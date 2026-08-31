import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Check, ShieldCheck, ShoppingBag } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import useCart from '@/hooks/useCart'
import { guardarCliente } from '@/services/formSubmissionService'
import { StorageKeys } from '@/storage'
import { useAuth } from '@/context/AuthContext'
import { getPeruDepartments } from '@/services/peruUbigeoService'
import { calcularCostoEnvio, obtenerConfiguracionEnvioActual } from '@/utils/envioHelpers'
import { SHIPPING_CONFIG_EVENT } from '@/admin/Sistema/envio/DatosEnvio'

const BTN_PRIMARIO_CLASS = 'inline-flex items-center justify-center gap-2 rounded-full bg-vino px-4 py-2.5 text-sm font-semibold text-crema transition hover:bg-vino-oscuro disabled:cursor-not-allowed disabled:opacity-60'

const DEPARTAMENTOS = getPeruDepartments().map((item) => ({
  departamento: item.code,
  nombre: item.name,
}))

type UbigeoItem = {
  departamento: string
  provincia: string
  distrito: string
  nombre: string
}

const UBIGEOS: UbigeoItem[] = [
  { departamento: '15', provincia: '01', distrito: '01', nombre: 'Lima' },
  { departamento: '15', provincia: '01', distrito: '02', nombre: 'San Isidro' },
  { departamento: '15', provincia: '01', distrito: '03', nombre: 'Miraflores' },
  { departamento: '15', provincia: '02', distrito: '01', nombre: 'Arequipa' },
  { departamento: '15', provincia: '02', distrito: '02', nombre: 'Cercado' },
  { departamento: '14', provincia: '01', distrito: '01', nombre: 'Trujillo' },
  { departamento: '13', provincia: '01', distrito: '01', nombre: 'Huancayo' },
]

const PAYMENT_METHODS = [
  { value: 'tarjeta', label: 'Tarjeta', icon: Check },
  { value: 'yape', label: 'Yape', icon: ShieldCheck },
] as const

type FormValues = {
  fullName: string
  email: string
  phone: string
  document: string
  department: string
  province: string
  district: string
  locationText: string
  locationName: string
  postalCode: string
  reference: string
  paymentMethod: 'tarjeta' | 'yape'
  cardOwner: string
  cardNumber: string
  cardExpiry: string
  cardCvv: string
  yapePhone: string
}

const DEFAULT_VALUES: FormValues = {
  fullName: '',
  email: '',
  phone: '',
  document: '',
  department: '',
  province: '',
  district: '',
  locationText: '',
  locationName: '',
  postalCode: '',
  reference: '',
  paymentMethod: 'tarjeta',
  cardOwner: '',
  cardNumber: '',
  cardExpiry: '',
  cardCvv: '',
  yapePhone: '',
}

const getGuestId = () => {
  const stored = window.localStorage.getItem(StorageKeys.GUEST)
  try {
    const guest = stored ? JSON.parse(stored) as { id?: string } : null
    if (guest?.id) return guest.id
  } catch {
    // ignore invalid guest data
  }

  const id = `guest-${crypto.randomUUID()}`
  window.localStorage.setItem(StorageKeys.GUEST, JSON.stringify({ id, createdAt: new Date().toISOString() }))
  return id
}

const parseStoredCheckout = (): Partial<FormValues> => {
  try {
    const raw = window.localStorage.getItem(StorageKeys.CHECKOUT)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, unknown>
    return {
      fullName: typeof parsed.name === 'string' ? parsed.name : '',
      email: typeof parsed.email === 'string' ? parsed.email : '',
      phone: typeof parsed.phone === 'string' ? parsed.phone : '',
      document: typeof parsed.document === 'string' ? parsed.document : '',
      department: typeof parsed.departmentCode === 'string' ? parsed.departmentCode : '',
      province: typeof parsed.provinceCode === 'string' ? parsed.provinceCode : '',
      district: typeof parsed.districtCode === 'string' ? parsed.districtCode : '',
      locationText: typeof parsed.address === 'string' ? parsed.address : '',
      postalCode: typeof parsed.postalCode === 'string' ? parsed.postalCode : '',
      reference: typeof parsed.reference === 'string' ? parsed.reference : '',
      paymentMethod: parsed.paymentMethod === 'yape' ? 'yape' : 'tarjeta',
    }
  } catch {
    return {}
  }
}

const getStoredProfileData = () => {
  try {
    const raw = window.localStorage.getItem(StorageKeys.USERS)
    if (!raw) return { direcciones: [], metodosPago: [] }
    const users = JSON.parse(raw) as Array<Record<string, unknown>>
    if (!Array.isArray(users) || users.length === 0) return { direcciones: [], metodosPago: [] }

    const matches = users.filter((entry) => {
      const email = typeof entry.email === 'string' ? entry.email.toLowerCase() : ''
      const phone = typeof entry.phone === 'string' ? entry.phone : ''
      return email === String(window.localStorage.getItem('ezzeta.checkout.lastEmail') ?? '').toLowerCase() || phone === String(window.localStorage.getItem('ezzeta.checkout.lastPhone') ?? '')
    })

    const firstUser = matches[0] ?? users[0]
    const direcciones = Array.isArray(firstUser.direcciones) ? firstUser.direcciones : []
    const metodosPago = Array.isArray(firstUser.metodosPago) ? firstUser.metodosPago : []
    return { direcciones, metodosPago }
  } catch {
    return { direcciones: [], metodosPago: [] }
  }
}

const saveStoredProfileData = (key: 'direcciones' | 'metodosPago', value: Record<string, unknown>) => {
  const current = getStoredProfileData()
  const usersRaw = window.localStorage.getItem(StorageKeys.USERS)
  const users = usersRaw ? JSON.parse(usersRaw) as Array<Record<string, unknown>> : []
  const emailKey = window.localStorage.getItem('ezzeta.checkout.lastEmail') ?? ''
  const phoneKey = window.localStorage.getItem('ezzeta.checkout.lastPhone') ?? ''

  const nextUsers = Array.isArray(users) && users.length > 0
    ? users.map((user) => {
        const matchesEmail = String(user.email ?? '').toLowerCase() === emailKey.toLowerCase()
        const matchesPhone = String(user.phone ?? '') === phoneKey
        if (!matchesEmail && !matchesPhone) return user

        const existing = Array.isArray(user[key]) ? user[key] : []
        return {
          ...user,
          [key]: [value, ...existing],
        }
      })
    : [{
        id: `guest-${Date.now()}`,
        email: emailKey || `guest-${Date.now()}@local.test`,
        phone: phoneKey || '',
        [key]: [value],
      }]

  window.localStorage.setItem(StorageKeys.USERS, JSON.stringify(nextUsers))
  return { ...current, [key]: [value, ...(Array.isArray(current[key]) ? current[key] : [])] }
}

const buildProvincias = (department: string) => {
  const seen = new Map<string, { departamento: string; provincia: string; nombre: string }>()
  UBIGEOS.filter((item) => item.departamento === department && item.distrito === '01').forEach((item) => {
    if (!seen.has(item.provincia)) seen.set(item.provincia, { departamento: item.departamento, provincia: item.provincia, nombre: item.nombre })
  })
  return Array.from(seen.values())
}

const buildDistritos = (department: string, province: string) => {
  const seen = new Map<string, { departamento: string; provincia: string; distrito: string; nombre: string }>()
  UBIGEOS.filter((item) => item.departamento === department && item.provincia === province).forEach((item) => {
    if (!seen.has(item.distrito)) seen.set(item.distrito, item)
  })
  return Array.from(seen.values())
}

function CheckoutPage() {
  const navigate = useNavigate()
  const { items, clearCart, totalPrice } = useCart()
  const { isCustomer, profile } = useAuth()
  const [form, setForm] = useState<FormValues>({ ...DEFAULT_VALUES, ...parseStoredCheckout() })
  const [contactSaved, setContactSaved] = useState(false)
  const [paymentSaved, setPaymentSaved] = useState(false)
  const [saveLocation, setSaveLocation] = useState(false)
  const [savePayment, setSavePayment] = useState(false)
  const [locationMessage, setLocationMessage] = useState('')
  const [paymentMessage, setPaymentMessage] = useState('')
  const [couponInput, setCouponInput] = useState('')
  const [appliedCouponCode, setAppliedCouponCode] = useState('')
  const [couponMessage, setCouponMessage] = useState('')
  const [confirmingOrder, setConfirmingOrder] = useState(false)
  const [confirmError, setConfirmError] = useState('')
  const [productsExpanded, setProductsExpanded] = useState(true)
  const [savedAccount, setSavedAccount] = useState<{ direcciones: Array<Record<string, unknown>>; metodosPago: Array<Record<string, unknown>> }>({ direcciones: [], metodosPago: [] })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [shippingConfig, setShippingConfig] = useState(obtenerConfiguracionEnvioActual())

  useEffect(() => {
    const syncShippingConfig = () => setShippingConfig(obtenerConfiguracionEnvioActual())
    syncShippingConfig()
    window.addEventListener(SHIPPING_CONFIG_EVENT, syncShippingConfig)
    return () => window.removeEventListener(SHIPPING_CONFIG_EVENT, syncShippingConfig)
  }, [])

  const provincias = useMemo(() => buildProvincias(form.department), [form.department])
  const distritos = useMemo(() => buildDistritos(form.department, form.province), [form.department, form.province])

  const selectedDepartmentName = DEPARTAMENTOS.find((item) => item.departamento === form.department)?.nombre ?? form.department
  const couponDiscount = useMemo(() => {
    if (appliedCouponCode === 'VITAELLA10') return Number((totalPrice * 0.1).toFixed(2))
    if (appliedCouponCode === 'ENVIO') return 0
    return 0
  }, [appliedCouponCode, totalPrice])

  const shippingResult = useMemo(() => {
    const baseConfig = shippingConfig ?? obtenerConfiguracionEnvioActual()
    const result = calcularCostoEnvio({
      subtotal: totalPrice,
      departamento: selectedDepartmentName,
      configuracion: baseConfig,
      freeShippingCoupon: appliedCouponCode === 'ENVIO',
    })

    if (result.shippingAmount !== null && Number.isFinite(result.shippingAmount)) {
      return result
    }

    if (appliedCouponCode === 'ENVIO') {
      return { ...result, shippingAmount: 0, shippingLabel: 'Gratis' }
    }

    if (totalPrice >= 200) {
      return { ...result, shippingAmount: 0, shippingLabel: 'Gratis' }
    }

    return {
      ...result,
      shippingAmount: form.department === '15' ? 15 : 25,
      shippingLabel: `S/ ${(form.department === '15' ? 15 : 25).toFixed(2)}`,
    }
  }, [appliedCouponCode, form.department, selectedDepartmentName, shippingConfig, totalPrice])

  const shippingCost = shippingResult.shippingAmount ?? 0
  const subtotalConDescuento = Math.max(0, Number((totalPrice - couponDiscount).toFixed(2)))
  const checkoutTotal = Number((subtotalConDescuento + shippingCost).toFixed(2))
  const etiquetaEnvio = shippingResult.shippingLabel || (shippingCost === 0 ? 'Gratis' : `S/ ${shippingCost.toFixed(2)}`)

  useEffect(() => {
    if (!isCustomer || !profile) return
    const nextValues: Partial<FormValues> = {
      fullName: typeof profile.firstName === 'string' ? String(profile.firstName) : '',
      email: typeof profile.email === 'string' ? String(profile.email) : '',
      phone: typeof profile.phone === 'string' ? String(profile.phone) : '',
      document: typeof profile.document === 'string' ? String(profile.document) : '',
      department: typeof profile.department === 'string' ? String(profile.department) : '',
      province: typeof profile.province === 'string' ? String(profile.province) : '',
      district: typeof profile.district === 'string' ? String(profile.district) : '',
      locationText: typeof profile.address === 'string' ? String(profile.address) : '',
    }
    setForm((current) => ({ ...current, ...nextValues }))
  }, [isCustomer, profile])

  useEffect(() => {
    const snapshot = getStoredProfileData()
    setSavedAccount(snapshot)
  }, [isCustomer, profile, form.email])

  useEffect(() => {
    if (items.length === 0) return
    const hasContactData = [form.fullName, form.email, form.phone, form.document].some((value) => value.trim().length > 0)
    if (!hasContactData) return

    const payload = {
      name: form.fullName,
      email: form.email,
      phone: form.phone,
      document: form.document,
      departmentCode: form.department,
      provinceCode: form.province,
      districtCode: form.district,
      address: form.locationText,
      postalCode: form.postalCode,
      reference: form.reference,
      paymentMethod: form.paymentMethod,
      couponCode: appliedCouponCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    window.localStorage.setItem(StorageKeys.CHECKOUT, JSON.stringify(payload))
    window.localStorage.setItem('ezzeta.checkout.lastEmail', form.email)
    window.localStorage.setItem('ezzeta.checkout.lastPhone', form.phone)
  }, [items.length, form, appliedCouponCode])

  const updateField = (field: keyof FormValues, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  const validateContact = () => {
    const nextErrors: Record<string, string> = {}
    if (form.fullName.trim().length < 2) nextErrors.fullName = 'Ingresa tu nombre completo.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Correo inválido.'
    if (form.phone.trim().length < 7) nextErrors.phone = 'Ingresa un teléfono válido.'
    if (form.document.trim().length < 8) nextErrors.document = 'Ingresa tu documento.'
    if (!form.department) nextErrors.department = 'Selecciona un departamento.'
    if (!form.province) nextErrors.province = 'Selecciona una provincia.'
    if (!form.district) nextErrors.district = 'Selecciona un distrito.'
    if (form.locationText.trim().length < 5) nextErrors.locationText = 'Ingresa tu dirección.'
    if (form.reference.trim().length < 3) nextErrors.reference = 'Ingresa una referencia.'
    return nextErrors
  }

  const validatePayment = () => {
    const nextErrors: Record<string, string> = {}
    if (form.paymentMethod === 'tarjeta') {
      if (form.cardOwner.trim().length < 2) nextErrors.cardOwner = 'Ingresa el nombre del titular.'
      if (form.cardNumber.replace(/\s/g, '').length < 12) nextErrors.cardNumber = 'Número incompleto.'
      if (form.cardExpiry.trim().length < 4) nextErrors.cardExpiry = 'Fecha inválida.'
      if (form.cardCvv.trim().length < 3) nextErrors.cardCvv = 'CVV inválido.'
    } else if (form.yapePhone.trim().length < 7) {
      nextErrors.yapePhone = 'Número de Yape inválido.'
    }
    return nextErrors
  }

  const handleSaveContact = () => {
    const nextErrors = validateContact()
    setErrors((current) => ({ ...current, ...nextErrors }))
    if (Object.keys(nextErrors).length > 0) return

    if (saveLocation) {
      const addressPayload = {
        id: Date.now(),
        nombre: form.locationName || 'Ubicación guardada',
        departamento: form.department,
        provincia: form.province,
        distrito: form.district,
        direccion: form.locationText,
        codigo_postal: form.postalCode,
        referencia: form.reference,
      }

      const newProfile = saveStoredProfileData('direcciones', addressPayload)
      setSavedAccount({
        direcciones: Array.isArray(newProfile.direcciones) ? newProfile.direcciones : [],
        metodosPago: Array.isArray(newProfile.metodosPago) ? newProfile.metodosPago : [],
      })
      setLocationMessage('Ubicación guardada correctamente.')
    }

    setContactSaved(true)
  }

  const handleSavePayment = () => {
    const nextErrors = validatePayment()
    setErrors((current) => ({ ...current, ...nextErrors }))
    if (Object.keys(nextErrors).length > 0) return

    if (savePayment) {
      const paymentPayload = {
        id: Date.now(),
        type: form.paymentMethod,
        ownerName: form.cardOwner,
        cardNumber: form.cardNumber,
        yapeNumber: form.yapePhone,
        last4: form.cardNumber.replace(/\s/g, '').slice(-4) || '0000',
      }
      const newProfile = saveStoredProfileData('metodosPago', paymentPayload)
      setSavedAccount({
        direcciones: Array.isArray(newProfile.direcciones) ? newProfile.direcciones : [],
        metodosPago: Array.isArray(newProfile.metodosPago) ? newProfile.metodosPago : [],
      })
      setPaymentMessage('Método de pago guardado.')
    }

    setPaymentSaved(true)
  }

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase()
    if (!code) {
      setCouponMessage('Ingresa un código de cupón.')
      return
    }

    if (code === 'VITAELLA10') {
      setAppliedCouponCode(code)
      setCouponMessage('Cupón aplicado: 10% de descuento.')
      return
    }

    if (code === 'ENVIO') {
      setAppliedCouponCode(code)
      setCouponMessage('Cupón aplicado: envío gratis.')
      return
    }

    setAppliedCouponCode('')
    setCouponMessage('Cupón inválido.')
  }

  const handleConfirm = async () => {
    if (!contactSaved || !paymentSaved) {
      setConfirmError('Completa los datos de envío y pago antes de confirmar.')
      return
    }

    setConfirmingOrder(true)
    setConfirmError('')

    try {
      if (!isCustomer) {
        await guardarCliente({
          type: 'guest',
          guestId: getGuestId(),
          firstName: form.fullName,
          email: form.email,
          phone: form.phone,
          document: form.document,
          department: selectedDepartmentName,
          province: form.province,
          district: form.district,
          address: form.locationText,
          postalCode: form.postalCode,
          reference: form.reference,
        })
      }
    } catch (error) {
      setConfirmError(error instanceof Error ? error.message : 'No se pudo guardar tus datos.')
      setConfirmingOrder(false)
      return
    }

    const storedOrders = window.localStorage.getItem(StorageKeys.PEDIDOS)
    const orders = storedOrders ? JSON.parse(storedOrders) : []
    const nextId = Math.max(0, ...orders.map((order: { id?: number }) => Number(order.id) || 0)) + 1
    const now = new Date().toISOString()
    const pedido = {
      id: nextId,
      numeroPedido: `VE-${String(nextId).padStart(6, '0')}`,
      carritoId: null,
      cliente: {
        id: 0,
        nombre: form.fullName,
        correo: form.email,
        telefono: form.phone,
        documento: form.document,
      },
      direccion: {
        departamento: selectedDepartmentName,
        provincia: form.province,
        codigoPostal: form.postalCode,
        distrito: form.district,
        direccion: form.locationText,
        referencia: form.reference,
      },
      productos: items.map((item) => ({
        productoId: Number(item.id),
        slug: String(item.id),
        nombre: item.name,
        imagen: item.image,
        categoria: '',
        subcategoria: '',
        talla: item.size || 'Única',
        cantidad: item.quantity,
        precioUnitario: item.unitPrice,
        subtotal: item.unitPrice * item.quantity,
      })),
      descuentos: [],
      subtotal: totalPrice,
      descuentoTotal: couponDiscount,
      costoEnvio: shippingCost,
      total: checkoutTotal,
      metodoPago: form.paymentMethod,
      estado: 'pagado',
      historial: [{ estado: 'pagado', fecha: now }],
      fechaPedido: now,
      fechaActualizacion: now,
    }

    window.localStorage.setItem(StorageKeys.PEDIDOS, JSON.stringify([...orders, pedido]))
    window.localStorage.setItem(StorageKeys.CHECKOUT, JSON.stringify({
      name: form.fullName,
      email: form.email,
      phone: form.phone,
      document: form.document,
      departmentCode: form.department,
      provinceCode: form.province,
      districtCode: form.district,
      address: form.locationText,
      postalCode: form.postalCode,
      reference: form.reference,
      paymentMethod: form.paymentMethod,
      couponCode: appliedCouponCode,
      updatedAt: now,
    }))
    window.dispatchEvent(new Event('maxeta:pedidos-changed'))
    setConfirmingOrder(false)
    clearCart()
    navigate('/', { state: { purchaseSuccess: true } })
  }

  const paymentSummary = paymentSaved ? (form.paymentMethod === 'tarjeta' ? `Tarjeta •••• ${form.cardNumber.replace(/\s/g, '').slice(-4) || '0000'}` : `Yape · ${form.yapePhone}`) : undefined
  const contactSummary = contactSaved ? `${form.fullName} · ${form.locationText} · Ref.: ${form.reference}` : undefined

  if (items.length === 0) {
    return (
      <div className="checkout-page min-h-screen bg-crema">
        <header className="border-b border-[rgba(125,36,56,0.12)] bg-[#ffffff] px-5 py-5">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div className="font-serif text-2xl font-semibold text-vino-oscuro">Ezzeta</div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-vino">Checkout</span>
          </div>
        </header>
        <main className="mx-auto flex w-[min(640px,92%)] flex-col items-center gap-4 py-20 text-center">
          <ShoppingBag className="h-12 w-12 text-vino-oscuro" strokeWidth={1.5} />
          <h1 className="font-serif text-[1.6rem] font-semibold text-vino-oscuro">Tu carrito está vacío</h1>
          <p className="text-[#6b4750]">Agrega el colágeno Ezzeta a tu carrito para continuar con la compra.</p>
          <Link to="/#producto" className={BTN_PRIMARIO_CLASS}>Ver producto</Link>
        </main>
      </div>
    )
  }

  return (
    <div className="checkout-page min-h-screen bg-crema">
      <header className="border-b border-[rgba(125,36,56,0.12)] bg-[#ffffff] px-5 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="font-serif text-2xl font-semibold text-vino-oscuro">Ezzeta</div>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-vino">Checkout</span>
        </div>
      </header>

      <main className="mx-auto w-[min(1120px,92%)] py-12 max-[720px]:py-8">
        <Link to="/tienda" className="mb-7 inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-vino hover:text-vino-oscuro">
          <ArrowLeft className="h-10 w-10" />
          Volver a la tienda
        </Link>

        <div className="mt-4 mb-9 flex items-end justify-between gap-6 max-[720px]:mb-7 max-[560px]:block">
          <div>
            <h1 className="font-serif text-[clamp(1.8rem,3.2vw,2.35rem)] leading-[1.05] font-semibold text-vino-oscuro">Revisa y paga tu compra</h1>
            <p className="mt-3 max-w-125 text-[0.92rem] leading-[1.65] text-[#6b4750]">Completa tus datos y elige cómo quieres recibir tu pedido Ezzeta.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-[0.78rem] font-bold text-[#8a6670] max-[560px]:mt-5">
            <span className="flex size-7 items-center justify-center rounded-full bg-verde text-blanco"><Check className="size-4" /></span>
            <span>1. Envío</span>
            <span className="h-px w-7 bg-[rgba(125,36,56,0.18)]" />
            <span className="flex size-7 items-center justify-center rounded-full bg-vino text-crema">2</span>
            <span>Pago</span>
          </div>
        </div>

        <div className="grid grid-cols-[1.35fr_1fr] items-start gap-7 max-[720px]:grid-cols-1">
          <div className="grid gap-5">
            <section className="overflow-hidden rounded-[28px] border border-[rgba(125,36,56,0.15)] bg-[#fffdfd] shadow-[0_18px_60px_rgba(80,26,34,0.06)]">
              <div className="flex items-center justify-between gap-3 border-b border-[rgba(125,36,56,0.08)] bg-[rgb(255, 255, 255)] px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-vino text-sm font-bold text-crema">1</span>
                  <div>
                    <h2 className="text-lg font-semibold text-vino-oscuro">Datos de contacto y envío</h2>
                    {contactSummary ? <p className="text-xs text-[#7b5e63]">{contactSummary}</p> : null}
                  </div>
                </div>
                <button type="button" onClick={() => setContactSaved(false)} className="text-xs font-bold uppercase tracking-[0.12em] text-vino hover:text-vino-oscuro">Editar</button>
              </div>
              <div className="grid gap-4 p-5">
                <div>
                  <label className="mb-2 block text-[0.75rem] font-bold uppercase tracking-[0.12em] text-vino">Nombre completo</label>
                  <input value={form.fullName} onChange={(event) => updateField('fullName', event.target.value)} className={`h-11 w-full rounded-xl border px-3.5 text-sm outline-none ${errors.fullName ? 'border-red-500 bg-red-50' : 'border-[rgba(125,36,56,0.18)] bg-white focus:border-vino'}`} placeholder="Tu nombre" />
                  {errors.fullName ? <p className="mt-1 text-xs text-red-600">{errors.fullName}</p> : null}
                </div>
                <div>
                  <label className="mb-2 block text-[0.75rem] font-bold uppercase tracking-[0.12em] text-vino">Correo electrónico</label>
                  <input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} className={`h-11 w-full rounded-xl border px-3.5 text-sm outline-none ${errors.email ? 'border-red-500 bg-red-50' : 'border-[rgba(125,36,56,0.18)] bg-white focus:border-vino'}`} placeholder="ejemplo@mail.com" />
                  {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
                </div>
                <div>
                  <label className="mb-2 block text-[0.75rem] font-bold uppercase tracking-[0.12em] text-vino">Teléfono</label>
                  <input value={form.phone} onChange={(event) => updateField('phone', event.target.value)} className={`h-11 w-full rounded-xl border px-3.5 text-sm outline-none ${errors.phone ? 'border-red-500 bg-red-50' : 'border-[rgba(125,36,56,0.18)] bg-white focus:border-vino'}`} placeholder="+51 9XXXXXXXX" />
                  {errors.phone ? <p className="mt-1 text-xs text-red-600">{errors.phone}</p> : null}
                </div>
                <div>
                  <label className="mb-2 block text-[0.75rem] font-bold uppercase tracking-[0.12em] text-vino">DNI / RUC / CE</label>
                  <input value={form.document} onChange={(event) => updateField('document', event.target.value)} className={`h-11 w-full rounded-xl border px-3.5 text-sm outline-none ${errors.document ? 'border-red-500 bg-red-50' : 'border-[rgba(125,36,56,0.18)] bg-white focus:border-vino'}`} placeholder="Número de documento" />
                  {errors.document ? <p className="mt-1 text-xs text-red-600">{errors.document}</p> : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="min-w-0">
                    <label className="mb-2 block text-[0.75rem] font-bold uppercase tracking-[0.12em] text-vino">Departamento</label>
                    <select value={form.department} onChange={(event) => {
                      updateField('department', event.target.value)
                      updateField('province', '')
                      updateField('district', '')
                    }} className={`h-11 w-full rounded-xl border px-3.5 text-sm outline-none ${errors.department ? 'border-red-500 bg-red-50' : 'border-[rgba(125,36,56,0.18)] bg-white focus:border-vino'}`}>
                      <option value="">Selecciona</option>
                      {DEPARTAMENTOS.map((item) => (
                        <option key={item.departamento} value={item.departamento}>{item.nombre}</option>
                      ))}
                    </select>
                    {errors.department ? <p className="mt-1 text-xs text-red-600">{errors.department}</p> : null}
                  </div>

                  <div className="min-w-0">
                    <label className="mb-2 block text-[0.75rem] font-bold uppercase tracking-[0.12em] text-vino">Provincia</label>
                    <select value={form.province} onChange={(event) => {
                      updateField('province', event.target.value)
                      updateField('district', '')
                    }} disabled={!form.department} className={`h-11 w-full rounded-xl border px-3.5 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60 ${errors.province ? 'border-red-500 bg-red-50' : 'border-[rgba(125,36,56,0.18)] bg-white focus:border-vino'}`}>
                      <option value="">Selecciona</option>
                      {provincias.map((item) => (
                        <option key={`${item.departamento}-${item.provincia}`} value={item.provincia}>{item.nombre}</option>
                      ))}
                    </select>
                    {errors.province ? <p className="mt-1 text-xs text-red-600">{errors.province}</p> : null}
                  </div>

                  <div className="min-w-0">
                    <label className="mb-2 block text-[0.75rem] font-bold uppercase tracking-[0.12em] text-vino">Distrito</label>
                    <select value={form.district} onChange={(event) => updateField('district', event.target.value)} disabled={!form.province} className={`h-11 w-full rounded-xl border px-3.5 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60 ${errors.district ? 'border-red-500 bg-red-50' : 'border-[rgba(125,36,56,0.18)] bg-white focus:border-vino'}`}>
                      <option value="">Selecciona</option>
                      {distritos.map((item) => (
                        <option key={`${item.departamento}-${item.provincia}-${item.distrito}`} value={item.distrito}>{item.nombre}</option>
                      ))}
                    </select>
                    {errors.district ? <p className="mt-1 text-xs text-red-600">{errors.district}</p> : null}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[0.75rem] font-bold uppercase tracking-[0.12em] text-vino">Dirección</label>
                  <input value={form.locationText} onChange={(event) => updateField('locationText', event.target.value)} className={`h-11 w-full rounded-xl border px-3.5 text-sm outline-none ${errors.locationText ? 'border-red-500 bg-red-50' : 'border-[rgba(125,36,56,0.18)] bg-white focus:border-vino'}`} placeholder="Av., jr., calle, número, referencia o interior" />
                  {errors.locationText ? <p className="mt-1 text-xs text-red-600">{errors.locationText}</p> : null}
                </div>

                <div className="flex justify-end">
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[rgba(125,36,56,0.18)] px-3 py-2.5 text-sm font-semibold text-vino-oscuro">
                    <input type="checkbox" checked={saveLocation} onChange={(event) => setSaveLocation(event.target.checked)} className="size-4 accent-vino" />
                    Guardar ubicación
                  </label>
                </div>

                {saveLocation ? (
                  <div>
                    <label className="mb-2 block text-[0.75rem] font-bold uppercase tracking-[0.12em] text-vino">Nombre de la ubicación</label>
                    <input value={form.locationName} onChange={(event) => updateField('locationName', event.target.value)} className="h-11 w-full rounded-xl border border-[rgba(125,36,56,0.18)] bg-white px-3.5 text-sm outline-none focus:border-vino" placeholder="Ej. Casa o trabajo" />
                  </div>
                ) : null}

                {locationMessage ? <p className="text-sm font-semibold text-verde">{locationMessage}</p> : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[0.75rem] font-bold uppercase tracking-[0.12em] text-vino">Código postal</label>
                    <input value={form.postalCode} onChange={(event) => updateField('postalCode', event.target.value)} className="h-11 w-full rounded-xl border border-[rgba(125,36,56,0.18)] bg-white px-3.5 text-sm outline-none focus:border-vino" placeholder="Ej. 15001" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[0.75rem] font-bold uppercase tracking-[0.12em] text-vino">Referencia</label>
                    <input value={form.reference} onChange={(event) => updateField('reference', event.target.value)} className={`h-11 w-full rounded-xl border px-3.5 text-sm outline-none ${errors.reference ? 'border-red-500 bg-red-50' : 'border-[rgba(125,36,56,0.18)] bg-white focus:border-vino'}`} placeholder="Ej. frente al parque" />
                    {errors.reference ? <p className="mt-1 text-xs text-red-600">{errors.reference}</p> : null}
                  </div>
                </div>

                <Button className={`${BTN_PRIMARIO_CLASS} w-full justify-center sm:w-auto`} onClick={handleSaveContact}>Guardar y continuar</Button>
              </div>
            </section>

            <section className="overflow-hidden rounded-[28px] border border-[rgba(125,36,56,0.15)] bg-[#fffdfd] shadow-[0_18px_60px_rgba(80,26,34,0.06)]">
              <div className="flex items-center justify-between gap-3 border-b border-[rgba(125,36,56,0.08)] bg-[rgba(255, 255, 255, 0.72)] px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-vino text-sm font-bold text-crema">2</span>
                  <div>
                    <h2 className="text-lg font-semibold text-vino-oscuro">Método de pago</h2>
                    {paymentSummary ? <p className="text-xs text-[#7b5e63]">{paymentSummary}</p> : null}
                  </div>
                </div>
                <button type="button" onClick={() => setPaymentSaved(false)} className="text-xs font-bold uppercase tracking-[0.12em] text-vino hover:text-vino-oscuro">Editar</button>
              </div>
              <div className="grid gap-4 p-5">
                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map((method) => {
                    const active = form.paymentMethod === method.value
                    const Icon = method.icon
                    return (
                      <label key={method.value} className={`flex cursor-pointer flex-col items-center gap-2 rounded-[18px] border px-4 py-5 text-black transition ${active ? 'border-dorado bg-[rgba(247, 57, 57, 0.53)]' : 'border-[rgba(125,36,56,0.16)] bg-[rgb(255, 255, 255)]'}`}>
                        <Icon className="h-5 w-5" />
                        <span className="flex items-center gap-2 text-[0.9rem] font-semibold">
                          <input type="radio" name="paymentMethod" checked={active} onChange={() => updateField('paymentMethod', method.value)} className="accent-vino" />
                          {method.label}
                        </span>
                      </label>
                    )
                  })}
                </div>

                {isCustomer && savedAccount.metodosPago.length > 0 ? (
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-vino">Usar método guardado</p>
                    <div className="flex flex-wrap gap-2">
                      {savedAccount.metodosPago.map((method, index) => (
                        <button type="button" key={`${String(method.type ?? 'pago')}-${index}`} onClick={() => {
                          if (method.type === 'yape' || method.yapeNumber) {
                            updateField('paymentMethod', 'yape')
                            updateField('yapePhone', String(method.yapeNumber ?? ''))
                            return
                          }
                          updateField('paymentMethod', 'tarjeta')
                          updateField('cardOwner', String(method.ownerName ?? ''))
                          updateField('cardNumber', String(method.cardNumber ?? ''))
                        }} className="rounded-full border border-vino px-3 py-2 text-xs font-semibold text-vino hover:bg-vino hover:text-crema">
                          {method.type === 'yape' || method.yapeNumber ? `Yape ${method.yapeNumber ?? ''}` : `Tarjeta •••• ${String(method.last4 ?? '')}`}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {isCustomer ? (
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-vino-oscuro">
                    <input type="checkbox" checked={savePayment} onChange={(event) => setSavePayment(event.target.checked)} className="size-4 accent-vino" />
                    Guardar {form.paymentMethod === 'tarjeta' ? 'tarjeta' : 'número de Yape'}
                  </label>
                ) : null}

                {paymentMessage ? <p className="text-sm font-semibold text-verde">{paymentMessage}</p> : null}

                {form.paymentMethod === 'tarjeta' ? (
                  <div className="grid gap-4.5">
                    <div>
                      <label className="mb-2 block text-[0.75rem] font-bold uppercase tracking-[0.12em] text-vino">Nombre del propietario</label>
                      <input value={form.cardOwner} onChange={(event) => updateField('cardOwner', event.target.value)} className={`h-11 w-full rounded-xl border px-3.5 text-sm outline-none ${errors.cardOwner ? 'border-red-500 bg-red-50' : 'border-[rgba(125,36,56,0.18)] bg-white focus:border-vino'}`} placeholder="Nombre en la tarjeta" />
                      {errors.cardOwner ? <p className="mt-1 text-xs text-red-600">{errors.cardOwner}</p> : null}
                    </div>
                    <div>
                      <label className="mb-2 block text-[0.75rem] font-bold uppercase tracking-[0.12em] text-vino">Número de tarjeta</label>
                      <input value={form.cardNumber} onChange={(event) => updateField('cardNumber', event.target.value)} className={`h-11 w-full rounded-xl border px-3.5 text-sm outline-none ${errors.cardNumber ? 'border-red-500 bg-red-50' : 'border-[rgba(125,36,56,0.18)] bg-white focus:border-vino'}`} placeholder="0000 0000 0000 0000" />
                      {errors.cardNumber ? <p className="mt-1 text-xs text-red-600">{errors.cardNumber}</p> : null}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-2 block text-[0.75rem] font-bold uppercase tracking-[0.12em] text-vino">Expiración</label>
                        <input value={form.cardExpiry} onChange={(event) => updateField('cardExpiry', event.target.value)} className={`h-11 w-full rounded-xl border px-3.5 text-sm outline-none ${errors.cardExpiry ? 'border-red-500 bg-red-50' : 'border-[rgba(125,36,56,0.18)] bg-white focus:border-vino'}`} placeholder="MM/AA" />
                        {errors.cardExpiry ? <p className="mt-1 text-xs text-red-600">{errors.cardExpiry}</p> : null}
                      </div>
                      <div>
                        <label className="mb-2 block text-[0.75rem] font-bold uppercase tracking-[0.12em] text-vino">CVV</label>
                        <input value={form.cardCvv} onChange={(event) => updateField('cardCvv', event.target.value)} className={`h-11 w-full rounded-xl border px-3.5 text-sm outline-none ${errors.cardCvv ? 'border-red-500 bg-red-50' : 'border-[rgba(125,36,56,0.18)] bg-white focus:border-vino'}`} placeholder="123" />
                        {errors.cardCvv ? <p className="mt-1 text-xs text-red-600">{errors.cardCvv}</p> : null}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4.5">
                    <div>
                      <label className="mb-2 block text-[0.75rem] font-bold uppercase tracking-[0.12em] text-vino">Número de Yape</label>
                      <input value={form.yapePhone} onChange={(event) => updateField('yapePhone', event.target.value)} className={`h-11 w-full rounded-xl border px-3.5 text-sm outline-none ${errors.yapePhone ? 'border-red-500 bg-red-50' : 'border-[rgba(125,36,56,0.18)] bg-white focus:border-vino'}`} placeholder="+51 9XXXXXXXX" />
                      {errors.yapePhone ? <p className="mt-1 text-xs text-red-600">{errors.yapePhone}</p> : null}
                    </div>
                    <p className="text-[0.9rem] text-[#7a5560]">En este flujo simulado, recibirás la confirmación por WhatsApp.</p>
                  </div>
                )}

                <Button className={`${BTN_PRIMARIO_CLASS} w-full justify-center sm:w-auto`} onClick={handleSavePayment}>Guardar método de pago</Button>
              </div>
            </section>
          </div>

          <aside className="rounded-[30px] border border-[rgba(125,36,56,0.12)] bg-[#ffffff] p-5 shadow-[0_22px_70px_rgba(91,31,38,0.08)]">
            <div className="flex items-center justify-between border-b border-[rgba(125,36,56,0.1)] pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-vino">Resumen</p>
                <h3 className="mt-2 font-serif text-2xl font-semibold text-vino-oscuro">Tu pedido</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-vino text-crema">
                <ShoppingBag className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <button type="button" onClick={() => setProductsExpanded(!productsExpanded)} className="flex w-full items-center justify-between text-sm font-semibold text-vino-oscuro">
                <span>{items.length} productos</span>
                <span>{productsExpanded ? 'Ocultar' : 'Mostrar'}</span>
              </button>

              {productsExpanded ? (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex gap-3 rounded-2xl border border-[rgba(125,36,56,0.08)] bg-white p-3">
                      <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-vino-oscuro">{item.name}</p>
                        <p className="mt-1 text-xs text-[#7b5e63]">Talla {item.size || 'Única'} · {item.quantity} und.</p>
                        <p className="mt-2 text-sm font-bold text-vino">S/ {(item.unitPrice * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-5 rounded-2xl border border-[rgba(125,36,56,0.08)] bg-white p-4">
              <div className="flex gap-2">
                <input value={couponInput} onChange={(event) => setCouponInput(event.target.value)} placeholder="Código promocional" className="h-11 flex-1 rounded-xl border border-[rgba(125,36,56,0.16)] bg-[#fffaf7] px-3 text-sm outline-none focus:border-vino" />
                <Button onClick={handleApplyCoupon} className="h-11 rounded-xl px-3">Aplicar</Button>
              </div>
              {couponMessage ? <p className="mt-2 text-xs text-[#7a5560]">{couponMessage}</p> : null}
              {appliedCouponCode ? <p className="mt-2 text-xs font-semibold text-verde">Cupón activo: {appliedCouponCode}</p> : null}
            </div>

            <div className="mt-5 space-y-3 text-sm text-[#6b4750]">
              <div className="flex justify-between"><span>Subtotal</span><span>S/ {totalPrice.toFixed(2)}</span></div>
              {couponDiscount > 0 ? <div className="flex justify-between text-green-600"><span>Descuento</span><span>-S/ {couponDiscount.toFixed(2)}</span></div> : null}
              <div className="flex justify-between"><span>Envío</span><span>{etiquetaEnvio}</span></div>
              <div className="flex justify-between"><span>Departamento</span><span>{selectedDepartmentName || 'Sin seleccionar'}</span></div>
            </div>

            <div className="mt-5 rounded-2xl bg-[rgba(99, 91, 91, 0.66)] p-4">
              <div className="flex items-center justify-between text-lg font-semibold text-black">
                <span>Total</span>
                <span>S/ {checkoutTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button onClick={handleConfirm} disabled={!(contactSaved && paymentSaved) || confirmingOrder} className="mt-5 h-12 w-full rounded-full bg-vino text-crema hover:bg-vino-oscuro disabled:cursor-not-allowed disabled:opacity-60">
              {confirmingOrder ? 'Confirmando...' : 'Confirmar compra'}
            </Button>

            {confirmError ? <p className="mt-3 text-sm font-medium text-red-600">{confirmError}</p> : null}

            <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#7a5560]">
              <ShieldCheck className="h-4 w-4 text-verde" />
              Compra segura
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default CheckoutPage
