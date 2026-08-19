import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { type PopUpItem } from './popupStorage';

type PopUpModalProps = {
  popup: PopUpItem;
  open: boolean;
  onClose: () => void;
  onAction: (popup: PopUpItem) => void;
};

export const PopUpModal = ({ popup, open, onClose, onAction }: PopUpModalProps) => {
  if (!open) {
    return null;
  }

  const isInteractive = popup.redireccion && Boolean(popup.destino);
  const handleClickContent = () => {
    if (isInteractive) {
      onAction(popup);
    }
  };

  const contentClassName = isInteractive
    ? 'group relative w-full cursor-pointer transition duration-200 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-zinc-900/30'
    : 'relative w-full';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 px-4 py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label={`Pop-Up ${popup.nombre}`}
      >
        <motion.div
          className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-[0_35px_80px_rgba(0,0,0,0.35)]"
          initial={{ y: 24, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 24, opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-100"
            aria-label="Cerrar Pop-Up"
          >
            <X size={20} />
          </button>

          <div className="relative max-h-[85vh] overflow-hidden bg-black">
            {popup.tipoContenido === 'video' ? (
              <div className={contentClassName}>
                {isInteractive ? (
                  <button
                    type="button"
                    onClick={handleClickContent}
                    className="group relative w-full"
                    aria-label={`Abrir destino ${popup.destino}`}
                  >
                    <video
                      src={popup.recursoMedia}
                      className="h-full w-full max-h-[75vh] min-h-[280px] object-contain"
                      muted
                      loop
                      playsInline
                      controls={false}
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3 text-sm text-white">
                      Haz click para ir a {popup.destino}
                    </div>
                  </button>
                ) : (
                  <video
                    src={popup.recursoMedia}
                    className="h-full w-full max-h-[75vh] min-h-[280px] object-contain"
                    controls
                  />
                )}
              </div>
            ) : (
              <div className={contentClassName}>
                {isInteractive ? (
                  <button
                    type="button"
                    onClick={handleClickContent}
                    className="group relative w-full"
                    aria-label={`Abrir destino ${popup.destino}`}
                  >
                    <picture>
                      {popup.imagenMobile ? (
                        <source media="(max-width: 767px)" srcSet={popup.imagenMobile} />
                      ) : null}
                      {popup.imagenDesktop ? (
                        <source media="(min-width: 768px)" srcSet={popup.imagenDesktop} />
                      ) : null}
                      <img
                        src={popup.imagenDesktop || popup.imagenMobile}
                        alt={popup.nombre}
                        className="h-full w-full max-h-[75vh] min-h-[280px] object-contain"
                      />
                    </picture>
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3 text-sm text-white">
                      Haz click para ir a {popup.destino}
                    </div>
                  </button>
                ) : (
                  <picture>
                    {popup.imagenMobile ? (
                      <source media="(max-width: 767px)" srcSet={popup.imagenMobile} />
                    ) : null}
                    {popup.imagenDesktop ? (
                      <source media="(min-width: 768px)" srcSet={popup.imagenDesktop} />
                    ) : null}
                    <img
                      src={popup.imagenDesktop || popup.imagenMobile}
                      alt={popup.nombre}
                      className="h-full w-full max-h-[75vh] min-h-[280px] object-contain"
                    />
                  </picture>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
