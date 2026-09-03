import { AnimatePresence, motion } from 'framer-motion';
import { Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useCart from '../../hooks/useCart';
import useCheckoutDraft, { CHECKOUT_DRAFT_CHANGED } from '../../hooks/useCheckoutDraft';
import type { Product } from '../../types';
import { getProducts } from '../../services/contentService';
import { resolveProductPrice, resolveCartCoupon, resolverDescuentosCarrito, obtenerMayorDescuentoCombo, usePricingRules, detectarCombosEnCarrito, obtenerPrecioMayorista, type CartItem } from '../../services/pricingService';
import { obtenerPromoCodes } from '../../data/promoCodes';
import { storageManager, StorageKeys } from '../../storage';
import CartCheckout from './CartCheckout';
import CartItemsList from './CartItemsList';
import CartSummary from './CartSummary';
import { PermissionGate } from '../PermissionGate';
import { PERMISSIONS } from '../../utils/permissionCodes';
import { calcularCostoEnvio, obtenerConfiguracionEnvioActual } from '../../utils/envioHelpers';
import { SHIPPING_CONFIG_EVENT } from '../../admin/Sistema/envio/DatosEnvio';

type DeletedCartItem = { productId: number; quantity: number; size: string };

type CartProduct = Product & {
  quantity: number;
  size: string;
  __discountApplied?: number;
  __precioOriginal?: number;
  __product?: Product;
};

type AppliedCouponType = 'percentage' | 'fixed' | 'shipping' | 'price_fixed';

type AppliedCoupon = {
  id?: number;
  code: string;
  type: AppliedCouponType;
  value: number;
  minPurchase: number;
  active: boolean;
  freeShipping?: boolean;
  source: 'static' | 'admin';
};

export const CartDrawer = ({ open, onOpenChange }: { open?: boolean; onOpenChange?: (next: boolean) => void } = {}) => {
  const { isCartOpen: cartOpenState, closeCart: closeCartStore, cart, removeFromCart, restoreCartItem, updateQuantity, changeItemSize, clearCart } = useCart();
  const { isAuthenticated, user, recordPurchase } = useAuth();
  const navigate = useNavigate();
  const products = getProducts();
  const drawerOpen = typeof open === 'boolean' ? open : cartOpenState;

  useEffect(() => {
    if (typeof open === 'boolean' && onOpenChange && open !== cartOpenState) {
      onOpenChange(cartOpenState);
    }
  }, [cartOpenState, onOpenChange, open]);

  const handleClose = () => {
    if (typeof open === 'boolean' && onOpenChange) {
      onOpenChange(false);
    }
    closeCartStore();
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{ productId: number; size: string } | null>(null);
  const [clearCartConfirm, setClearCartConfirm] = useState(false);
  const [deletedCartItem, setDeletedCartItem] = useState<DeletedCartItem | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout' | 'payment'>('cart');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(() => {
    try {
      return storageManager.cart.appliedCoupon.get() as AppliedCoupon | null;
    } catch {
      return null;
    }
  });
  const [promoMessage, setPromoMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const pricingRules = usePricingRules();

  const selectedProducts: CartProduct[] = cart
    .map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      if (!product) return null;
      const precio = resolveProductPrice(product, { cantidad: item.quantity }, pricingRules);
      return { ...product, price: precio.precioFinal, quantity: item.quantity, size: item.size, __discountApplied: precio.descuentoAplicado, __precioOriginal: precio.precioOriginal, __product: product } as CartProduct;
    })
    .filter((item): item is CartProduct => item !== null);

  const cantidadesPorSubcategoria = selectedProducts.reduce((totales, item) => {
    const clave = `${item.category}::${item.subcategory}`;
    totales.set(clave, (totales.get(clave) ?? 0) + item.quantity);
    return totales;
  }, new Map<string, number>());

  selectedProducts.forEach((item) => {
    const precioMayorista = isAuthenticated && item.__product
      ? obtenerPrecioMayorista(item.__product, cantidadesPorSubcategoria.get(`${item.category}::${item.subcategory}`) ?? 0)
      : null;
    if (precioMayorista !== null) {
      item.price = precioMayorista;
    }
  });

  const { getDraft, setDraft } = useCheckoutDraft();
  const initialDraft = getDraft();
  const [checkoutDepartamento, setCheckoutDepartamento] = useState(initialDraft.departamento ?? '');
  const [departamentoError, setDepartamentoError] = useState(false);

  const handleDepartamentoChange = (departamento: string) => {
    setDepartamentoError(false);
    const nextDraft = { ...getDraft(), departamento, provincia: '', distrito: '' };
    setDraft(nextDraft);
    setCheckoutDepartamento(departamento);
  };

  const handleProceedToCheckout = () => {
    if (selectedProducts.length === 0) {
      return;
    }
    closeCartStore();
    navigate('/checkout');
  };

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === StorageKeys.CHECKOUT) {
        const nextDraft = getDraft();
        setCheckoutDepartamento(nextDraft.departamento ?? '');
      }
    };

    const handleDraftChange = () => {
      const nextDraft = getDraft();
      setCheckoutDepartamento(nextDraft.departamento ?? '');
    };

    const handleShippingConfigChange = () => {
      const currentDraft = getDraft();
      setCheckoutDepartamento(currentDraft.departamento ?? '');
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(CHECKOUT_DRAFT_CHANGED, handleDraftChange);
    window.addEventListener(SHIPPING_CONFIG_EVENT, handleShippingConfigChange);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(CHECKOUT_DRAFT_CHANGED, handleDraftChange);
      window.removeEventListener(SHIPPING_CONFIG_EVENT, handleShippingConfigChange);
    };
  }, [getDraft]);

  const selectedProductsSubtotal = selectedProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedProductsOriginalSubtotal = selectedProducts.reduce((sum, item) => sum + ((item as any).__precioOriginal ?? item.price) * item.quantity, 0);

  const productLevelDiscountTotal = selectedProducts.reduce((sum, item) => sum + ((item as any).__precioOriginal ?? item.price) * item.quantity - item.price * item.quantity, 0);
  const configuracionEnvio = obtenerConfiguracionEnvioActual();

  const cartItemsForComboDetection: CartItem[] = cart.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    size: item.size,
  }));

  const comboInfo = useMemo(
    () => detectarCombosEnCarrito(cartItemsForComboDetection, products, pricingRules),
    [cart, products, pricingRules],
  );

  const promoDiscountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;

    if (appliedCoupon.type === 'percentage') {
      return Number(Math.min(selectedProductsSubtotal, selectedProductsSubtotal * (appliedCoupon.value / 100)).toFixed(2));
    }

    if (appliedCoupon.type === 'fixed') {
      return Number(Math.min(selectedProductsSubtotal, appliedCoupon.value).toFixed(2));
    }

    if (appliedCoupon.type === 'price_fixed') {
      return Number(Math.min(selectedProductsSubtotal, Math.max(0, selectedProductsSubtotal - appliedCoupon.value)).toFixed(2));
    }

    return 0;
  }, [appliedCoupon, selectedProductsSubtotal]);

  const freeShippingCoupon = appliedCoupon?.freeShipping || appliedCoupon?.type === 'shipping';
  const descuentosCarrito = resolverDescuentosCarrito(
    selectedProductsSubtotal,
    promoDiscountAmount,
    obtenerMayorDescuentoCombo(comboInfo),
  );
  const shippingResult = calcularCostoEnvio({
    subtotal: selectedProductsSubtotal,
    departamento: checkoutDepartamento,
    configuracion: configuracionEnvio,
    freeShippingCoupon,
  });

  const canProceedToCheckout = selectedProducts.length > 0;
  const shipping = shippingResult.shippingAmount ?? 0;
  const discountedSubtotal = descuentosCarrito.subtotalFinal;
  const discountedTotal = Number(Math.max(0, discountedSubtotal + shipping).toFixed(2));

  const totalSavings = Number(Math.max(0, productLevelDiscountTotal + descuentosCarrito.descuentoCupon + descuentosCarrito.descuentoCombos).toFixed(2));

  useEffect(() => {
    if (appliedCoupon && selectedProductsSubtotal < appliedCoupon.minPurchase) {
      setAppliedCoupon(null);
      storageManager.cart.appliedCoupon.clear();
      setPromoMessage({
        text: `✕ El cupón ${appliedCoupon.code} requiere compra mínima de S/${appliedCoupon.minPurchase}.`,
        type: 'error',
      });
    }
  }, [selectedProductsSubtotal, appliedCoupon]);

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      const itemToRestore = cart.find((item) => item.productId === deleteConfirm.productId && item.size === deleteConfirm.size);
      removeFromCart(deleteConfirm.productId, deleteConfirm.size);
      if (itemToRestore) {
        setDeletedCartItem(itemToRestore);
      }
      setDeleteConfirm(null);
    }
  };

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === StorageKeys.PROMO_CODES) {
        setPromoMessage({ text: 'Los códigos promocionales se actualizaron. Vuelve a aplicar tu cupón.', type: 'success' });
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const applyPromoCode = () => {
    const normalizedCode = promoCodeInput.trim().toUpperCase();

    if (!normalizedCode) {
      setPromoMessage({ text: '✕ Ingresa un código promocional.', type: 'error' });
      return;
    }

    if (appliedCoupon) {
      setPromoMessage({ text: '✕ Solo se permite un cupón a la vez.', type: 'error' });
      return;
    }

    const couponFromRules = resolveCartCoupon(selectedProductsSubtotal, normalizedCode, pricingRules);

    if (couponFromRules.rule) {
      const tipoDescuento = couponFromRules.rule.configuracion?.tipoDescuento;
      const couponType: AppliedCouponType =
        tipoDescuento === 'fijo'
          ? 'fixed'
          : tipoDescuento === 'precio_fijo'
          ? 'price_fixed'
          : 'percentage';

      const coupon: AppliedCoupon = {
        code: normalizedCode,
        type: couponType,
        value: Number(couponFromRules.rule.configuracion?.valor ?? 0),
        minPurchase: Number(couponFromRules.rule.configuracion?.subtotalMinimo ?? 0),
        active: true,
        freeShipping: couponFromRules.freeShipping,
        source: 'admin',
      };

      setAppliedCoupon(coupon);
      storageManager.cart.appliedCoupon.set(coupon);
      setPromoMessage({ text: '✓ Código aplicado correctamente', type: 'success' });
      return;
    }

    const foundPromo = obtenerPromoCodes().find((promo) => promo.code.toUpperCase() === normalizedCode);

    if (!foundPromo) {
      setPromoMessage({ text: '✕ Código inválido', type: 'error' });
      return;
    }

    if (!foundPromo.active) {
      setPromoMessage({ text: '✕ Este código ya no está activo.', type: 'error' });
      return;
    }

    if (selectedProductsSubtotal < foundPromo.minPurchase) {
      setPromoMessage({ text: `✕ Compra mínima de S/${foundPromo.minPurchase}`, type: 'error' });
      return;
    }

    const coupon: AppliedCoupon = { ...foundPromo, source: 'static' };
    setAppliedCoupon(coupon);
    storageManager.cart.appliedCoupon.set(coupon);
    setPromoMessage({ text: '✓ Código aplicado correctamente', type: 'success' });
  };

  const removeAppliedPromo = () => {
    setAppliedCoupon(null);
    storageManager.cart.appliedCoupon.clear();
    setPromoCodeInput('');
    setPromoMessage({ text: 'Cupón eliminado', type: 'success' });
  };

  if (!drawerOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      {drawerOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/40"
            onClick={closeCartStore}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="fixed right-0 top-0 z-[80] flex h-full w-full sm:max-w-xl flex-col border-l border-black/10 bg-white text-black shadow-[0_24px_70px_rgba(0,0,0,0.18)]"
          >
            <div className="flex items-center justify-between border-b border-black/10 bg-white px-5 py-5 sm:px-7 sm:py-6">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-black/50">Carrito</p>
                <h2 className="mt-1 text-2xl font-semibold text-black">Tu compra</h2>
              </div>
              <motion.button type="button" onClick={handleClose} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }} className="rounded-full border border-black/10 p-2 text-black transition hover:border-black/30">
                <X size={20} />
              </motion.button>
            </div>

            {checkoutStep === 'cart' && selectedProducts.length > 0 ? (
              <div className="flex justify-end border-b border-black/10 px-5 py-3 sm:px-7">
                <PermissionGate permission={PERMISSIONS.salesDelete}>
                  <button
                    type="button"
                    onClick={() => setClearCartConfirm(true)}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-red-600 transition hover:text-red-700"
                  >
                    <Trash2 size={14} />
                    Borrar todo
                  </button>
                </PermissionGate>
              </div>
            ) : null}

            <div className="min-h-0 flex-1 overflow-y-auto bg-white px-5 py-6 sm:px-7 sm:py-7">
              {deletedCartItem ? (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm"
                >
                  <p className="min-w-0 truncate text-black/70">Producto eliminado del carrito.</p>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        restoreCartItem(deletedCartItem);
                        setDeletedCartItem(null);
                      }}
                      className="font-semibold text-red-600 transition hover:text-red-700"
                    >
                      Deshacer
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletedCartItem(null)}
                      aria-label="Cerrar aviso de producto eliminado"
                      className="rounded-full p-1 text-black/50 transition hover:bg-black/10 hover:text-black"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </motion.div>
              ) : null}
              {checkoutStep === 'cart' ? (
                selectedProducts.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-black/20 bg-white p-8 text-center text-sm text-black/60">
                    Tu carrito está vacío.
                  </div>
                ) : (
                  <CartItemsList
                    items={selectedProducts}
                    changeItemSize={changeItemSize}
                    updateQuantity={updateQuantity}
                    setDeleteConfirm={setDeleteConfirm}
                  />
                )
              ) : null}

              {checkoutStep === 'checkout' || checkoutStep === 'payment' ? (
                <CartCheckout
                  selectedProducts={selectedProducts}
                  subtotal={selectedProductsSubtotal}
                  promoDiscountAmount={promoDiscountAmount}
                  shipping={shipping}
                  shippingLabel={shippingResult.shippingLabel}
                  discountedTotal={discountedTotal}
                  checkoutStep={checkoutStep}
                  setCheckoutStep={setCheckoutStep}
                  clearCart={clearCart}
                  isAuthenticated={isAuthenticated}
                  user={user}
                  recordPurchase={recordPurchase}
                />
              ) : null}
            </div>

            {checkoutStep === 'cart' ? (
              <div className="max-h-[48vh] shrink-0 overflow-y-auto border-t border-black/10 bg-white px-5 pb-5 sm:px-7 sm:pb-7">
                <CartSummary
                  subtotal={selectedProductsOriginalSubtotal}
                  shipping={shipping}
                  shippingLabel={shippingResult.shippingLabel}
                  montoMinimoEnvioGratis={shippingResult.montoMinimoEnvioGratis}
                  shippingCalculable={shippingResult.shippingCalculable}
                  shippingNotConfigured={shippingResult.shippingNotConfigured}
                  checkoutDepartamento={checkoutDepartamento}
                  onDepartamentoChange={handleDepartamentoChange}
                  departamentoError={departamentoError}
                  discountedSubtotal={discountedSubtotal}
                  discountedTotal={discountedTotal}
                  combosAplicados={comboInfo.combosAplicados}
                  totalSavings={totalSavings}
                  onApplyPromo={applyPromoCode}
                  promoMessage={promoMessage}
                  appliedCoupon={appliedCoupon}
                  onProceedToCheckout={handleProceedToCheckout}
                  promoCodeInput={promoCodeInput}
                  setPromoCodeInput={setPromoCodeInput}
                  removeAppliedPromo={removeAppliedPromo}
                  setCheckoutStep={setCheckoutStep}
                  isCheckoutDisabled={!canProceedToCheckout}
                />
              </div>
            ) : null}
          </motion.aside>

          <AnimatePresence>
            {deleteConfirm ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-black/45 px-4 py-4 backdrop-blur-[2px]"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="my-auto w-full max-w-sm rounded-[1.5rem] border border-black/10 bg-white p-5 sm:p-6 shadow-[0_26px_70px_rgba(0,0,0,0.2)]"
                >
                  <h3 className="text-lg font-semibold text-black">¿Eliminar producto?</h3>
                  <p className="mt-2 text-sm text-black/70">¿Está seguro de que desea eliminar este artículo del carrito?</p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <motion.button
                      type="button"
                      onClick={() => setDeleteConfirm(null)}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-black/5"
                    >
                      Cancelar
                    </motion.button>
                    <PermissionGate permission={PERMISSIONS.salesDelete}>
                      <motion.button
                        type="button"
                        onClick={handleConfirmDelete}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
                      >
                        Eliminar
                      </motion.button>
                    </PermissionGate>
                  </div>
                </motion.div>
              </motion.div>
            ) : null}
            {clearCartConfirm ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-black/45 px-4 py-4 backdrop-blur-[2px]"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="my-auto w-full max-w-sm rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-[0_26px_70px_rgba(0,0,0,0.2)] sm:p-6"
                >
                  <h3 className="text-lg font-semibold text-black">¿Borrar todo el carrito?</h3>
                  <p className="mt-2 text-sm text-black/70">Se eliminarán todos los productos de tu carrito. Esta acción no se puede deshacer.</p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setClearCartConfirm(false)}
                      className="flex-1 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-black/5"
                    >
                      Cancelar
                    </button>
                    <PermissionGate permission={PERMISSIONS.salesDelete}>
                      <button
                        type="button"
                        onClick={() => {
                          clearCart();
                          setClearCartConfirm(false);
                          storageManager.cart.appliedCoupon.clear();
                          setAppliedCoupon(null);
                          setPromoCodeInput('');
                        }}
                        className="flex-1 rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
                      >
                        Borrar todo
                      </button>
                    </PermissionGate>
                  </div>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </>
      ) : null}
    </AnimatePresence>
  );
};

export default CartDrawer;
