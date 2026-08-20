import SectionHeading from '@/components/common/SectionHeading'
import { REVEAL_CLASS } from '@/shared/ui/reveal'
import { hitos } from './data'

function NuestraHistoria() {
  return (
    <section id="historia" className="py-22.5">
      <div className="mx-auto w-[min(1180px,92%)]">
        <SectionHeading eyebrow="Nuestro camino" title="Una historia hecha de constancia" />

        <div className="relative grid grid-cols-4 gap-6.5 max-[980px]:grid-cols-2 max-[520px]:grid-cols-1">
          <div className="absolute top-5.5 right-0 left-0 h-0.5 bg-[repeating-linear-gradient(90deg,rgba(201,162,75,0.5)_0px,rgba(201,162,75,0.5)_10px,transparent_10px,transparent_20px)] max-[980px]:hidden" />
          {hitos.map((hito) => (
            <div key={hito.year} className={`reveal relative ${REVEAL_CLASS}`}>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-vino-oscuro font-serif text-[0.85rem] font-bold text-dorado-suave shadow-marca">
                {hito.year}
              </div>
              <h3 className="mb-2 font-serif text-[1.08rem] leading-[1.15] font-semibold text-vino-oscuro">{hito.title}</h3>
              <p className="text-[0.9rem] leading-[1.6] text-[#6b4750]">{hito.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default NuestraHistoria
