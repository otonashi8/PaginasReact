import CommonButton from '@/components/common/CommonButton'
import { BTN_PRIMARIO_CLASS } from '@/shared/ui/buttons'
import { REVEAL_CLASS } from '@/shared/ui/reveal'

function Esencia() {
  return (
    <section id="esencia" className="py-22.5">
      <div className="mx-auto grid w-[min(1180px,92%)] grid-cols-2 items-center gap-15 max-[720px]:grid-cols-1">
        <img
          src="https://ezzetacompany.com/wp-content/uploads/2026/07/Gemini_Generated_Image_9xkraj9xkraj9xkr.png"
          alt="Ingredientes naturales Vitaella"
          className={`reveal h-auto w-full rounded-[28px] object-cover shadow-marca ${REVEAL_CLASS}`}
        />
        <div className={`reveal ${REVEAL_CLASS}`}>
          <span className="inline-flex items-center gap-2 text-[0.72rem] font-bold tracking-[0.16em] text-vino uppercase before:inline-block before:h-0.5 before:w-4.5 before:bg-dorado before:content-['']">
            Nuestra esencia
          </span>
          <h2 className="my-4 font-serif text-[clamp(1.9rem,3vw,2.4rem)] leading-[1.05] font-semibold tracking-[-0.01em] text-vino-oscuro">
            Naturaleza pura, ciencia con propósito
          </h2>
          <p className="leading-[1.7] text-[#6b4750]">
            En Vitaella seleccionamos cada ingrediente pensando en tu bienestar real. Trabajamos con proveedores que cultivan de forma responsable y procesos que conservan lo mejor de cada planta.
          </p>
          <p className="leading-[1.7] text-[#6b4750]">
            Sin rellenos innecesarios, sin promesas vacías: solo fórmulas simples que funcionan.
          </p>
          <div className="mb-9.5 flex flex-wrap gap-4 max-[980px]:justify-center">
            <CommonButton asChild className={BTN_PRIMARIO_CLASS}>
              <a href="#producto">Conoce el colágeno</a>
            </CommonButton>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Esencia
