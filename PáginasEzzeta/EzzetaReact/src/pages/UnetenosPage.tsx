import { useState } from 'react';
import CartDrawer from '@/components/common/CartDrawer';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import TrabajosSection from '@/modules/rrhh/TrabajosSection';

function UnetenosPage() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <Header onOpenCart={() => setCartOpen(true)} />
      <main>
        <TrabajosSection />
      </main>
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <Footer />
    </>
  );
}

export default UnetenosPage;
