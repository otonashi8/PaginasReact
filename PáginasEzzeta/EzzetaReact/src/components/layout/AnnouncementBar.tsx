import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

type AnnouncementBarProps = {
  messages?: string[];
  interval?: number;
};

const defaultMessages = [
  'Envíos a todo el Perú',
  'Nuevas prendas cada semana',
  'Compra segura y fácil',
];

export const AnnouncementBar = ({
  messages = defaultMessages,
  interval = 3600,
}: AnnouncementBarProps) => {
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const safeMessages = messages.filter((message) => message.trim());

  useEffect(() => {
    if (safeMessages.length < 2 || shouldReduceMotion) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % safeMessages.length);
    }, interval);

    return () => window.clearInterval(timer);
  }, [interval, safeMessages.length, shouldReduceMotion]);

  if (safeMessages.length === 0) return null;

  const activeMessage = safeMessages[activeIndex % safeMessages.length];

  return (
    <div
      className="relative z-40 flex min-h-9 items-center justify-center overflow-hidden bg-black px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white sm:min-h-10 sm:text-[11px]"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={activeMessage}
          initial={shouldReduceMotion ? false : { opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? undefined : { opacity: 0, y: 18 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="block max-w-full truncate"
        >
          {activeMessage}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};
