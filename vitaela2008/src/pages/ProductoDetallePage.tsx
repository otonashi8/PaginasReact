import { useEffect, useState } from 'react'
import { ArrowLeft, Check, ChevronRight, Heart, Package, ShieldCheck, Truck } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CartDrawer from '@/components/common/CartDrawer'
import CommonButton from '@/components/common/CommonButton'
import CommonCard from '@/components/common/CommonCard'
import SectionHeading from '@/components/common/SectionHeading'
import StarRating from '@/components/common/StarRating'
import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import { Badge } from '@/components/ui/badge'
import Faq from '@/modules/faq/Faq'
import ProductCard from '@/modules/tienda/ProductCard'
import { getProductImage, CATEGORIA_STYLES, findProductoById, TIENDA_PRODUCTS } from '@/modules/tienda/data'
import { useCart } from '@/shared/cart/CartContext'
import { useScrollReveal } from '@/shared/hooks/useScrollReveal'
import { BTN_DORADO_CLASS, BTN_SECUNDARIO_CLASS } from '@/shared/ui/buttons'
import { REVEAL_CLASS } from '@/shared/ui/reveal'

const BADGE_CLASS: Record<'Bestseller' | 'Nuevo' | 'Oferta', string> = {
  Bestseller: 'bg-dorado text-vino-oscuro',
  Nuevo: 'bg-verde text-crema',
  Oferta: 'bg-vino text-crema',
}

function ProductoDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const producto = findProductoById(id)

  const [quantity, setQuantity] = useState(1)
  const [liked, setLiked] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState(false)
  const { addItem, announceAdded } = useCart()

  useScrollReveal()

  useEffect(() => {
    setQuantity(1)
    setLiked(false)
    window.scrollTo(0, 0)
  }, [id])

  const handleOpenCart = () => setCartOpen(true)
  const handleOpenFaq = () => setFaqOpen(true)

  if (!producto) {
    return (
      <>
        <Header onOpenCart={handleOpenCart} />
        <main className="mx-auto flex w-[min(640px,92%)] flex-col items-center gap-4 py-40 text-center">
          <h1 className="font-serif text-[1.8rem] font-semibold text-vino-oscuro">Producto no encontrado</h1>
          <p className="text-[#6b4750]">El producto que buscas ya no está disponible o cambió de dirección.</p>
          <CommonButton asChild className={BTN_SECUNDARIO_CLASS}>
            <Link to="/tienda">Volver a la tienda</Link>
          </CommonButton>
        </main>
        <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
        <Footer onOpenFaq={handleOpenFaq} />
      </>
    )
  }

  const style = CATEGORIA_STYLES[producto.category]
  const Icon = style.icon
  const discount = producto.originalPrice ? Math.round((1 - producto.unitPrice / producto.originalPrice) * 100) : null

  const cartProduct = {
    id: producto.id,
    name: producto.name,
    image: getProductImage(producto.category, producto.name, producto.id),
    unitPrice: producto.unitPrice,
  }

  const handleAddToCart = () => {
    addItem(cartProduct, quantity)
    announceAdded(producto.name)
  }

  const handleBuyNow = () => {
    addItem(cartProduct, quantity)
    navigate('/checkout')
  }

  const relacionados = TIENDA_PRODUCTS.filter((item) => item.category === producto.category && item.id !== producto.id).slice(0, 3)

  return (
    <>
      <Header onOpenCart={handleOpenCart} />

      <main>
        <div className="mx-auto w-[min(1180px,92%)] pt-32 pb-4 max-[720px]:pt-26">
          <Link to="/tienda" className="mb-5 inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-vino hover:text-vino-oscuro">
            <ArrowLeft className="h-4 w-4" />
            Volver a la tienda
          </Link>

          <nav className="mb-8 flex flex-wrap items-center gap-1.5 text-[0.82rem] font-semibold text-[#8a6670]">
            <Link to="/tienda" className="hover:text-vino">
              Tienda
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-vino-oscuro">{style.label}</span>
            <ChevronRight className="size-3.5" />
            <span className="max-w-60 truncate text-vino-oscuro">{producto.name}</span>
          </nav>
        </div>

        <section className="pb-20">
          <div className="mx-auto grid w-[min(1180px,92%)] grid-cols-[0.9fr_1.1fr] items-start gap-14 max-[980px]:grid-cols-1">
            <div className={`reveal relative ${REVEAL_CLASS}`}>
              <div className={`relative aspect-4/5 overflow-hidden rounded-[32px] bg-linear-to-br shadow-marca ${style.gradient}`}>
                <div className="absolute inset-0 m-auto h-[65%] w-[65%] animate-[girar_50s_linear_infinite] rounded-full border border-dashed border-white/25" />
                <Icon className="absolute inset-0 m-auto size-28 text-white/90 drop-shadow-sm" strokeWidth={1.3} />

                <div className="absolute top-5 left-5 flex flex-wrap gap-1.5">
                  {producto.badge && (
                    <Badge className={`h-auto rounded-full border-transparent px-3.5 py-1.5 text-[0.78rem] font-bold ${BADGE_CLASS[producto.badge]}`}>
                      {producto.badge}
                    </Badge>
                  )}
                  {discount && <Badge className="h-auto rounded-full border-transparent bg-blanco px-3.5 py-1.5 text-[0.78rem] font-bold text-vino-oscuro">-{discount}%</Badge>}
                </div>

                <button
                  type="button"
                  onClick={() => setLiked((value) => !value)}
                  aria-label={liked ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                  aria-pressed={liked}
                  className="absolute top-5 right-5 flex size-10 items-center justify-center rounded-full bg-white/90 text-vino-oscuro shadow-sm transition-transform hover:scale-110"
                >
                  <Heart className={`size-4.5 ${liked ? 'fill-vino text-vino' : ''}`} />
                </button>
              </div>
            </div>

            <div className={`reveal ${REVEAL_CLASS}`}>
              <Badge className={`mb-4.5 h-auto gap-1.5 rounded-full border-transparent px-4 py-2 text-[0.78rem] font-bold ${style.accentBg} ${style.accentText}`}>
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                {style.label}
              </Badge>

              <h1 className="mb-3 font-serif text-[clamp(1.9rem,3.2vw,2.5rem)] leading-[1.08] font-semibold tracking-[-0.01em] text-vino-oscuro">{producto.name}</h1>

              <div className="mb-4 flex items-center gap-2.5">
                <StarRating count={producto.rating} className="text-dorado" />
                <span className="text-[0.85rem] text-[#8a6670]">{producto.reviews} reseñas</span>
              </div>

              <p className="mb-6 max-w-125 leading-[1.7] text-[#6b4750]">{producto.description}</p>

              <ul className="mb-7 flex flex-wrap gap-2.5">
                {producto.caracteristicas.map((item) => (
                  <li key={item}>
                    <Badge className="h-auto rounded-full border-transparent bg-vino-suave px-4 py-2 text-[0.82rem] font-bold text-vino-oscuro">{item}</Badge>
                  </li>
                ))}
              </ul>

              <div className="mb-6 flex items-baseline gap-3.5">
                <span className="font-serif text-[2.2rem] font-semibold text-vino-oscuro">S/ {producto.unitPrice.toFixed(2)}</span>
                {producto.originalPrice && <span className="text-[1.05rem] text-[#9a7a82] line-through">S/ {producto.originalPrice.toFixed(2)}</span>}
              </div>

              <p className="mb-6 inline-flex items-center gap-2 text-[0.85rem] font-semibold text-[#6b4750]">
                <Package className="size-4 text-dorado" />
                {producto.presentacion}
              </p>

              <div className="mb-6 flex items-center gap-3.5">
                <CommonButton
                  className="h-11 w-11 rounded-[16px] bg-vino p-0 text-[1.2rem] text-crema hover:bg-vino-oscuro"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  −
                </CommonButton>
                <span className="min-w-8 text-center font-bold">{quantity}</span>
                <CommonButton className="h-11 w-11 rounded-[16px] bg-vino p-0 text-[1.2rem] text-crema hover:bg-vino-oscuro" onClick={() => setQuantity(quantity + 1)}>
                  +
                </CommonButton>
              </div>

              <div className="mb-7 flex flex-wrap gap-4">
                <CommonButton className={BTN_SECUNDARIO_CLASS} onClick={handleAddToCart}>
                  Agregar al carrito
                </CommonButton>
                <CommonButton className={BTN_DORADO_CLASS} onClick={handleBuyNow}>
                  Comprar ahora
                </CommonButton>
              </div>

              <div className="flex flex-wrap gap-5 border-t border-[rgba(125,36,56,0.1)] pt-6">
                <span className="inline-flex items-center gap-2 text-[0.82rem] font-semibold text-[#6b4750]">
                  <ShieldCheck className="size-4 text-verde" />
                  Compra 100% segura
                </span>
                <span className="inline-flex items-center gap-2 text-[0.82rem] font-semibold text-[#6b4750]">
                  <Truck className="size-4 text-verde" />
                  Envío en 24-48h
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="mx-auto grid w-[min(1180px,92%)] grid-cols-[1.3fr_1fr] gap-12 max-[980px]:grid-cols-1">
            <div className={`reveal ${REVEAL_CLASS}`}>
              <h2 className="mb-4 font-serif text-[1.5rem] font-semibold text-vino-oscuro">Descripción</h2>
              <p className="mb-10 leading-[1.75] text-[#6b4750]">{producto.longDescription}</p>

              <h2 className="mb-5 font-serif text-[1.5rem] font-semibold text-vino-oscuro">Beneficios</h2>
              <div className="grid grid-cols-3 gap-5 max-[720px]:grid-cols-1">
                {producto.beneficios.map((beneficio) => (
                  <CommonCard key={beneficio.title} className="px-5.5 py-6">
                    <div className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-[14px] bg-[linear-gradient(140deg,var(--color-vino-suave),var(--color-durazno))]">
                      <Icon className="h-5 w-5 stroke-vino-oscuro" strokeWidth={1.8} />
                    </div>
                    <h3 className="mb-2 font-serif text-[1.02rem] leading-[1.15] font-semibold text-vino-oscuro">{beneficio.title}</h3>
                    <p className="text-[0.85rem] leading-[1.55] text-[#6b4750]">{beneficio.description}</p>
                  </CommonCard>
                ))}
              </div>
            </div>

            <CommonCard className={`reveal h-fit bg-[rgba(237,214,197,0.4)] px-7 py-8 ${REVEAL_CLASS}`}>
              <h2 className="mb-3 font-serif text-[1.2rem] font-semibold text-vino-oscuro">Modo de uso</h2>
              <p className="mb-6 leading-[1.7] text-[#6b4750]">{producto.modoDeUso}</p>

              <h3 className="mb-3 text-[0.9rem] font-bold text-vino-oscuro">Este producto incluye</h3>
              <ul className="grid gap-2.5">
                {producto.caracteristicas.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-[0.88rem] text-[#6b4750]">
                    <Check className="size-4 shrink-0 text-verde" strokeWidth={2.5} />
                    {item}
                  </li>
                ))}
              </ul>
            </CommonCard>
          </div>
        </section>

        {relacionados.length > 0 && (
          <section className="pb-22.5">
            <div className="mx-auto w-[min(1180px,92%)]">
              <SectionHeading eyebrow="Sigue explorando" title="También te puede interesar" />
              <div className="grid grid-cols-3 gap-7 max-[980px]:grid-cols-2 max-[560px]:grid-cols-1">
                {relacionados.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <Faq open={faqOpen} onClose={() => setFaqOpen(false)} />

      <Footer onOpenFaq={handleOpenFaq} />
    </>
  )
}

export default ProductoDetallePage
