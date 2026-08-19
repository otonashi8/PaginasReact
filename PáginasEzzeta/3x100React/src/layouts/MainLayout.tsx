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
  const popupTimerRef = useRef<number | null>(null);

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
      <main className="mx-auto min-h-[70vh] w-full max-w-7xl px-6 py-10 pt-24 lg:px-8">
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
