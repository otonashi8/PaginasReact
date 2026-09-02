import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import Chatbot from '../components/Chatbot/Chatbot';
import { ScrollToTopButton } from '../components/ScrollToTopButton';
import {
  getActivePopUpForPath,
  hasPopUpBeenShownInSession,
  markPopUpShownInSession,
  type PopUpItem,
} from '../admin/Marketing/PopUp/popupStorage';
import { PopUpModal } from '../admin/Marketing/PopUp/PopUpModal';

export const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activePopUp, setActivePopUp] = useState<PopUpItem | null>(null);
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const [showPurchaseToast, setShowPurchaseToast] = useState(false);
  const popupTimerRef = useRef<number | null>(null);
  const purchaseToastTimerRef = useRef<number | null>(null);
  const isHomePage = location.pathname === '/' || location.pathname === '/home' || location.pathname === '/inicio';
  const purchaseSuccess = Boolean((location.state as { purchaseSuccess?: boolean } | null)?.purchaseSuccess);

  useEffect(() => {
    if (!purchaseSuccess) {
      setShowPurchaseToast(false);
      return;
    }

    setShowPurchaseToast(true);

    if (purchaseToastTimerRef.current !== null) {
      window.clearTimeout(purchaseToastTimerRef.current);
    }

    purchaseToastTimerRef.current = window.setTimeout(() => {
      setShowPurchaseToast(false);
      purchaseToastTimerRef.current = null;
    }, 3500);

    return () => {
      if (purchaseToastTimerRef.current !== null) {
        window.clearTimeout(purchaseToastTimerRef.current);
      }
    };
  }, [purchaseSuccess, location.pathname]);

  useEffect(() => {
    const popup = getActivePopUpForPath(location.pathname);
    setActivePopUp(popup);
    setIsPopUpOpen(false);

    if (popupTimerRef.current !== null) {
      window.clearTimeout(popupTimerRef.current);
      popupTimerRef.current = null;
    }

    if (!popup) {
      return;
    }

    if (popup.frecuencia === 'una-vez-sesion' && hasPopUpBeenShownInSession(popup.id)) {
      return;
    }

    const showPopUp = () => {
      setIsPopUpOpen(true);
      if (popup.frecuencia === 'una-vez-sesion') {
        markPopUpShownInSession(popup.id);
      }
      popupTimerRef.current = null;
    };

    if (popup.retraso <= 0) {
      showPopUp();
      return;
    }

    popupTimerRef.current = window.setTimeout(showPopUp, popup.retraso * 1000);

    return () => {
      if (popupTimerRef.current !== null) {
        window.clearTimeout(popupTimerRef.current);
        popupTimerRef.current = null;
      }
    };
  }, [location.pathname]);

  const handleClosePopUp = () => {
    setIsPopUpOpen(false);
  };

  const handlePopUpAction = (popup: PopUpItem) => {
    setIsPopUpOpen(false);
    if (popup.redireccion && popup.destino) {
      navigate(popup.destino);
    }
  };

  return (
    <div className="max-h-screen bg-white text-black">
      <Header />
      <AnimatePresence>
        {showPurchaseToast ? (
          <motion.div
            initial={{ opacity: 0, x: 40, y: -10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 40, y: -10 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="fixed right-4 top-4 z-[120] flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 shadow-[0_18px_40px_rgba(18,82,58,0.18)]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Compra realizada con éxito</p>
              <p className="text-xs text-slate-600">Tu pedido quedó registrado.</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <main className={isHomePage ? 'min-h-[70vh] w-full py-0' : 'mx-auto min-h-[70vh] w-full max-w-7xl px-6 py-10 pt-15 lg:px-8'}>
        <Outlet />
      </main>
      <Footer />
      <Chatbot />
      <ScrollToTopButton />
      {activePopUp ? (
        <PopUpModal
          popup={activePopUp}
          open={isPopUpOpen}
          onClose={handleClosePopUp}
          onAction={handlePopUpAction}
        />
      ) : null}
    </div>
  );
};
