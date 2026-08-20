import { useState } from 'react'
import CartDrawer from '@/components/common/CartDrawer'
import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import Faq from '@/modules/faq/Faq'
import ContactoForm from '@/modules/contacto/ContactoForm'
import ContactoHero from '@/modules/contacto/ContactoHero'
import ContactoInfo from '@/modules/contacto/ContactoInfo'
import { useScrollReveal } from '@/shared/hooks/useScrollReveal'

function ContactoPage() {
  const [cartOpen, setCartOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState(false)

  useScrollReveal()

  const handleOpenCart = () => setCartOpen(true)
  const handleOpenFaq = () => setFaqOpen(true)

  return (
    <>
      <Header onOpenCart={handleOpenCart} />

      <main>
        <ContactoHero />

        <section className="pb-22.5">
          <div className="mx-auto grid w-[min(1000px,92%)] grid-cols-[1.3fr_1fr] items-start gap-8 max-[720px]:grid-cols-1">
            <ContactoForm />
            <ContactoInfo />
          </div>
        </section>
      </main>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <Faq open={faqOpen} onClose={() => setFaqOpen(false)} />

      <Footer onOpenFaq={handleOpenFaq} />
    </>
  )
}

export default ContactoPage
