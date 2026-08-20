import { Clock } from 'lucide-react'
import CommonCard from '@/components/common/CommonCard'
import { REVEAL_CLASS } from '@/shared/ui/reveal'
import { canales } from './data'

function ContactoInfo() {
  return (
    <div className={`reveal grid gap-5 ${REVEAL_CLASS}`}>
      <CommonCard className="p-6.5">
        <h2 className="mb-4 font-serif text-[1.15rem] font-semibold text-vino-oscuro">Canales de atención</h2>
        <div className="flex flex-col gap-3">
          {canales.map((canal) => (
            <a
              key={canal.value}
              href={canal.href}
              target={canal.href.startsWith('http') ? '_blank' : undefined}
              rel={canal.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="group flex items-center gap-3.5 rounded-[18px] border border-[rgba(125,36,56,0.14)] bg-[rgba(253,246,241,0.7)] px-4 py-3.5 transition-colors hover:border-vino/30 hover:bg-vino-suave/60"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-vino-suave text-vino transition-colors group-hover:bg-vino group-hover:text-crema">
                <canal.icon className="h-4.5 w-4.5" />
              </span>
              <span className="flex flex-col">
                <span className="text-[0.75rem] font-semibold tracking-[0.06em] text-vino uppercase">{canal.label}</span>
                <span className="text-[0.95rem] font-medium text-vino-oscuro">{canal.value}</span>
              </span>
            </a>
          ))}
        </div>
      </CommonCard>

      <CommonCard className="bg-[rgba(237,214,197,0.4)] p-6.5">
        <div className="mb-2 flex items-center gap-2.5 text-vino-oscuro">
          <Clock className="h-4.5 w-4.5" />
          <h2 className="font-serif text-[1.05rem] font-semibold">Horario de atención</h2>
        </div>
        <p className="text-[0.9rem] leading-[1.6] text-[#6b4750]">
          Lunes a sábado: 9:00 am – 7:00 pm
          <br />
          Domingos y feriados: respuesta al siguiente día hábil
        </p>
      </CommonCard>
    </div>
  )
}

export default ContactoInfo
