import { AnimatePresence, motion } from 'framer-motion';
import { Heart, ShoppingBag, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ImagePlaceholder } from './ImagePlaceholder';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import useCart from '../hooks/useCart';
import useCheckoutDraft, { CHECKOUT_DRAFT_CHANGED } from '../hooks/useCheckoutDraft';
import type { Product } from '../types';
import { getPlanById, type SubscriptionPlan } from '../plans';
import { getProducts } from '../services/contentService';
import { resolveProductPrice, resolveCartCoupon, usePricingRules, detectarCombosEnCarrito, type CartItem  } from '../services/pricingService';
import PriceDisplay from '../components/PriceDisplay';
import QuickAddModal from './QuickAddModal';
import { obtenerPromoCodes } from '../data/promoCodes';
import { storageManager, StorageKeys } from '../storage';
import CartCheckout from './CartCheckout';
import CartItemsList from './CartItemsList';
import CartCombos from './CartCombos';
import CartSummary from './CartSummary';
import { MembershipModal } from './MembershipModal';
import { ProductHoverImage } from '../components/ProductHoverImage';
import { PermissionGate } from './PermissionGate';
import { PERMISSIONS } from '../utils/permissionCodes';
import { calcularCostoEnvio, obtenerConfiguracionEnvioActual } from '../utils/envioHelpers';
import { SHIPPING_CONFIG_EVENT } from '../admin/Sistema/envio/DatosEnvio';

type CartProduct = Product & { quantity: number; size: string };

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

export const CartDrawer = () => {
  const { isAuthenticated, user, recordPurchase } = useAuth();
  const { favorites, toggleFavorite } = useWishlist();
  const { cart, isCartOpen, closeCart, removeFromCart, updateQuantity, changeItemSize, clearCart } = useCart();
  const products = getProducts();
  const [deleteConfirm, setDeleteConfirm] = useState<{ productId: number; size: string } | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout' | 'payment'>('cart');
  const [recommendedModalProduct, setRecommendedModalProduct] = useState<(typeof products)[number] | null>(null);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlan['id']>(user?.plan ?? 'bronze');
  const [plansVersion, setPlansVersion] = useState(0);
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

      if (!product) {
        return null;
      }

      const precio = resolveProductPrice(product, { cantidad: item.quantity });

      return { ...product, price: precio.precioFinal, quantity: item.quantity, size: item.size };
    })
    .filter((item): item is CartProduct => item !== null);

  const { getDraft, setDraft } = useCheckoutDraft();
  const initialDraft = getDraft();
  const [checkoutDepartamento, setCheckoutDepartamento] = useState(initialDraft.departamento ?? '');
  const [departamentoError, setDepartamentoError] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const handleDepartamentoChange = (departamento: string) => {
    setDepartamentoError(false);
    setCheckoutError('');
    const nextDraft = {
      ...getDraft(),
      departamento,
      provincia: '',
      distrito: '',
    };

    setDraft(nextDraft);
    setCheckoutDepartamento(departamento);
  };

  const handleProceedToCheckout = () => {
    if (!checkoutDepartamento.trim()) {
      setDepartamentoError(true);
      setCheckoutError('Selecciona tu departamento para calcular el envío.');
      return;
    }

    if (!shippingResult.shippingCalculable) {
      setCheckoutError('No hay una tarifa de envío configurada para este departamento.');
      return;
    }

    setCheckoutError('');
    setCheckoutStep('checkout');
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
  const configuracionEnvio = obtenerConfiguracionEnvioActual();
  const effectivePlanId = (user?.plan ?? selectedPlanId) as SubscriptionPlan['id'];
  const activePlan = useMemo(() => getPlanById(effectivePlanId), [effectivePlanId, plansVersion]);
  const hasActivePlan = Boolean(user?.plan) || selectedPlanId !== 'bronze';
  const discountRate = hasActivePlan
    ? activePlan.descuento / 100
    : 0;
  const discountAmount = Number(
    (selectedProductsSubtotal * discountRate).toFixed(2)
  );

  // combos en carrito
  const cartItemsForComboDetection: CartItem[] = cart.map(item => ({
    productId: item.productId,
    quantity: item.quantity,
    size: item.size
  }));
  const comboInfo = useMemo(
    () => detectarCombosEnCarrito(cartItemsForComboDetection, products, pricingRules),
    [cart, products, pricingRules]
  );

  const promoDiscountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;

    if (appliedCoupon.type === 'percentage') {
      return Number(
        Math.min(selectedProductsSubtotal, selectedProductsSubtotal * (appliedCoupon.value / 100)).toFixed(2)
      );
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
  const shippingResult = calcularCostoEnvio({
    subtotal: selectedProductsSubtotal,
    departamento: checkoutDepartamento,
    configuracion: configuracionEnvio,
    freeShippingCoupon,
  });

  const shipping = shippingResult.shippingAmount ?? 0;
  const discountedSubtotal = Number(Math.max(0, selectedProductsSubtotal - discountAmount - promoDiscountAmount - comboInfo.descuentoTotalCombos).toFixed(2));
  const discountedTotal = Number(Math.max(0, discountedSubtotal + shipping).toFixed(2));

  useEffect(() => {
    if (user?.plan) {
      setSelectedPlanId(user.plan);
    }
  }, [user?.plan]);

  useEffect(() => {
    const onPlansChanged = () => setPlansVersion((v) => v + 1);
    window.addEventListener('maxeta:plans-changed', onPlansChanged);
    return () => window.removeEventListener('maxeta:plans-changed', onPlansChanged);
  }, []);

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
      removeFromCart(deleteConfirm.productId, deleteConfirm.size);
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

  const handleMembershipPlanSelect = (planId: SubscriptionPlan['id']) => {
    setSelectedPlanId(planId);
  };

  return (
    <AnimatePresence>
      {isCartOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/40"
            onClick={closeCart}
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
              <motion.button type="button" onClick={closeCart} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }} className="rounded-full border border-black/10 p-2 text-black transition hover:border-black/30">
                <X size={20} />
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto bg-white px-5 py-6 sm:px-7 sm:py-7">
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

              {checkoutStep === 'cart' && selectedProducts.length > 0 && (
                <div className="mt-5">
                  <CartCombos
                    combosAplicados={comboInfo.combosAplicados}
                    combosIncompletos={comboInfo.combosIncompletos}
                  />
                </div>
              )}

              {checkoutStep === 'cart' && (
                <CartSummary
                  subtotal={selectedProductsSubtotal}
                  promoDiscountAmount={promoDiscountAmount}
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
                    onProceedToCheckout={handleProceedToCheckout}
                  hasActivePlan={hasActivePlan}
                  activePlan={activePlan}
                  onApplyPromo={applyPromoCode}
                  promoMessage={promoMessage}
                  appliedCoupon={appliedCoupon}
                  promoCodeInput={promoCodeInput}
                  setPromoCodeInput={setPromoCodeInput}
                  removeAppliedPromo={removeAppliedPromo}
                  setIsMembershipModalOpen={setIsMembershipModalOpen}
                  setCheckoutStep={setCheckoutStep}
                  checkoutError={checkoutError}
                />
              )}

              {checkoutStep === 'checkout' || checkoutStep === 'payment' ? (
                <CartCheckout
                  selectedProducts={selectedProducts}
                  subtotal={selectedProductsSubtotal}
                  discountAmount={discountAmount}
                  promoDiscountAmount={promoDiscountAmount}
                  shipping={shipping}
                  shippingLabel={shippingResult.shippingLabel}
                  discountedTotal={discountedTotal}
                  hasActivePlan={hasActivePlan}
                  activePlan={activePlan}
                  checkoutStep={checkoutStep}
                  setCheckoutStep={setCheckoutStep}
                  clearCart={clearCart}
                  isAuthenticated={isAuthenticated}
                  user={user}
                  recordPurchase={recordPurchase}
                />
              ) : null}

              <div className="mt-5 rounded-[1.25rem] border border-black/10 bg-white p-4 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black">Nuestras Recomendaciones</p>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {products.slice(0, 8).map((product) => {
                    const isFavorite = favorites.includes(product.id);

                    return (
                      <Link
                        key={product.id}
                        to={`/producto/${product.slug}`}
                        onClick={() => closeCart()}
                        className="group overflow-hidden rounded-xl border border-black/10 bg-white transition hover:-translate-y-0.5 hover:border-red-600 hover:shadow-[0_12px_24px_rgba(0,0,0,0.1)]"
                      >
                        <div className="relative h-40 sm:h-48 lg:h-52 xl:h-56 bg-white flex items-center justify-center">
                          {product.image ? (
                            <ProductHoverImage
                              product={product}
                              alt={product.name}
                              className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                            />
                          ) : (
                            <ImagePlaceholder label="Producto" className="h-full w-full" />
                          )}

                          <PermissionGate permission={PERMISSIONS.productUpdate}>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                toggleFavorite(product.id);
                              }}
                              className={`absolute right-2 top-2 sm:right-3 sm:top-3 rounded-full border p-2 transition ${
                                isFavorite
                                  ? 'border-red-600 bg-red-600 text-white'
                                  : 'border-black/10 bg-white text-black hover:border-red-600 hover:text-red-600'
                              }`}
                            >
                              <Heart size={16} />
                            </button>
                          </PermissionGate>
                        </div>

                        <div className="p-2.5 sm:p-3">
                          <p className="line-clamp-2 text-sm font-semibold text-black">
                            {product.name}
                          </p>

                          <div className="mt-3 flex items-center justify-between">
                            <PriceDisplay product={product} />

                            <PermissionGate permission={PERMISSIONS.salesCreate}>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  setRecommendedModalProduct(product);
                                }}
                                className="inline-flex items-center justify-center rounded-full border border-black/10 bg-black p-2 text-white transition hover:bg-red-600"
                              >
                                <ShoppingBag size={16} />
                              </button>
                            </PermissionGate>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
              <QuickAddModal
                product={recommendedModalProduct}
                isOpen={Boolean(recommendedModalProduct)}
                initialSize={recommendedModalProduct?.sizes?.[0]}
                onClose={() => setRecommendedModalProduct(null)}
              />
              <div className="h-10" />
            </div>
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
          </AnimatePresence>

          <MembershipModal
            isOpen={isMembershipModalOpen}
            onClose={() => setIsMembershipModalOpen(false)}
            onSelectPlan={handleMembershipPlanSelect}
          />
        </>
      ) : null}
    </AnimatePresence>
  );
};
