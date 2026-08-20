import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CATEGORIA_STYLES, type Categoria } from './data'

export type CategoriaFiltro = Categoria | 'todos'
export type Orden = 'destacados' | 'precio-asc' | 'precio-desc' | 'valorados'

const CATEGORIAS: { value: CategoriaFiltro; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  ...(Object.entries(CATEGORIA_STYLES) as [Categoria, (typeof CATEGORIA_STYLES)[Categoria]][]).map(([value, style]) => ({
    value,
    label: style.label,
  })),
]

const ORDEN_OPTIONS: { value: Orden; label: string }[] = [
  { value: 'destacados', label: 'Destacados' },
  { value: 'precio-asc', label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
  { value: 'valorados', label: 'Mejor valorados' },
]

interface TiendaFiltrosProps {
  categoria: CategoriaFiltro
  onCategoriaChange: (categoria: CategoriaFiltro) => void
  busqueda: string
  onBusquedaChange: (busqueda: string) => void
  orden: Orden
  onOrdenChange: (orden: Orden) => void
}

function TiendaFiltros({ categoria, onCategoriaChange, busqueda, onBusquedaChange, orden, onOrdenChange }: TiendaFiltrosProps) {
  return (
    <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap gap-2.5">
        {CATEGORIAS.map((item) => {
          const active = categoria === item.value
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onCategoriaChange(item.value)}
              className={`rounded-full px-4.5 py-2.5 text-[0.85rem] font-bold transition-colors duration-300 ${
                active ? 'bg-vino text-crema shadow-[0_10px_20px_-10px_rgba(76,21,38,0.55)]' : 'bg-vino-suave text-vino-oscuro hover:bg-[rgba(125,36,56,0.16)]'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#9a7a82]" />
          <Input
            value={busqueda}
            onChange={(event) => onBusquedaChange(event.target.value)}
            placeholder="Buscar productos..."
            className="h-auto w-56 rounded-full border-[rgba(125,36,56,0.2)] bg-blanco py-2.5 pr-4 pl-9.5 text-[0.85rem] text-vino-oscuro focus-visible:border-vino focus-visible:ring-vino/30"
          />
        </div>

        <Select value={orden} onValueChange={(value) => onOrdenChange(value as Orden)}>
          <SelectTrigger className="h-auto rounded-full border-[rgba(125,36,56,0.2)] bg-blanco px-4 py-2.5 text-[0.85rem] font-semibold text-vino-oscuro focus-visible:border-vino focus-visible:ring-vino/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORDEN_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default TiendaFiltros
