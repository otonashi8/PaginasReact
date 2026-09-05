import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, RefreshCcw, Truck, ArrowUpRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard';
import QuickAddModal from '../components/common/QuickAddModal';
import { getHomeBannerRotationSeconds, getHomeCategories, getHomeProducts, getHomeSlides, getTopFeaturedProducts } from '../services/homeContentService';

export const HomePage = () => {
  const slides = getHomeSlides();
  const homeCategories = getHomeCategories();
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
              CATEGORÍAS DESTACADAS
            </h2>
            <p className="mt-2 text-sm text-black/70">¡EXPLORA NUESTRAS CATEGORÍAS!</p>
          </div>
          <div className="grid w-full grid-cols-1 px-4 md:grid-cols-2 xl:grid-cols-4 sm:px-6 lg:px-8">
            {homeCategories.map((category) => (
              <Link
                key={category.categoria}
                to={`/tienda?category=${encodeURIComponent(category.categoria)}`}
                className="group relative aspect-[3/4] w-full overflow-hidden border border-zinc-200 bg-white shadow-[0_12px_35px_rgba(0,0,0,0.04)]"
              >
                <img src={category.imagen} alt={category.categoria} className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-sm uppercase tracking-[0.24em] text-white/80">{category.descripcion}</p>
                  <h3 className="mt-2 text-xl font-semibold">{category.categoria}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden bg-black">
        <div className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-red-600/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-red-600/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-red-500" />
              <p className="text-[15px] font-semibold uppercase tracking-[0.35em] text-red-500">Experiencia Ezzeta</p>
              <span className="h-px w-8 bg-red-500" />
            </div>
            <h2 className="text-2xl font-semibold uppercase leading-tight tracking-[0.12em] text-white sm:text-4xl">Excelencia en cada detalle</h2>
            <p className="mx-auto mt-4 max-w-xl text-xs leading-6 text-white/60 sm:text-lg">Diseñamos cada parte de tu experiencia para que comprar sea simple, seguro y cómodo.</p>
          </div>
          <div className="relative mt-12 grid gap-4 md:grid-cols-3">
            <div className="group relative border border-white/80 bg-white/[0.04] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-red-500/50 hover:bg-white/[0.07]">
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center border border-white/75 bg-white text-black transition-colors duration-300 group-hover:border-red-500 group-hover:bg-red-500 group-hover:text-white">
                  <Truck size={21} strokeWidth={1.8} />
                </div>
                <span className="text-[10px] font-semibold tracking-[0.2em] text-white/80">01</span>
              </div>
              <div className="mt-7">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white">Envío gratis</p>
                <p className="mt-3 text-sm leading-6 text-white/70">Disfruta envío gratuito a nivel nacional en compras desde
                  <span className="font-semibold text-white"> S/200</span>.
                </p>
              </div>
              <div className="mt-6 h-px w-8 bg-red-500 transition-all duration-300 group-hover:w-16" />
            </div>
            <div className="group relative border border-white/80 bg-white/[0.04] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-red-500/50 hover:bg-white/[0.07]">
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center border border-white/75 bg-white text-black transition-colors duration-300 group-hover:border-red-500 group-hover:bg-red-500 group-hover:text-white">
                  <RefreshCcw size={21} strokeWidth={1.8} />
                </div>
                <span className="text-[10px] font-semibold tracking-[0.2em] text-white/80">02</span>
              </div>
              <div className="mt-7">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white">Cambios fáciles</p>
                <p className="mt-3 text-sm leading-6 text-white/70">¿No fue tu talla o color ideal? Realiza cambios dentro de los primeros <span className="font-semibold text-white">7 días</span>.</p>
              </div>
              <div className="mt-6 h-px w-8 bg-red-500 transition-all duration-300 group-hover:w-16" />
            </div>
            <div className="group relative border border-white/80 bg-white/[0.04] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-red-500/50 hover:bg-white/[0.07]">
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center border border-white/75 bg-white text-black transition-colors duration-300 group-hover:border-red-500 group-hover:bg-red-500 group-hover:text-white">
                  <ShieldCheck size={21} strokeWidth={1.8} />
                </div>
                <span className="text-[10px] font-semibold tracking-[0.2em] text-white/80">03</span>
              </div>
              <div className="mt-7">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white">Pago seguro</p>
                <p className="mt-3 text-sm leading-6 text-white/70">Protegemos tus datos con tecnología de seguridad para que compres con total confianza.</p>
              </div>
              <div className="mt-6 h-px w-8 bg-red-500 transition-all duration-300 group-hover:w-16" />
            </div>
          </div>
          <div className="mt-10 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-white/10" />
            <span className="text-[15px] uppercase tracking-[0.3em] text-white">Compra con confianza</span>
            <span className="h-px w-12 bg-white/10" />
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden bg-white">
        <div className="mx-auto grid w-full items-center gap-2 px-5 py-14 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-8">
          {/* Bloque visual */}
          <div className="relative min-h-[420px] overflow-hidden border border-white/10 bg-zinc-900">
            <img
              src="src/assets/estilo.png"
              alt="Imagen de la colección"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </div>
          {/* Contenido */}
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-8 bg-red-500" />
              <p className="text-[15px] font-semibold uppercase tracking-[0.3em] text-red-500">Nuestra esencia</p>
            </div>
            <h2 className="max-w-xl text-2xl font-semibold uppercase leading-tight tracking-[0.08em] text-black sm:text-4xl">Diseñado para tu día a día</h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-black/70">En Ezzeta creemos que la comodidad y el estilo deben ir de la mano. Por eso seleccionamos productos pensados para acompañarte en cada momento.</p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div className="border-l border-red-500 pl-4">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-black">Calidad</p>
                <p className="mt-2 text-sm leading-5 text-black/65">Productos seleccionados para ofrecerte una mejor experiencia.</p>
              </div>
              <div className="border-l border-red-500 pl-4">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-black">Comodidad</p>
                <p className="mt-2 text-sm leading-5 text-black/65">Diseños que se adaptan a tu ritmo y a tu estilo personal.</p>
              </div>
            </div>
            <Link
              to="/tienda"
              type="button"
              className="mt-9 inline-flex h-10 items-center gap-3 border border-black/20 px-5 text-[12px] font-semibold uppercase tracking-[0.18em] text-black transition-colors hover:text-white hover:border-red-500 hover:bg-red-500"
            >Conoce nuestra colección<ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full overflow-hidden">
        <div className="w-full">
          <div className="mb-6 text-center sm:text-left px-4 sm:px-6 lg:px-8">
            <p className="text-sm uppercase tracking-[0.3em] text-red-600">Estilo</p>
            <h2 className="mt-3 text-2xl font-semibold uppercase tracking-[0.18em] text-black sm:text-3xl">ESCOGE TU ESTILO</h2>
            <p className="mt-2 text-sm text-black/70">¡VISITA NUESTRA TIENDA!</p>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={carouselIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="grid w-full grid-cols-1 px-4 sm:grid-cols-2 sm:px-6 xl:grid-cols-4 lg:px-8"
            >{visibleCarouselProducts.map((product) => (
                <ProductCard key={product.id} product={product} onQuickAdd={setSelectedProduct} />
              ))}
            </motion.div>
          </AnimatePresence>
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
