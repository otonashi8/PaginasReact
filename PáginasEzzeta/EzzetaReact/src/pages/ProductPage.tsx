import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Minus, Plus, RotateCcw, Shield, ShoppingBag, Truck } from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ProductHoverImage } from '../components/ProductHoverImage';
import { PermissionGate } from '../components/PermissionGate';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { resolveProductPrice } from '../services/pricingService';
import PriceDisplay from '../components/PriceDisplay';
import QuickAddModal from '../components/common/QuickAddModal';
import { ProductSizeOptions } from '../components/common/ProductSizeOptions';
import { getProductBySlug, getProducts, getRelatedProducts } from '../services/contentService';
import type { Product } from '../types';
import { PERMISSIONS } from '../utils/permissionCodes';
import { obtenerSubcategoriaMetadata } from '../admin/Inventario/productos/DatosProductos';

export const ProductPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { favorites, toggleFavorite, addToCart } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("M");
  const [showAllImages, setShowAllImages] = useState(false);
  const [relatedPage, setRelatedPage] = useState(0);

  const [quickBuyProduct, setQuickBuyProduct] = useState<Product | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const sizeGuideTableRef = useRef<HTMLDivElement>(null);
  const [sizeGuideScroll, setSizeGuideScroll] = useState({ x: 0, y: 0 });
  const [sizeGuideOverflow, setSizeGuideOverflow] = useState({ x: false, y: false });

  const product = useMemo(() => {
    if (!slug) {
      return undefined;
    }

    const bySlug = getProductBySlug(slug);

    if (bySlug) {
      return bySlug;
    }

    const match = slug.match(/-(\d+)$/);

    if (!match) {
      return undefined;
    }

    const productId = Number(match[1]);
    return getProducts().find((item) => item.id === productId);
  }, [slug]);

  const [uploadedImages, setUploadedImages] = useState<(string | null)[]>([]);

  const resultadoPrecio = useMemo(
    () => product ? resolveProductPrice(product, { cantidad: quantity }) : null,
    [product, quantity],
  );

  const changeQuantity = (value: number) => {
    setQuantity(Math.max(1, value));
  };

  const startChanging = (direction: 1 | -1) => {
    changeQuantity(quantity + direction);

    const interval = setInterval(() => {
      setQuantity((current) => Math.max(1, current + direction));
    }, 120);

    const stop = () => {
      clearInterval(interval);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchend", stop);
    };

    window.addEventListener("mouseup", stop);
    window.addEventListener("touchend", stop);
  };

  useEffect(() => {
    if (!product) return;

    const productImages = Array.isArray(product["mini-image"]) ? product["mini-image"].filter(Boolean) : [];
    const fallbackImages = product.image ? [product.image] : [];
    const images = productImages.length > 0 ? productImages : fallbackImages;

    const firstAvailableSize = product.sizes.find((size) => {
      const stock = Number(product.sizesStock?.[size] ?? 0);
      return !Number.isFinite(stock) || stock > 0;
    }) ?? product.sizes[0] ?? 'M';

    setUploadedImages(images);
    setShowAllImages(false);
    setRelatedPage(0);
    setSelectedSize(firstAvailableSize);
    setQuantity(1);
  }, [product?.id, location.pathname]);

  useLayoutEffect(() => {
    if (!isSizeGuideOpen || !product) return;

    const tableContainer = sizeGuideTableRef.current;
    if (!tableContainer) return;

    const updateOverflow = () => {
      setSizeGuideOverflow({
        x: tableContainer.scrollWidth > tableContainer.clientWidth + 1,
        y: tableContainer.scrollHeight > tableContainer.clientHeight + 1,
      });
      setSizeGuideScroll({ x: tableContainer.scrollLeft, y: tableContainer.scrollTop });
    };

    updateOverflow();
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(tableContainer);
    return () => observer.disconnect();
  }, [isSizeGuideOpen, product]);

  const variantOptions = useMemo(() => {
    if (!product) return [];

    const familyProducts = getProducts().filter((item) =>
      item.id === product.id || (
        item.category.trim().toLowerCase() === product.category.trim().toLowerCase() &&
        item.subcategory.trim().toLowerCase() === product.subcategory.trim().toLowerCase()
      )
    );

    return Array.from(new Map(
      familyProducts
        .filter((item) => item.stock !== 0)
        .flatMap((item) => (item.colors?.length ? item.colors : [item.name]))
        .map((color) => [color.trim().toLowerCase(), color.trim()])
    ).values());
  }, [product]);

  if (!product) {
    return (
      <div className="rounded-[1.75rem] border border-black/10 bg-white p-8 text-black/70">Producto no encontrado.</div>
    );
  }

  const relatedProducts = getRelatedProducts(product.id);
  const relatedPageCount = Math.max(1, Math.ceil(relatedProducts.length / 4));
  const visibleRelatedProducts = relatedProducts.slice(relatedPage * 4, relatedPage * 4 + 4);
  const changeRelatedPage = (direction: 1 | -1) => {
    setRelatedPage((currentPage) => (currentPage + direction + relatedPageCount) % relatedPageCount);
  };
  const isFavorite = favorites.includes(product.id);
  const precioOriginal = resultadoPrecio?.precioOriginal ?? product.price;
  const precioFinal = resultadoPrecio?.precioFinal ?? product.price;
  const hayDescuento = (resultadoPrecio?.descuentoAplicado ?? 0) > 0 && precioFinal < precioOriginal;
  const etiquetaDescuento = resultadoPrecio?.etiquetaDescuento;
  const metadataSubcategoria = obtenerSubcategoriaMetadata(product.category, product.subcategory);
  const guiaLavado = metadataSubcategoria.guiaLavado;
  const guiaTallas = metadataSubcategoria.guiaTallas;
  const sizeOptions = product.sizes.length > 0 ? product.sizes : ['Única'];
  const visibleImages = showAllImages ? uploadedImages : uploadedImages.slice(0, 4);
  const hasMoreImages = uploadedImages.length > 4;

  const moveSizeGuideScroll = (axis: 'x' | 'y', value: number) => {
    const tableContainer = sizeGuideTableRef.current;
    if (!tableContainer) return;

    tableContainer.scrollTo(axis === 'x' ? { left: value, top: tableContainer.scrollTop } : { left: tableContainer.scrollLeft, top: value });
    setSizeGuideScroll((current) => ({ ...current, [axis]: value }));
  };

  const openQuickBuy = (item: Product) => {
    setQuickBuyProduct(item);
  };

  const closeQuickBuy = () => setQuickBuyProduct(null);

  return (
    <section className="space-y-8 sm:space-y-10">
      <div className="grid items-start gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="min-w-0">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div layout className="grid grid-cols-2 gap-2 sm:gap-3">
            {visibleImages.map((imageUrl, index) => (
              <motion.div key={`${imageUrl ?? "empty"}-${index}`} layout initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3, ease: 'easeOut' }} className="group aspect-[4/5] overflow-hidden bg-zinc-100">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={`${product.name} ${index + 1}`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[9px] uppercase tracking-[0.12em] text-black/40">Sin imagen</div>
                )}
              </motion.div>
            ))}
            </motion.div>
          </AnimatePresence>
          {hasMoreImages ? (
            <motion.button
              type="button"
              onClick={() => setShowAllImages((current) => !current)}
              whileTap={{ scale: 0.99 }}
              className="mt-4 w-full border border-black/15 bg-white py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-black transition hover:border-black hover:bg-black hover:text-white"
            >{showAllImages ? 'Ver menos' : `Ver más imágenes (${uploadedImages.length - 4})`}
            </motion.button>
          ) : null}
          <div className="mt-10 space-y-8 border-t border-black/10 pt-8">
            <div>
              <h2 className="text-lg font-bold uppercase tracking-[0.2em] text-black">Descripción</h2>
              <p className="mt-3 max-w-2xl text-md leading-7 text-black/65">{product.description}</p>
            </div>
            {guiaLavado?.url ? (
              <a href={guiaLavado.url} target="_blank" rel="noreferrer" className="inline-flex border-t border-black/10 pt-6 text-lg font-bold uppercase tracking-[0.18em] text-black transition hover:text-red-600">Guía de lavado ↗</a>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col lg:sticky lg:top-6">
          <div className="flex flex-wrap items-center gap-2 text-md tracking-[0.08em] text-black/45">
            <Link to="/" className="transition-colors hover:text-red-600">Inicio</Link><span>/</span><Link to="/tienda" className="transition-colors hover:text-red-600">Tienda</Link><span>/</span><span className="text-black/75">{product.name}</span>
          </div>
          <p className="mt-7 text-md font-bold uppercase tracking-[0.24em] text-red-600">{product.category}</p>
          <h1 className="mt-2 text-3xl font-semibold uppercase tracking-[0.08em] text-black">{product.name}</h1>
          <div className="mt-5 flex flex-wrap items-end gap-3 border-b border-black/10 pb-6">
            <PriceDisplay product={product} cantidad={quantity} />
            {hayDescuento && etiquetaDescuento ? <span className="border border-red-200 bg-red-50 px-2.5 py-1 text-md font-bold uppercase tracking-[0.12em] text-red-600">{etiquetaDescuento}</span> : null}
          </div>
          <div className="mt-6 space-y-6 border-b border-black/10 pb-7">
            {variantOptions.length > 0 ? <div>
              <p className="text-lg font-bold uppercase tracking-[0.2em] text-black/65">Color</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {variantOptions.map((color) => {
                  const variant = getProducts().find((item) => (item.colors ?? []).some((itemColor) => itemColor.trim().toLowerCase() === color.toLowerCase()));
                  const isCurrent = (product.colors ?? []).some((itemColor) => itemColor.trim().toLowerCase() === color.toLowerCase());
                  return <button 
                  key={color} 
                  type="button" 
                  title={color} 
                  onClick={() => variant && navigate(`/producto/${variant.slug}`)} 
                  className={`flex size-9 items-center justify-center rounded-full border p-1 ${isCurrent ? 'border-black' : 'border-black/15'}`}>
                    <span 
                    className="size-full rounded-full border border-black/10 bg-zinc-300" 
                    style={{ backgroundColor: color.toLowerCase().includes('verde') ? '#7c9b69' : color.toLowerCase().includes('negro') ? '#111' : color.toLowerCase().includes('blanco') ? '#f4f4f4' : color.toLowerCase().includes('azul') ? '#789ab5' : '#c9b59b' }} />
                  </button>;
                })}
              </div>
            </div> : null}
          </div>
          <div className="mt-6 space-y-6">
            <div>
              <div className="flex items-center justify-between gap-3">
                <label className="text-lg font-bold uppercase tracking-[0.2em] text-black/65">Talla</label>
                {guiaTallas &&
                (guiaTallas.columnas.length > 0 ||
                  guiaTallas.filas.length > 0) ? (
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-lg font-bold uppercase tracking-[0.14em] text-black transition hover:text-red-600"
                  >Guía de tallas ↗
                  </button>
                ) : null}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {sizeOptions.map((size) => {
                  const stockForSize = Number(
                    product.sizesStock?.[size] ?? 0,
                  );
                  const isAvailable =
                    !Number.isFinite(stockForSize) || stockForSize > 0;
                  const isSelected = selectedSize === size;
                  return (
                    <motion.button
                      key={size}
                      type="button"
                      whileHover={isAvailable ? { y: -1 } : undefined}
                      whileTap={isAvailable ? { scale: 0.98 } : undefined}
                      disabled={!isAvailable}
                      onClick={() => {
                        if (isAvailable) {
                          setSelectedSize(size);
                        }
                      }}
                      className={`h-10 border text-md font-medium uppercase tracking-[0.08em] transition ${
                        isSelected
                          ? "border-black bg-black text-white"
                          : isAvailable
                            ? "border-black/15 bg-white text-black hover:border-black"
                            : "cursor-not-allowed border-black/10 text-black/30 line-through"
                      }`}
                    >{size}
                    </motion.button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-lg font-bold uppercase tracking-[0.2em] text-black/65">Cantidad</label>
              <div className="mt-3 inline-flex h-10 items-center border border-black/15 bg-white">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onMouseDown={() => startChanging(-1)}
                  onTouchStart={() => startChanging(-1)}
                  className="flex h-full w-10 items-center justify-center border-r border-black/10 text-black transition hover:bg-black hover:text-white"
                ><Minus size={15} />
                </motion.button>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={quantity}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");

                    changeQuantity(value === "" ? 1 : Number(value));
                  }}
                  className="h-full w-14 bg-white text-center text-md font-semibold text-black outline-none"
                />
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onMouseDown={() => startChanging(1)}
                  onTouchStart={() => startChanging(1)}
                  className="flex h-full w-10 items-center justify-center border-l border-black/10 text-black transition hover:bg-black hover:text-white"
                ><Plus size={15} />
                </motion.button>
              </div>
            </div>
          </div>
          <div className="mt-7 grid gap-2 sm:grid-cols-[1fr_auto]">
            <PermissionGate permission={PERMISSIONS.salesCreate}>
              <motion.button
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                onClick={() =>
                  addToCart(product.id, selectedSize, quantity)
                }
                className="inline-flex h-11 items-center justify-center gap-2 border border-black bg-black px-5 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:border-red-600 hover:bg-red-600"
              ><ShoppingBag size={15} />Agregar al carrito
              </motion.button>
            </PermissionGate>
            {isAuthenticated ? (
              <motion.button
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => toggleFavorite(product.id)}
                className={`inline-flex h-11 items-center justify-center gap-2 border px-5 text-xs font-bold uppercase tracking-[0.12em] transition ${
                  isFavorite
                    ? "border-red-600 bg-red-600 text-white"
                    : "border-black/15 bg-white text-black hover:border-red-600 hover:text-red-600"
                }`}
              ><Heart size={22} />
              </motion.button>
            ) : null}
          </div>
          <div className="mt-7 border-t border-black/10 pt-5">
            <h2 className="text-md font-bold uppercase tracking-[0.2em] text-black">Detalles</h2>
            <div className="mt-3 grid gap-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {(product.extras ?? []).map((extra, index) => {
                const icons = [Truck, Shield, RotateCcw] as const;
                const Icon = icons[index % icons.length];
                return <div key={extra} className="flex items-center gap-2 border border-black/10 px-3 py-2.5 text-md text-black/65"><Icon size={14} className="shrink-0 text-black/60" />{extra}</div>;
              })}
            </div>
          </div>
          <Link
            to={`/tienda?category=${encodeURIComponent(product.category)}`}
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 border border-black bg-white px-5 text-lg font-bold uppercase tracking-[0.16em] text-black transition hover:bg-black hover:text-white"
          ><ShoppingBag size={15} />Comprar {product.category}
          </Link>
          <div className="mt-5 border-t border-black/10 pt-5 text-sm leading-6 text-black/55">
            Envíos a todo el Perú. Compra segura y atención para cambios.
          </div>
        </div>
      </div>
      <div className="border-t border-black/10 pt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-md font-bold uppercase tracking-[0.24em] text-black/45">También te puede interesar</p>
            <h2 className="mt-2 text-2xl font-semibold uppercase tracking-[0.1em] text-black sm:text-3xl">Productos relacionados</h2>
          </div>
          {relatedProducts.length > 4 ? (
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => changeRelatedPage(-1)}
                aria-label="Ver productos relacionados anteriores"
                className="flex h-10 w-10 items-center justify-center border border-black bg-white text-lg text-black transition hover:bg-black hover:text-white"
              >
                ◁
              </button>
              <button
                type="button"
                onClick={() => changeRelatedPage(1)}
                aria-label="Ver más productos relacionados"
                className="flex h-10 w-10 items-center justify-center border border-black bg-white text-lg text-black transition hover:bg-black hover:text-white"
              >
                ▷
              </button>
            </div>
          ) : null}
        </div>
        <div className="mt-6 grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {visibleRelatedProducts.map((item, index) => {
            const resultadoPrecioRelacionado = resolveProductPrice(item);
            const precioOriginalRelacionado = resultadoPrecioRelacionado.precioOriginal;
            const precioFinalRelacionado = resultadoPrecioRelacionado.precioFinal;
            const hayDescuentoRelacionado = resultadoPrecioRelacionado.descuentoAplicado > 0 && precioFinalRelacionado < precioOriginalRelacionado;
            const etiquetaDescuentoRelacionado = resultadoPrecioRelacionado.etiquetaDescuento;
            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.04,
                }}
                whileHover={{ y: -3 }}
                className="group bg-white"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-white">
                  <Link
                    to={`/producto/${item.slug}`}
                    className="flex h-full w-full items-center justify-center"
                  >
                    <ProductHoverImage
                      product={item}
                      alt={item.name}
                      className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
                    />
                  </Link>
                  {isAuthenticated ? (
                    <div className="absolute right-3 top-3">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          toggleFavorite(item.id);
                        }}
                        className={`absolute right-2 top-2 rounded-full transition sm:right-3 sm:top-3 ${
                          favorites.includes(item.id)
                            ? 'text-red-500'
                            : 'text-white hover:text-red-600'
                        }`}
                      ><Heart size={22} className={`transition-all duration-200 ${favorites.includes(item.id) ? "fill-red-500 text-red-500" : "fill-transparent"}`}/>
                      </button>
                    </div>
                  ) : null}
                  <ProductSizeOptions
                    product={item}
                    onSelect={(size) => addToCart(item.id, size)}
                  />
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-black">{item.name}</h3>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-black/45">{item.category}</p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-base font-semibold text-red-600"><PriceDisplay product={item} /></div>
                      {hayDescuentoRelacionado &&
                      etiquetaDescuentoRelacionado ? (
                        <span className="border border-red-200 bg-red-50 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-red-600">{etiquetaDescuentoRelacionado}</span>
                      ) : null}
                    </div>
                    <PermissionGate permission={PERMISSIONS.salesCreate}>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          openQuickBuy(item);
                        }}
                        className="inline-flex shrink-0 items-center justify-center rounded-full p-2 text-black transition hover:text-red-600"
                      ><ShoppingBag size={25} />
                      </motion.button>
                    </PermissionGate>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
      <AnimatePresence>
      {isSizeGuideOpen &&
      guiaTallas &&
      (guiaTallas.columnas.length > 0 ||
        guiaTallas.filas.length > 0) ? (
        <motion.div
          className="fixed inset-0 z-50 overflow-hidden bg-black/55"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSizeGuideOpen(false)}
        >
          <motion.div
            className="ml-auto h-full w-full max-w-4xl overflow-y-auto border-l border-black/10 bg-white shadow-[0_22px_60px_rgba(0,0,0,0.22)] sm:w-[min(88vw,56rem)]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">Guía de tallas</p>
                <h3 className="mt-1 text-lg font-semibold uppercase tracking-[0.12em] text-black">{product.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="text-[10px] font-bold uppercase tracking-[0.14em] text-black/60 transition hover:text-red-600"
              >Cerrar
              </button>
            </div>
            <div
              ref={sizeGuideTableRef}
              onScroll={(event) => setSizeGuideScroll({ x: event.currentTarget.scrollLeft, y: event.currentTarget.scrollTop })}
              className="max-h-[48vh] overflow-auto p-5"
            >
              <table className="w-full min-w-[360px] border border-black/10 text-left text-md">
                <thead>
                  <tr>
                    {guiaTallas.columnas.map((columna, index) => (
                      <th
                        key={`modal-guide-head-${columna}-${index}`}
                        className="border-b border-black/10 bg-black/[0.03] px-3 py-2 font-semibold text-black/70"
                      >{columna}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {guiaTallas.filas.map((fila, index) => (
                    <tr
                      key={`modal-guide-row-${fila.etiqueta}-${index}`}
                    >
                      {guiaTallas.columnas.map((columna, colIndex) => (
                        <td
                          key={`modal-guide-cell-${fila.etiqueta}-${columna}-${colIndex}`}
                          className="border-b border-black/10 px-3 py-2 text-black/65"
                        >{fila.valores?.[columna] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {sizeGuideOverflow.x ? <label className="flex items-center gap-3 px-5 pb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-black/55">X<input type="range" min="0" max={Math.max(0, (sizeGuideTableRef.current?.scrollWidth ?? 0) - (sizeGuideTableRef.current?.clientWidth ?? 0))} value={sizeGuideScroll.x} onChange={(event) => moveSizeGuideScroll('x', Number(event.target.value))} className="w-full accent-black" /></label> : null}
            {sizeGuideOverflow.y ? <label className="flex items-center gap-3 px-5 pb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-black/55">Y<input type="range" min="0" max={Math.max(0, (sizeGuideTableRef.current?.scrollHeight ?? 0) - (sizeGuideTableRef.current?.clientHeight ?? 0))} value={sizeGuideScroll.y} onChange={(event) => moveSizeGuideScroll('y', Number(event.target.value))} className="w-full accent-black" /></label> : null}
            {guiaTallas.imagenUrl ? <div className="border-t border-black/10 px-1 py-1"><img src={guiaTallas.imagenUrl} alt={`Guía de tallas de ${product.name}`} className="mx-auto max-h-[32rem] w-full object-contain" /></div> : null}
            {guiaTallas.mensajeSecundario ? (
              <div className="border-t border-black/10 px-5 py-2">
                <p className="text-md leading-6 text-black/65">{guiaTallas.mensajeSecundario}</p>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
      </AnimatePresence>
      <QuickAddModal
        product={quickBuyProduct ?? relatedProducts[0] ?? product}
        isOpen={Boolean(quickBuyProduct)}
        initialSize={quickBuyProduct?.sizes?.[0] || "M"}
        onClose={closeQuickBuy}
      />
    </section>
  );
};
