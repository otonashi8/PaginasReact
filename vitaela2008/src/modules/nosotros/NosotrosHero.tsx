import { Link } from 'react-router-dom'
import CommonButton from '@/components/common/CommonButton'
import { BTN_PRIMARIO_CLASS, BTN_SECUNDARIO_CLASS } from '@/shared/ui/buttons'
import { EYEBROW_CLASS } from '@/shared/ui/modal'
import { REVEAL_CLASS } from '@/shared/ui/reveal'

function NosotrosHero() {
  return (
    <section className="pt-40 pb-20 max-[720px]:pt-30 max-[720px]:pb-14">
      <div className="mx-auto grid w-[min(1180px,92%)] grid-cols-2 items-center gap-15 max-[720px]:grid-cols-1">
        <img
          src="https://ezzetacompany.com/wp-content/uploads/2026/07/Gemini_Generated_Image_9xkraj9xkraj9xkr.png"
          alt="Ingredientes naturales Vitaella"
          className={`reveal h-auto w-full rounded-[28px] object-cover shadow-marca ${REVEAL_CLASS}`}
        />
        <div className={`reveal ${REVEAL_CLASS}`}>
          <span className={EYEBROW_CLASS}>Sobre nosotros</span>
          <h1 className="my-4.5 font-serif text-[clamp(2.2rem,3.8vw,3rem)] leading-[1.08] font-semibold tracking-[-0.01em] text-vino-oscuro">
            Belleza que nace de la naturaleza, ciencia que la potencia
          </h1>
          <p className="mb-4 leading-[1.7] text-[#6b4750]">
            Vitaella nació en Perú con una idea simple: devolverle a la piel, el cabello y el cuerpo lo que la rutina diaria les quita, usando
            ingredientes naturales y fórmulas respaldadas por la ciencia.
          </p>
          <p className="mb-8.5 leading-[1.7] text-[#6b4750]">
            Hoy somos una comunidad de miles de personas que eligieron cuidarse desde adentro, sin promesas vacías ni ingredientes de relleno.
          </p>
          <div className="flex flex-wrap gap-4">
            <CommonButton asChild className={BTN_PRIMARIO_CLASS}>
              <Link to="/tienda">Conoce nuestros productos</Link>
            </CommonButton>
            <CommonButton asChild className={BTN_SECUNDARIO_CLASS}>
              <a href="#historia">Nuestra historia</a>
            </CommonButton>
          </div>
        </div>
      </div>
    </section>
  )
}

export default NosotrosHero
