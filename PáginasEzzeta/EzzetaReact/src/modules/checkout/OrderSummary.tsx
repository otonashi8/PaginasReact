import { Check, ShieldCheck, ShoppingBag } from 'lucide-react';
import { Button } from '../../components/ui/button';

export function OrderSummary({
  items,
  totalPrice,
  productsExpanded,
  onToggleProducts,
  couponInput,
  onCouponInputChange,
  onApplyCoupon,
  couponMessage,
  discountTotal,
  appliedCouponCode,
  selectedDepartmentName,
  etiquetaEnvio,
  checkoutTotal,
  onConfirm,
  confirmingOrder,
  confirmError,
  canConfirm,
}: any) {
  const subtotal = Number(totalPrice ?? 0);
  return (
    <aside className="border border-[rgba(125,36,56,0.12)] bg-[#fffaf7] p-5 shadow-[0_22px_70px_rgba(91,31,38,0.08)]">
      <div className="flex items-center justify-between border-b border-[rgba(125,36,56,0.1)] pb-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-vino">Resumen</p>
          <h3 className="mt-2 text-2xl font-semibold text-vino-oscuro">Tu pedido</h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center bg-vino text-crema">
          <ShoppingBag className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <button type="button" onClick={onToggleProducts} className="flex w-full items-center justify-between text-sm font-semibold text-vino-oscuro">
          <span>{items.length} productos</span>
          <span>{productsExpanded ? 'Ocultar' : 'Mostrar'}</span>
        </button>

        {productsExpanded ? (
          <div className="space-y-3">
            {items.map((item: any) => (
              <div key={`${item.id}-${item.size}`} className="flex gap-3 border border-[rgba(125,36,56,0.08)] bg-white p-3">
                <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-vino-oscuro">{item.name}</p>
                  <p className="mt-1 text-sm text-[#7b5e63]">Talla {item.size || 'Única'} · {item.quantity} und.</p>
                  <p className="mt-2 text-sm font-bold text-vino">S/ {(item.unitPrice * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-5 border border-[rgba(125,36,56,0.08)] bg-white p-4">
        <div className="flex gap-2">
          <input
            value={couponInput}
            onChange={(event) => onCouponInputChange(event.target.value)}
            placeholder="Código promocional"
            className="h-11 flex-1 border border-[rgba(125,36,56,0.16)] bg-[#fffaf7] px-3 text-sm outline-none focus:border-vino"
          />
          <Button onClick={onApplyCoupon} className="h-11 px-3">Aplicar</Button>
        </div>
        {couponMessage ? <p className="mt-2 text-sm text-[#7a5560]">{couponMessage}</p> : null}
        {appliedCouponCode ? <p className="mt-2 text-sm font-semibold text-verde">Cupón activo: {appliedCouponCode}</p> : null}
      </div>

      <div className="mt-5 space-y-3 text-sm text-[#6b4750]">
        <div className="flex justify-between"><span>Subtotal</span><span>S/ {subtotal.toFixed(2)}</span></div>
        {discountTotal > 0 ? <div className="flex justify-between text-green-600"><span>Descuento</span><span>-S/ {discountTotal.toFixed(2)}</span></div> : null}
        <div className="flex justify-between"><span>Envío</span><span>{etiquetaEnvio}</span></div>
        <div className="flex justify-between"><span>Departamento</span><span>{selectedDepartmentName || 'Sin seleccionar'}</span></div>
      </div>

      <div className="mt-5 bg-[rgba(255, 255, 255, 0.1)] p-4">
        <div className="flex items-center justify-between text-lg font-semibold text-black">
          <span>Total</span>
          <span>S/ {Number(checkoutTotal ?? 0).toFixed(2)}</span>
        </div>
      </div>

      <Button onClick={onConfirm} disabled={!canConfirm || confirmingOrder} className="mt-5 h-12 w-full bg-vino text-crema hover:bg-vino-oscuro disabled:cursor-not-allowed disabled:opacity-60">
        {confirmingOrder ? 'Confirmando...' : 'Confirmar compra'}
      </Button>

      {confirmError ? <p className="mt-3 text-sm font-medium text-red-600">{confirmError}</p> : null}

      <div className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#7a5560]">
        <ShieldCheck className="h-4 w-4 text-verde" />
        Compra segura
      </div>

      <div className="mt-4 flex items-center gap-2 border border-[rgba(125,36,56,0.08)] bg-white p-3 text-sm text-[#7a5560]">
        <Check className="h-4 w-4 text-verde" />
        Pago con protección y confirmación local.
      </div>
    </aside>
  );
}
