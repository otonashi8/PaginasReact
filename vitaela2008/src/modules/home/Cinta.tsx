import { cintaItems } from './data'

const itemClassName =
  "flex items-center gap-7 whitespace-nowrap px-7 font-serif text-[1.15rem] text-dorado-suave italic after:text-dorado after:not-italic after:content-['✦']"

interface CintaProps {
  items?: string[]
}

function Cinta({ items = cintaItems }: CintaProps) {
  return (
    <div className="relative z-5 mb-10 overflow-hidden bg-vino-oscuro py-4 shadow-[0_10px_30px_-10px_rgba(76,21,38,0.4)]">
      <div className="flex w-max animate-[desplazar_28s_linear_infinite]" id="cintaTrack">
        <span className={itemClassName}>
          {items.map((item) => (
            <span className={itemClassName} key={item}>
              {item}
            </span>
          ))}
        </span>
        <span className={itemClassName}>
          {items.map((item) => (
            <span className={itemClassName} key={`${item}-duplicate`}>
              {item}
            </span>
          ))}
        </span>
      </div>
    </div>
  )
}

export default Cinta
