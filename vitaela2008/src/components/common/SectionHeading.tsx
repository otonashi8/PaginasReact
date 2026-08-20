import { EYEBROW_CLASS } from '@/shared/ui/modal'
import { REVEAL_CLASS } from '@/shared/ui/reveal'

interface SectionHeadingProps {
  eyebrow: string
  title: string
  description?: string
}

function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className={`reveal mx-auto mb-15 max-w-[640px] text-center ${REVEAL_CLASS}`}>
      <span className={`w-full justify-center ${EYEBROW_CLASS}`}>{eyebrow}</span>
      <h2 className="my-4 font-serif text-[clamp(2rem,3.4vw,2.7rem)] leading-[1.05] font-semibold tracking-[-0.01em] text-vino-oscuro">
        {title}
      </h2>
      {description && <p className="text-[1.02rem] leading-[1.6] text-[#6b4750]">{description}</p>}
    </div>
  )
}

export default SectionHeading
