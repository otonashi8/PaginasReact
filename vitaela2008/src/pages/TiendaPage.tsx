import { useMemo, useState } from 'react'
import { PackageSearch } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import CartDrawer from '@/components/common/CartDrawer'
import CommonButton from '@/components/common/CommonButton'
import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import Faq from '@/modules/faq/Faq'
import Cinta from '@/modules/home/Cinta'
import ProductCard from '@/modules/tienda/ProductCard'
import TiendaFiltros, { type CategoriaFiltro, type Orden } from '@/modules/tienda/TiendaFiltros'
import TiendaHero from '@/modules/tienda/TiendaHero'
import { TIENDA_PRODUCTS } from '@/modules/tienda/data'
import { useScrollReveal } from '@/shared/hooks/useScrollReveal'
import { BTN_SECUNDARIO_CLASS } from '@/shared/ui/buttons'

const TIENDA_CINTA_ITEMS = [
  'Envío gratis desde S/150',
  'Cambios y devoluciones en 15 días',
  'Pago seguro con tarjeta y Yape',
  'Ingredientes 100% naturales',
  'Atención personalizada 24/7',
]

const CATEGORIAS_VALIDAS: CategoriaFiltro[] = ['colageno', 'vitaminas', 'skincare', 'bienestar']

function TiendaPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoriaFromUrl = searchParams.get('categoria')
  const categoriaInicial: CategoriaFiltro = CATEGORIAS_VALIDAS.includes(categoriaFromUrl as CategoriaFiltro) ? (categoriaFromUrl as CategoriaFiltro) : 'todos'

  const [cartOpen, setCartOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState(false)
  const [categoria, setCategoriaState] = useState<CategoriaFiltro>(categoriaInicial)
  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useState<Orden>('destacados')

  const handleCategoriaChange = (value: CategoriaFiltro) => {
    setCategoriaState(value)
    setSearchParams(value === 'todos' ? {} : { categoria: value })
  }

  const handleOpenCart = () => setCartOpen(true)
  const handleOpenFaq = () => setFaqOpen(true)

  const productos = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    const filtrados = TIENDA_PRODUCTS.filter((producto) => {
      const coincideCategoria = categoria === 'todos' || producto.category === categoria
      const coincideBusqueda = !texto || producto.name.toLowerCase().includes(texto) || producto.description.toLowerCase().includes(texto)
      return coincideCategoria && coincideBusqueda
    })

    const ordenados = [...filtrados]
    if (orden === 'precio-asc') ordenados.sort((a, b) => a.unitPrice - b.unitPrice)
    else if (orden === 'precio-desc') ordenados.sort((a, b) => b.unitPrice - a.unitPrice)
    else if (orden === 'valorados') ordenados.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
    else ordenados.sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0) || b.reviews - a.reviews)

    return ordenados
  }, [categoria, busqueda, orden])

  useScrollReveal(productos)

  const handleLimpiarFiltros = () => {
    handleCategoriaChange('todos')
    setBusqueda('')
    setOrden('destacados')
  }

  return (
    <>
      <Header onOpenCart={handleOpenCart} />

      <main>
        <TiendaHero />
        <Cinta items={TIENDA_CINTA_ITEMS} />

        <section className="pb-22.5">
          <div className="mx-auto w-[min(1180px,92%)]">
            <TiendaFiltros
              categoria={categoria}
              onCategoriaChange={handleCategoriaChange}
              busqueda={busqueda}
              onBusquedaChange={setBusqueda}
              orden={orden}
              onOrdenChange={setOrden}
            />

            <p className="mb-6 text-[0.85rem] font-semibold text-[#8a6670]">
              Mostrando {productos.length} de {TIENDA_PRODUCTS.length} productos
            </p>

            {productos.length > 0 ? (
              <div className="grid grid-cols-3 gap-7 max-[980px]:grid-cols-2 max-[560px]:grid-cols-1">
                {productos.map((producto) => (
                  <ProductCard key={producto.id} product={producto} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 rounded-[28px] border border-[rgba(125,36,56,0.1)] bg-blanco py-20 text-center">
                <PackageSearch className="size-11 text-[#c79aa4]" strokeWidth={1.5} />
                <p className="max-w-90 text-[#6b4750]">No encontramos productos que coincidan con tu búsqueda. Prueba con otro término o categoría.</p>
                <CommonButton className={BTN_SECUNDARIO_CLASS} onClick={handleLimpiarFiltros}>
                  Limpiar filtros
                </CommonButton>
              </div>
            )}
          </div>
        </section>
      </main>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <Faq open={faqOpen} onClose={() => setFaqOpen(false)} />

      <Footer onOpenFaq={handleOpenFaq} />
    </>
  )
}

export default TiendaPage
