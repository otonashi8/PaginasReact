import type { LucideIcon } from 'lucide-react'
import CommonCard from '@/components/common/CommonCard'
import { REVEAL_CLASS } from '@/shared/ui/reveal'

interface BeneficioCardProps {
  icon: LucideIcon
  title: string
  description: string
}

function BeneficioCard({ icon: Icon, title, description }: BeneficioCardProps) {
  return (
    <CommonCard
      className={`reveal px-7.5 py-9 transition-[transform,box-shadow] duration-400 ease hover:-translate-y-2 hover:shadow-marca max-[520px]:px-5.5 max-[520px]:py-7 ${REVEAL_CLASS}`}
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[16px] bg-[linear-gradient(140deg,var(--color-vino-suave),var(--color-durazno))]">
        <Icon className="h-6.5 w-6.5 stroke-vino-oscuro" strokeWidth={1.8} />
      </div>
      <h3 className="mb-2.5 font-serif text-[1.18rem] leading-[1.05] font-semibold tracking-[-0.01em] text-vino-oscuro">{title}</h3>
      <p className="text-[0.94rem] leading-[1.6] text-[#6b4750]">{description}</p>
    </CommonCard>
  )
}

export default BeneficioCard
