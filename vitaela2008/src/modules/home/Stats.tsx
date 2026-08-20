import { statsData } from './data'
import { useCountUp } from '../../shared/hooks/useCountUp'
import { REVEAL_CLASS } from '@/shared/ui/reveal'

function Stats() {
  useCountUp()

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(120deg,var(--color-vino-oscuro),var(--color-vino))] py-22.5 text-crema before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_85%_20%,rgba(201,162,75,0.25),transparent_55%)] before:content-['']">
      <div className="relative mx-auto grid w-[min(1180px,92%)] grid-cols-4 gap-7.5 text-center max-[980px]:grid-cols-2 max-[980px]:gap-y-9 max-[720px]:gap-y-8">
        {statsData.map((stat) => (
          <div className={`reveal ${REVEAL_CLASS}`} key={stat.label}>
            <div className="font-serif text-[clamp(2.2rem,4vw,3.2rem)] text-dorado-suave stat-num" data-count={stat.count}>
              0
            </div>
            <div className="mt-2 text-[0.85rem] tracking-[0.04em] opacity-85">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Stats
