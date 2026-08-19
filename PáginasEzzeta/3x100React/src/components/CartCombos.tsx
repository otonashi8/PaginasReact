import { motion } from 'framer-motion';
import type { ComboApplied } from '../services/pricingService';

type CartCombosProps = {
  combosAplicados: ComboApplied[];
  combosIncompletos: ComboApplied[];
};

export default function CartCombos({ combosAplicados, combosIncompletos }: CartCombosProps) {
  if (combosAplicados.length === 0 && combosIncompletos.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Combos Aplicados */}
      {combosAplicados.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[1.2rem] border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          <p className="font-semibold mb-2">✓ Combos aplicados</p>
          <div className="space-y-2">
            {combosAplicados.map((combo, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span>
                  {combo.regla.nombre} ({combo.instancias} x)
                </span>
                <span className="font-semibold text-green-700">-S/{combo.descuentoTotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Combos Incompletos */}
      {combosIncompletos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[1.2rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
        >
          <p className="font-semibold mb-2">💡 Completa un combo</p>
          <div className="space-y-2">
            {combosIncompletos.map((combo, idx) => (
              <div key={idx} className="text-amber-700">
                <p className="font-medium">{combo.regla.nombre}</p>
                {combo.mensajeOportunidad && (
                  <p className="text-xs mt-1">{combo.mensajeOportunidad} S/{combo.regla.configuracion?.precioCombo}</p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
