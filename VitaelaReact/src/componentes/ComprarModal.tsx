import { useState } from 'react'
import ubigeoPeru from 'ubigeo-peru'

interface ComprarModalProps {
  open: boolean
  onClose: () => void
  onComplete: () => void
}

type UbigeoItem = {
  departamento: string
  provincia: string
  distrito: string
  nombre: string
}

const ubigeoItems: UbigeoItem[] = Array.isArray((ubigeoPeru as { inei?: UbigeoItem[] } | undefined)?.inei)
  ? (ubigeoPeru as { inei: UbigeoItem[] }).inei
  : []

const getDepartamentos = () =>
  ubigeoItems
    .filter((item) => item.provincia === '00' && item.distrito === '00')
    .map((item) => ({
      code: item.departamento,
      name: item.nombre
    }))
    .filter(
      (item, index, lista) =>
        lista.findIndex((elemento) => elemento.code === item.code) === index
    )
    .sort((a, b) => a.name.localeCompare(b.name))

const getProvinciasPorDepartamento = (departamento: string) =>
  ubigeoItems
    .filter(
      (item) =>
        item.departamento === departamento &&
        item.provincia !== '00' &&
        item.distrito === '00'
    )
    .map((item) => ({
      code: item.provincia,
      name: item.nombre
    }))
    .filter(
      (item, index, lista) =>
        lista.findIndex((elemento) => elemento.code === item.code) === index
    )
    .sort((a, b) => a.name.localeCompare(b.name))

const getDistritosPorProvincia = (departamento: string, provincia: string) =>
  ubigeoItems
    .filter(
      (item) =>
        item.departamento === departamento &&
        item.provincia === provincia &&
        item.distrito !== '00'
    )
    .map((item) => ({
      code: item.distrito,
      name: item.nombre
    }))
    .filter(
      (item, index, lista) =>
        lista.findIndex((elemento) => elemento.code === item.code) === index
    )
    .sort((a, b) => a.name.localeCompare(b.name))

export default function ComprarModal({
  open,
  onClose,
  onComplete
}: ComprarModalProps) {
  const [step, setStep] = useState(1)
  const [quantity, setQuantity] = useState(1)

  // Datos personales
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  // Datos de envío
  const [department, setDepartment] = useState('')
  const [province, setProvince] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')

  // Método de pago
  const [paymentMethod, setPaymentMethod] = useState<'tarjeta' | 'yape'>('tarjeta')

  // Datos de tarjeta
  const [cardHolderName, setCardHolderName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  // Yape
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

    setDepartment('')
    setProvince('')
    setCity('')
    setAddress('')

    setPaymentMethod('tarjeta')

    setCardHolderName('')
    setCardNumber('')
    setCardExpiry('')
    setCardCvv('')

    setYapePhone('')

    setCompleted(false)
  }

  const handleDepartmentChange = (value: string) => {
    setDepartment(value)
    setProvince('')
    setCity('')
  }

  const handleProvinceChange = (value: string) => {
    setProvince(value)
    setCity('')
  }

  const validarPaso1 = () => {
    return quantity >= 1
  }

  const validarPaso2 = () => {
    if (
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !department.trim() ||
      !province.trim() ||
      !city.trim() ||
      !address.trim()
    ) {
      alert('Completa todos los campos obligatorios antes de continuar.')
      return false
    }

    return true
  }

  const validarPaso3 = () => {
    if (paymentMethod === 'tarjeta') {
      if (
        !cardHolderName.trim() ||
        !cardNumber.trim() ||
        !cardExpiry.trim() ||
        !cardCvv.trim()
      ) {
        alert('Completa todos los datos obligatorios de la tarjeta.')
        return false
      }

      // Validación básica del número de tarjeta
      const numeroLimpio = cardNumber.replace(/\s/g, '')

      if (!/^\d{16}$/.test(numeroLimpio)) {
        alert('El número de tarjeta debe contener 16 dígitos.')
        return false
      }

      // MM/YY
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) {
        alert('La caducidad debe tener el formato MM/YY.')
        return false
      }

      // CVV
      if (!/^\d{3,4}$/.test(cardCvv)) {
        alert('El código de seguridad debe contener 3 o 4 dígitos.')
        return false
      }
    }

    if (paymentMethod === 'yape' && !yapePhone.trim()) {
      alert('Ingresa el número de Yape.')
      return false
    }

    return true
  }

  const handleNext = () => {
    if (step === 1 && !validarPaso1()) return
    if (step === 2 && !validarPaso2()) return

    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleConfirm = () => {
    if (!validarPaso3()) return

    onClose()

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

        <button
          type="button"
          className="modal-close"
          onClick={handleClose}
          aria-label="Cerrar modal"
        >
          ✕
        </button>

        <span className="eyebrow">
          🛍️ Compra segura y confiable
        </span>

        <h2>
          {completed ? '✨ Compra realizada' : '💳 Simulación de pago'}
        </h2>

        {/* PASOS */}
        <div className="payment-steps">
          <div className={`payment-step${step === 1 ? ' active' : ''}`}>
            <strong>1</strong>
            <div>
              <span>🛒 Datos del pedido</span>
              <small>Selecciona cantidad y revisa el total</small>
            </div>
          </div>

          <div className={`payment-step${step === 2 ? ' active' : ''}`}>
            <strong>2</strong>
            <div>
              <span>📍 Datos de envío</span>
              <small>Datos personales y dirección</small>
            </div>
          </div>

          <div className={`payment-step${step === 3 ? ' active' : ''}`}>
            <strong>3</strong>
            <div>
              <span>💰 Método de pago</span>
              <small>Pagos seguros con Tarjeta o Yape</small>
            </div>
          </div>
        </div>

        {completed ? (
          <div className="payment-summary success-message">
            <p>✅ ¡Tu compra se registró correctamente!</p>
            <p>📧 En breve recibirás la confirmación en tu correo.</p>

            <div className="modal-actions modal-actions--space">
              <button
                type="button"
                className="btn btn-secundario"
                onClick={handleAnother}
              >
                🛒 Hacer otra compra
              </button>

              <button
                type="button"
                className="btn btn-primario"
                onClick={handleClose}
              >
                ✕ Cerrar
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* PASO 1 */}
            {step === 1 && (
              <div className="step-panel step-panel-product">
                <div className="product-image-section">
                  <img
                    src="https://images.unsplash.com/photo-1599599810694-b5ac4dd0aae1?w=400&h=500&fit=crop"
                    alt="Colágeno Hidrolizado Vitaella"
                    className="product-image"
                  />
                  <div className="badge-product">
                    <span className="badge-star">⭐ Premium</span>
                    <span className="badge-natural">100% Natural</span>
                  </div>
                </div>
                <div className="product-details-section">
                  <div className="product-info-card">
                    <h3>🌿 Colágeno Hidrolizado Vitaella</h3>
                    <div className="pricing-section">
                      <div className="price-item">
                        <span className="price-label">Precio por unidad:</span>
                        <span className="price-value">S/ 89.90</span>
                      </div>
                    </div>
                    <div className="quantity-section">
                      <label className="quantity-label">📦 Cantidad</label>
                      <div className="quantity-control">
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(Math.max(1, quantity - 1))
                          }
                        >−</button>
                        <span>{quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(quantity + 1)
                          }
                        >+</button>
                      </div>
                    </div>
                    <div className="payment-summary compact-summary">
                        <strong>Total a pagar</strong>
                        <span className="total-price">S/ {totalPrice}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* PASO 2 */}
            {step === 2 && (
              <div className="step-panel form-panel">
                <div className="form-section-title">
                  <h3>📍 Datos de envío</h3>
                  <p>Todos los campos son obligatorios para completar la compra.</p>
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label>
                      <span>👤 Nombre completo <b>*</b></span>
                    </label>
                    <input
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>
                      <span>📧 Correo electrónico <b>*</b></span>
                    </label>
                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="ejemplo@mail.com"
                      type="email"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>
                      <span>📱 Teléfono <b>*</b></span>
                    </label>
                    <input
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+51 9XXXXXXXX"
                      type="tel"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>
                      <span>🗺️ Departamento <b>*</b></span>
                    </label>
                    <select
                      value={department}
                      onChange={(event) => handleDepartmentChange(event.target.value)}
                      required
                    >
                      <option value="">Selecciona un departamento</option>
                      {getDepartamentos().map((item) => (
                        <option key={`${item.code}-${item.name}`} value={item.code}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>
                      <span>📍 Provincia <b>*</b></span>
                    </label>
                    <select
                      value={province}
                      onChange={(event) => handleProvinceChange(event.target.value)}
                      disabled={!department}
                      required
                    >
                      <option value="">
                        {department ? 'Selecciona una provincia' : 'Primero selecciona departamento'}
                      </option>
                      {getProvinciasPorDepartamento(department).map((item) => (
                        <option key={`${department}-${item.code}-${item.name}`} value={item.code}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>
                      <span>🏙️ Ciudad <b>*</b></span>
                    </label>
                    <select
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      disabled={!province}
                      required
                    >
                      <option value="">
                        {province ? 'Selecciona una ciudad' : 'Primero selecciona provincia'}
                      </option>
                      {getDistritosPorProvincia(department, province).map((item) => (
                        <option key={`${department}-${province}-${item.code}-${item.name}`} value={item.code}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field form-field-full">
                    <label>
                      <span>🏠 Dirección <b>*</b></span>
                    </label>
                    <input
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      placeholder="Av. / Jr. / Calle, número, referencia"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PASO 3 */}
            {step === 3 && (
              <div className="step-panel">

                <div className="form-section-title">
                  <h3>💳 Datos de pago</h3>
                  <p>
                    Selecciona tu método de pago y completa todos
                    los campos obligatorios.
                  </p>
                </div>

                <div className="payment-methods">
                  <label>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="tarjeta"
                      checked={paymentMethod === 'tarjeta'}
                      onChange={() =>
                        setPaymentMethod('tarjeta')
                      }
                    />

                    💳 Tarjeta de crédito/débito
                  </label>

                  <label>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="yape"
                      checked={paymentMethod === 'yape'}
                      onChange={() =>
                        setPaymentMethod('yape')
                      }
                    />

                    📱 Yape
                  </label>
                </div>

                {paymentMethod === 'tarjeta' ? (
                  <div className="payment-form">

                    {/* Nombre propietario */}
                    <label className="flex flex-col gap-1">
                      <span>
                        👤 Nombre del propietario de la tarjeta <b>*</b>
                      </span>

                      <input
                        value={cardHolderName}
                        onChange={(event) =>
                          setCardHolderName(event.target.value)
                        }
                        placeholder="Nombre que aparece en la tarjeta"
                        autoComplete="cc-name"
                        required
                      />
                    </label>

                    {/* Número */}
                    <label className="flex flex-col gap-1">
                      <span>
                        💳 N.º de tarjeta <b>*</b>
                      </span>

                      <input
                        value={cardNumber}
                        onChange={(event) =>
                          setCardNumber(event.target.value)
                        }
                        placeholder="0000 0000 0000 0000"
                        inputMode="numeric"
                        autoComplete="cc-number"
                        maxLength={19}
                        required
                      />
                    </label>

                    <div className="card-row">

                      {/* Caducidad */}
                      <label className="flex flex-col gap-1">
                        <span>
                          📅 Caducidad <b>*</b>
                        </span>

                        <input
                          value={cardExpiry}
                          onChange={(event) =>
                            setCardExpiry(event.target.value)
                          }
                          placeholder="MM/YY"
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          maxLength={5}
                          required
                        />
                      </label>

                      {/* CVV */}
                      <label className="flex flex-col gap-1">
                        <span>
                          🔐 Código de seguridad <b>*</b>
                        </span>

                        <input
                          value={cardCvv}
                          onChange={(event) =>
                            setCardCvv(event.target.value)
                          }
                          placeholder="123"
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          maxLength={4}
                          required
                        />
                      </label>

                    </div>

                    <p className="payment-note">
                      🔒 Tus datos de pago se utilizan únicamente
                      para esta simulación.
                    </p>

                  </div>
                ) : (
                  <div className="payment-form">

                    <label className="flex flex-col gap-1">
                      <span>
                        📞 Número de Yape <b>*</b>
                      </span>

                      <input
                        value={yapePhone}
                        onChange={(event) =>
                          setYapePhone(event.target.value)
                        }
                        placeholder="+51 9XXXXXXXX"
                        type="tel"
                        required
                      />
                    </label>

                    <p className="payment-note">
                      💬 En este flujo simulado, recibirás la
                      confirmación por WhatsApp.
                    </p>

                  </div>
                )}
              </div>
            )}

            {/* BOTONES */}
            <div className="modal-actions">

              <button
                type="button"
                className="btn btn-secundario"
                onClick={handleBack}
                disabled={step === 1}
              >
                ← Volver
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  className="btn btn-primario"
                  onClick={handleNext}
                >
                  Siguiente →
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primario"
                  onClick={handleConfirm}
                >
                  ✓ Confirmar compra
                </button>
              )}

            </div>
          </>
        )}
      </div>
    </div>
  )
}