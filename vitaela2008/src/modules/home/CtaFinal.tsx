import { REVEAL_CLASS } from '@/shared/ui/reveal'

function CtaFinal() {
  return (
    <section className="py-22.5">
      <div className="mx-auto w-[min(1180px,92%)]">
        <div
          className={`reveal relative overflow-hidden rounded-[40px] bg-[linear-gradient(135deg,var(--color-vino-oscuro)_0%,var(--color-vino)_60%,#8a2d43_100%)] px-15 py-20 text-center text-crema after:absolute after:-top-50 after:-right-37.5 after:h-125 after:w-125 after:bg-[radial-gradient(circle,rgba(201,162,75,0.35),transparent_70%)] after:content-[''] max-[720px]:px-6 max-[720px]:py-15 max-[520px]:px-5 max-[520px]:py-12 ${REVEAL_CLASS}`}
        >
          <h2 className="relative mb-4 font-serif text-[clamp(2rem,4vw,2.8rem)] leading-[1.05] font-semibold tracking-[-0.01em]">
            Tu piel, cabello y bienestar
            <br />
            se lo merecen
          </h2>
          <p className="relative mx-auto mb-8.5 max-w-120 opacity-90 max-[520px]:max-w-full">
            Únete a miles de personas que ya transformaron su rutina de belleza con Vitaella.
          </p>
          <div className="relative mb-9.5 flex flex-wrap justify-center gap-4">
            <a
              href="#producto"
              className="inline-flex items-center justify-center gap-2.5 rounded-full bg-linear-to-br from-dorado to-[#b48a34] px-8 py-4 text-[0.95rem] font-bold whitespace-nowrap text-vino-oscuro shadow-[0_14px_26px_-10px_rgba(201,162,75,0.6)] transition-transform duration-350 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.75 hover:scale-[1.02]"
            >
              Comprar mi colágeno
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CtaFinal
