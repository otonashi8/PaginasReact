import { useEffect, useState } from 'react'
import { testimonios } from './data'
import CommonCard from '@/components/common/CommonCard'
import SectionHeading from '@/components/common/SectionHeading'
import StarRating from '@/components/common/StarRating'

function Testimonios() {
  const [startIndex, setStartIndex] = useState(0)

  useEffect(() => {
    const rotation = window.setInterval(() => {
      setStartIndex((current) => (current + 1) % testimonios.length)
    }, 4000)

    return () => window.clearInterval(rotation)
  }, [])

  const visibleTestimonios = Array.from({ length: Math.min(3, testimonios.length) }, (_, offset) => testimonios[(startIndex + offset) % testimonios.length])

  return (
    <section id="testimonios" className="py-22.5">
      <div className="mx-auto w-[min(1180px,92%)]">
        <SectionHeading eyebrow="Lo que dicen de nosotras" title="Historias reales, resultados reales" />
        <div key={startIndex} className="grid animate-[opiniones-entrada_700ms_cubic-bezier(0.2,0.7,0.2,1)] grid-cols-3 gap-6.5 max-[980px]:grid-cols-1">
          {visibleTestimonios.map((item) => (
            <CommonCard className="rounded-[24px] p-8" key={item.name}>
              <StarRating className="mb-4" />
              <p className="mb-5 text-[0.96rem] leading-[1.7] text-[#4a2b34]">{item.quote}</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10.5 w-10.5 items-center justify-center rounded-full bg-[linear-gradient(140deg,var(--color-vino-luz),var(--color-dorado))] font-serif font-extrabold text-blanco">
                  {item.initial}
                </div>
                <div>
                  <strong className="block text-[0.9rem]">{item.name}</strong>
                  <span className="text-[0.78rem] text-[#8a6670]">{item.note}</span>
                </div>
              </div>
            </CommonCard>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonios
