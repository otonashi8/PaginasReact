import { useState } from 'react'
import CartDrawer from '@/components/common/CartDrawer'
import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import Faq from '@/modules/faq/Faq'
import Stats from '@/modules/home/Stats'
import MisionVision from '@/modules/nosotros/MisionVision'
import NosotrosCta from '@/modules/nosotros/NosotrosCta'
import NosotrosHero from '@/modules/nosotros/NosotrosHero'
import NuestraHistoria from '@/modules/nosotros/NuestraHistoria'
import Valores from '@/modules/nosotros/Valores'
import { useHashScroll } from '@/shared/hooks/useHashScroll'
import { useScrollReveal } from '@/shared/hooks/useScrollReveal'

function NosotrosPage() {
  const [cartOpen, setCartOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState(false)

  useScrollReveal()
  useHashScroll()

  const handleOpenCart = () => setCartOpen(true)
  const handleOpenFaq = () => setFaqOpen(true)

  return (
    <>
      <Header onOpenCart={handleOpenCart} />

      <main>
        <NosotrosHero />
        <NuestraHistoria />
        <MisionVision />
        <Valores />
        <Stats />
        <NosotrosCta />
      </main>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <Faq open={faqOpen} onClose={() => setFaqOpen(false)} />

      <Footer onOpenFaq={handleOpenFaq} />
    </>
  )
}

export default NosotrosPage
