import { EYEBROW_CLASS } from '@/shared/ui/modal'
import { REVEAL_CLASS } from '@/shared/ui/reveal'

function ContactoHero() {
  return (
    <section className="pt-40 pb-14 max-[720px]:pt-30 max-[720px]:pb-10">
      <div className={`reveal mx-auto w-[min(680px,92%)] text-center ${REVEAL_CLASS}`}>
        <span className={`w-full justify-center ${EYEBROW_CLASS}`}>Contáctanos</span>
        <h1 className="my-4.5 font-serif text-[clamp(2.2rem,3.8vw,3rem)] leading-[1.08] font-semibold tracking-[-0.01em] text-vino-oscuro">
          Estamos aquí para ayudarte
        </h1>
        <p className="leading-[1.7] text-[#6b4750]">
          ¿Tienes una duda sobre tu pedido, un producto o quieres proponernos una alianza? Cuéntanos y te respondemos a la brevedad.
        </p>
      </div>
    </section>
  )
}

export default ContactoHero
