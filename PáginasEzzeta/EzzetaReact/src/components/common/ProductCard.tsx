import { motion } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ImagePlaceholder } from '../ImagePlaceholder';
import { PermissionGate } from '../PermissionGate';
import { ProductHoverImage } from '../ProductHoverImage';
import { PriceDisplay } from '../PriceDisplay';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import type { Product } from '../../types';
import { resolveProductPrice } from '../../services/pricingService';
import { PERMISSIONS } from '../../utils/permissionCodes';
import { ProductSizeOptions } from './ProductSizeOptions';

type ProductCardProps = {
  product: Product;
  onQuickAdd?: (product: Product) => void;
};

export const ProductCard = ({ product, onQuickAdd }: ProductCardProps) => {
  const navigate = useNavigate();
  const { favorites, toggleFavorite, addToCart } = useWishlist();
  const { isAuthenticated } = useAuth();
  const isFavorite = favorites.includes(product.id);
  const resultadoPrecio = resolveProductPrice(product);
  const hayDescuento = resultadoPrecio.descuentoAplicado > 0 && resultadoPrecio.precioFinal < resultadoPrecio.precioOriginal;
  const discountPercentage = hayDescuento && resultadoPrecio.precioOriginal > 0
    ? Math.round(((resultadoPrecio.precioOriginal - resultadoPrecio.precioFinal) / resultadoPrecio.precioOriginal) * 100)
    : 0;

  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.01 }}
      className="flex h-full flex-col bg-white p-2"
    >
      <div
        onClick={() => navigate(`/producto/${product.slug}`)}
        className="group relative aspect-[4/5] cursor-pointer overflow-hidden bg-white"
        role="link"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') navigate(`/producto/${product.slug}`);
        }}
      >
        {product.image ? (
          <ProductHoverImage product={product} alt={product.name} className="h-full w-full object-cover transition duration-200 group-hover:scale-105" />
        ) : (
          <ImagePlaceholder label="Producto" className="h-full" />
        )}
        {discountPercentage > 0 ? (
          <span className="absolute left-2 top-2 bg-black px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
            -{discountPercentage}%
          </span>
        ) : null}
        {isAuthenticated ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              toggleFavorite(product.id);
            }}
            className={`absolute right-2 top-2 rounded-full transition sm:right-3 sm:top-3 ${isFavorite ? 'text-red-500' : 'text-white hover:text-red-600'}`}
            aria-label={isFavorite ? 'Quitar de wishlist' : 'Agregar a wishlist'}
          >
            <Heart size={22} className={`transition-all duration-200 ${isFavorite ? "fill-red-500 text-red-500" : "fill-transparent"}`} />
          </button>
        ) : null}
        <ProductSizeOptions
          product={product}
          onSelect={(size) => addToCart(product.id, size)}
        />
      </div>
      <div className="mt-4 flex flex-1 flex-col">
        <p className="text-sm uppercase tracking-[0.2em] text-black/45">{product.category}</p>
        <h3 className="mt-2 text-base font-semibold text-black">{product.name}</h3>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <PriceDisplay product={product} />
            {hayDescuento && resultadoPrecio.etiquetaDescuento ? (
              <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-600">{resultadoPrecio.etiquetaDescuento}</span>
            ) : null}
          </div>
          <PermissionGate permission={PERMISSIONS.salesCreate}>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onQuickAdd?.(product);
              }}
              className="inline-flex shrink-0 items-center justify-center rounded-full p-2 text-black transition"
              aria-label={`Agregar ${product.name} al carrito`}
            >
              <ShoppingBag size={25} />
            </button>
          </PermissionGate>
        </div>
      </div>
    </motion.article>
  );
};

export default ProductCard;
