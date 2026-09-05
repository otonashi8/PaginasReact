import type { Product } from '../../types';

type ProductSizeOptionsProps = {
  product: Product;
  onSelect: (size: string) => void;
};

const isSizeAvailable = (product: Product, size: string) => {
  if (!product.sizesStock) {
    return true;
  }

  return Number(product.sizesStock[size] ?? 0) > 0;
};

export const ProductSizeOptions = ({ product, onSelect }: ProductSizeOptionsProps) => {
  if (product.sizes.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-wrap items-center justify-center gap-1.5 bg-white/95 p-2 opacity-0 shadow-[0_-8px_20px_rgba(0,0,0,0.08)] transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100" aria-label="Tallas disponibles">
      {product.sizes.map((size) => {
        const available = isSizeAvailable(product, size);

        return (
          <button
            key={size}
            type="button"
            disabled={!available}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(size);
            }}
            className={`min-w-8 border px-2 py-1 text-md font-semibold uppercase tracking-[0.08em] transition ${
              available
                ? 'border-black/20 text-black hover:border-black hover:bg-black hover:text-white'
                : 'cursor-not-allowed border-black/10 text-black/30 line-through'
            }`}
            aria-label={`${size}${available ? '' : ' agotada'}`}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
};