import { useMemo, useState, type ReactNode } from 'react'
import { ArrowLeft, ChevronDown, CreditCard, ShieldCheck, ShoppingBag, Smartphone } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import ubigeoPeru from 'ubigeo-peru'
import { z } from 'zod'
import logo from '@/assets/logo_vitaella.png'
import CommonButton from '@/components/common/CommonButton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCart } from '@/shared/cart/CartContext'
import { PRODUCT_IMAGE_OVERRIDES } from '@/modules/tienda/data'
import { BTN_PRIMARIO_CLASS } from '@/shared/ui/buttons'
import { EYEBROW_CLASS, MODAL_INPUT_CLASS, MODAL_LABEL_CLASS, MODAL_P_CLASS } from '@/shared/ui/modal'

const PAYMENT_METHODS = [
  { value: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
  { value: 'yape', label: 'Yape', icon: Smartphone },
] as const

const UBIGEOS = ubigeoPeru.inei
const DEPARTAMENTOS = UBIGEOS.filter((item) => item.provincia === '00' && item.distrito === '00')

const contactSchema = z.object({
  fullName: z.string().trim().min(3, 'Ingresa tu nombre completo'),
  email: z.string().trim().min(1, 'Ingresa tu correo').email('Ingresa un correo válido'),
  phone: z
    .string()
    .trim()
    .min(1, 'Ingresa tu teléfono')
    .regex(/^\+?\d{9,12}$/, { message: 'Ingresa un teléfono válido, solo números' }),
  department: z.string().min(1, 'Selecciona un departamento'),
  province: z.string().min(1, 'Selecciona una provincia'),
  district: z.string().min(1, 'Selecciona un distrito'),
  locationText: z.string().trim().min(3, 'Ingresa tu dirección'),
})

const cardSchema = z.object({
  cardNumber: z
    .string()
    .trim()
    .refine((value) => value.replace(/\s/g, '').length >= 13, 'Ingresa un número de tarjeta válido'),
  cardExpiry: z.string().trim().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'Formato MM/AA' }),
  cardCvv: z.string().trim().regex(/^\d{3,4}$/, { message: 'CVV inválido' }),
})

const yapeSchema = z.object({
  yapePhone: z.string().trim().regex(/^\+?\d{9,12}$/, { message: 'Ingresa un número de Yape válido' }),
})

interface ComprarFormValues {
  fullName: string
  email: string
  phone: string
  department: string
  province: string
  district: string
  locationText: string
  paymentMethod: 'tarjeta' | 'yape'
  cardNumber: string
  cardExpiry: string
  cardCvv: string
  yapePhone: string
}

const DEFAULT_VALUES: ComprarFormValues = {
  fullName: '',
  email: '',
  phone: '',
  department: '',
  province: '',
  district: '',
  locationText: '',
  paymentMethod: 'tarjeta',
  cardNumber: '',
  cardExpiry: '',
  cardCvv: '',
  yapePhone: '',
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1.5 text-[0.8rem] font-semibold text-red-500">{message}</p>
}

function errorInputClass(hasError: boolean) {
  return `${MODAL_INPUT_CLASS} ${hasError ? 'border-red-400 focus-visible:border-red-400 focus-visible:ring-red-200' : ''}`
}

function CheckoutHeader() {
  return (
    <header className="border-b border-[rgba(125,36,56,0.1)] py-5">
      <div className="mx-auto flex w-[min(1000px,92%)] items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Vitaella" className="h-9 w-auto" />
        </Link>
        <span className="inline-flex items-center gap-2 text-[0.8rem] font-bold text-vino-oscuro">
          <ShieldCheck className="h-4 w-4" />
          Compra 100% segura
        </span>
      </div>
    </header>
  )
}

interface CheckoutSectionProps {
  title: string
  disabled?: boolean
  summary?: ReactNode
  onEdit?: () => void
  children?: ReactNode
}

function CheckoutSection({ title, disabled = false, summary, onEdit, children }: CheckoutSectionProps) {
  return (
    <div className={`rounded-[24px] border border-[rgba(125,36,56,0.1)] bg-blanco p-6 ${disabled ? 'pointer-events-none opacity-50' : ''}`}>
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-[1.05rem] font-semibold text-vino-oscuro">{title}</h2>
        {summary !== undefined && onEdit && (
          <button type="button" onClick={onEdit} className="text-[0.85rem] font-semibold text-vino underline-offset-2 hover:underline">
            Cambiar
          </button>
        )}
      </div>
      {summary !== undefined ? <p className="mt-2 text-[0.9rem] text-[#6b4750]">{summary}</p> : <div className="mt-4">{children}</div>}
    </div>
  )
}

function CheckoutPage() {
  const [completed, setCompleted] = useState(false)
  const [contactSaved, setContactSaved] = useState(false)
  const [paymentSaved, setPaymentSaved] = useState(false)
  const [productsExpanded, setProductsExpanded] = useState(true)
  const { items, clearCart, totalPrice } = useCart()

  const { register, getValues, setError, watch, setValue, clearErrors, formState: { errors } } = useForm<ComprarFormValues>({
    defaultValues: DEFAULT_VALUES,
  })

  const paymentMethod = watch('paymentMethod')
  const department = watch('department')
  const province = watch('province')

  const provincias = useMemo(
    () => UBIGEOS.filter((item) => item.departamento === department && item.provincia !== '00' && item.distrito === '00'),
    [department],
  )
  const distritos = useMemo(
    () => UBIGEOS.filter((item) => item.departamento === department && item.provincia === province && item.distrito !== '00'),
    [department, province],
  )

  const handleSaveContact = () => {
    const result = contactSchema.safeParse(getValues())
    clearErrors(['fullName', 'email', 'phone', 'department', 'province', 'district', 'locationText'])
    if (!result.success) {
      for (const issue of result.error.issues) {
        setError(issue.path[0] as keyof ComprarFormValues, { message: issue.message })
      }
      return
    }
    setContactSaved(true)
  }

  const handleSavePayment = () => {
    if (paymentMethod === 'tarjeta') {
      const result = cardSchema.safeParse(getValues())
      clearErrors(['cardNumber', 'cardExpiry', 'cardCvv'])
      if (!result.success) {
        for (const issue of result.error.issues) {
          setError(issue.path[0] as keyof ComprarFormValues, { message: issue.message })
        }
        return
      }
    } else {
      const result = yapeSchema.safeParse(getValues())
      clearErrors(['yapePhone'])
      if (!result.success) {
        for (const issue of result.error.issues) {
          setError(issue.path[0] as keyof ComprarFormValues, { message: issue.message })
        }
        return
      }
    }
    setPaymentSaved(true)
  }

  const handleConfirm = () => {
    setCompleted(true)
    clearCart()
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-crema">
        <CheckoutHeader />
        <main className="mx-auto w-[min(640px,92%)] py-16 text-center max-[720px]:py-10">
          <div className="grid gap-3 rounded-[24px] bg-[rgba(110,143,107,0.14)] p-8 text-left font-bold leading-[1.8] text-[#3f3a33]">
            <span className={`justify-center ${EYEBROW_CLASS}`}>Compra segura</span>
            <h1 className="mb-1 font-serif text-[1.9rem] leading-[1.05] font-semibold tracking-[-0.01em] text-vino-oscuro">Compra realizada</h1>
            <p className={MODAL_P_CLASS}>¡Tu compra se registró correctamente!</p>
            <p className={MODAL_P_CLASS}>En breve recibirás la confirmación en tu correo.</p>
            <div className="mt-3 flex flex-wrap justify-start gap-3.5">
              <CommonButton asChild className={BTN_PRIMARIO_CLASS}>
                <Link to="/">Volver a la tienda</Link>
              </CommonButton>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-crema">
        <CheckoutHeader />
        <main className="mx-auto flex w-[min(640px,92%)] flex-col items-center gap-4 py-20 text-center">
          <ShoppingBag className="h-12 w-12 text-vino-oscuro" strokeWidth={1.5} />
          <h1 className="font-serif text-[1.6rem] font-semibold text-vino-oscuro">Tu carrito está vacío</h1>
          <p className="text-[#6b4750]">Agrega el colágeno Vitaella a tu carrito para continuar con la compra.</p>
          <CommonButton asChild className={BTN_PRIMARIO_CLASS}>
            <Link to="/#producto">Ver producto</Link>
          </CommonButton>
        </main>
      </div>
    )
  }

  const selectedDepartment = DEPARTAMENTOS.find((item) => item.departamento === getValues('department'))?.nombre
  const selectedProvince = provincias.find((item) => item.provincia === getValues('province'))?.nombre
  const selectedDistrict = distritos.find((item) => item.distrito === getValues('district'))?.nombre

  const contactSummary = contactSaved
    ? `${getValues('fullName')} · ${selectedDistrict}, ${selectedProvince}, ${selectedDepartment} · ${getValues('locationText')}`
    : undefined

  const paymentSummary = paymentSaved
    ? paymentMethod === 'tarjeta'
      ? `Tarjeta •••• ${getValues('cardNumber').replace(/\s/g, '').slice(-4)}`
      : `Yape · ${getValues('yapePhone')}`
    : undefined

  return (
    <div className="min-h-screen bg-crema">
      <CheckoutHeader />
      <main className="mx-auto w-[min(1000px,92%)] py-12 max-[720px]:py-8">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-vino hover:text-vino-oscuro">
          <ArrowLeft className="h-4 w-4" />
          Volver a la tienda
        </Link>

        <span className={EYEBROW_CLASS}>Compra segura</span>
        <h1 className="mt-4 mb-8 font-serif text-[1.9rem] leading-[1.05] font-semibold tracking-[-0.01em] text-vino-oscuro">Revisa y paga tu compra</h1>

        <div className="grid grid-cols-[1.35fr_1fr] items-start gap-7 max-[720px]:grid-cols-1">
          <div className="grid gap-5">
            <CheckoutSection title="Datos de contacto y envío" summary={contactSummary} onEdit={() => setContactSaved(false)}>
              <div className="grid gap-4.5">
                <div>
                  <Label htmlFor="fullName" className={MODAL_LABEL_CLASS}>
                    Nombre completo
                  </Label>
                  <Input
                    id="fullName"
                    className={errorInputClass(!!errors.fullName)}
                    placeholder="Tu nombre"
                    aria-invalid={!!errors.fullName}
                    {...register('fullName')}
                  />
                  <FieldError message={errors.fullName?.message} />
                </div>
                <div>
                  <Label htmlFor="email" className={MODAL_LABEL_CLASS}>
                    Correo electrónico
                  </Label>
                  <Input
                    id="email"
                    className={errorInputClass(!!errors.email)}
                    placeholder="ejemplo@mail.com"
                    type="email"
                    aria-invalid={!!errors.email}
                    {...register('email')}
                  />
                  <FieldError message={errors.email?.message} />
                </div>
                <div>
                  <Label htmlFor="phone" className={MODAL_LABEL_CLASS}>
                    Teléfono
                  </Label>
                  <Input
                    id="phone"
                    className={errorInputClass(!!errors.phone)}
                    placeholder="+51 9XXXXXXXX"
                    aria-invalid={!!errors.phone}
                    {...register('phone')}
                  />
                  <FieldError message={errors.phone?.message} />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="min-w-0">
                    <Label htmlFor="department" className={MODAL_LABEL_CLASS}>
                      Departamento
                    </Label>
                    <Select
                      value={department}
                      onValueChange={(value) => {
                        setValue('department', value)
                        setValue('province', '')
                        setValue('district', '')
                      }}
                    >
                      <SelectTrigger id="department" className={`h-10 w-full ${errorInputClass(!!errors.department)}`} aria-invalid={!!errors.department}>
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTAMENTOS.map((item) => (
                          <SelectItem key={item.departamento} value={item.departamento}>
                            {item.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError message={errors.department?.message} />
                  </div>

                  <div className="min-w-0">
                    <Label htmlFor="province" className={MODAL_LABEL_CLASS}>
                      Provincia
                    </Label>
                    <Select
                      value={province}
                      disabled={!department}
                      onValueChange={(value) => {
                        setValue('province', value)
                        setValue('district', '')
                      }}
                    >
                      <SelectTrigger id="province" className={`h-10 w-full ${errorInputClass(!!errors.province)}`} aria-invalid={!!errors.province}>
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        {provincias.map((item) => (
                          <SelectItem key={`${item.departamento}-${item.provincia}`} value={item.provincia}>
                            {item.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError message={errors.province?.message} />
                  </div>

                  <div className="min-w-0">
                    <Label htmlFor="district" className={MODAL_LABEL_CLASS}>
                      Distrito
                    </Label>
                    <Select value={watch('district')} disabled={!province} onValueChange={(value) => setValue('district', value)}>
                      <SelectTrigger id="district" className={`h-10 w-full ${errorInputClass(!!errors.district)}`} aria-invalid={!!errors.district}>
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        {distritos.map((item) => (
                          <SelectItem key={`${item.departamento}-${item.provincia}-${item.distrito}`} value={item.distrito}>
                            {item.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError message={errors.district?.message} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="locationText" className={MODAL_LABEL_CLASS}>
                    Dirección
                  </Label>
                  <Input
                    id="locationText"
                    className={errorInputClass(!!errors.locationText)}
                    placeholder="Av., Jr., calle, número, referencia o interior"
                    aria-invalid={!!errors.locationText}
                    {...register('locationText')}
                  />
                  <FieldError message={errors.locationText?.message} />
                </div>
                <CommonButton className={`${BTN_PRIMARIO_CLASS} w-full justify-center sm:w-auto`} onClick={handleSaveContact}>
                  Guardar y continuar
                </CommonButton>
              </div>
            </CheckoutSection>

            <CheckoutSection
              title="Método de pago"
              disabled={!contactSaved && !paymentSaved}
              summary={paymentSummary}
              onEdit={() => setPaymentSaved(false)}
            >
              <div className="grid gap-4.5">
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setValue('paymentMethod', value as 'tarjeta' | 'yape')}
                  className="mb-1.5 grid grid-cols-2 gap-3"
                >
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon
                    const active = paymentMethod === method.value
                    return (
                      <Label
                        key={method.value}
                        htmlFor={method.value}
                        className={`flex cursor-pointer flex-col items-center gap-2 rounded-[18px] border px-4 py-5 font-normal text-vino-oscuro transition-colors ${
                          active ? 'border-dorado bg-[rgba(201,162,75,0.16)]' : 'border-[rgba(125,36,56,0.16)] bg-[rgba(253,246,241,0.98)]'
                        }`}
                      >
                        <Icon className="h-5.5 w-5.5" strokeWidth={1.8} />
                        <span className="flex items-center gap-1.5 text-[0.9rem] font-semibold">
                          <RadioGroupItem value={method.value} id={method.value} className="border-vino data-checked:border-vino data-checked:bg-vino" />
                          {method.label}
                        </span>
                      </Label>
                    )
                  })}
                </RadioGroup>
                {paymentMethod === 'tarjeta' ? (
                  <div className="grid gap-4.5">
                    <div>
                      <Label htmlFor="cardNumber" className={MODAL_LABEL_CLASS}>
                        Número de tarjeta
                      </Label>
                      <Input
                        id="cardNumber"
                        className={errorInputClass(!!errors.cardNumber)}
                        placeholder="0000 0000 0000 0000"
                        aria-invalid={!!errors.cardNumber}
                        {...register('cardNumber')}
                      />
                      <FieldError message={errors.cardNumber?.message} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="cardExpiry" className={MODAL_LABEL_CLASS}>
                          Expiración
                        </Label>
                        <Input
                          id="cardExpiry"
                          className={errorInputClass(!!errors.cardExpiry)}
                          placeholder="MM/AA"
                          aria-invalid={!!errors.cardExpiry}
                          {...register('cardExpiry')}
                        />
                        <FieldError message={errors.cardExpiry?.message} />
                      </div>
                      <div>
                        <Label htmlFor="cardCvv" className={MODAL_LABEL_CLASS}>
                          CVV
                        </Label>
                        <Input
                          id="cardCvv"
                          className={errorInputClass(!!errors.cardCvv)}
                          placeholder="123"
                          aria-invalid={!!errors.cardCvv}
                          {...register('cardCvv')}
                        />
                        <FieldError message={errors.cardCvv?.message} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4.5">
                    <div>
                      <Label htmlFor="yapePhone" className={MODAL_LABEL_CLASS}>
                        Número de Yape
                      </Label>
                      <Input
                        id="yapePhone"
                        className={errorInputClass(!!errors.yapePhone)}
                        placeholder="+51 9XXXXXXXX"
                        aria-invalid={!!errors.yapePhone}
                        {...register('yapePhone')}
                      />
                      <FieldError message={errors.yapePhone?.message} />
                    </div>
                    <p className="text-[0.9rem] text-[#7a5560]">En este flujo simulado, recibirás la confirmación por WhatsApp.</p>
                  </div>
                )}
                <CommonButton className={`${BTN_PRIMARIO_CLASS} w-full justify-center sm:w-auto`} onClick={handleSavePayment}>
                  Guardar método de pago
                </CommonButton>
              </div>
            </CheckoutSection>
          </div>

          <div className="grid min-w-0 gap-5 rounded-[24px] border border-[rgba(125,36,56,0.1)] bg-[rgba(237,214,197,0.55)] p-6 max-[720px]:order-first max-[520px]:p-4">
            <div>
              <h2 className="mb-4 font-serif text-[1.05rem] font-semibold text-vino-oscuro max-[360px]:text-[0.98rem]">Resumen de la compra</h2>
              <button
                type="button"
                className="flex w-full min-w-0 items-start justify-between gap-3 border-b border-[rgba(125,36,56,0.12)] pb-4 text-left"
                onClick={() => setProductsExpanded((value) => !value)}
                aria-expanded={productsExpanded}
              >
                <span className="min-w-0 text-[0.9rem] font-semibold text-vino-oscuro">Productos ({items.length})</span>
                <span className="flex shrink-0 items-center gap-1.5 text-[0.9rem] text-[#6b4750]">
                  S/ {totalPrice.toFixed(2)}
                  <ChevronDown className={`h-4 w-4 transition-transform ${productsExpanded ? 'rotate-180' : ''}`} />
                </span>
              </button>
              <div className={`grid transition-[grid-template-rows] duration-350 ease-out ${productsExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="min-h-0 overflow-hidden">
                  <div className={`grid gap-3 border-b border-[rgba(125,36,56,0.12)] py-4 transition-[opacity,transform] duration-350 ease-out ${productsExpanded ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}`}>
                    {items.map((item) => (
                      <div key={item.id} className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 text-[0.85rem] max-[380px]:gap-2.5">
                        <img src={PRODUCT_IMAGE_OVERRIDES[item.id] ?? item.image} alt={item.name} className="size-14 shrink-0 rounded-[14px] object-cover shadow-sm max-[380px]:size-12" />
                        <span className="min-w-0 break-words font-semibold leading-[1.35] text-vino-oscuro">
                          {item.name} <span className="whitespace-nowrap font-normal text-[#8a6670]">x{item.quantity}</span>
                        </span>
                        <span className="whitespace-nowrap text-right text-[#6b4750]">S/ {(item.unitPrice * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="font-bold text-vino-oscuro">Total</span>
                <span className="whitespace-nowrap font-serif text-[1.4rem] font-semibold text-vino-oscuro">S/ {totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <CommonButton
              className={`${BTN_PRIMARIO_CLASS} w-full justify-center`}
              onClick={handleConfirm}
              disabled={!contactSaved || !paymentSaved}
            >
              Pagar ahora
            </CommonButton>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CheckoutPage
