import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import CommonButton from '@/components/common/CommonButton'
import CommonCard from '@/components/common/CommonCard'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { BTN_PRIMARIO_CLASS } from '@/shared/ui/buttons'
import { MODAL_INPUT_CLASS, MODAL_LABEL_CLASS } from '@/shared/ui/modal'
import { REVEAL_CLASS } from '@/shared/ui/reveal'
import { ASUNTOS } from './data'

const contactoSchema = z.object({
  fullName: z.string().trim().min(3, 'Ingresa tu nombre completo'),
  email: z.string().trim().min(1, 'Ingresa tu correo').email('Ingresa un correo válido'),
  asunto: z.string().min(1, 'Selecciona un asunto'),
  mensaje: z.string().trim().min(10, 'Cuéntanos un poco más (mínimo 10 caracteres)'),
})

interface ContactoFormValues {
  fullName: string
  email: string
  asunto: string
  mensaje: string
}

const DEFAULT_VALUES: ContactoFormValues = {
  fullName: '',
  email: '',
  asunto: '',
  mensaje: '',
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1.5 text-[0.8rem] font-semibold text-red-500">{message}</p>
}

function errorInputClass(hasError: boolean) {
  return `${MODAL_INPUT_CLASS} ${hasError ? 'border-red-400 focus-visible:border-red-400 focus-visible:ring-red-200' : ''}`
}

function ContactoForm() {
  const [enviado, setEnviado] = useState(false)

  const {
    register,
    getValues,
    setError,
    watch,
    setValue,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<ContactoFormValues>({ defaultValues: DEFAULT_VALUES })

  const asunto = watch('asunto')

  const handleSubmit = () => {
    const result = contactoSchema.safeParse(getValues())
    clearErrors(['fullName', 'email', 'asunto', 'mensaje'])
    if (!result.success) {
      for (const issue of result.error.issues) {
        setError(issue.path[0] as keyof ContactoFormValues, { message: issue.message })
      }
      return
    }
    setEnviado(true)
  }

  const handleReiniciar = () => {
    reset(DEFAULT_VALUES)
    setEnviado(false)
  }

  if (enviado) {
    return (
      <CommonCard className={`reveal grid gap-3 p-8 text-center ${REVEAL_CLASS}`}>
        <CheckCircle2 className="mx-auto h-11 w-11 text-verde" strokeWidth={1.5} />
        <h2 className="font-serif text-[1.4rem] font-semibold text-vino-oscuro">¡Mensaje enviado!</h2>
        <p className="text-[#6b4750]">Gracias por escribirnos. Nuestro equipo te responderá dentro del horario de atención.</p>
        <CommonButton className={`${BTN_PRIMARIO_CLASS} mx-auto mt-2`} onClick={handleReiniciar}>
          Enviar otro mensaje
        </CommonButton>
      </CommonCard>
    )
  }

  return (
    <CommonCard className={`reveal p-7.5 max-[520px]:p-6 ${REVEAL_CLASS}`}>
      <h2 className="mb-6 font-serif text-[1.25rem] font-semibold text-vino-oscuro">Escríbenos</h2>

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
          <Label htmlFor="asunto" className={MODAL_LABEL_CLASS}>
            Asunto
          </Label>
          <Select value={asunto} onValueChange={(value) => setValue('asunto', value)}>
            <SelectTrigger id="asunto" className={`${errorInputClass(!!errors.asunto)} w-full justify-between`}>
              <SelectValue placeholder="Selecciona un asunto" />
            </SelectTrigger>
            <SelectContent>
              {ASUNTOS.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={errors.asunto?.message} />
        </div>

        <div>
          <Label htmlFor="mensaje" className={MODAL_LABEL_CLASS}>
            Mensaje
          </Label>
          <Textarea
            id="mensaje"
            className={`${errorInputClass(!!errors.mensaje)} min-h-32 resize-none`}
            placeholder="Cuéntanos en qué podemos ayudarte"
            aria-invalid={!!errors.mensaje}
            {...register('mensaje')}
          />
          <FieldError message={errors.mensaje?.message} />
        </div>

        <CommonButton className={`${BTN_PRIMARIO_CLASS} w-full justify-center sm:w-auto`} onClick={handleSubmit}>
          Enviar mensaje
        </CommonButton>
      </div>
    </CommonCard>
  )
}

export default ContactoForm
