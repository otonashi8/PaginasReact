import { useEffect, useState } from 'react'
import { ArrowUp, Camera, ChevronDown, ChevronUp, Mail, MessageCircle, Music2, Share2, X } from 'lucide-react'
import { canales } from '@/modules/contacto/data'

const FAQS = [
  {
    question: '¿Qué productos ofrecen?',
    answer: 'Ofrecemos colágeno, vitaminas, productos de skincare y opciones de bienestar con ingredientes seleccionados.',
  },
  {
    question: '¿Cuánto demora el envío?',
    answer: 'Los pedidos se entregan normalmente en 24 a 48 horas. El envío es gratis desde S/150.',
  },
  {
    question: '¿Qué medios de pago aceptan?',
    answer: 'Puedes pagar con tarjeta y Yape mediante nuestro proceso de compra seguro.',
  },
  {
    question: '¿Puedo hacer cambios o devoluciones?',
    answer: 'Sí. Aceptamos cambios y devoluciones dentro de los 15 días, según las condiciones de la compra.',
  },
]

const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com/vitaella.pe', icon: Camera },
  { label: 'Facebook', href: 'https://facebook.com/vitaella.pe', icon: Share2 },
  { label: 'TikTok', href: 'https://tiktok.com/@vitaella.pe', icon: Music2 },
]

function FloatingTools() {
  const [showTop, setShowTop] = useState(false)
  const [openPanel, setOpenPanel] = useState<'social' | 'chat' | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 420)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <div className="fixed right-5 bottom-5 z-40 flex flex-col items-end gap-3 max-[520px]:right-4 max-[520px]:bottom-4">
      <div className={`grid transition-[grid-template-rows,opacity,transform] duration-300 ease-out ${openPanel === 'social' ? 'grid-rows-[1fr] translate-y-0 opacity-100' : 'pointer-events-none grid-rows-[0fr] translate-y-2 opacity-0'}`}>
        <div className="min-h-0 overflow-hidden">
          <div className="w-56 rounded-[20px] border border-[rgba(125,36,56,0.12)] bg-blanco p-4 shadow-[0_18px_45px_-18px_rgba(76,21,38,0.5)]">
          <div className="mb-3 flex items-center justify-between">
            <strong className="font-serif text-[1.05rem] text-vino-oscuro">Síguenos</strong>
            <button type="button" onClick={() => setOpenPanel(null)} className="rounded-full p-1 text-[#8a6670] hover:bg-vino-suave hover:text-vino" aria-label="Cerrar redes sociales">
              <X className="size-4" />
            </button>
          </div>
          <div className="grid gap-2">
            {SOCIALS.map(({ label, href, icon: Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[0.84rem] font-semibold text-vino-oscuro hover:bg-vino-suave">
                <Icon className="size-4 text-vino" />
                {label}
              </a>
            ))}
          </div>
          </div>
        </div>
      </div>

      <div className={`grid transition-[grid-template-rows,opacity,transform] duration-300 ease-out ${openPanel === 'chat' ? 'grid-rows-[1fr] translate-y-0 opacity-100' : 'pointer-events-none grid-rows-[0fr] translate-y-2 opacity-0'}`}>
        <div className="min-h-0 overflow-hidden">
          <div className="w-[min(370px,calc(100vw-2rem))] overflow-hidden rounded-[22px] border border-[rgba(125,36,56,0.12)] bg-blanco shadow-[0_18px_45px_-18px_rgba(76,21,38,0.5)]">
          <div className="flex items-center justify-between bg-vino px-5 py-4 text-crema">
            <div>
              <strong className="block font-serif text-[1.1rem]">Hola, somos Vitaella</strong>
              <span className="text-[0.75rem] text-crema/80">Resolvemos tus dudas</span>
            </div>
            <button type="button" onClick={() => setOpenPanel(null)} className="rounded-full p-1.5 hover:bg-white/15" aria-label="Cerrar chatbot">
              <X className="size-4" />
            </button>
          </div>

          <div className="max-h-[min(440px,65vh)] overflow-y-auto p-4">
            <p className="mb-3 text-[0.8rem] font-semibold text-[#6b4750]">¿En qué podemos ayudarte?</p>
            <div className="grid gap-2">
              {FAQS.map((faq, index) => {
                const expanded = openFaq === index
                return (
                  <div key={faq.question} className="rounded-xl bg-crema-2/60">
                    <button type="button" onClick={() => setOpenFaq(expanded ? null : index)} className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-[0.8rem] font-bold text-vino-oscuro">
                      {faq.question}
                      {expanded ? <ChevronUp className="size-4 shrink-0 text-vino" /> : <ChevronDown className="size-4 shrink-0 text-vino" />}
                    </button>
                    <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                      <p className={`overflow-hidden px-3 text-[0.78rem] leading-[1.5] text-[#6b4750] transition-[opacity,transform,padding] duration-300 ease-out ${expanded ? 'translate-y-0 pb-3 opacity-100' : '-translate-y-2 pb-0 opacity-0'}`}>
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 border-t border-[rgba(125,36,56,0.1)] pt-4">
              <p className="mb-2 text-[0.8rem] font-bold text-vino-oscuro">¿Necesitas ayuda personalizada?</p>
              <div className="grid gap-1.5">
                {canales.map((canal) => {
                  const Icon = canal.label === 'Correo' ? Mail : MessageCircle
                  return (
                    <a key={canal.value} href={canal.href} target={canal.href.startsWith('http') ? '_blank' : undefined} rel={canal.href.startsWith('http') ? 'noopener noreferrer' : undefined} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[0.78rem] font-semibold text-vino hover:bg-vino-suave">
                      <Icon className="size-3.5" />
                      {canal.value}
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {showTop && (
          <button type="button" onClick={scrollToTop} className="flex size-11 items-center justify-center rounded-full border border-[rgba(125,36,56,0.15)] bg-blanco text-vino-oscuro shadow-[0_10px_25px_-12px_rgba(76,21,38,0.55)] transition-transform hover:-translate-y-1" aria-label="Volver arriba">
            <ArrowUp className="size-5" />
          </button>
        )}
        <button type="button" onClick={() => setOpenPanel(openPanel === 'social' ? null : 'social')} className="flex h-11 items-center gap-2 rounded-full bg-dorado px-4 text-[0.78rem] font-bold text-vino-oscuro shadow-[0_10px_25px_-12px_rgba(76,21,38,0.55)] transition-transform hover:-translate-y-1" aria-label="Síguenos en redes sociales">
          <Share2 className="size-4" />
          <span className="max-[420px]:hidden">Síguenos</span>
        </button>
        <button type="button" onClick={() => setOpenPanel(openPanel === 'chat' ? null : 'chat')} className="flex size-12 items-center justify-center rounded-full bg-vino text-crema shadow-[0_12px_28px_-12px_rgba(76,21,38,0.7)] transition-transform hover:-translate-y-1" aria-label="Abrir chatbot de ayuda">
          <MessageCircle className="size-5.5" />
        </button>
      </div>
    </div>
  )
}

export default FloatingTools