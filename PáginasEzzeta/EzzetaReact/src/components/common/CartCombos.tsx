import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import type { ComboApplied } from '../../services/pricingService';

type CartCombosProps = {
  combosAplicados: ComboApplied[];
};

export default function CartCombos({ combosAplicados }: CartCombosProps) {
  const [mostrarInfo, setMostrarInfo] = useState(false);

  if (combosAplicados.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {combosAplicados.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          <div className="flex items-center gap-2 font-semibold">
            <span>✓ Combo aplicado</span>
            <button
              type="button"
              onClick={() => setMostrarInfo((actual) => !actual)}
              aria-expanded={mostrarInfo}
              aria-controls="combo-aplicado-info"
              aria-label="acorde a tus productos es el combo que más te conviene"
              className="text-base font-normal leading-none text-green-700 transition hover:text-green-900"
            >
              ⓘ
            </button>
          </div>
          <AnimatePresence initial={false}>
            {mostrarInfo ? (
              <motion.div
                id="combo-aplicado-info"
                role="status"
                initial={{ opacity: 0, height: 0, y: -4 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -4 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="mt-2 overflow-hidden rounded-lg border border-green-200 bg-white/70 px-3 py-2 text-xs font-normal text-green-800"
              >
                Acorde a tus productos es el combo que más te conviene.
              </motion.div>
            ) : null}
          </AnimatePresence>
          <div className="mt-3 space-y-2">
            {combosAplicados.map((combo, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3">
                <span>
                  {combo.regla.nombre} ({combo.instancias} x)
                </span>
                <span className="shrink-0 font-semibold text-green-700">-S/{combo.descuentoTotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
