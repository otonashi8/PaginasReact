import CommonButton from '@/components/common/CommonButton'
import StarRating from '@/components/common/StarRating'
import { BTN_PRIMARIO_CLASS, BTN_SECUNDARIO_CLASS } from '@/shared/ui/buttons'
import { EYEBROW_CLASS } from '@/shared/ui/modal'
import HeroBadge from './HeroBadge'
import HeroBlob from './HeroBlob'

const BLOBS = [
  'top-0 left-[8%] h-[400px] w-[400px] animate-[respirar_10s_ease-in-out_infinite] bg-[radial-gradient(circle_at_30%_30%,var(--color-vino-luz)_0%,var(--color-vino-oscuro)_65%,transparent_92%)] max-[520px]:left-[4%] max-[520px]:h-[320px] max-[520px]:w-[320px]',
  'right-[2%] bottom-[-10px] h-[230px] w-[230px] animate-[respirar_13s_ease-in-out_-4s_infinite] bg-[radial-gradient(circle_at_60%_40%,var(--color-dorado-suave)_0%,var(--color-dorado)_65%,transparent_92%)] max-[520px]:right-[6%] max-[520px]:h-[200px] max-[520px]:w-[200px]',
  'top-[60%] left-0 h-[150px] w-[150px] animate-[respirar_9s_ease-in-out_-2s_infinite] bg-[radial-gradient(circle_at_50%_50%,var(--color-durazno)_0%,var(--color-durazno)_55%,transparent_88%)] max-[520px]:top-[58%] max-[520px]:left-[-6%] max-[520px]:h-[130px] max-[520px]:w-[130px]',
]

const BADGES = [
  {
    label: 'Piel más firme',
    className: 'top-[6%] right-[8%] animate-[flotar_6s_ease-in-out_-1.5s_infinite] max-[520px]:top-[8%] max-[520px]:right-[6%]',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#4C1526" strokeWidth="2" className="h-3.5 w-3.5">
        <path d="M12 2C9 6 6 9 6 13a6 6 0 0 0 12 0c0-4-3-7-6-11z" />
      </svg>
    ),
  },
  {
    label: '100% natural',
    className: 'bottom-[10%] left-0 animate-[flotar_6s_ease-in-out_-3.5s_infinite] max-[520px]:bottom-[8%] max-[520px]:left-[4%]',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#4C1526" strokeWidth="2" className="h-3.5 w-3.5">
        <path d="M4 12h16M4 12l4-4M4 12l4 4" />
      </svg>
    ),
  },
]

function Hero() {
  return (
    <section
      className="relative overflow-hidden pt-42.5 pb-25 max-[720px]:pt-32.5 max-[720px]:pb-15 max-[520px]:pt-27.5 max-[520px]:pb-13 max-[360px]:pt-22.5 max-[360px]:pb-11"
      id="inicio"
    >
      <div className="mx-auto grid w-[min(1180px,92%)] grid-cols-[1.05fr_0.95fr] items-center gap-10 max-[980px]:grid-cols-1 max-[980px]:text-center max-[720px]:gap-6">
        <div>
          <span className={EYEBROW_CLASS}>Belleza natural, resultados reales</span>
          <h1 className="mt-4.5 mb-5.5 font-serif text-[clamp(2.6rem,5vw,4.2rem)] leading-[1.05] font-semibold tracking-[-0.01em] text-vino-oscuro max-[720px]:text-[2.6rem] max-[520px]:text-[2.2rem] max-[360px]:text-[1.95rem]">
            Colágeno que se nota,
            <br />
            <em className="relative whitespace-nowrap text-vino italic">
              naturaleza que se siente
              <svg viewBox="0 0 200 14" preserveAspectRatio="none" className="absolute -bottom-1.5 left-0 h-3.5 w-full">
                <path
                  d="M2 10 Q 50 2, 100 8 T 198 6"
                  stroke="#C9A24B"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </em>
          </h1>
          <p className="mb-8.5 max-w-122.5 text-[1.12rem] leading-[1.7] text-[#5b3a44] max-[980px]:mx-auto max-[720px]:max-w-full max-[720px]:text-base max-[520px]:text-[0.98rem] max-[520px]:leading-[1.65] max-[360px]:text-[0.92rem]">
            Vitaella combina colágeno hidrolizado con ingredientes 100% naturales para devolverle firmeza a tu piel, fuerza a tu cabello y energía a tu cuerpo, desde adentro hacia afuera.
          </p>
          <div className="mb-9.5 flex flex-wrap gap-4 max-[980px]:justify-center max-[360px]:gap-2.5">
            <CommonButton asChild className={BTN_PRIMARIO_CLASS}>
              <a href="#producto">Quiero mi colágeno</a>
            </CommonButton>
            <CommonButton asChild className={BTN_SECUNDARIO_CLASS}>
              <a href="#beneficios">Ver beneficios</a>
            </CommonButton>
          </div>
          <div className="flex items-center gap-4 max-[980px]:justify-center">
            <StarRating />
            <small className="block text-[0.82rem] font-semibold  text-[#7a5560]">+10,000 clientes ya notaron el cambio</small>
          </div>
        </div>

        <div className="relative flex min-h-130 items-center justify-center max-[980px]:mt-5 max-[980px]:h-105 max-[720px]:mt-5 max-[720px]:h-auto max-[520px]:min-h-70">
          {BLOBS.map((className) => (
            <HeroBlob key={className} className={className} />
          ))}

          {BADGES.map((badge) => (
            <HeroBadge key={badge.label} icon={badge.icon} label={badge.label} className={badge.className} />
          ))}

          <div className="relative z-3 animate-[flotar_5s_ease-in-out_infinite] max-[520px]:max-w-[280px]">
            <img
              src="https://ezzetacompany.com/wp-content/uploads/2026/07/Gemini_Generated_Image_xmo2xsxmo2xsxmo2.png"
              alt="Colágeno Vitaella"
              className="h-auto w-full max-w-[320px] rounded-[28px] object-cover shadow-marca"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
