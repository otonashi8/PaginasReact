import { motion, useReducedMotion } from 'framer-motion';
import { MessageCircle, RotateCcw, Ruler, ShieldCheck, type LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductHoverImage } from '../components/ProductHoverImage';
import { PriceDisplay } from '../components/PriceDisplay';
import { getHomeProducts } from '../services/homeContentService';

type BenefitItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type PromoStep = {
  title: string;
  description: string;
};

type webLinks = {
  name: string;
  href: string;
  image?: string;
};

const benefits: BenefitItem[] = [
  {
    title: 'Compra Segura',
    description: 'Tus productos protegidos',
    icon: ShieldCheck,
  },
  {
    title: 'Cambios Fáciles',
    description: 'Hasta 30 días',
    icon: RotateCcw,
  },
  {
    title: 'Talla Perfecta',
    description: 'Guías perfectas',
    icon: Ruler,
  },
  {
    title: 'Atención Rápida',
    description: 'Escríbenos al WhatsApp',
    icon: MessageCircle,
  },
];

const promoSteps: PromoStep[] = [
  {
    title: 'Elige 3 prendas',
    description: 'Escoge tus prendas favoritas de la tienda.',
  },
  {
    title: 'Mezcla a tu gusto',
    description: 'Combina diferentes modelos, estilos y tallas.',
  },
  {
    title: '¡Listo, S/100!',
    description: 'Lleva tus 3 prendas por solo S/100.',
  },
];

const bannerHighlights = [
  {
    image: 'https://3x100.pe/wp-content/uploads/2026/05/BANNER-02-1536x889.png', alt: "banner izq"
  },
  {
    image: 'https://3x100.pe/wp-content/uploads/2026/05/BANNER-01-1536x889.png', alt: "banner der"
  },
];

const webLinks = [
  { name: 'EZZETA', href: 'https://ezzetacompany.com/', image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRH6deP4ow_WolSBvxrJ6teDeWoWJlrlVldNHKol04TYJ5YfS5W7nw-rpXG&s=10'},
  { name: 'UOMO CATTIVO', href: 'https://uomocattivo.com/', image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNlxm0vLmPWcDXKI3qtD_OWlT4a7P6rXQB2PMt2ExjnAC7ZH4U91z4lGE&s=10'},
  { name: 'MAXETA', href: 'https://maxeta.com.pe/home-main-demo/', image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnGpOMpTsJqDWgeFSIVZaKZwKTcFf_fWQFN1rsbEgHzA&s=10'},
  { name: 'CREPANTE', href: 'https://crepante.com/', image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3zQmT4V-w98N5ZK4s3xDh6KVhf7PO6JZBZUW03tF1MA&s=10'},
];

const luminousTitle = '¡PRENDAS A MEJORES PRECIOS!';

export const HomePage = () => {
  const featuredProducts = useMemo(() => {
    const products = getHomeProducts();
    return products.slice(0, 8);
  }, []);

  const shouldReduceMotion = useReducedMotion();
  const [activeWebIndex, setActiveWebIndex] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setActiveWebIndex((current) => (current + 1) % webLinks.length);
    }, 1200);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="space-y-8 pb-8 pt-0">
      <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.04)] sm:p-8 lg:p-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-red-600">Estilo urbano</p>
            <h1 className="mt-3 text-3xl font-semibold uppercase tracking-[0.16em] text-black sm:text-4xl lg:text-5xl">
              Diseña tu look con piezas que hablan por ti.
            </h1>
          </div>

          <p className="max-w-xl text-sm leading-7 text-black/70 sm:text-base">
            Descubre una colección pensada para quienes buscan comodidad, identidad y presencia en cada detalle.
          </p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          const [firstWord, ...remainingWords] = benefit.title.split(' ');
          const highlightedText = remainingWords.join(' ');

          return (
            <motion.article
              key={benefit.title}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              animate={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.2 : 0.4, delay: shouldReduceMotion ? 0 : index * 0.08, ease: 'easeOut' }}
              className="rounded-[1.5rem] border border-zinc-200 bg-white p-6 text-center shadow-[0_10px_30px_rgba(0,0,0,0.03)]"
            >
              <div className="flex justify-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-600/10 bg-red-600/10 text-red-600">
                  <Icon size={22} />
                </div>
              </div>
              <h2 className="text-lg font-semibold text-black">
                {firstWord}{' '}
                <span className="text-red-600">{highlightedText}</span>
              </h2>
              <p className="mt-2 text-sm leading-6 text-black/70">{benefit.description}</p>
            </motion.article>
          );
        })}
      </div>

      <section className="rounded-[2rem] bg-black px-6 py-10 sm:px-8 lg:px-10 lg:py-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-red-600">Promociones</p>
          <h2 className="mt-4 text-3xl font-semibold uppercase tracking-[0.18em] text-white sm:text-4xl">
            ¡LAS MEJORES OFERTAS!
          </h2>
          <p className="mt-4 text-base leading-7 text-white/80 sm:text-lg">
            “Combina tallas, modelos y colores como tú quieras. El descuento se aplica de forma automática en tu carrito de compras.”
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {promoSteps.map((step, index) => (
            <motion.article
              key={step.title}
              whileHover={{ y: -8, scale: 1.02, boxShadow: '0 20px 35px rgba(255,255,255,0.08)' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="rounded-[1.4rem] border border-white/10 bg-zinc-900/90 p-6 text-left shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600/15 text-sm font-semibold text-red-400">
                0{index + 1}
              </div>
              <h3 className="mt-5 text-xl font-semibold uppercase tracking-[0.16em] text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/75">{step.description}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-zinc-200 bg-white px-6 py-10 shadow-[0_10px_40px_rgba(0,0,0,0.03)] sm:px-8 lg:px-10 lg:py-12">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-red-600">Oferta destacada</p>
          <h2 className="mt-3 flex flex-wrap justify-center gap-1 text-3xl font-semibold uppercase tracking-[0.18em] text-black sm:text-4xl lg:text-5xl">
            {luminousTitle.split('').map((char, index) => (
              <motion.span
                key={`${char}-${index}`}
                initial={{ opacity: shouldReduceMotion ? 1 : 0.45 }}
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: [0.42, 1, 0.7, 1, 0.48] }}
                transition={{
                  duration: shouldReduceMotion ? 0.2 : 2.6 + (index % 4) * 0.35,
                  repeat: shouldReduceMotion ? 0 : Infinity,
                  delay: shouldReduceMotion ? 0 : index * 0.04,
                  ease: 'easeInOut',
                }}
                className={char === ' ' ? 'w-2 sm:w-3' : ''}
              >
                {char}
              </motion.span>
            ))}
          </h2>
        </div>

        <div className="overflow-hidden">
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="flex w-max gap-5"
          >
            {[...featuredProducts, ...featuredProducts].map((product, index) => (
              <motion.article
                key={`${product.id}-${index}`}
                whileHover={{ y: -6, scale: 1.01, boxShadow: '0 16px 35px rgba(0, 0, 0, 0.08)' }}
                transition={{ duration: 20, ease: 'easeOut' }}
                className="w-[88vw] max-w-[280px] overflow-hidden rounded-[1.4rem] border border-zinc-200 bg-white sm:w-[46vw] lg:w-[22vw]"
              >
                <Link to={`/producto/${product.slug}`} className="block">
                  <div className="aspect-[4/5] overflow-hidden bg-zinc-50">
                    <ProductHoverImage
                      product={product}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-300 hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold uppercase tracking-[0.14em] text-black">{product.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-black/70">{product.category}</p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <PriceDisplay product={product} />
                      <span className="rounded-full bg-red-600/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-red-600">
                        Ver más
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {bannerHighlights.map((banner) => (
          <motion.article
            key={banner.alt}
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="group relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-black"
          >
            <div className="relative aspect-[16/9] overflow-hidden">
              <img
                src={banner.image}
                alt={banner.alt}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            </div>
          </motion.article>
        ))}
      </section>

      <section className="rounded-[2rem] border border-zinc-200 bg-white px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-red-600">Explora más</p>
          <h2 className="mt-3 text-2xl font-semibold uppercase tracking-[0.16em] text-black sm:text-3xl">
            Descubre las páginas relacionadas
          </h2>
        </div>

        <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
          {webLinks.map((link, index) => {
            const isActive = activeWebIndex === index;

            return (
              <motion.article
                key={link.href}
                initial={false}
                animate={{
                  borderColor: isActive ? 'rgba(239, 68, 68, 1)' : 'rgba(228, 228, 231, 1)',
                  boxShadow: isActive ? '0 0 0 1px rgba(239, 68, 68, 0.18), 0 10px 30px rgba(239, 68, 68, 0.12)' : '0 10px 30px rgba(0, 0, 0, 0.04)',
                  scale: isActive ? 1.02 : 1,
                }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="rounded-[1.5rem] border border-zinc-200 bg-white p-6 text-center"
              >
                <Link to={link.href} className="block">
                  <div className={`mx-auto mb-4 flex h-36 w-36 items-center justify-center rounded-full border-2 transition-all ${isActive ? 'border-red-600 bg-red-600/10 text-red-600 shadow-[0_0_18px_rgba(239,68,68,0.24)]' : 'border-zinc-200 bg-zinc-50 text-black'}`}>
                    {link.image && (
                      <img src={link.image} alt={link.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <h3 className={`text-lg font-semibold uppercase tracking-[0.16em] transition-colors ${isActive ? 'text-red-600' : 'text-black'}`}>
                    {link.name}
                  </h3>
                </Link>
              </motion.article>
            );
          })}
        </div>
      </section>
    </section>
  );
};
