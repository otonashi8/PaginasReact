import type { ReactNode } from 'react'

interface HeroBadgeProps {
  icon: ReactNode
  label: string
  className: string
}

function HeroBadge({ icon, label, className }: HeroBadgeProps) {
  return (
    <div
      className={`absolute select-none z-4 flex items-center gap-2 rounded-[16px] bg-blanco px-4 py-3 text-[0.78rem] font-bold shadow-marca ${className}`}
    >
      <span className=" flex h-6.5 w-6.5 items-center justify-center rounded-full bg-verde/15">{icon}</span>
      {label}
    </div>
  )
}

export default HeroBadge
