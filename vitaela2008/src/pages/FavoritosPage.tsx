import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import CartDrawer from '@/components/common/CartDrawer'
import CommonButton from '@/components/common/CommonButton'
import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import Faq from '@/modules/faq/Faq'
import ProductCard from '@/modules/tienda/ProductCard'
import { TIENDA_PRODUCTS } from '@/modules/tienda/data'
import { useFavorites } from '@/shared/favorites/FavoritesContext'
import { useScrollReveal } from '@/shared/hooks/useScrollReveal'
import { BTN_SECUNDARIO_CLASS } from '@/shared/ui/buttons'

function FavoritosPage() {
  const [cartOpen, setCartOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState(false)
  const { favoriteIds } = useFavorites()

  const productos = TIENDA_PRODUCTS.filter((producto) => favoriteIds.includes(producto.id))
  useScrollReveal(productos)

  return (
    <>
      <Header onOpenCart={() => setCartOpen(true)} />

      <main className="pt-32 pb-22.5 max-[720px]:pt-26">
        <section className="mx-auto w-[min(1180px,92%)]">
          <div className="mb-10 max-w-2xl">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-vino-suave px-4 py-2 text-[0.75rem] font-bold tracking-[0.08em] text-vino-oscuro uppercase">
              <Heart className="size-3.5 fill-vino text-vino" />
              Tu selección
            </span>
            <h1 className="mb-3 font-serif text-[clamp(2rem,4vw,3.2rem)] font-semibold text-vino-oscuro">Mis favoritos</h1>
            <p className="text-[#6b4750]">Guarda los productos que te gustan y vuelve a ellos cuando estés lista para elegir.</p>
          </div>

          {productos.length > 0 ? (
            <div className="grid grid-cols-3 gap-7 max-[980px]:grid-cols-2 max-[560px]:grid-cols-1">
              {productos.map((producto) => <ProductCard key={producto.id} product={producto} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-[28px] border border-[rgba(125,36,56,0.1)] bg-blanco py-20 text-center">
              <Heart className="size-12 text-[#c79aa4]" strokeWidth={1.4} />
              <h2 className="font-serif text-[1.4rem] font-semibold text-vino-oscuro">Aún no tienes favoritos</h2>
              <p className="max-w-90 text-[#6b4750]">Presiona el corazón de cualquier producto para guardarlo aquí.</p>
              <CommonButton asChild className={BTN_SECUNDARIO_CLASS}>
                <Link to="/tienda">Explorar productos</Link>
              </CommonButton>
            </div>
          )}
        </section>
      </main>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <Faq open={faqOpen} onClose={() => setFaqOpen(false)} />
      <Footer onOpenFaq={() => setFaqOpen(true)} />
    </>
  )
}

export default FavoritosPage