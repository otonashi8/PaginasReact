import { motion } from 'framer-motion';

export default function CartSummary({
  subtotal,
  discountAmount,
  promoDiscountAmount,
  shipping,
  discountedSubtotal,
  discountedTotal,
  hasActivePlan,
  activePlan,
  onApplyPromo,
  promoMessage,
  appliedPromo,
  promoCodeInput,
  setPromoCodeInput,
  removeAppliedPromo,
  setIsMembershipModalOpen,
  setCheckoutStep,
}: any) {
  return (
    <div className="mt-8 space-y-5 border-t border-black/10 pt-6 sm:pt-7">
      <div className="border-t border-black/10 pt-6 text-sm text-black">
        <p className="font-semibold uppercase tracking-[0.2em] text-black">Código promocional</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={promoCodeInput}
            onChange={(event) => setPromoCodeInput(event.target.value)}
            placeholder="Ingresa tu cupón"
            className="w-full border border-neutral-300 bg-white px-4 py-3 text-black outline-none transition focus:border-black"
          />
          <motion.button
            type="button"
            onClick={onApplyPromo}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="border border-black bg-black px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-red-600 hover:border-red-600"
          >
            Aplicar
          </motion.button>
        </div>
        {promoMessage ? (
          <p className={`mt-3 text-sm ${promoMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {promoMessage.text}
          </p>
        ) : null}

        {appliedPromo ? (
          <div className="mt-4 border border-green-600 bg-green-50 p-4 text-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">Cupón aplicado</p>
                <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
                  {appliedPromo.code}{' '}
                  {appliedPromo.type === 'percentage'
                    ? `(-${appliedPromo.value}%)`
                    : appliedPromo.type === 'fixed'
                    ? `(-S/${appliedPromo.value})`
                    : '(Envío gratis)'}
                </p>
              </div>
              <motion.button
                type="button"
                onClick={removeAppliedPromo}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="border border-red-600 px-4 py-2 text-sm font-semibold uppercase text-red-600 transition hover:bg-red-600 hover:text-white"
              >
                Eliminar
              </motion.button>
            </div>
          </div>
        ) : null}
      </div>

      {!hasActivePlan && (
        <div className="border-l-4 border-red-600 bg-neutral-50 p-5 text-sm">
          <p className="font-semibold text-black">¿Quieres unirte al programa mayorista?</p>
          <p className="mt-2 text-sm text-black/60">Elige un plan y continúa con el mismo flujo de registro compartido por toda la app.</p>
          <motion.button
            type="button"
            onClick={() => setIsMembershipModalOpen(true)}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="mt-5 w-full border border-black bg-black px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:border-red-600 hover:bg-red-600"
          >
            Quiero unirme
          </motion.button>
        </div>
      )}

      {hasActivePlan && (
        <div className="border-l-4 border-green-600 bg-green-50 p-5 text-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-black/50">Plan activo</p>
              <p className="mt-1 font-semibold text-black">{activePlan.nombre}</p>
            </div>
            <span className="border border-green-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-green-700">{activePlan.descuento}%</span>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-black/70">
              <span>Subtotal</span>
              <span>S/{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-black/70">
              <span>Descuento</span>
              <span>-S/{discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-black/70">
              <span>Total</span>
              <span>S/{discountedSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Ahorro obtenido</span>
              <span>S/{discountAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 border-t-2 border-black bg-neutral-50 pt-6 text-sm">
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
        <div className="flex justify-between text-black/60">
          <span>Envío (&gt; S/300 gratis)</span>
          <span className={shipping === 0 ? 'font-semibold text-green-600' : 'text-black/80'}>{shipping === 0 ? 'GRATIS' : `S/${shipping}`}</span>
        </div>
        <div className="flex flex-col gap-3 border-t border-black/10 pt-3">
          <div className="flex items-center justify-between border-t border-black pt-5 text-2xl font-bold uppercase text-black">
            <span>Total final</span>
            <span>S/{discountedTotal.toFixed(2)}</span>
          </div>
          <motion.button
            type="button"
            onClick={() => setCheckoutStep('checkout')}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            className="w-full border border-red-600 bg-red-600 px-6 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-black hover:border-black"
          >
            Pagar ahora
          </motion.button>
        </div>
      </div>
    </div>
  );
}
