import { Heart, ShoppingBag } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import CommonButton from '@/components/common/CommonButton'
import CommonCard from '@/components/common/CommonCard'
import { Badge } from '@/components/ui/badge'
import StarRating from '@/components/common/StarRating'
import { useCart } from '@/shared/cart/CartContext'
import { useFavorites } from '@/shared/favorites/FavoritesContext'
import { REVEAL_CLASS } from '@/shared/ui/reveal'
import { getProductImage, CATEGORIA_STYLES, type Producto } from './data'

const BADGE_CLASS: Record<NonNullable<Producto['badge']>, string> = {
  Bestseller: 'bg-dorado text-vino-oscuro',
  Nuevo: 'bg-verde text-crema',
  Oferta: 'bg-vino text-crema',
}

interface ProductCardProps {
  product: Producto
}

function ProductCard({ product }: ProductCardProps) {
  const { addItem, announceAdded } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const navigate = useNavigate()

  const style = CATEGORIA_STYLES[product.category]
  const Icon = style.icon
  const discount = product.originalPrice ? Math.round((1 - product.unitPrice / product.originalPrice) * 100) : null
  const liked = isFavorite(product.id)

  const cartProduct = {
    id: product.id,
    name: product.name,
    image: getProductImage(product.category, product.name, product.id),
    unitPrice: product.unitPrice,
  }

  const handleAddToCart = () => {
    addItem(cartProduct, 1)
    announceAdded(product.name)
  }

  const handleBuyNow = () => {
    addItem(cartProduct, 1)
    navigate('/checkout')
  }

  return (
    <CommonCard className={`reveal group flex h-full flex-col overflow-hidden transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-marca ${REVEAL_CLASS}`}>
      <Link to={`/tienda/${product.id}`} className="flex flex-1 flex-col">
        <div className={`relative aspect-[4/5] overflow-hidden bg-linear-to-br ${style.gradient}`}>
          <div className="absolute inset-0 m-auto h-[70%] w-[70%] animate-[girar_50s_linear_infinite] rounded-full border border-dashed border-white/25" />
          <Icon className="absolute inset-0 m-auto size-16 text-white/90 drop-shadow-sm transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />

          <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
            {product.badge && <Badge className={`h-auto rounded-full border-transparent px-3 py-1 text-[0.72rem] font-bold ${BADGE_CLASS[product.badge]}`}>{product.badge}</Badge>}
            {discount && <Badge className="h-auto rounded-full border-transparent bg-blanco px-3 py-1 text-[0.72rem] font-bold text-vino-oscuro">-{discount}%</Badge>}
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              toggleFavorite(product.id)
            }}
            aria-label={liked ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            aria-pressed={liked}
            className="absolute top-3.5 right-3.5 flex size-8.5 items-center justify-center rounded-full bg-white/90 text-vino-oscuro shadow-sm transition-transform hover:scale-110"
          >
            <Heart className={`size-4 ${liked ? 'fill-vino text-vino' : ''}`} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-2.5 p-5.5 pb-0">
          <span className={`w-fit rounded-full px-2.5 py-1 text-[0.68rem] font-bold tracking-[0.08em] uppercase ${style.accentBg} ${style.accentText}`}>
            {style.label}
          </span>
          <h3 className="font-serif text-[1.12rem] leading-[1.2] font-semibold text-vino-oscuro transition-colors group-hover:text-vino">{product.name}</h3>

          <div className="flex items-center gap-2">
            <StarRating count={product.rating} className="text-dorado" />
            <span className="text-[0.78rem] text-[#8a6670]">({product.reviews})</span>
          </div>

          <p className="line-clamp-2 flex-1 text-[0.88rem] leading-[1.55] text-[#6b4750]">{product.description}</p>

          <div className="flex items-baseline gap-2">
            <span className="font-serif text-[1.35rem] font-semibold text-vino-oscuro">S/ {product.unitPrice.toFixed(2)}</span>
            {product.originalPrice && <span className="text-[0.85rem] text-[#9a7a82] line-through">S/ {product.originalPrice.toFixed(2)}</span>}
          </div>
        </div>
      </Link>

      <div className="flex gap-2.5 p-5.5 pt-4">
        <CommonButton
          className="h-auto flex-1 justify-center gap-1.5 rounded-full border-[1.5px] border-vino bg-transparent px-3 py-2.5 text-[0.82rem] font-bold text-vino transition-[transform,background,color] duration-300 hover:-translate-y-0.5 hover:bg-vino hover:text-crema"
          onClick={handleAddToCart}
          icon={<ShoppingBag className="size-4" />}
        >
          Agregar
        </CommonButton>
        <CommonButton
          className="h-auto flex-1 justify-center rounded-full bg-linear-to-br from-dorado to-[#b48a34] px-3 py-2.5 text-[0.82rem] font-bold text-vino-oscuro shadow-[0_10px_20px_-10px_rgba(201,162,75,0.6)] transition-transform duration-300 hover:-translate-y-0.5 hover:scale-[1.02]"
          onClick={handleBuyNow}
        >
          Comprar
        </CommonButton>
      </div>
    </CommonCard>
  )
}

export default ProductCard
