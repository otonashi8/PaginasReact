import { Leaf, Sparkles, Truck } from 'lucide-react'
import HeroBlob from '@/modules/home/HeroBlob'
import { EYEBROW_CLASS } from '@/shared/ui/modal'
import { REVEAL_CLASS } from '@/shared/ui/reveal'

const HIGHLIGHTS = [
  { icon: Sparkles, label: '10 líneas de producto' },
  { icon: Leaf, label: '100% ingredientes naturales' },
  { icon: Truck, label: 'Envío en 24-48h' },
]

function TiendaHero() {
  return (
    <section className="relative overflow-hidden pt-40 pb-16 max-[720px]:pt-30 max-[720px]:pb-11">
      <HeroBlob className="top-[-60px] right-[6%] h-[280px] w-[280px] animate-[respirar_11s_ease-in-out_infinite] bg-[radial-gradient(circle_at_35%_35%,var(--color-dorado-suave)_0%,var(--color-dorado)_65%,transparent_92%)] opacity-70" />
      <HeroBlob className="bottom-[-70px] left-[4%] h-[220px] w-[220px] animate-[respirar_13s_ease-in-out_-3s_infinite] bg-[radial-gradient(circle_at_50%_50%,var(--color-durazno)_0%,var(--color-durazno)_60%,transparent_90%)] opacity-70" />

      <div className={`reveal relative mx-auto w-[min(760px,92%)] text-center ${REVEAL_CLASS}`}>
        <span className={`w-full justify-center ${EYEBROW_CLASS}`}>Catálogo Vitaella</span>
        <h1 className="mt-4.5 mb-5 font-serif text-[clamp(2.4rem,4.4vw,3.4rem)] leading-[1.08] font-semibold tracking-[-0.01em] text-vino-oscuro">
          Todo lo que tu piel, cabello y bienestar necesitan
        </h1>
        <p className="mx-auto mb-8 max-w-140 text-[1.02rem] leading-[1.7] text-[#5b3a44]">
          Explora nuestra línea completa de colágenos, vitaminas y cuidado natural, pensada para acompañarte todos los días.
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          {HIGHLIGHTS.map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-2 text-[0.85rem] font-semibold text-vino-oscuro">
              <Icon className="size-4 text-dorado" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TiendaHero
