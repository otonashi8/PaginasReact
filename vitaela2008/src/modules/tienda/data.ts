import { Droplets, Leaf, Pill, Sparkle, type LucideIcon } from 'lucide-react'

export type Categoria = 'colageno' | 'vitaminas' | 'skincare' | 'bienestar'

export interface CategoriaStyle {
  label: string
  icon: LucideIcon
  gradient: string
  accentBg: string
  accentText: string
  colorFrom: string
  colorTo: string
}

export const CATEGORIA_STYLES: Record<Categoria, CategoriaStyle> = {
  colageno: {
    label: 'Colágeno',
    icon: Droplets,
    gradient: 'from-vino to-vino-oscuro',
    accentBg: 'bg-vino-suave',
    accentText: 'text-vino-oscuro',
    colorFrom: '#7D2438',
    colorTo: '#4C1526',
  },
  vitaminas: {
    label: 'Vitaminas',
    icon: Pill,
    gradient: 'from-dorado to-[#b48a34]',
    accentBg: 'bg-dorado-suave',
    accentText: 'text-[#7a5a1f]',
    colorFrom: '#C9A24B',
    colorTo: '#b48a34',
  },
  skincare: {
    label: 'Skincare',
    icon: Sparkle,
    gradient: 'from-[#e7b7a0] to-vino-luz',
    accentBg: 'bg-[rgba(243,217,196,0.55)]',
    accentText: 'text-[#8a4a2e]',
    colorFrom: '#F3D9C4',
    colorTo: '#A8425A',
  },
  bienestar: {
    label: 'Bienestar',
    icon: Leaf,
    gradient: 'from-verde to-[#3f5a3c]',
    accentBg: 'bg-[rgba(110,143,107,0.16)]',
    accentText: 'text-[#4a6347]',
    colorFrom: '#6E8F6B',
    colorTo: '#3f5a3c',
  },
}

export type Badge = 'Bestseller' | 'Nuevo' | 'Oferta'

export interface ProductoBeneficio {
  title: string
  description: string
}

export interface Producto {
  id: string
  name: string
  category: Categoria
  description: string
  longDescription: string
  unitPrice: number
  originalPrice?: number
  rating: number
  reviews: number
  badge?: Badge
  presentacion: string
  modoDeUso: string
  caracteristicas: string[]
  beneficios: ProductoBeneficio[]
}

export const TIENDA_PRODUCTS: Producto[] = [
  {
    id: 'colageno-hidrolizado-vitaella',
    name: 'Colágeno Hidrolizado Original',
    category: 'colageno',
    description: 'Fórmula clásica en polvo con vitamina C para piel firme y cabello fuerte desde la primera caja.',
    longDescription:
      'Nuestra fórmula insignia combina colágeno hidrolizado de bajo peso molecular con vitamina C para potenciar su absorción y estimular tu producción natural. Sin sabor artificial, se disuelve por completo en segundos y se integra fácil a tu rutina diaria.',
    unitPrice: 89.9,
    originalPrice: 109.9,
    rating: 5,
    reviews: 482,
    badge: 'Bestseller',
    presentacion: '30 sobres x 10 g',
    modoDeUso: 'Disuelve un sobre en un vaso de agua, jugo o yogurt. Tómalo preferentemente en ayunas, todos los días.',
    caracteristicas: ['Colágeno tipo I y III', 'Vitamina C', 'Biotina', 'Ácido hialurónico'],
    beneficios: [
      { title: 'Piel más firme', description: 'Mejora la elasticidad e hidratación, reduciendo líneas de expresión.' },
      { title: 'Cabello más fuerte', description: 'Aporta aminoácidos clave para un cabello con más brillo y densidad.' },
      { title: 'Articulaciones sanas', description: 'Favorece la movilidad, ideal para quienes se mantienen activas.' },
    ],
  },
  {
    id: 'colageno-biotina-capilar',
    name: 'Colágeno + Biotina Capilar',
    category: 'colageno',
    description: 'Potenciado con biotina y zinc para frenar la caída y dar brillo intenso al cabello.',
    longDescription:
      'Diseñado especialmente para quienes buscan fortalecer su cabello desde la raíz. La combinación de colágeno, biotina y zinc nutre el folículo capilar, reduce la caída visible y devuelve el brillo natural en pocas semanas de uso constante.',
    unitPrice: 94.9,
    originalPrice: 112.9,
    rating: 5,
    reviews: 216,
    badge: 'Oferta',
    presentacion: '30 sobres x 10 g',
    modoDeUso: 'Mezcla un sobre con agua fría o tibia una vez al día, junto a una comida principal.',
    caracteristicas: ['Biotina', 'Zinc', 'Colágeno hidrolizado', 'Vitamina E'],
    beneficios: [
      { title: 'Menos caída', description: 'Fortalece el folículo capilar y reduce la caída visible del cabello.' },
      { title: 'Más brillo', description: 'Nutre la fibra capilar devolviendo luminosidad y suavidad.' },
      { title: 'Uñas resistentes', description: 'La biotina también fortalece uñas débiles y quebradizas.' },
    ],
  },
  {
    id: 'colageno-marino-antiedad',
    name: 'Colágeno Marino Antiedad',
    category: 'colageno',
    description: 'Péptidos marinos de bajo peso molecular para una piel más tersa y luminosa.',
    longDescription:
      'Extraído de fuentes marinas sostenibles, este colágeno de bajo peso molecular se absorbe hasta 1.5 veces más rápido que el colágeno bovino tradicional. Combinado con antioxidantes, ayuda a combatir los signos visibles del envejecimiento.',
    unitPrice: 99.9,
    rating: 4,
    reviews: 87,
    badge: 'Nuevo',
    presentacion: '30 sobres x 8 g',
    modoDeUso: 'Disuelve un sobre en medio vaso de agua fría. Tómalo por la noche antes de dormir.',
    caracteristicas: ['Colágeno marino', 'Coenzima Q10', 'Vitamina E', 'Resveratrol'],
    beneficios: [
      { title: 'Piel más tersa', description: 'Reduce la profundidad de arrugas y mejora la firmeza facial.' },
      { title: 'Efecto antioxidante', description: 'Protege la piel del daño causado por radicales libres.' },
      { title: 'Absorción rápida', description: 'Péptidos de bajo peso molecular para mejor biodisponibilidad.' },
    ],
  },
  {
    id: 'multivitaminico-mujer-balance',
    name: 'Multivitamínico Mujer Balance',
    category: 'vitaminas',
    description: 'Mezcla de 12 vitaminas y minerales pensada para energía diaria y equilibrio hormonal.',
    longDescription:
      'Formulado con 12 vitaminas y minerales esenciales, este multivitamínico está pensado para acompañar el ritmo de vida activo de la mujer moderna, apoyando la energía diaria, el equilibrio hormonal y las defensas.',
    unitPrice: 59.9,
    rating: 5,
    reviews: 340,
    presentacion: '60 cápsulas',
    modoDeUso: 'Toma una cápsula al día junto con alimentos, preferentemente en el desayuno.',
    caracteristicas: ['Vitaminas B6, B12 y D3', 'Hierro', 'Ácido fólico', 'Zinc'],
    beneficios: [
      { title: 'Energía sostenida', description: 'El complejo B ayuda a convertir los alimentos en energía real.' },
      { title: 'Equilibrio hormonal', description: 'Apoya la regulación hormonal durante todo el mes.' },
      { title: 'Defensas fuertes', description: 'Zinc y vitamina D3 refuerzan tu sistema inmune.' },
    ],
  },
  {
    id: 'magnesio-bisglicinato-relax',
    name: 'Magnesio Bisglicinato Relax',
    category: 'vitaminas',
    description: 'Alta absorción para relajación muscular, mejor descanso y menos fatiga.',
    longDescription:
      'El magnesio bisglicinato es una de las formas mejor toleradas y absorbidas de este mineral. Ayuda a relajar la musculatura, mejorar la calidad del sueño y reducir la sensación de fatiga acumulada del día a día.',
    unitPrice: 49.9,
    rating: 4,
    reviews: 158,
    presentacion: '60 cápsulas',
    modoDeUso: 'Toma 2 cápsulas por la noche, media hora antes de dormir.',
    caracteristicas: ['Magnesio bisglicinato', 'Vitamina B6', 'Sin laxante', 'Alta absorción'],
    beneficios: [
      { title: 'Mejor descanso', description: 'Favorece la relajación muscular y un sueño más profundo.' },
      { title: 'Menos fatiga', description: 'Participa en más de 300 procesos energéticos del cuerpo.' },
      { title: 'Calma muscular', description: 'Reduce calambres y tensión acumulada tras el ejercicio.' },
    ],
  },
  {
    id: 'omega-3-ultra-pure',
    name: 'Omega 3 Ultra Pure',
    category: 'vitaminas',
    description: 'Aceite de pescado purificado, alto en EPA/DHA para corazón y mente en forma.',
    longDescription:
      'Cápsulas de aceite de pescado de triple destilación, con altas concentraciones de EPA y DHA. Libre de metales pesados y sin sabor a pescado, ideal para cuidar tu salud cardiovascular y cognitiva a diario.',
    unitPrice: 64.9,
    originalPrice: 74.9,
    rating: 5,
    reviews: 201,
    badge: 'Oferta',
    presentacion: '60 cápsulas blandas',
    modoDeUso: 'Toma 2 cápsulas al día junto con una comida que contenga grasas para mejor absorción.',
    caracteristicas: ['EPA y DHA', 'Triple destilación', 'Sin sabor a pescado', 'Libre de metales pesados'],
    beneficios: [
      { title: 'Corazón sano', description: 'Ayuda a mantener niveles saludables de triglicéridos.' },
      { title: 'Mente enfocada', description: 'El DHA apoya la función cognitiva y la memoria.' },
      { title: 'Piel hidratada', description: 'Los ácidos grasos esenciales nutren la piel desde adentro.' },
    ],
  },
  {
    id: 'serum-hialuronico-vitc',
    name: 'Sérum Ácido Hialurónico + Vit. C',
    category: 'skincare',
    description: 'Hidratación profunda y luminosidad inmediata en una fórmula ligera de rápida absorción.',
    longDescription:
      'Un sérum ligero de textura gel que combina ácido hialurónico de tres pesos moleculares con vitamina C estabilizada. Hidrata en profundidad, ilumina el tono de la piel y ayuda a prevenir signos de envejecimiento prematuro.',
    unitPrice: 79.9,
    rating: 5,
    reviews: 129,
    badge: 'Nuevo',
    presentacion: 'Frasco 30 ml',
    modoDeUso: 'Aplica 3-4 gotas sobre rostro limpio, mañana y noche, antes de tu crema hidratante.',
    caracteristicas: ['Ácido hialurónico', 'Vitamina C estabilizada', 'Sin fragancia', 'Apto piel sensible'],
    beneficios: [
      { title: 'Hidratación profunda', description: 'Retiene la humedad en múltiples capas de la piel.' },
      { title: 'Piel luminosa', description: 'La vitamina C unifica el tono y aporta luminosidad.' },
      { title: 'Textura ligera', description: 'Absorción rápida sin dejar sensación grasosa.' },
    ],
  },
  {
    id: 'crema-facial-durazno',
    name: 'Crema Facial Nutritiva Durazno',
    category: 'skincare',
    description: 'Textura en mousse con extracto de durazno que nutre sin dejar sensación grasosa.',
    longDescription:
      'Una crema facial de textura mousse, ligera y de rápida absorción, formulada con extracto de durazno y manteca de karité. Nutre profundamente, suaviza la piel y deja un aroma fresco y delicado durante todo el día.',
    unitPrice: 69.9,
    rating: 4,
    reviews: 96,
    presentacion: 'Frasco 50 ml',
    modoDeUso: 'Aplica sobre rostro y cuello limpios con movimientos circulares, mañana y noche.',
    caracteristicas: ['Extracto de durazno', 'Manteca de karité', 'Vitamina E', 'Libre de parabenos'],
    beneficios: [
      { title: 'Nutrición profunda', description: 'Repone la barrera de hidratación natural de la piel.' },
      { title: 'Piel suave', description: 'Textura mousse que se absorbe sin dejar residuo graso.' },
      { title: 'Aroma delicado', description: 'Fragancia natural a durazno, suave y duradera.' },
    ],
  },
  {
    id: 'te-detox-herbal',
    name: 'Té Detox Herbal Vitaella',
    category: 'bienestar',
    description: 'Blend de hierbas naturales que acompaña la digestión y reduce la hinchazón.',
    longDescription:
      'Un blend artesanal de hierbas seleccionadas —diente de león, jengibre y menta— que acompaña de forma natural los procesos digestivos y ayuda a reducir la sensación de hinchazón después de las comidas.',
    unitPrice: 34.9,
    rating: 4,
    reviews: 174,
    presentacion: '20 bolsitas de infusión',
    modoDeUso: 'Vierte agua caliente sobre una bolsita y deja reposar 5 minutos. Toma después de tus comidas principales.',
    caracteristicas: ['Diente de león', 'Jengibre', 'Menta', 'Sin cafeína'],
    beneficios: [
      { title: 'Mejor digestión', description: 'Las hierbas naturales acompañan el proceso digestivo diario.' },
      { title: 'Menos hinchazón', description: 'Ayuda a aliviar la sensación de pesadez después de comer.' },
      { title: 'Relajante', description: 'Ideal como ritual de pausa en cualquier momento del día.' },
    ],
  },
  {
    id: 'probioticos-flora-balance',
    name: 'Probióticos Flora Balance',
    category: 'bienestar',
    description: '10 cepas vivas para una digestión saludable y un sistema inmune más fuerte.',
    longDescription:
      'Una fórmula con 10 cepas probióticas vivas y 20 mil millones de UFC por cápsula, con recubrimiento entérico que protege a las bacterias del ácido estomacal para que lleguen activas al intestino.',
    unitPrice: 54.9,
    rating: 5,
    reviews: 263,
    badge: 'Bestseller',
    presentacion: '30 cápsulas',
    modoDeUso: 'Toma una cápsula al día, preferentemente en ayunas con un vaso de agua.',
    caracteristicas: ['10 cepas vivas', '20 mil millones UFC', 'Recubrimiento entérico', 'No requiere refrigeración'],
    beneficios: [
      { title: 'Digestión saludable', description: 'Equilibra la flora intestinal y mejora la digestión.' },
      { title: 'Inmunidad fuerte', description: 'Gran parte del sistema inmune vive en el intestino.' },
      { title: 'Menos hinchazón', description: 'Ayuda a reducir gases y molestias digestivas.' },
    ],
  },
]

export function findProductoById(id: string | undefined): Producto | undefined {
  return TIENDA_PRODUCTS.find((producto) => producto.id === id)
}

export const PRODUCT_IMAGE_OVERRIDES: Record<string, string> = {
  'colageno-hidrolizado-vitaella': 'https://ezzetacompany.com/wp-content/uploads/2026/07/Gemini_Generated_Image_xmo2xsxmo2xsxmo2.png',
}

export function getProductImage(categoria: Categoria, name: string, id: string): string {
  return PRODUCT_IMAGE_OVERRIDES[id] ?? buildPlaceholderImage(categoria, name)
}

/** Builds a small gradient monogram as a data URI so cart/checkout thumbnails have art without external images. */
export function buildPlaceholderImage(categoria: Categoria, name: string): string {
  const style = CATEGORIA_STYLES[categoria]
  const initial = name.trim().charAt(0).toUpperCase()
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='500'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${style.colorFrom}'/><stop offset='1' stop-color='${style.colorTo}'/></linearGradient></defs><rect width='400' height='500' fill='url(%23g)'/><text x='50%' y='54%' font-family='Georgia, serif' font-size='150' fill='rgba(255,255,255,0.88)' text-anchor='middle' dominant-baseline='middle'>${initial}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
