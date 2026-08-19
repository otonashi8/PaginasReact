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
  if (!open) return null

  return (
    <div className="modal-overlay">
      <div className="modal-card modal-card-wide">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar FAQ">
          X
        </button>
        <span className="eyebrow">Preguntas frecuentes</span>
        <h2>Respuestas a tus preguntas</h2>
        <div className="faq-list">
          {preguntas.map((item) => (
            <details key={item.question} open>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}
