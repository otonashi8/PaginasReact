import { motion } from 'framer-motion';
import type { Product } from '../types';
import type { PurchaseItem } from '../types/auth';
import type { SubscriptionPlan } from '../plans';
import { PermissionGate } from './PermissionGate';
import { PERMISSIONS } from '../utils/permissionCodes';

type CartProduct = Product & { quantity: number; size: string };

type Props = {
  selectedProducts: CartProduct[];
  subtotal: number;
  discountAmount: number;
  shipping: number;
  discountedSubtotal: number;
  hasActivePlan: boolean;
  activePlan: SubscriptionPlan;
  checkoutStep: 'cart' | 'checkout' | 'payment';
  setCheckoutStep: (step: 'cart' | 'checkout' | 'payment') => void;
  paymentInfo: { name: string; email: string; address: string; paymentMethod: string };
  setPaymentInfo: (info: { name: string; email: string; address: string; paymentMethod: string }) => void;
  paymentDetails: { cardNumber: string; cardName: string; cardExpiry: string; cardCvc: string; yapePhone: string };
  setPaymentDetails: (details: { cardNumber: string; cardName: string; cardExpiry: string; cardCvc: string; yapePhone: string }) => void;
  isAuthenticated: boolean;
  user: any;
  recordPurchase?: (payload: any) => Promise<void>;
  clearCart: () => void;
};

export default function CartCheckout({
  selectedProducts,
  subtotal,
  discountAmount,
  shipping,
  discountedSubtotal,
  hasActivePlan,
  activePlan,
  checkoutStep,
  setCheckoutStep,
  paymentInfo,
  setPaymentInfo,
  paymentDetails,
  setPaymentDetails,
  isAuthenticated,
  user,
  recordPurchase,
  clearCart,
}: Props) {
  return (
    <>
      {checkoutStep === 'checkout' ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-[1.25rem] border border-black/10 bg-white p-4 sm:p-5 lg:p-6 text-black shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <h3 className="text-lg font-bold uppercase tracking-[0.12em]">Datos de envío y contacto</h3>
          <div className="mt-6 space-y-6 text-sm">
            <label className="block">
              <span className="text-xs uppercase tracking-[0.12em] text-zinc-500">Nombre completo</span>
              <input
                type="text"
                value={paymentInfo.name}
                onChange={(event) => setPaymentInfo({ ...paymentInfo, name: event.target.value })}
                className="mt-2 w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-black transition-all duration-200 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.12em] text-zinc-500">Email</span>
              <input
                type="email"
                value={paymentInfo.email}
                onChange={(event) => setPaymentInfo({ ...paymentInfo, email: event.target.value })}
                className="mt-2 w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-black transition-all duration-200 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.12em] text-zinc-500">Dirección</span>
              <input
                type="text"
                value={paymentInfo.address}
                onChange={(event) => setPaymentInfo({ ...paymentInfo, address: event.target.value })}
                className="mt-2 w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-black transition-all duration-200 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.12em] text-zinc-500">Método de pago</span>
              <select
                value={paymentInfo.paymentMethod}
                onChange={(event) => setPaymentInfo({ ...paymentInfo, paymentMethod: event.target.value })}
                className="mt-2 w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-black transition-all duration-200 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
              >
                <option value="card">Tarjeta</option>
                <option value="paypal">PayPal</option>
                <option value="yape">Yape</option>
                <option value="cash">Contra entrega</option>
              </select>
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <motion.button
                type="button"
                onClick={() => setCheckoutStep('cart')}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-black transition hover:border-black hover:bg-zinc-100"
              >
                Volver
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setCheckoutStep('payment')}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-red-600 px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] text-white transition-all duration-200 hover:bg-black"
              >
                Confirmar datos
              </motion.button>
            </div>
          </div>
        </motion.div>
      ) : null}

      {checkoutStep === 'payment' ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 border border-zinc-200 bg-white p-5 sm:p-6 lg:p-7 text-black shadow-sm">
          <h3 className="text-lg font-bold uppercase tracking-[0.12em]">Pago — {paymentInfo.paymentMethod}</h3>
          <div className="mt-6 space-y-6 text-sm">
            <div className="border-b border-zinc-200 pb-5">
              {paymentInfo.paymentMethod === 'card' && (
                <>
                  <label className="block">
                    <span className="text-xs uppercase tracking-[0.12em] text-zinc-500">Número de tarjeta</span>
                    <input
                      type="text"
                      value={paymentDetails.cardNumber}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                      className="mt-2 w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-black transition-all duration-200 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                    />
                  </label>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-xs uppercase tracking-[0.12em] text-zinc-500">Nombre en la tarjeta</span>
                      <input
                        type="text"
                        value={paymentDetails.cardName}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, cardName: e.target.value })}
                        className="mt-2 w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-black transition-all duration-200 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs uppercase tracking-[0.12em] text-zinc-500">Expiración / CVC</span>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="MM/AA"
                          value={paymentDetails.cardExpiry}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, cardExpiry: e.target.value })}
                          className="w-2/3 border border-zinc-300 bg-white px-4 py-3 text-sm text-black transition-all duration-200 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                        />
                        <input
                          type="text"
                          placeholder="CVC"
                          value={paymentDetails.cardCvc}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, cardCvc: e.target.value })}
                          className="w-1/2 border border-zinc-300 bg-white px-4 py-3 text-sm text-black transition-all duration-200 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                        />
                      </div>
                    </label>
                  </div>
                </>
              )}
            </div>

            {paymentInfo.paymentMethod === 'yape' && (
              <label className="block">
                <span className="text-xs uppercase tracking-[0.12em] text-zinc-500">Número Yape</span>
                <input
                  type="tel"
                  value={paymentDetails.yapePhone}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, yapePhone: e.target.value })}
                  className="mt-2 w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-black transition-all duration-200 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                />
              </label>
            )}

            {paymentInfo.paymentMethod === 'paypal' && (
              <p className="border-l-4 border-red-600 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">Serás redirigido a PayPal tras confirmar.</p>
            )}

            {paymentInfo.paymentMethod === 'cash' && (
              <p className="border-l-4 border-red-600 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">Pagarás al recibir el pedido.</p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <motion.button
                type="button"
                onClick={() => setCheckoutStep('checkout')}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-black transition hover:border-black hover:bg-zinc-100"
              >
                Volver
              </motion.button>
              <PermissionGate permission={PERMISSIONS.salesCreate}>
              <motion.button
                type="button"
                onClick={async () => {
                  if (!selectedProducts.length) {
                    alert('Tu carrito está vacío.');
                    return;
                  }

                  if (!isAuthenticated || !user) {
                    alert('Inicia sesión para registrar tu compra.');
                    return;
                  }

                  const items: PurchaseItem[] = selectedProducts.map((item) => {
                    const lineSubtotal = item.price * item.quantity;
                    const lineDiscount = hasActivePlan
                      ? Number((lineSubtotal * (activePlan.descuento / 100)).toFixed(2))
                      : 0;

                    return {
                      productId: item.id,
                      name: item.name,
                      quantity: item.quantity,
                      unitPrice: item.price,
                      subtotal: lineSubtotal,
                      discount: lineDiscount,
                      total: Number((lineSubtotal - lineDiscount).toFixed(2)),
                      size: item.size,
                    };
                  });

                  try {
                    if (recordPurchase) {
                      await recordPurchase({
                        items,
                        subtotal,
                        discount: discountAmount,
                        total: discountedSubtotal + shipping,
                        paymentMethod: paymentInfo.paymentMethod,
                      });
                    }

                    clearCart();
                    alert('Pago simulado. Gracias.');
                    setCheckoutStep('cart');
                  } catch (error) {
                    console.error('Error al procesar el pago:', error);
                    alert('Ocurrió un error al procesar el pedido. Intenta nuevamente.');
                  }
                }}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-red-600 px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] text-white transition-all duration-200 hover:bg-black"
              >
                Confirmar pago
              </motion.button>
              </PermissionGate>
            </div>
          </div>
        </motion.div>
      ) : null}
    </>
  );
}
