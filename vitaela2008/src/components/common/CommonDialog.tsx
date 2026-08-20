import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogTitle } from '@/components/ui/dialog'
import { EYEBROW_CLASS, MODAL_P_CLASS } from '@/shared/ui/modal'

interface CommonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eyebrow?: string
  title: string
  description?: string
  className?: string
  children?: ReactNode
}

/** Wraps shadcn's `Dialog`/`DialogContent` with the site's crema card look (rounded corners,
 * vino border, brand close button) and handles Escape/overlay-click-to-close for free. */
function CommonDialog({ open, onOpenChange, eyebrow, title, description, className = '', children }: CommonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-[rgba(20,10,18,0.75)] backdrop-blur-[10px]" />
        <DialogContent
          showCloseButton={false}
          className={`max-h-[calc(100vh-64px)] gap-0 overflow-y-auto rounded-[32px] border border-[rgba(125,36,56,0.12)] bg-crema p-7.5 text-vino-oscuro shadow-marca sm:max-w-190 max-[720px]:max-h-[calc(100vh-48px)] max-[720px]:p-6 max-[360px]:rounded-[22px] max-[360px]:p-4.5 ${className}`}
        >
          <DialogClose className="absolute top-4.5 right-4.5 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-vino-oscuro text-crema outline-none transition-transform hover:scale-105">
            <X className="mx-auto h-4.5 w-4.5" />
            <span className="sr-only">Cerrar</span>
          </DialogClose>
          {eyebrow && <span className={EYEBROW_CLASS}>{eyebrow}</span>}
          <DialogTitle className="mt-4 mb-2.5 font-serif text-[1.9rem] leading-[1.05] font-semibold tracking-[-0.01em] text-vino-oscuro">
            {title}
          </DialogTitle>
          {description && <DialogDescription className={MODAL_P_CLASS}>{description}</DialogDescription>}
          {children}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}

export default CommonDialog
