import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, RefreshCcw, Truck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard';
import QuickAddModal from '../components/common/QuickAddModal';
import { getHomeBannerRotationSeconds, getHomeProducts, getHomeSlides, getTopFeaturedProducts } from '../services/homeContentService';

type CollectionCategory = {
  name: string;
  image: string;
  description: string;
};

const newCollectionCategories: CollectionCategory[] = [
  {
    name: 'Poleras',
    image: 'https://ezzetacompany.com/wp-content/uploads/2026/05/CANGURO-NEGRO-3-800x1000.jpg',
    description: 'Diseños cómodos y versátiles.',
  },
  {
    name: 'Casacas',
    image: 'https://ezzetacompany.com/wp-content/uploads/2026/06/CASACA-BASICA-ACERO1.png',
    description: 'Capas y acabados urbanos.',
  },
  {
    name: 'Jean',
    image: 'https://ezzetacompany.com/wp-content/uploads/2026/06/JEAN-CLASICOS-AZUL-1-800x1200.jpg',
    description: 'Estilo con actitud y caída.',
  },
  {
    name: 'Polos',
    image: 'https://uomocattivo.com/wp-content/uploads/2026/07/POLO-SUPREMO-PERLA-17-600x900.png.webp',
    description: 'Refinamiento diario para todos.',
  },
];

export const HomePage = () => {
  const slides = getHomeSlides();
  const featuredProducts = getTopFeaturedProducts();
  const allProducts = (featuredProducts.length ? featuredProducts : getHomeProducts()).slice(0, 12);
  const bannerRotationMs = getHomeBannerRotationSeconds() * 1000;
  const [activeSlide, setActiveSlide] = useState(0);
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false,
  );

  const [selectedProduct, setSelectedProduct] = useState<(typeof allProducts)[number] | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const updateViewport = () => {
      setIsMobileViewport(window.innerWidth <= 768);
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    if (!slides.length) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, bannerRotationMs);

    return () => window.clearInterval(timer);
  }, [bannerRotationMs, slides.length]);

  useEffect(() => {
    if (!allProducts.length) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setCarouselIndex((current) => (current + 1) % Math.max(1, Math.ceil(allProducts.length / 4)));
    }, 5000);

    return () => window.clearInterval(timer);
  }, [allProducts.length]);

  const currentSlide = slides[activeSlide] ?? slides[0];
  const currentSlideImage = isMobileViewport ? currentSlide?.imgMobile || currentSlide?.imgDesktop : currentSlide?.imgDesktop || currentSlide?.imgMobile;
  const visibleCarouselProducts = useMemo(() => {
    const groups = Array.from({ length: Math.max(1, Math.ceil(allProducts.length / 4)) }, (_, index) =>
      allProducts.slice(index * 4, index * 4 + 4)
    );

    return groups[carouselIndex % groups.length] ?? [];
  }, [allProducts, carouselIndex]);

  return (
    <section className="space-y-8 pb-8 pt-0">
      {slides.length > 0 ? (
        <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-white">
          <div className="relative h-[56vh] min-h-[320px] overflow-hidden sm:h-[64vh] sm:min-h-[380px] lg:h-[78vh] lg:min-h-[480px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide?.title ?? 'slide'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="relative h-full w-full"
              >
                <picture>
                  <source media="(max-width: 768px)" srcSet={currentSlide?.imgMobile || currentSlide?.imgDesktop || ''} />
                  <img
                    src={currentSlideImage ?? ''}
                    alt={currentSlide?.title ?? 'Banner'}
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              </motion.div>
            </AnimatePresence>
            <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-4">
              <Link
                to="/tienda"
                className="inline-flex items-center justify-center gap-2 border border-white bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-black hover:text-white"
              >
                Ver tienda
                <ArrowRight size={16} />
              </Link>
              <div className="flex items-center justify-center gap-2">
                {slides.map((slide, index) => (
                  <button
                    key={slide.title}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    className={`h-2 w-10 transition ${activeSlide === index ? 'bg-white' : 'bg-white/40'}`}
                    aria-label={`Ir al slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="w-full overflow-hidden">
        <div className="w-full">
          <div className="mb-6 text-center sm:text-left px-4 sm:px-6 lg:px-8">
            <p className="text-sm uppercase tracking-[0.3em] text-red-600">Nueva colección</p>
            <h2 className="mt-3 text-2xl font-semibold uppercase tracking-[0.18em] text-black sm:text-3xl">
              NUEVA COLECCIÓN
            </h2>
            <p className="mt-2 text-sm text-black/70">¡EXPLORA NUESTRAS CATEGORÍAS!</p>
          </div>
          <div className="grid w-full grid-cols-1 gap-6 px-4 md:grid-cols-2 xl:grid-cols-4 sm:px-6 lg:px-8">
            {newCollectionCategories.map((category) => (
              <Link
                key={category.name}
                to={`/tienda?category=${encodeURIComponent(category.name)}`}
                className="group relative min-h-[22rem] overflow-hidden border border-zinc-200 bg-white shadow-[0_12px_35px_rgba(0,0,0,0.04)]"
              >
                <img src={category.image} alt={category.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-sm uppercase tracking-[0.24em] text-white/80">{category.description}</p>
                  <h3 className="mt-2 text-xl font-semibold">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full overflow-hidden">
        <div className="w-full">
          <div className="mb-6 text-center sm:text-left px-4 sm:px-6 lg:px-8">
            <p className="text-sm uppercase tracking-[0.3em] text-red-600">Estilo</p>
            <h2 className="mt-3 text-2xl font-semibold uppercase tracking-[0.18em] text-black sm:text-3xl">
              ESCOGE TU ESTILO
            </h2>
            <p className="mt-2 text-sm text-black/70">¡VISITA NUESTRA TIENDA!</p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={carouselIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="grid w-full grid-cols-1 gap-6 px-4 sm:grid-cols-2 sm:px-6 xl:grid-cols-4 lg:px-8"
            >
              {visibleCarouselProducts.map((product) => (
                <ProductCard key={product.id} product={product} onQuickAdd={setSelectedProduct} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="w-full overflow-hidden">
        <div className="w-full">
          <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-12 text-center sm:px-12">
            <p className="text-16px uppercase tracking-[0.3em] text-red-600">EXPERIENCIA EZZETA</p>
            <h2 className="mt-3 text-3xl font-semibold uppercase tracking-[0.18em] text-black sm:text-4xl">NOS ENFOCAMOS EN LA EXCELENCIA Y COMODIDAD</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <div className="rounded-[2rem] border border-black/10 bg-zinc-50 p-8 text-left">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-black/10 bg-white text-black">
                  <Truck size={24} />
                </div>
                <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-black">Envío gratis</p>
                <p className="mt-3 text-sm leading-6 text-black/70">Sin costo de despacho para todas tus compras a nivel nacional con subtotales mayores o iguales a S/200.</p>
              </div>
              <div className="rounded-[2rem] border border-black/10 bg-zinc-50 p-8 text-left">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-black/10 bg-white text-black">
                  <RefreshCcw size={24} />
                </div>
                <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-black">Cambios y devoluciones</p>
                <p className="mt-3 text-sm leading-6 text-black/70">¿No es tu talla o prefieres otro color? Realiza cambios simples dentro de los primeros 7 días de tu entrega.</p>
              </div>
              <div className="rounded-[2rem] border border-black/10 bg-zinc-50 p-8 text-left">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-black/10 bg-white text-black">
                  <ShieldCheck size={24} />
                </div>
                <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-black">Pago seguro</p>
                <p className="mt-3 text-sm leading-6 text-black/70">Procesamos todas tus transacciones con cifrado seguro SSL para proteger tus datos de crédito y banca móvil.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <QuickAddModal
        product={selectedProduct ?? (allProducts[0] ?? null) as any}
        isOpen={Boolean(selectedProduct)}
        initialSize={selectedProduct?.sizes?.[0] || 'M'}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
};
