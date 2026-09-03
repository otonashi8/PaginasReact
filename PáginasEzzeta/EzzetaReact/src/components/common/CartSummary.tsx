import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { PermissionGate } from '../PermissionGate';
import { PERMISSIONS } from '../../utils/permissionCodes';
import CartCombos from './CartCombos';
import type { ComboApplied } from '../../services/pricingService';

export default function CartSummary({
  subtotal: _subtotal,
  totalSavings: totalSavingsProp,
  shippingNotConfigured,
  discountedSubtotal,
  discountedTotal,
  combosAplicados,
  onProceedToCheckout,
  isCheckoutDisabled,
}: any) {
  const [expandido, setExpandido] = useState(false);
  const subtotal = Number(_subtotal ?? 0);
  const totalSavings = typeof totalSavingsProp === 'number'
    ? Number(Math.max(0, totalSavingsProp).toFixed(2))
    : Number(Math.max(0, subtotal - Number(discountedSubtotal ?? 0)).toFixed(2));
  return (
    <>
      <div className="mt-8 space-y-5 border-t border-black/10 pt-6 sm:pt-7">

        <div className="rounded-[1.2rem] border border-black/10 bg-white p-5 text-sm shadow-[0_14px_36px_rgba(0,0,0,0.07)]">
          <button
            type="button"
            onClick={() => setExpandido((actual) => !actual)}
            aria-expanded={expandido}
            className="flex w-full items-center justify-between gap-3 text-left font-semibold text-black"
          >
            <span>Resumen del carrito</span>
            <span aria-hidden="true" className="text-lg leading-none">{expandido ? '∨' : '∧'}</span>
          </button>
          <AnimatePresence initial={false}>
            {expandido ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="space-y-3 pt-4">
                  <CartCombos combosAplicados={(combosAplicados ?? []) as ComboApplied[]} />
                  <div className="flex justify-between text-black/70">
                    <span>Total original</span>
                    <span>S/{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Lo Que Ahorras</span>
                    <span className={totalSavings > 0 ? 'font-semibold text-green-600' : 'text-green-600'}>-S/{totalSavings.toFixed(2)}</span>
                  </div>
                  {shippingNotConfigured ? (
                    <p className="text-xs text-orange-600">Selecciona un departamento con tarifa configurada para calcular el envío.</p>
                  ) : null}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
          <div className="mt-3 flex flex-col gap-3 border-t border-black/10 pt-3">
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
