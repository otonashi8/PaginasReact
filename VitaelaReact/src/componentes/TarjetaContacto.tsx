interface TarjetaContactoProps {
  open: boolean
  onClose: () => void
}

export default function TarjetaContacto({ open, onClose }: TarjetaContactoProps) {
  if (!open) return null

  return (
    <div className="modal-overlay">
      <div className="modal-card modal-card-small">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar contacto">
          X
        </button>
        <span className="eyebrow">Contacto</span>
        <h2>Habla con nosotros</h2>
        <div className="contact-card">
          <p>
            Escríbenos a <strong>Gerencia@vitaella.pe</strong>
          </p>
          <p>
            Llama o WhatsApp: <strong>+51 973340715</strong> o <strong>+51 903424479</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
