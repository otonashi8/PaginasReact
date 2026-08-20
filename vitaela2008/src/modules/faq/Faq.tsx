import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import CommonDialog from '@/components/common/CommonDialog'

interface FaqProps {
  open: boolean
  onClose: () => void
}

const preguntas = [
  {
    question: '¿Qué beneficios obtengo con Vitaella?',
    answer: 'Mejora la firmeza de la piel, fortalece uñas y cabello, y apoya articulaciones y recuperación muscular con ingredientes naturales.',
  },
  {
    question: '¿Cuánto tarda en notarse el resultado?',
    answer: 'La mayoría de clientes reportan mejoras visibles en 30 días cuando se consume regularmente.',
  },
  {
    question: '¿Cómo se consume el colágeno?',
    answer: 'Se mezcla una cucharada diaria en agua, jugo o bebida fría, idealmente con una fuente de vitamina C para mejor absorción.',
  },
]

export default function Faq({ open, onClose }: FaqProps) {
  return (
    <CommonDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      eyebrow="Preguntas frecuentes"
      title="Respuestas a tus preguntas"
      className="sm:max-w-180"
    >
      <Accordion type="single" collapsible defaultValue={preguntas[0].question}>
        {preguntas.map((item) => (
          <AccordionItem
            key={item.question}
            value={item.question}
            className="border-b border-[rgba(125,36,56,0.14)] last:border-none"
          >
            <AccordionTrigger className="py-4 text-[1.02rem] font-semibold text-vino-oscuro hover:no-underline focus-visible:ring-vino/30 **:data-[slot=accordion-trigger-icon]:text-dorado">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="pb-4 leading-[1.75] text-[#5b3a44]">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </CommonDialog>
  )
}
