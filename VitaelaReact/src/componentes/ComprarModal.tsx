import { useState } from 'react'

interface ComprarModalProps {
  open: boolean
  onClose: () => void
  onComplete: () => void
}

export default function ComprarModal({ open, onClose, onComplete }: ComprarModalProps) {
  const [step, setStep] = useState(1)
  const [quantity, setQuantity] = useState(1)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [locationText, setLocationText] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'tarjeta' | 'yape'>('tarjeta')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [yapePhone, setYapePhone] = useState('')
  const [completed, setCompleted] = useState(false)

  if (!open) return null

  const totalPrice = (89.9 * quantity).toFixed(2)

  const resetForm = () => {
    setStep(1)
    setQuantity(1)
    setFullName('')
    setEmail('')
    setPhone('')
    setLocationText('')
    setPaymentMethod('tarjeta')
    setCardNumber('')
    setCardExpiry('')
    setCardCvv('')
    setYapePhone('')
    setCompleted(false)
  }

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleConfirm = () => {
    setCompleted(true)
    window.setTimeout(() => {
      onComplete()
    }, 120)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleAnother = () => {
    resetForm()
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card modal-card-wide modal-card-centered">
        <button type="button" className="modal-close" onClick={handleClose} aria-label="Cerrar modal">
          ×
        </button>
        <span className="eyebrow">Compra segura</span>
        <h2>{completed ? 'Compra realizada' : 'Simulación de pago'}</h2>

        <div className="payment-steps">
          <div className={`payment-step${step === 1 ? ' active' : ''}`}>
            <strong>1.</strong>
            <div>
              <span>Datos del pedido</span>
              <small>Selecciona cantidad y revisa el total</small>
            </div>
          </div>
          <div className={`payment-step${step === 2 ? ' active' : ''}`}>
            <strong>2.</strong>
            <div>
              <span>Datos envío/contacto</span>
              <small>Nombre, correo, teléfono y dirección</small>
            </div>
          </div>
          <div className={`payment-step${step === 3 ? ' active' : ''}`}>
            <strong>3.</strong>
            <div>
              <span>Método de pago</span>
              <small>Tarjeta o Yape</small>
            </div>
          </div>
        </div>

        {completed ? (
          <div className="payment-summary success-message">
            <p>¡Tu compra se registró correctamente!</p>
            <p>En breve recibirás la confirmación en tu correo.</p>
            <div className="modal-actions modal-actions--space">
              <button type="button" className="btn btn-secundario" onClick={handleAnother}>
                Hacer otra compra
              </button>
              <button type="button" className="btn btn-primario" onClick={handleClose}>
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <>
            {step === 1 && (
              <div className="step-panel">
                <label>
                  Cantidad
                  <div className="quantity-control">
                    <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                      −
                    </button>
                    <span>{quantity}</span>
                    <button type="button" onClick={() => setQuantity(quantity + 1)}>
                      +
                    </button>
                  </div>
                </label>
                <div className="payment-summary compact-summary">
                  <div>
                    <strong>Producto</strong>
                    <span>Colágeno Hidrolizado Vitaella</span>
                  </div>
                  <div>
                    <strong>Precio unidad</strong>
                    <span>S/ 89.90</span>
                  </div>
                  <div>
                    <strong>Total estimado</strong>
                    <span>S/ {totalPrice}</span>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="step-panel form-grid">
                <label>
                  Nombre completo
                  <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Tu nombre" />
                </label>
                <label>
                  Correo electrónico
                  <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ejemplo@mail.com" type="email" />
                </label>
                <label>
                  Teléfono
                  <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+51 9XXXXXXXX" />
                </label>
                <label>
                  Dirección / Ubigeo
                  <input
                    value={locationText}
                    onChange={(event) => setLocationText(event.target.value)}
                    placeholder="Ej: Lima / Lima / Miraflores"
                  />
                </label>
              </div>
            )}

            {step === 3 && (
              <div className="step-panel form-grid">
                <div className="payment-methods">
                  <label>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="tarjeta"
                      checked={paymentMethod === 'tarjeta'}
                      onChange={() => setPaymentMethod('tarjeta')}
                    />
                    Tarjeta
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="yape"
                      checked={paymentMethod === 'yape'}
                      onChange={() => setPaymentMethod('yape')}
                    />
                    Yape
                  </label>
                </div>
                {paymentMethod === 'tarjeta' ? (
                  <div className="payment-form">
                    <label>
                      Número de tarjeta
                      <input value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} placeholder="0000 0000 0000 0000" />
                    </label>
                    <div className="card-row">
                      <label>
                        Expiración
                        <input value={cardExpiry} onChange={(event) => setCardExpiry(event.target.value)} placeholder="MM/AA" />
                      </label>
                      <label>
                        CVV
                        <input value={cardCvv} onChange={(event) => setCardCvv(event.target.value)} placeholder="123" />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="payment-form">
                    <label>
                      Número de Yape
                      <input value={yapePhone} onChange={(event) => setYapePhone(event.target.value)} placeholder="+51 9XXXXXXXX" />
                    </label>
                    <p className="payment-note">En este flujo simulado, recibirás la confirmación por WhatsApp.</p>
                  </div>
                )}
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="btn btn-secundario" onClick={handleBack} disabled={step === 1}>
                Volver
              </button>
              {step < 3 ? (
                <button type="button" className="btn btn-primario" onClick={handleNext}>
                  Siguiente
                </button>
              ) : (
                <button type="button" className="btn btn-primario" onClick={handleConfirm}>
                  Confirmar compra
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
