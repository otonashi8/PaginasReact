import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import CommonButton from '@/components/common/CommonButton'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { PRODUCT_IMAGE_OVERRIDES } from '@/modules/tienda/data'
import { useCart } from '@/shared/cart/CartContext'
import { BTN_PRIMARIO_CLASS } from '@/shared/ui/buttons'

interface CartDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, totalPrice } = useCart()
  const navigate = useNavigate()

  const handleCheckout = () => {
    onOpenChange(false)
    navigate('/checkout')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-4/5 gap-0 bg-crema sm:max-w-sm">
        <SheetHeader>
          <SheetTitle className="font-serif text-[1.15rem] font-semibold text-vino-oscuro">Tu carrito</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center text-[#8a6670]">
            <ShoppingBag className="h-10 w-10" strokeWidth={1.5} />
            <p>Tu carrito está vacío.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4">
              <div className="grid gap-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3.5 border-b border-[rgba(125,36,56,0.1)] pb-4">
                    <img src={PRODUCT_IMAGE_OVERRIDES[item.id] ?? item.image} alt={item.name} className="h-16 w-16 shrink-0 rounded-[14px] object-cover" />
                    <div className="flex flex-1 flex-col gap-1.5">
                      <span className="text-[0.9rem] font-semibold text-vino-oscuro">{item.name}</span>
                      <span className="text-[0.82rem] text-[#8a6670]">S/ {item.unitPrice.toFixed(2)} c/u</span>
                      <div className="mt-1 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-[rgba(125,36,56,0.08)] text-vino-oscuro"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label="Reducir cantidad"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-5 text-center text-[0.9rem] font-bold">{item.quantity}</span>
                          <button
                            type="button"
                            className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-[rgba(125,36,56,0.08)] text-vino-oscuro"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          className="text-[#8a6670] hover:text-vino"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Quitar ${item.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 border-t border-[rgba(125,36,56,0.12)] p-4 pt-5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-vino-oscuro">Total</span>
                <span className="font-serif text-[1.3rem] font-semibold text-vino-oscuro">S/ {totalPrice.toFixed(2)}</span>
              </div>
              <CommonButton className={`${BTN_PRIMARIO_CLASS} w-full justify-center`} onClick={handleCheckout}>
                Ir al checkout
              </CommonButton>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default CartDrawer
