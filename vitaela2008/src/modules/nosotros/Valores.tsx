import CommonCard from '@/components/common/CommonCard'
import SectionHeading from '@/components/common/SectionHeading'
import { REVEAL_CLASS } from '@/shared/ui/reveal'
import { valores } from './data'

function Valores() {
  return (
    <section className="py-22.5">
      <div className="mx-auto w-[min(1180px,92%)]">
        <SectionHeading eyebrow="Lo que nos guía" title="Nuestros valores" description="Los principios que sostienen cada decisión, desde una fórmula hasta una respuesta a un mensaje." />

        <div className="grid grid-cols-3 gap-6.5 max-[980px]:grid-cols-2 max-[520px]:grid-cols-1">
          {valores.map(({ icon: Icon, title, description }) => (
            <CommonCard
              key={title}
              className={`reveal px-7.5 py-9 transition-[transform,box-shadow] duration-400 ease hover:-translate-y-2 hover:shadow-marca max-[520px]:px-5.5 max-[520px]:py-7 ${REVEAL_CLASS}`}
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[16px] bg-[linear-gradient(140deg,var(--color-vino-suave),var(--color-durazno))]">
                <Icon className="h-6.5 w-6.5 stroke-vino-oscuro" strokeWidth={1.8} />
              </div>
              <h3 className="mb-2.5 font-serif text-[1.18rem] leading-[1.05] font-semibold tracking-[-0.01em] text-vino-oscuro">{title}</h3>
              <p className="text-[0.94rem] leading-[1.6] text-[#6b4750]">{description}</p>
            </CommonCard>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Valores
