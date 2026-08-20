import SectionHeading from '@/components/common/SectionHeading'
import { beneficios } from './data'
import BeneficioCard from './BeneficioCard'

function Beneficios() {
  return (
    <section id="beneficios" className="py-22.5">
      <div className="mx-auto w-[min(1180px,92%)]">
        <SectionHeading
          eyebrow="Por qué tomar colágeno"
          title="Beneficios que se ven y se sienten"
          description="El colágeno es la proteína más abundante del cuerpo, pero su producción baja con los años. Vitaella ayuda a reponerlo de forma natural."
        />

        <div className="grid grid-cols-3 gap-6.5 max-[980px]:grid-cols-2 max-[720px]:grid-cols-1">
          {beneficios.map((beneficio) => (
            <BeneficioCard key={beneficio.title} icon={beneficio.icon} title={beneficio.title} description={beneficio.description} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Beneficios
