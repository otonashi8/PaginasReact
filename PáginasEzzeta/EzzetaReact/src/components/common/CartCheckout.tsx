import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { PermissionGate } from '../PermissionGate';
import { PERMISSIONS } from '../../utils/permissionCodes';
import useCheckoutDraft from '../../hooks/useCheckoutDraft';
import { getPeruDistricts, getPeruProvinces } from '../../services/peruUbigeoService';
import type { Product } from '../../types';
import type { PurchaseItem } from '../../types/auth';
import { createAndPersistOrder } from '../../services/checkoutService';

type CartProduct = Product & { quantity: number; size: string };

type Props = {
  selectedProducts: CartProduct[];
  subtotal: number;
  promoDiscountAmount: number;
  shipping: number;
  shippingLabel?: string;
  discountedTotal: number;
  checkoutStep: 'cart' | 'checkout' | 'payment';
  setCheckoutStep: (s: 'cart' | 'checkout' | 'payment') => void;
  clearCart: () => void;
  isAuthenticated: boolean;
  user: any;
  recordPurchase?: (payload: any) => Promise<void>;
};

export default function CartCheckout({
  selectedProducts,
  subtotal,
  promoDiscountAmount,
  shipping,
  shippingLabel,
  discountedTotal,
  checkoutStep,
  setCheckoutStep,
  clearCart,
  isAuthenticated: _isAuthenticated,
  user: _user,
  recordPurchase,
}: Props) {
  const { getDraft, setDraft } = useCheckoutDraft();

  const [paymentInfo, setPaymentInfo] = useState(() => {
    const draft = getDraft();
    return {
      name: draft.name ?? '',
      email: draft.email ?? '',
      address: draft.address ?? '',
      paymentMethod: draft.paymentMethod ?? 'card',
      phone: (draft as any).phone ?? undefined,
    };
  });

  const [shippingAddress, setShippingAddress] = useState(() => {
    const draft = getDraft();
    return {
      departamento: draft.departamento ?? '',
      provincia: draft.provincia ?? '',
      distrito: draft.distrito ?? '',
      codigoPostal: '',
      referencia: draft.referencia ?? '',
    };
  });

  const provinces = useMemo(
    () => (shippingAddress.departamento ? getPeruProvinces(shippingAddress.departamento) : []),
    [shippingAddress.departamento],
  );
  const districts = useMemo(
    () => (shippingAddress.departamento && shippingAddress.provincia
      ? getPeruDistricts(shippingAddress.departamento, shippingAddress.provincia)
      : []),
    [shippingAddress.departamento, shippingAddress.provincia],
  );

  useEffect(() => {
    const draftPhone: string | undefined = (paymentInfo as any)?.phone ?? undefined;

    setDraft({
      name: paymentInfo.name,
      email: paymentInfo.email,
      address: paymentInfo.address,
      paymentMethod: paymentInfo.paymentMethod,
      referencia: shippingAddress.referencia,
      departamento: shippingAddress.departamento,
      provincia: shippingAddress.provincia,
      distrito: shippingAddress.distrito,
      phone: draftPhone,
    });
  }, [paymentInfo, shippingAddress, setDraft]);

  return (
    <>
      {checkoutStep === 'checkout' ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-[1.25rem] border border-black/10 bg-white p-4 sm:p-5 lg:p-6 text-black shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <h3 className="text-base font-semibold">Datos de envío y contacto</h3>
          <div className="mt-4 space-y-4 text-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-black/60">Nombre completo</span>
            <input
              type="text"
              value={paymentInfo.name}
              onChange={(event) => setPaymentInfo({ ...paymentInfo, name: event.target.value })}
              className="mt-2 w-full rounded-full border border-black/10 bg-white px-4 py-2 text-black outline-none"
            />
          </label>
          <label className="block">
            <span className="text-black/60">Email</span>
            <input
              type="email"
              value={paymentInfo.email}
              onChange={(event) => setPaymentInfo({ ...paymentInfo, email: event.target.value })}
              className="mt-2 w-full rounded-full border border-black/10 bg-white px-4 py-2 text-black outline-none"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-black/60">Dirección de entrega</span>
          <input
            type="text"
            value={paymentInfo.address}
            onChange={(event) => setPaymentInfo({ ...paymentInfo, address: event.target.value })}
            className="mt-2 w-full rounded-full border border-black/10 bg-white px-4 py-2 text-black outline-none"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="text-black/60">Departamento</span>
            <input
              type="text"
              value={shippingAddress.departamento}
              readOnly
              placeholder="Departamento no seleccionado"
              className="mt-2 w-full rounded-full border border-black/10 bg-white px-4 py-2 text-black outline-none"
            />
            <p className="mt-2 text-sm text-black/70">
              {shippingLabel === 'GRATIS' ? '🎉 Envío gratis' : shipping !== undefined ? `S/${shipping.toFixed(2)} de envío` : 'Costo de envío por calcular'}
            </p>
          </label>

          <label className="block">
            <span className="text-black/60">Provincia</span>
            <select
              value={shippingAddress.provincia}
              onChange={(event) => setShippingAddress({
                ...shippingAddress,
                provincia: event.target.value,
                distrito: '',
              })}
              disabled={!shippingAddress.departamento}
              className="mt-2 w-full rounded-full border border-black/10 bg-white px-4 py-2 text-black outline-none disabled:cursor-not-allowed disabled:bg-black/5"
            >
              <option value="">Selecciona una provincia</option>
              {provinces.map((province) => (
                <option key={province.code} value={province.name}>
                  {province.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-black/60">Distrito</span>
            <select
              value={shippingAddress.distrito}
              onChange={(event) => setShippingAddress({
                ...shippingAddress,
                distrito: event.target.value,
              })}
              disabled={!shippingAddress.provincia}
              className="mt-2 w-full rounded-full border border-black/10 bg-white px-4 py-2 text-black outline-none disabled:cursor-not-allowed disabled:bg-black/5"
            >
              <option value="">Selecciona un distrito</option>
              {districts.map((district) => (
                <option key={district.code} value={district.name}>
                  {district.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-black/60">Código postal</span>
            <input
              type="text"
              value={shippingAddress.codigoPostal}
              onChange={(event) => setShippingAddress({ ...shippingAddress, codigoPostal: event.target.value })}
              className="mt-2 w-full rounded-full border border-black/10 bg-white px-4 py-2 text-black outline-none"
            />
          </label>

          <label className="block">
            <span className="text-black/60">Referencia</span>
            <input
              type="text"
              value={shippingAddress.referencia}
              onChange={(event) => setShippingAddress({ ...shippingAddress, referencia: event.target.value })}
              className="mt-2 w-full rounded-full border border-black/10 bg-white px-4 py-2 text-black outline-none"
            />
          </label>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <motion.button
            type="button"
            onClick={() => setCheckoutStep('cart')}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-black/5"
          >Volver al carrito
          </motion.button>

          <PermissionGate permission={PERMISSIONS.salesCreate}>
            <motion.button
              type="button"
              onClick={async () => {
                const draft = getDraft();
                const missingMandatory = !draft.name || !draft.email || !draft.address || !draft.departamento || !draft.provincia || !draft.distrito;

                if (missingMandatory) {
                  return;
                }

                const items: PurchaseItem[] = selectedProducts.map((product) => {
                  const unitPrice = Number(product.price);
                  const subtotalForItem = unitPrice * product.quantity;

                  return {
                    productId: product.id,
                    name: product.name,
                    quantity: product.quantity,
                    unitPrice,
                    subtotal: subtotalForItem,
                    discount: 0,
                    total: subtotalForItem,
                    size: product.size,
                  };
                });

                const order = {
                  items,
                  subtotal,
                  discount: promoDiscountAmount,
                  total: discountedTotal,
                  shipping,
                  paymentMethod: paymentInfo.paymentMethod,
                  customer: {
                    name: paymentInfo.name,
                    email: paymentInfo.email,
                    phone: paymentInfo.phone ?? '',
                    address: paymentInfo.address,
                  },
                  shippingAddress: {
                    departamento: shippingAddress.departamento,
                    provincia: shippingAddress.provincia,
                    distrito: shippingAddress.distrito,
                    referencia: shippingAddress.referencia,
                  },
                };

                const persisted = await createAndPersistOrder(order as any);
                if (persisted) {
                  clearCart();
                  if (recordPurchase) {
                    await recordPurchase({ items: order.items, total: order.total, shipping: order.shipping, paymentMethod: order.paymentMethod });
                  }
                  setCheckoutStep('payment');
                }
              }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 rounded-full bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
            >Continuar al pago
            </motion.button>
          </PermissionGate>
        </div>
      </div>
        </motion.div>
      ) : null}
    </>
  );
}
