import { Compass, Target } from 'lucide-react'
import { REVEAL_CLASS } from '@/shared/ui/reveal'

const ITEMS = [
  {
    icon: Target,
    label: 'Misión',
    text: 'Empoderar a cada persona para que cuide su piel, cabello y bienestar con productos naturales, honestos y respaldados por la ciencia, haciendo que sentirse bien por dentro y por fuera sea parte de su rutina diaria.',
  },
  {
    icon: Compass,
    label: 'Visión',
    text: 'Ser la marca de bienestar natural más querida de Latinoamérica, reconocida por transformar vidas a través de fórmulas simples, efectivas y creadas con propósito.',
  },
]

function MisionVision() {
  return (
    <section className="py-22.5">
      <div className={`reveal relative mx-auto w-[min(1180px,92%)] overflow-hidden rounded-[40px] bg-[linear-gradient(180deg,var(--color-crema-2),var(--color-crema))] ${REVEAL_CLASS}`}>
        <div className="grid grid-cols-2 divide-x divide-[rgba(125,36,56,0.12)] max-[720px]:grid-cols-1 max-[720px]:divide-x-0 max-[720px]:divide-y">
          {ITEMS.map(({ icon: Icon, label, text }) => (
            <div key={label} className="px-12 py-15 max-[720px]:px-7.5 max-[720px]:py-10">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[16px] bg-linear-to-br from-vino to-vino-oscuro shadow-marca">
                <Icon className="h-6.5 w-6.5 text-crema" strokeWidth={1.8} />
              </div>
              <h2 className="mb-3.5 font-serif text-[1.6rem] font-semibold tracking-[-0.01em] text-vino-oscuro">{label}</h2>
              <p className="max-w-110 leading-[1.75] text-[#6b4750]">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default MisionVision
