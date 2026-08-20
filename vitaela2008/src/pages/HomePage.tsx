import { useState } from 'react'
import CartDrawer from '@/components/common/CartDrawer'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Hero from '@/modules/home/Hero'
import Cinta from '@/modules/home/Cinta'
import Beneficios from '@/modules/home/Beneficios'
import Esencia from '@/modules/home/Esencia'
import ProductoDestacado from '@/modules/home/ProductoDestacado'
import Stats from '@/modules/home/Stats'
import Testimonios from '@/modules/home/Testimonios'
import CtaFinal from '@/modules/home/CtaFinal'
import Faq from '@/modules/faq/Faq'
import { useHashScroll } from '@/shared/hooks/useHashScroll'
import { useScrollReveal } from '@/shared/hooks/useScrollReveal'

function HomePage() {
  const [cartOpen, setCartOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState(false)

  useScrollReveal()
  useHashScroll()

  const handleOpenCart = () => setCartOpen(true)
  const handleOpenFaq = () => setFaqOpen(true)
  const handleCloseFaq = () => setFaqOpen(false)

  return (
    <>
      <Header onOpenCart={handleOpenCart} />

      <main>
        <Hero />
        <Cinta />
        <Beneficios />
        <Esencia />
        <ProductoDestacado />
        <Stats />
        <Testimonios />
        <CtaFinal />
      </main>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <Faq open={faqOpen} onClose={handleCloseFaq} />

      <Footer onOpenFaq={handleOpenFaq} />
    </>
  )
}

export default HomePage
