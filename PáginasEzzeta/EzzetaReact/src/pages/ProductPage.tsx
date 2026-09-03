import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Minus, Plus, RotateCcw, Shield, ShoppingBag, Truck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ProductHoverImage } from '../components/ProductHoverImage';
import { PermissionGate } from '../components/PermissionGate';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { resolveProductPrice } from '../services/pricingService';
import PriceDisplay from '../components/PriceDisplay';
import QuickAddModal from '../components/common/QuickAddModal';
import { getProductBySlug, getProducts, getRelatedProducts } from '../services/contentService';
import type { Product } from '../types';
import { PERMISSIONS } from '../utils/permissionCodes';
import { obtenerSubcategoriaMetadata } from '../admin/Inventario/productos/DatosProductos';

export const ProductPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const { favorites, toggleFavorite, addToCart } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [quickBuyProduct, setQuickBuyProduct] = useState<Product | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

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
    setSelectedImageIndex(0);
    setSelectedSize(firstAvailableSize);
    setQuantity(1);
  }, [product?.id, location.pathname]);
  useEffect(() => {
    if (uploadedImages.length <= 1) return;

    const validImages = uploadedImages.filter(Boolean);

    if (validImages.length <= 1) return;

    const interval = setInterval(() => {
      setSelectedImageIndex((current) => (current + 1) % validImages.length);
    }, 3000); 

    return () => clearInterval(interval);
  }, [uploadedImages]);

  if (!product) {
    return (
      <div className="rounded-[1.75rem] border border-black/10 bg-white p-8 text-black/70">Producto no encontrado.</div>
    );
  }

  const relatedProducts = getRelatedProducts(product.id);
  const isFavorite = favorites.includes(product.id);
  const precioOriginal = resultadoPrecio?.precioOriginal ?? product.price;
  const precioFinal = resultadoPrecio?.precioFinal ?? product.price;
  const hayDescuento = (resultadoPrecio?.descuentoAplicado ?? 0) > 0 && precioFinal < precioOriginal;
  const etiquetaDescuento = resultadoPrecio?.etiquetaDescuento;
  const metadataSubcategoria = obtenerSubcategoriaMetadata(product.category, product.subcategory);
  const guiaLavado = metadataSubcategoria.guiaLavado;
  const guiaTallas = metadataSubcategoria.guiaTallas;
  const sizeOptions = product.sizes.length > 0 ? product.sizes : ['Única'];

  const openQuickBuy = (item: Product) => {
    setQuickBuyProduct(item);
  };

  const closeQuickBuy = () => setQuickBuyProduct(null);

  return (
    <section className="space-y-8 sm:space-y-10">
      <div className="border-b border-black/10 pb-6">
        <div className="flex flex-wrap items-center gap-2 text-[11px] tracking-[0.08em] text-black/45">
          <Link
            to="/"
            className="transition-colors hover:text-red-600"
          >Inicio
          </Link>
          <span className="text-black/25">/</span>
          <Link
            to="/tienda"
            className="transition-colors hover:text-red-600"
          >Tienda
          </Link>
          <span className="text-black/25">/</span>
          <span className="text-black/75">{product.name}</span>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-red-600">{product.category}</p>
            <h1 className="mt-2 text-3xl font-semibold uppercase tracking-[0.1em] text-black sm:text-4xl">{product.name}</h1>
          </div>
          <p className="max-w-xl text-sm leading-6 text-black/60 lg:text-right">{product.description}</p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
        <div className="min-w-0">
          <div className="relative overflow-hidden border border-black/10 bg-white">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImageIndex}
                src={uploadedImages[selectedImageIndex] ?? product.image}
                alt={product.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="aspect-[4/5] w-full object-cover sm:aspect-[5/6]"
              />
            </AnimatePresence>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
            {uploadedImages.map((imageUrl, index) => (
              <button
                key={`${imageUrl ?? "empty"}-${index}`}
                type="button"
                onClick={() => setSelectedImageIndex(index)}
                className={`group aspect-[4/5] overflow-hidden border bg-white transition ${
                  selectedImageIndex === index
                    ? "border-red-600"
                    : "border-black/10 hover:border-black/40"
                }`}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={`${product.name} ${index + 1}`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[9px] uppercase tracking-[0.12em] text-black/40">Sin imagen</div>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col border border-black/10 bg-white p-5 sm:p-6">
          <div className="border-b border-black/10 pb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-black/45">{product.category}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-black/40">{product.subcategory}</p>
            <div className="mt-5 flex flex-wrap items-end gap-3">
              <PriceDisplay product={product} cantidad={quantity} />
              {hayDescuento && etiquetaDescuento ? (
                <span className="border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-red-600">{etiquetaDescuento}</span>
              ) : null}
            </div>
          </div>
          <div className="mt-6 space-y-6">
            <div>
              <div className="flex items-center justify-between gap-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/65">Talla</label>
                {guiaTallas &&
                (guiaTallas.columnas.length > 0 ||
                  guiaTallas.filas.length > 0) ? (
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-[10px] font-bold uppercase tracking-[0.14em] text-black transition hover:text-red-600"
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
                      className={`h-10 border text-xs font-medium uppercase tracking-[0.08em] transition ${
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
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/65">Cantidad</label>
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
                  className="h-full w-14 bg-white text-center text-sm font-semibold text-black outline-none"
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
              ><Heart size={15} />Favoritos
              </motion.button>
            ) : null}
          </div>
          <div className="mt-7 border-t border-black/10 pt-5">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Detalle</h3>
            <p className="mt-3 text-sm leading-6 text-black/65">{product.description}</p>
          </div>
          {guiaLavado?.url ? (
            <div className="mt-5">
              <a
                href={guiaLavado.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex text-[10px] font-bold uppercase tracking-[0.18em] text-black transition hover:text-red-600"
              >Guía de lavado ↗
              </a>
            </div>
          ) : null}
          <div className="mt-6 grid gap-2 border-t border-black/10 pt-5 sm:grid-cols-4">
            {(product.extras ?? []).map((extra, index) => {
              const icons = [Truck, Shield, RotateCcw] as const;
              const Icon = icons[index % icons.length];
              return (
                <div
                  key={extra}
                  className="flex items-center gap-2 border border-black/10 px-3 py-2.5 text-xs text-black/65"
                ><Icon size={14} className="shrink-0 text-black/60" /><span>{extra}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="border-t border-black/10 pt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-black/45">También te puede interesar</p>
            <h2 className="mt-2 text-2xl font-semibold uppercase tracking-[0.1em] text-black sm:text-3xl">Productos relacionados</h2>
          </div>
        </div>
        <div className="mt-6 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]">
          {relatedProducts.map((item, index) => {
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
                className="group border border-black/10 bg-white p-3"
              >
                <div className="relative aspect-[3/4] overflow-hidden border border-black/10 bg-white">
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
                        className={`flex rounded-full size-8 items-center justify-center border transition ${
                          favorites.includes(item.id)
                            ? "border-red-600 bg-red-600 text-white"
                            : "border-black/15 bg-white text-black hover:border-red-600 hover:text-red-600"
                        }`}
                      ><Heart size={14} />
                      </button>
                    </div>
                  ) : null}
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
                        className="inline-flex size-9 rounded-full items-center justify-center border border-black bg-black text-white transition hover:border-red-600 hover:bg-red-600"
                      ><ShoppingBag size={15} />
                      </motion.button>
                    </PermissionGate>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
      {isSizeGuideOpen &&
      guiaTallas &&
      (guiaTallas.columnas.length > 0 ||
        guiaTallas.filas.length > 0) ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden border border-black/10 bg-white shadow-[0_22px_60px_rgba(0,0,0,0.22)]">
            <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-black">Guía de tallas</h3>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="text-[10px] font-bold uppercase tracking-[0.14em] text-black/60 transition hover:text-red-600"
              >Cerrar
              </button>
            </div>
            <div className="overflow-x-auto p-5">
              <table className="w-full min-w-[360px] border border-black/10 text-left text-xs">
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
            {guiaTallas.mensajeSecundario ? (
              <div className="border-t border-black/10 px-5 py-4">
                <p className="text-sm leading-6 text-black/65">{guiaTallas.mensajeSecundario}</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      <QuickAddModal
        product={quickBuyProduct ?? relatedProducts[0] ?? product}
        isOpen={Boolean(quickBuyProduct)}
        initialSize={quickBuyProduct?.sizes?.[0] || "M"}
        onClose={closeQuickBuy}
      />
    </section>
  );
};
