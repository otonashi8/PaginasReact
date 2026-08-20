import { Check, Sparkles } from 'lucide-react'

interface CartAddedNotificationProps {
  productName: string
}

function CartAddedNotification({ productName }: CartAddedNotificationProps) {
  return (
    <div className="pointer-events-none fixed top-5 right-5 z-60 w-[min(360px,calc(100%-2rem))] animate-[notificacion-entrada_500ms_cubic-bezier(0.2,0.8,0.2,1)]" role="alert">
      <div className="relative overflow-hidden rounded-[18px] border border-[rgba(201,162,75,0.45)] bg-blanco px-4.5 py-4 shadow-[0_18px_45px_-18px_rgba(76,21,38,0.55)]">
        <div className="fuegos-artificiales" aria-hidden="true">
          {Array.from({ length: 8 }, (_, index) => <span key={index} style={{ '--particula': index } as React.CSSProperties} />)}
        </div>
        <div className="relative flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-verde text-blanco">
            <Check className="size-5" strokeWidth={2.5} />
          </span>
          <p className="min-w-0 text-[0.88rem] leading-[1.35] text-vino-oscuro">
            <strong className="font-bold">{productName}</strong> agregado al carrito
          </p>
          <Sparkles className="ml-auto size-5 shrink-0 text-dorado" />
        </div>
      </div>
    </div>
  )
}

export default CartAddedNotification