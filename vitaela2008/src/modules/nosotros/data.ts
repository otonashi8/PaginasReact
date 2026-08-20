import { Eye, FlaskConical, HeartHandshake, Leaf, Recycle, ShieldCheck, type LucideIcon } from 'lucide-react'

export interface Valor {
  icon: LucideIcon
  title: string
  description: string
}

export const valores: Valor[] = [
  {
    icon: Leaf,
    title: 'Naturalidad',
    description: 'Elegimos ingredientes naturales y evitamos rellenos innecesarios en cada fórmula.',
  },
  {
    icon: FlaskConical,
    title: 'Respaldo científico',
    description: 'Cada producto se desarrolla y valida bajo estándares de calidad exigentes.',
  },
  {
    icon: Eye,
    title: 'Transparencia',
    description: 'Mostramos exactamente qué contiene cada producto, sin promesas vacías.',
  },
  {
    icon: HeartHandshake,
    title: 'Cercanía',
    description: 'Acompañamos a cada clienta con atención personalizada, antes y después de comprar.',
  },
  {
    icon: ShieldCheck,
    title: 'Calidad garantizada',
    description: 'Procesos y controles certificados en cada lote que producimos.',
  },
  {
    icon: Recycle,
    title: 'Sostenibilidad',
    description: 'Trabajamos con empaques responsables y proveedores que cuidan el planeta.',
  },
]

export interface Hito {
  year: string
  title: string
  description: string
}

export const hitos: Hito[] = [
  {
    year: '2021',
    title: 'El comienzo',
    description: 'Nace la idea de crear una marca peruana de bienestar 100% natural.',
  },
  {
    year: '2022',
    title: 'Primer lote',
    description: 'Lanzamos nuestro primer colágeno hidrolizado, elaborado en pequeños lotes.',
  },
  {
    year: '2024',
    title: 'Crecimos juntas',
    description: 'Más de 10,000 clientes ya confían en Vitaella para su rutina diaria.',
  },
  {
    year: '2026',
    title: 'Nueva etapa',
    description: 'Ampliamos nuestra línea a vitaminas, skincare y bienestar integral.',
  },
]
