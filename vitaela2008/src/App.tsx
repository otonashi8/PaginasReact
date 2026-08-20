import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import CheckoutPage from '@/pages/CheckoutPage'
import FloatingTools from '@/components/common/FloatingTools'
import ContactoPage from '@/pages/ContactoPage'
import FavoritosPage from '@/pages/FavoritosPage'
import HomePage from '@/pages/HomePage'
import NosotrosPage from '@/pages/NosotrosPage'
import ProductoDetallePage from '@/pages/ProductoDetallePage'
import TiendaPage from '@/pages/TiendaPage'
import { CartProvider } from '@/shared/cart/CartContext'
import { FavoritesProvider } from '@/shared/favorites/FavoritesContext'

function ScrollToTopOnRouteChange() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}

function App() {
  return (
    <CartProvider>
      <FavoritesProvider>
      <ScrollToTopOnRouteChange />
      <FloatingTools />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/nosotros" element={<NosotrosPage />} />
        <Route path="/tienda" element={<TiendaPage />} />
        <Route path="/tienda/:id" element={<ProductoDetallePage />} />
        <Route path="/contacto" element={<ContactoPage />} />
        <Route path="/favoritos" element={<FavoritosPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>
      </FavoritesProvider>
    </CartProvider>
  )
}

export default App
