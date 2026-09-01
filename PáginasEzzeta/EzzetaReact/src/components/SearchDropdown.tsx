import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Search, X } from "lucide-react";
import { resolveProductPrice } from "../services/pricingService";
import type { Product } from "../types";
type Props = {
  products: Product[];
  search: string;
  onClose: () => void;
  onViewAll: () => void;
  onSelectProduct?: (product: Product) => void;
};
export const SearchDropdown = ({
  products,
  search,
  onClose,
  onViewAll,
  onSelectProduct,
}: Props) => {
  const query = search.trim();
  return (
    <AnimatePresence>
      {query !== "" && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.14)]"
        >
          {products.length > 0 ? (
            <>
              {/* ENCABEZADO */}
              <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Search className="size-4 text-black/50" />
                  <p className="text-sm font-semibold text-black">
                    Resultados para{" "}
                    <span className="font-bold">"{query}"</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar búsqueda"
                  className="inline-flex size-8 items-center justify-center rounded-full text-black/50 transition hover:bg-black/5 hover:text-black"
                ><X className="size-4" />
                </button>
              </div>
              {/* RESULTADOS */}
              <div className="max-h-[390px] overflow-y-auto">
                {products.slice(0, 6).map((product) => (
                  <SearchProductItem
                    key={product.id}
                    product={product}
                    onClose={onClose}
                    onSelectProduct={onSelectProduct}
                  />
                ))}
              </div>
              {/* VER TODOS */}
              <button
                type="button"
                onClick={onViewAll}
                className="flex w-full items-center justify-center gap-2 border-t border-black/10 bg-white px-4 py-3.5 text-sm font-bold text-red-600 transition hover:bg-black hover:text-white"
              >Ver todos los resultados<ArrowRight className="size-4" />
              </button>
            </>
          ) : (
            /* SIN RESULTADOS */
            <div className="px-5 py-6">
              <div className="flex items-start gap-3">
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-black text-white"
                ><Search className="size-4" />
                </div>
                <div>
                  <p className="font-semibold text-black">No encontramos productos</p>
                  <p className="mt-1 text-sm text-black/55">Prueba con otro término de búsqueda.</p>
                </div>
              </div>
              {/* SUGERENCIAS */}
              <div className="mt-5">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-black/45">Puedes buscar</p>
                <div className="flex flex-wrap gap-2">
                  {["Luxury", "Prime", "Caffarena", "Polo", "Jogger",
                  ].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-black transition hover:border-red-600 hover:text-red-600"
                    >{item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

type SearchProductItemProps = {
  product: Product;
  onClose: () => void;
  onSelectProduct?: (product: Product) => void;
};

const SearchProductItem = ({
  product,
  onClose,
  onSelectProduct,
}: SearchProductItemProps) => {
  const pricingSummary = resolveProductPrice(product);
  const hasDiscount =
    pricingSummary.descuentoAplicado > 0 &&
    pricingSummary.precioFinal < pricingSummary.precioOriginal;

  const image =
    product.image ||
    product["mini-image"]?.[0] ||
    "";

  return (
    <button
      type="button"
      onClick={() => {
        onSelectProduct?.(product);
        onClose();
      }}
      className=" group flex w-full items-center gap-3 border-b border-black/5 px-4 py-3 text-left transition hover:bg-black/[0.025]"
    >
      {/* IMAGEN */}
      <div
        className=" flex size-[68px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black/[0.035]"
      >
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-black/35">Sin imagen</span>
        )}
      </div>
      {/* INFORMACIÓN */}
      <div className="min-w-0 flex-1">
        {/* CATEGORÍA */}
        <div className="flex items-center gap-2">
          <span className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-black/40">{product.category}</span>
          {product.subcategory ? (
            <>
              <span className="text-black/20">•</span>
              <span className="truncate text-[10px] uppercase tracking-[0.1em] text-black/35">{product.subcategory}</span>
            </>
          ) : null}
        </div>
        {/* NOMBRE */}
        <p className=" mt-1 truncate text-sm font-semibold text-black transition group-hover:text-red-600" >{product.name}</p>
        {/* COLORES / TALLAS */}
        <div className="mt-1 flex items-center gap-2 text-[11px] text-black/45">
          {product.colors?.length ? (
            <span>
              {product.colors.length}{" "}
              {product.colors.length === 1 ? "color" : "colores"}
            </span>
          ) : null}

          {product.colors?.length && product.sizes?.length ? (
            <span className="text-black/20">•</span>
          ) : null}

          {product.sizes?.length ? (
            <span>
              {product.sizes.length}{" "}
              {product.sizes.length === 1 ? "talla" : "tallas"}
            </span>
          ) : null}
        </div>
      </div>
      {/* PRECIO */}
      <div className="shrink-0 text-right">
        {hasDiscount ? (
          <p className="text-[11px] text-black/35 line-through">S/ {pricingSummary.precioOriginal.toFixed(2)}</p>
        ) : null}
        <p
          className={`text-sm font-bold ${
            hasDiscount ? "text-red-600" : "text-black"
          }`}
        >S/ {pricingSummary.precioFinal.toFixed(2)}
        </p>
        {hasDiscount ? (
          <span className="text-[9px] font-bold uppercase tracking-wider text-red-600">Oferta</span>
        ) : null}
      </div>
      {/* FLECHA */}
      <ArrowRight className=" size-4 shrink-0 text-black/20 transition group-hover:translate-x-0.5 group-hover:text-red-600"/>
    </button>
  );
};