import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Minus, Plus, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { useHoldNumber } from '../../hooks/useHoldNumber';
import { getProducts } from '../../services/contentService';
import type { Product } from '../../types';
import { PERMISSIONS } from '../../utils/permissionCodes';
import { PermissionGate } from '../PermissionGate';
import PriceDisplay from '../PriceDisplay';

type QuickAddModalProps = {
  product: Product | null;
  initialSize?: string;
  isOpen: boolean;
  onClose: () => void;
};

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

// Detects if a string is a valid CSS color format we support (hex, rgb/rgba, hsl/hsla)
const isCssColor = (value: string) => {
  const v = value.trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v)) return true;
  if (/^rgb\(/i.test(v) || /^rgba\(/i.test(v)) return true;
  if (/^hsl\(/i.test(v) || /^hsla\(/i.test(v)) return true;
  // allow simple "r,g,b" or "r, g, b"
  if (/^\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*$/.test(v)) return true;
  return false;
};

const hexToRgb = (hex: string) => {
  const h = hex.replace('#', '');
  const hexNormalized = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const bigint = parseInt(hexNormalized, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

const parseRgbString = (input: string) => {
  const v = input.trim();
  const rgbMatch = v.match(/rgba?\(([^)]+)\)/i);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(',').slice(0, 3).map((p) => Number(p.trim()));
    return { r: parts[0], g: parts[1], b: parts[2] };
  }

  const simple = v.split(',').map((p) => Number(p.trim()));
  if (simple.length === 3 && simple.every((n) => !Number.isNaN(n))) {
    return { r: simple[0], g: simple[1], b: simple[2] };
  }

  const hexMatch = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (hexMatch) return hexToRgb(v);

  return null;
};

const getContrastTextColor = (bgColor: string) => {
  const rgb = parseRgbString(bgColor) || (/#/.test(bgColor) ? hexToRgb(bgColor) : null);
  if (!rgb) return '#000';

  // relative luminance
  const srgb = [rgb.r, rgb.g, rgb.b].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  const lum = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  return lum > 0.5 ? '#000' : '#fff';
};

const colorFromLetter = (letter: string) => {
  const code = letter.toUpperCase().charCodeAt(0);
  // generate hue based on char code
  const hue = (code * 37) % 360;
  return `hsl(${hue} 60% 55%)`;
};

const parseColorEntry = (entry: string) => {
  const parts = (entry ?? '').split('|');
  if (parts.length > 1) {
    const label = parts[0].trim();
    const value = parts.slice(1).join('|').trim();
    return { label: label || undefined, value: value || undefined, original: entry };
  }

  const v = (entry ?? '').trim();
  return { label: undefined, value: v || undefined, original: entry };
};

// Resolve a color value provided in product data.
// Supports: direct CSS colors (hex, rgb, hsl), simple "r,g,b", or named values falling back to a default.
const getColorValue = (colorName: string) => {
  const raw = (colorName ?? '').trim();
  if (!raw) return '#d6d3d1';

  const parsed = parseColorEntry(raw);
  const value = parsed.value ?? '';

  if (!value) return '#d6d3d1';

  if (isCssColor(value)) {
    return value;
  }

  const normalized = value.toLowerCase();

  if (normalized.includes('verde')) return '#7c9b69';
  if (normalized.includes('negro') || normalized.includes('black')) return '#111111';
  if (normalized.includes('blanco') || normalized.includes('white')) return '#f3f4f6';
  if (normalized.includes('gris') || normalized.includes('grey') || normalized.includes('gray')) return '#a5a5a5';
  if (normalized.includes('marr') || normalized.includes('beige') || normalized.includes('arena')) return '#d5b98c';
  if (normalized.includes('olive') || normalized.includes('oliva')) return '#6b7a3f';
  if (normalized.includes('azul') || normalized.includes('blue') || normalized.includes('ice')) return '#7aa6c8';
  if (normalized.includes('rojo') || normalized.includes('red')) return '#d84d4d';
  if (normalized.includes('perla')) return '#e7e1d7';
  if (normalized.includes('gargola') || normalized.includes('g\u00e1rgola')) return '#c5a27d';
  if (normalized.includes('melange')) return '#d6c9b6';
  if (normalized.includes('acero')) return '#8d8f96';

  // If it's a single letter, generate a color from it
  if (/^[a-zA-Z]$/.test(value)) return colorFromLetter(value);

  return '#d6d3d1';
};

const getVariantColor = (product: Product): string => {
  const safeColors = (product.colors ?? []).filter((color): color is string => Boolean(color && color.trim()));

  if (safeColors.length > 0) {
    return safeColors[0].trim();
  }

  const haystack = `${product.name} ${product.slug}`.toLowerCase();

  if (haystack.includes('verde')) return 'Verde';
  if (haystack.includes('negro') || haystack.includes('black')) return 'Negro';
  if (haystack.includes('blanco') || haystack.includes('white')) return 'Blanco';
  if (haystack.includes('gris') || haystack.includes('grey') || haystack.includes('gray')) return 'Gris';
  if (haystack.includes('arena') || haystack.includes('beige')) return 'Arena';
  if (haystack.includes('azul') || haystack.includes('blue')) return 'Azul';
  if (haystack.includes('rojo') || haystack.includes('red')) return 'Rojo';
  if (haystack.includes('perla')) return 'Perla';
  if (haystack.includes('melange')) return 'Melange';
  if (haystack.includes('gargola') || haystack.includes('gargola')) return 'Gargola';
  if (haystack.includes('acero')) return 'Acero';

  return 'Standard';
};

export const QuickAddModal = ({ product, initialSize, isOpen, onClose }: QuickAddModalProps) => {
  const { addToCart, isFavorite, toggleFavorite } = useWishlist();
  const { value: quantity, setValue: setQuantity, start: startQuantity } = useHoldNumber(1, { min: 1, step: 1, interval: 120 });

  const [currentProduct, setCurrentProduct] = useState<Product | null>(product);

  const variantOptions = useMemo(() => {
    if (!product) {
      return [] as Array<{ color: string; product: Product }>;
    }

    const familyProducts = getProducts().filter((item) =>
      item.id === product.id || (
        normalizeText(item.category) === normalizeText(product.category) &&
        normalizeText(item.subcategory) === normalizeText(product.subcategory)
      )
    );

    const variantEntries = familyProducts.flatMap((item) => {
      const colors = item.colors?.length ? item.colors : [getVariantColor(item)];
      return colors
        .filter((color): color is string => Boolean(color && color.trim()))
        .map((color) => ({ color: color.trim(), product: item }));
    });

    const deduped = Array.from(
      new Map(
        variantEntries.map((entry) => [
          normalizeText(entry.color),
          entry,
        ])
      ).values()
    );

    return deduped.length ? deduped : [{ color: getVariantColor(product), product }];
  }, [product]);

  const [selColor, setSelColor] = useState<string>(
    variantOptions.find((variant) => variant.product.id === product?.id)?.color ?? variantOptions[0]?.color ?? 'Standard'
  );
  const availableColors = useMemo(
    () => Array.from(new Set(variantOptions.map((option) => option.color))),
    [variantOptions],
  );
  const availableSizes = useMemo(() => {
    if (!currentProduct) return [] as string[];

    return currentProduct.sizes.filter((size) => {
      const stock = Number(currentProduct.sizesStock?.[size] ?? 0);
      return !Number.isFinite(stock) || stock > 0;
    });
  }, [currentProduct]);
  const [selSize, setSelSize] = useState<string>(initialSize ?? product?.sizes?.[0] ?? 'M');

  useEffect(() => {
    setCurrentProduct(product);
    if (!product) {
      setSelColor('Standard');
      setSelSize(initialSize ?? 'M');
      return;
    }

    const nextColor = variantOptions.find((variant) => variant.product.id === product.id)?.color ?? variantOptions[0]?.color ?? getVariantColor(product);
    const nextAvailableSize = product.sizes.find((size) => {
      const stock = Number(product.sizesStock?.[size] ?? 0);
      return !Number.isFinite(stock) || stock > 0;
    }) ?? product.sizes[0] ?? 'M';

    setSelColor(nextColor);
    setSelSize(initialSize ?? nextAvailableSize);
  }, [product, initialSize, variantOptions]);

  useEffect(() => {
    if (!isOpen || !currentProduct) {
      return;
    }

    const nextAvailableSize = currentProduct.sizes.find((size) => {
      const stock = Number(currentProduct.sizesStock?.[size] ?? 0);
      return !Number.isFinite(stock) || stock > 0;
    }) ?? currentProduct.sizes[0] ?? 'M';

    setQuantity(1);
    setSelSize(initialSize ?? nextAvailableSize);
  }, [isOpen, currentProduct, initialSize, setQuantity]);

  if (!product || !currentProduct) {
    return null;
  }

  const handleColorChange = (color: string) => {
    const variant = variantOptions.find((option) => normalizeText(option.color) === normalizeText(color));
    if (variant) {
      const firstAvailableSize = variant.product.sizes.find((size) => {
        const stock = Number(variant.product.sizesStock?.[size] ?? 0);
        return !Number.isFinite(stock) || stock > 0;
      }) ?? variant.product.sizes[0] ?? 'M';

      setCurrentProduct(variant.product);
      setSelColor(variant.color);
      setSelSize(initialSize ?? firstAvailableSize);
      return;
    }

    setSelColor(color);
  };

  const selectedSizeIsAvailable = !availableSizes.length || availableSizes.includes(selSize);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/35 p-2 backdrop-blur-[2px] sm:items-center sm:p-5"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 14 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="my-0 w-full max-w-4xl max-h-[calc(100dvh-1rem)] overflow-y-auto rounded-2xl border border-zinc-200/90 bg-white shadow-[0_26px_70px_rgba(0,0,0,0.16)] sm:my-4 sm:max-h-[92dvh] sm:rounded-[1.75rem]"
          >
            <div className="grid md:grid-cols-[1.05fr_0.95fr]">
              <div className="relative border-b border-zinc-100 bg-zinc-50 md:border-b-0 md:border-r">
                <img src={currentProduct.image} alt={currentProduct.name} className="h-48 w-full object-contain p-4 sm:h-72 sm:p-6 md:h-full md:min-h-[520px] md:p-8" />
                <div className="absolute left-3 top-3 rounded-full border border-zinc-200 bg-white/90 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-black/70 backdrop-blur sm:left-4 sm:top-4 sm:px-3 sm:text-[10px] sm:tracking-[0.2em]">
                  Compra Rápida
                </div>
              </div>

              <div className="flex flex-col p-4 sm:p-6 md:p-7">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-black/50">Seleccionado</p>
                    <h3 className="mt-2 text-xl font-semibold leading-tight text-black sm:text-2xl">{currentProduct.name}</h3>
                    <PriceDisplay product={currentProduct} cantidad={quantity} />
                  </div>

                  <div className="flex items-center gap-2">
                    <PermissionGate permission={PERMISSIONS.productUpdate}>
                      <button
                        type="button"
                        onClick={() => toggleFavorite(currentProduct.id)}
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${isFavorite(currentProduct.id) ? 'border-red-600 bg-red-600 text-white shadow-[0_8px_20px_rgba(220,38,38,0.3)]' : 'border-zinc-300 bg-white text-black hover:border-zinc-400'}`}
                        aria-label={isFavorite(currentProduct.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                      >
                        <Heart size={16} />
                      </button>
                    </PermissionGate>
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 bg-white text-black transition hover:border-zinc-400"
                      aria-label="Cerrar"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:mt-6 sm:gap-5">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-[0.16em] text-black/60">Color</label>
                    <div className="mt-3 flex flex-wrap gap-2.5">
                      {availableColors.map((color) => {
                        const isSelected = color === selColor;
                        const parsed = parseColorEntry(color);
                        const label = parsed.label;
                        const value = parsed.value ?? '';
                        const displayChar = label && /^[a-zA-Z]$/.test(label) ? label : (/^[a-zA-Z]$/.test(value) ? value : undefined);
                        const bg = isCssColor(value) ? value : getColorValue(color);
                        const fg = displayChar ? getContrastTextColor(bg) : undefined;
                        const titleText = label ?? value ?? parsed.original ?? color;

                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => handleColorChange(color)}
                            className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 transition ${isSelected ? 'border-black bg-zinc-50 shadow-[0_0_0_1px_rgba(0,0,0,0.12)]' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}
                            aria-label={`Seleccionar color ${titleText}`}
                            title={titleText}
                          >
                            <span
                              className="h-5 w-5 rounded-full border border-black/10 flex items-center justify-center text-xs font-semibold"
                              style={{ backgroundColor: bg, color: fg }}
                            >
                              {displayChar ? displayChar.toUpperCase() : null}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium uppercase tracking-[0.16em] text-black/60">Talla</label>
                    <select
                      value={availableSizes.includes(selSize) ? selSize : (availableSizes[0] ?? '')}
                      onChange={(e) => setSelSize(e.target.value)}
                      className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-black outline-none transition focus:border-zinc-400"
                      disabled={!availableSizes.length}
                    >
                      {availableSizes.length ? (
                        availableSizes.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))
                      ) : (
                        <option value="">Sin tallas disponibles</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium uppercase tracking-[0.16em] text-black/60">Cantidad</label>
                    <div className="mt-2 inline-flex h-12 items-center rounded-xl border border-zinc-200 bg-white p-1">
                      <button
                        type="button"
                        onMouseDown={() => startQuantity(-1)}
                        onTouchStart={() => startQuantity(-1)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-black transition hover:bg-zinc-100"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={quantity}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '');
                          setQuantity(v === '' ? 1 : Number(v));
                        }}
                        className="w-16 border-x border-zinc-200 bg-white py-2 text-center text-base font-semibold text-black outline-none"
                      />
                      <button
                        type="button"
                        onMouseDown={() => startQuantity(1)}
                        onTouchStart={() => startQuantity(1)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-black transition hover:bg-zinc-100"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2">
                  <PermissionGate permission={PERMISSIONS.salesCreate}>
                    <button
                      type="button"
                      onClick={() => {
                        if (!availableSizes.length || !availableSizes.includes(selSize)) {
                          return;
                        }

                        addToCart(currentProduct.id, selSize, quantity);
                        onClose();
                      }}
                      disabled={!selectedSizeIsAvailable}
                      className="inline-flex h-12 items-center justify-center rounded-xl bg-black px-5 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
                    >
                      Agregar
                    </button>
                  </PermissionGate>
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 text-sm font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-zinc-100"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuickAddModal;
