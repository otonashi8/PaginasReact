import { motion } from 'framer-motion';
import { PermissionGate } from '../PermissionGate';
import { PERMISSIONS } from '../../utils/permissionCodes';

export default function CartSummary({
  subtotal: _subtotal,
  totalSavings: totalSavingsProp,
  promoDiscountAmount,
  shippingNotConfigured,
  discountedSubtotal,
  discountedTotal,
  onProceedToCheckout,
  isCheckoutDisabled,
}: any) {
  const subtotal = Number(_subtotal ?? 0);
  const totalSavings = typeof totalSavingsProp === 'number'
    ? Number(Math.max(0, totalSavingsProp).toFixed(2))
    : Number(Math.max(0, subtotal - Number(discountedSubtotal ?? 0)).toFixed(2));
  return (
    <>
      <div className="mt-8 space-y-5 border-t border-black/10 pt-6 sm:pt-7">

        <div className="space-y-3 rounded-[1.2rem] border border-black/10 bg-white p-5 text-sm shadow-[0_14px_36px_rgba(0,0,0,0.07)]">
          <div className="flex justify-between text-black/70">
            <span>Subtotal</span>
            <span>S/{subtotal.toFixed(2)}</span>
          </div>
          {promoDiscountAmount > 0 ? (
            <div className="flex justify-between text-green-600">
              <span>Descuento aplicado</span>
              <span>-S/{promoDiscountAmount.toFixed(2)}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-green-600">
            <span>Ahorro</span>
            <span className={totalSavings > 0 ? 'font-semibold text-green-600' : 'text-green-600'}>-S/{totalSavings.toFixed(2)}</span>
          </div>
          {shippingNotConfigured ? (
            <p className="text-xs text-orange-600">Selecciona un departamento con tarifa configurada para calcular el envío.</p>
          ) : null}
          <div className="flex flex-col gap-3 border-t border-black/10 pt-3">
            <div className="flex items-center justify-between text-lg font-semibold text-black sm:text-2xl">
              <span>Total</span>
              <span>S/{discountedTotal.toFixed(2)}</span>
            </div>
            <PermissionGate permission={PERMISSIONS.salesCreate}>
              <motion.button
                type="button"
                onClick={onProceedToCheckout}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                disabled={isCheckoutDisabled}
                className={`w-full rounded-full px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(220,38,38,0.3)] transition ${isCheckoutDisabled ? 'cursor-not-allowed bg-zinc-400 hover:bg-zinc-400' : 'bg-red-600 hover:bg-red-500'}`}>
                Pagar ahora
              </motion.button>
            </PermissionGate>
          </div>
        </div>
      </div>
    </>
  );
}
