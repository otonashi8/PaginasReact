import { Activity, Droplets, Leaf, Sparkle, Sparkles, Zap } from 'lucide-react'
import type { CartProduct } from '@/shared/cart/CartContext'

export const PRODUCTO_VITAELLA: CartProduct = {
  id: 'colageno-hidrolizado-vitaella',
  name: 'Colágeno Hidrolizado Vitaella',
  image: 'https://ezzetacompany.com/wp-content/uploads/2026/07/Gemini_Generated_Image_xmo2xsxmo2xsxmo2.png',
  unitPrice: 89.9,
}

export const beneficios = [
  {
    title: 'Piel más firme y luminosa',
    description: 'Mejora la elasticidad e hidratación de la piel, reduciendo la apariencia de líneas finas.',
    icon: Droplets,
  },
  {
    title: 'Cabello y uñas más fuertes',
    description: 'Aporta los aminoácidos clave para un cabello con más brillo y uñas más resistentes.',
    icon: Sparkle,
  },
  {
    title: 'Articulaciones flexibles',
    description: 'Favorece la salud de las articulaciones, ideal para quienes se mantienen activas.',
    icon: Activity,
  },
  {
    title: 'Recuperación muscular',
    description: 'Apoya la reparación de tejidos, perfecto para complementar tu rutina de ejercicio.',
    icon: Zap,
  },
  {
    title: 'Retrasa signos de la edad',
    description: 'Estimula la producción natural de colágeno para una piel visiblemente más joven.',
    icon: Sparkles,
  },
  {
    title: '100% ingredientes naturales',
    description: 'Sin azúcar añadida, sin colorantes artificiales. Solo naturaleza en su forma más pura.',
    icon: Leaf,
  },
]

export const statsData = [
  { count: "+10000", label: 'Clientes felices' },
  { count: 98, label: '% notó mejoras en 30 días' },
  { count: 100, label: '% ingredientes naturales' },
  { count: 5, label: 'Estrellas en promedio' },
]

export const testimonios = [
  {
    quote: '"Desde el primer mes noté mi piel más firme y mi cabello dejó de caerse tanto. Ya es parte de mi rutina."',
    name: 'Milagros R.',
    note: 'Cliente desde 2024',
    initial: 'M',
  },
  {
    quote: '"Me encanta que sea natural y sin sabor raro. Se disuelve fácil y ya veo diferencia en mis uñas."',
    name: 'Carla V.',
    note: 'Cliente frecuente',
    initial: 'C',
  },
  {
    quote: '"Practico running y el colágeno me ayudó muchísimo con las rodillas. Además llegó súper rápido."',
    name: 'Andrea S.',
    note: 'Cliente desde 2023',
    initial: 'A',
  },
  {
    quote: '"Después de unas semanas mi piel se siente mucho más hidratada. Me gusta que sea tan fácil incorporarlo a mi día."',
    name: 'Sofía M.',
    note: 'Cliente desde 2025',
    initial: 'S',
  },
  {
    quote: '"Lo empecé a tomar por mis uñas y terminé notando cambios también en mi cabello. Ya voy por mi tercer frasco."',
    name: 'Valeria T.',
    note: 'Cliente frecuente',
    initial: 'V',
  },
]

export const cintaItems = [
  'Piel radiante',
  'Cabello fuerte',
  'Articulaciones sanas',
  'Ingredientes naturales',
  'Sin azúcar añadida',
  'Resultados en 30 días',
]
