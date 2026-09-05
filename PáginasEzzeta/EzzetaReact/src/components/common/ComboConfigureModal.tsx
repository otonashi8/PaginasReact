import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { useProductsCatalog } from '../../services/contentService';
import type { ReglaPrecio } from '../../admin/Sistema/reglas-precios/TiposReglas';
import type { Product } from '../../types';
import { ProductHoverImage } from '../ProductHoverImage';

type Props = {
  regla: ReglaPrecio | null;
  isOpen: boolean;
  onClose: () => void;
};

type Selection = {
  productId?: number;
  color?: string;
  size?: string;
  sizeQuantities?: Record<string, number>;
};

type QuantitySelection = {
  productId?: number;
  color?: string;
  size?: string;
  quantity: number;
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

const isCssColor = (v: string) => !!v && (/^#/.test(v) || /^rgb/.test(v) || /^hsl/.test(v));

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();

const isProductAvailable = (product: Product) => product.stock == null || Number(product.stock) > 0;

const getProductSizes = (product: Product) => product.sizes;

const isSizeAvailable = (product: Product, size: string) =>
  !product.sizesStock || Number(product.sizesStock[size] ?? 0) > 0;

export const ComboConfigureModal = ({ regla, isOpen, onClose }: Props) => {
  const { addToCart } = useWishlist();
  const products = useProductsCatalog();

  const config: any = regla?.configuracion ?? {};
  const elementos = (config.elementos ?? []) as any[];

  const [selections, setSelections] = useState<Selection[]>([]);
  const [quantitySelections, setQuantitySelections] = useState<QuantitySelection[]>([]);
  const [activeQuantityIndex, setActiveQuantityIndex] = useState(0);

  const [openIndex, setOpenIndex] = useState<number>(0);
  const [openProductListIndex, setOpenProductListIndex] = useState<number | null>(null);
  const [openQuantityProductIndex, setOpenQuantityProductIndex] = useState<number | null>(null);

  useEffect(() => {
    setSelections(elementos.map(() => ({})));
    setQuantitySelections(elementos.length === 1 && Number(elementos[0]?.cantidad) > 1 ? [{ quantity: 1 }] : []);
    setActiveQuantityIndex(0);
    setExpandedCandidates(elementos.map(() => false));
    setOpenIndex(0);
    setOpenProductListIndex(null);
    setOpenQuantityProductIndex(null);
  }, [regla]);

  const carouselRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [expandedCandidates, setExpandedCandidates] = useState<boolean[]>([]);

  const candidatesFor = (el: any) => {
    if (el.tipo === 'producto') {
      const base = products.find((p) => String(p.id) === String(el.valor));
      if (!base || !isProductAvailable(base)) return [];
      if (elementos.length === 1 && Number(el.cantidad) > 1) return [base];
      return products.filter((item) => isProductAvailable(item) && (
        normalizeText(item.category) === normalizeText(base.category) &&
        normalizeText(item.subcategory) === normalizeText(base.subcategory)
      ));
    }

    if (el.tipo === 'categoria') {
      return products.filter((p) => isProductAvailable(p) && normalizeText(p.category) === normalizeText(String(el.valor)));
    }

    return products.filter((p) => isProductAvailable(p) && normalizeText(p.subcategory) === normalizeText(String(el.valor)));
  };

  const handleSelectColor = (index: number, color: string) => {
    const el = elementos[index];
    const candidates = candidatesFor(el);
    const currentProduct = selections[index]?.productId
      ? products.find((p) => p.id === selections[index].productId)
      : undefined;
    const match = currentProduct && (currentProduct.colors ?? []).some((c: string) => normalizeText(c) === normalizeText(color))
      ? currentProduct
      : candidates.find((p) => (p.colors ?? []).some((c: string) => normalizeText(c) === normalizeText(color)));
    const chosen = match ?? candidates[0];
    setSelections((prev) => {
      const copy = [...prev];
      const sizes = chosen ? getProductSizes(chosen) : [];
      copy[index] = { productId: chosen?.id, color, size: sizes.find((size) => isSizeAvailable(chosen, size)) ?? '' };
      return copy;
    });
  };

  const handleSizeChange = (index: number, size: string) => {
    setSelections((prev) => {
      const copy = [...prev];
      copy[index] = { ...(copy[index] ?? {}), size };
      return copy;
    });
    // auto-advance to next step when size selected
    if (index + 1 < elementos.length) {
      setOpenIndex(index + 1);
    }
  };

  const isSingleElementQuantityCombo = elementos.length === 1
    && Number(elementos[0]?.cantidad) > 1;

  const activeElement = elementos[openIndex];
  const activeCandidates = activeElement ? candidatesFor(activeElement) : [];
  const activeSelection = selections[openIndex] ?? {};
  const activeQuantityProduct = isSingleElementQuantityCombo && quantitySelections[activeQuantityIndex]?.productId
    ? activeCandidates.find((product) => String(product.id) === String(quantitySelections[activeQuantityIndex].productId))
    : undefined;
  const activePreviewProduct = activeQuantityProduct
    ?? (activeSelection.productId
      ? activeCandidates.find((product) => product.id === activeSelection.productId)
      : undefined);

  const canAdd = selections.length === elementos.length && selections.every((s, index) => {
    if (isSingleElementQuantityCombo && index === 0) {
      const total = quantitySelections.reduce((sum, selection) => sum + selection.quantity, 0);
      return quantitySelections.length > 0
        && quantitySelections.every((selection) => selection.productId && selection.size && selection.quantity > 0)
        && total === Number(elementos[index].cantidad);
    }
    return s.productId && s.size;
  });

  const handleAdd = () => {
    if (!canAdd) return;
    selections.forEach((s, index) => {
      const cantidad = elementos[index]?.cantidad ?? 1;
      if (isSingleElementQuantityCombo) {
        quantitySelections.forEach((selection) => {
          if (selection.productId && selection.size && selection.quantity > 0) {
            addToCart(selection.productId, selection.size, selection.quantity);
          }
        });
      } else if (s.productId && s.size) {
        addToCart(s.productId, s.size, cantidad);
      }
    });
    onClose();
  };

  if (!regla) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/35 p-2 sm:items-center sm:p-4">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.18 }} className="my-0 w-full max-w-5xl max-h-[calc(100dvh-1rem)] overflow-y-auto bg-white shadow-lg sm:my-4 sm:max-h-[90dvh]">
            <div className="grid h-full lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
              <div className="overflow-visible p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                  <div />
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{regla.nombre}</h3>
                    <button onClick={onClose} className="inline-flex items-center justify-center border p-2"> <X size={16} /> </button>
                  </div>
                </div>

                <div className="mt-6 space-y-4 w-full">
                  {elementos.map((el, idx) => {
                    const candidates = candidatesFor(el);
                    const selected = selections[idx] ?? {};
                    const isSubcategoria = el.tipo === 'subcategoria';
                    const isCategoryLike = el.tipo === 'categoria';
                    const isQuantityCombo = isSingleElementQuantityCombo && idx === 0;
                    const quantityHeaderProduct = isQuantityCombo && quantitySelections[activeQuantityIndex]?.productId
                      ? candidatesFor(el).find((p) => String(p.id) === String(quantitySelections[activeQuantityIndex].productId))
                      : undefined;
                    const product = quantityHeaderProduct
                      ?? (selected.productId ? products.find((p) => p.id === selected.productId) : (!isCategoryLike && !isSubcategoria ? candidates[0] : undefined));
                    const sizes = product ? getProductSizes(product) : [];
                    const allColors = isSubcategoria
                      ? Array.from(new Map(
                        candidates
                          .flatMap((p) => p.colors ?? [])
                          .map((color) => [normalizeText(color), color.trim()] as const)
                          .filter(([normalizedColor, color]) => normalizedColor && color)
                      ).values())
                      : [];

                    const colors = isSubcategoria ? allColors : (product?.colors ?? []);

                    const isOpen = openIndex === idx;

                    return (
                      <div key={el.id} className="border">
                        <button onClick={() => setOpenIndex(idx)} className={`w-full flex items-center gap-4 p-4 ${isOpen ? '' : ''}`}>
                          <div className="flex-none">
                            <div className="flex h-8 w-8 items-center justify-center bg-black text-sm font-semibold text-white">{idx + 1}</div>
                          </div>

                          <div className="flex-1 text-left">
                            <div className="text-sm text-black/60 uppercase">{String(el.tipo)}</div>
                            <div className="font-medium">{product ? product.name : String(el.valor)}</div>
                          </div>

                          <div className="flex-none">
                            {product?.image ? (
                              <div className="h-12 w-16 overflow-hidden bg-zinc-100">
                                <ProductHoverImage product={product} alt={product?.name} className="h-12 w-16 object-cover" />
                              </div>
                            ) : (
                              <div className="h-12 w-16 bg-zinc-100 flex items-center justify-center text-sm text-black/40">Sin imagen</div>
                            )}
                          </div>
                        </button>

                        {isOpen ? (
                          <div className="p-2 border-t">
                            <div>
                              <div>
                                {!isQuantityCombo ? <div className="mb-4">
                                  {isCategoryLike && !isQuantityCombo ? (
                                    <div className="relative">
                                      <div className="text-sm text-black/60">Seleccionar producto</div>
                                      <button
                                        type="button"
                                        onClick={() => setOpenProductListIndex((current) => current === idx ? null : idx)}
                                        className="mt-2 flex w-full items-center justify-between gap-3 border border-zinc-200 bg-white px-3 py-2.5 text-left text-sm transition hover:border-black"
                                      >
                                        <span className="min-w-0 truncate font-medium text-black">{product?.name ?? 'Selecciona un producto'}</span>
                                        <span className={`flex-none text-base transition-transform ${openProductListIndex === idx ? 'rotate-180' : ''}`}>∨</span>
                                      </button>
                                      {openProductListIndex === idx ? (
                                        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-64 overflow-y-auto border border-zinc-200 bg-white p-2 shadow-[0_14px_30px_rgba(0,0,0,0.14)]">
                                          {candidates.map((cand: Product) => {
                                            const isChosen = selected.productId === cand.id;
                                            return (
                                              <button
                                                key={cand.id}
                                                type="button"
                                                onClick={() => {
                                                  setSelections((prev) => {
                                                    const copy = [...prev];
                                                    copy[idx] = { productId: cand.id, color: undefined, size: undefined };
                                                    return copy;
                                                  });
                                                  setOpenProductListIndex(null);
                                                }}
                                                className={`flex w-full items-center gap-3 border p-2 text-left ${isChosen ? 'border-black bg-zinc-50' : 'border-transparent hover:border-zinc-200'}`}
                                              >
                                                <div className="h-12 w-10 flex-none overflow-hidden bg-zinc-100">
                                                  {cand.image ? <ProductHoverImage product={cand} alt={cand.name} className="h-12 w-10 object-cover" /> : <span className="flex h-full items-center justify-center text-[10px] text-black/40">Sin imagen</span>}
                                                </div>
                                                <span className="min-w-0 text-sm font-medium text-black">{cand.name}</span>
                                              </button>
                                            );
                                          })}
                                          {candidates.length === 0 ? (
                                            <div className="px-2 py-3 text-sm text-black/50">No hay productos disponibles.</div>
                                          ) : null}
                                        </div>
                                      ) : null}
                                    </div>
                                  ) : !isSubcategoria && candidates.length > 1 ? (
                                    <>
                                      <div className="text-sm text-black/60">Seleccionar producto</div>
                                      <div className="mt-2 relative">
                                        <button type="button" onClick={() => {
                                          const elRef = carouselRefs.current[idx];
                                          if (elRef) elRef.scrollBy({ left: -240, behavior: 'smooth' });
                                        }} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 inline-flex h-8 w-8 items-center justify-center border bg-white">‹</button>

                                        <div className="flex gap-3 overflow-x-auto px-8 py-2" style={{ scrollBehavior: 'smooth' }} ref={(el) => { carouselRefs.current[idx] = el; }}>
                                          {candidates.map((cand: any, cidx: number) => {
                                            const isChosen = selected.productId === cand.id;
                                            const showAll = expandedCandidates[idx];
                                            if (!showAll && cidx > 1) return null;
                                            return (
                                              <button key={cand.id} onClick={() => { setSelections((prev) => { const copy = [...prev]; copy[idx] = { ...(copy[idx] ?? {}), productId: cand.id, color: undefined, size: undefined }; return copy; }); setExpandedCandidates((s) => { const copy = [...s]; copy[idx] = true; return copy; }); }} className={`min-w-[calc(100vw-5rem)] max-w-[260px] flex-shrink-0 flex flex-col items-start gap-3 border p-3 text-left sm:min-w-[220px] sm:max-w-[260px] ${isChosen ? 'border-black bg-zinc-50' : 'border-zinc-200 bg-white'}`}>
                                                <div className="h-28 w-full overflow-hidden bg-zinc-100 sm:h-36">
                                                  {cand.image ? (
                                                    <ProductHoverImage product={cand} alt={cand.name} className="h-28 w-full object-cover sm:h-36" />
                                                  ) : (
                                                    <div className="h-28 w-full flex items-center justify-center text-sm text-black/40 sm:h-36">Sin imagen</div>
                                                  )}
                                                </div>
                                                <div className="text-sm font-medium text-black">{cand.name}</div>
                                                <div className="text-sm text-black/50">{getProductSizes(cand).slice(0, 6).join(' • ')}</div>
                                              </button>
                                            );
                                          })}
                                        </div>

                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2">
                                          <button type="button" onClick={() => {
                                            const elRef = carouselRefs.current[idx];
                                            if (elRef) elRef.scrollBy({ left: 240, behavior: 'smooth' });
                                          }} className="inline-flex h-8 w-8 items-center justify-center border bg-white">›</button>
                                          {!expandedCandidates[idx] && candidates.length > 2 ? (
                                            <button type="button" onClick={() => setExpandedCandidates((s) => { const copy = [...s]; copy[idx] = true; return copy; })} className="inline-flex h-8 items-center justify-center border bg-white px-3 text-sm">Mostrar más</button>
                                          ) : null}
                                        </div>
                                      </div>
                                    </>
                                  ) : null}
                                </div> : null}

                                {!isQuantityCombo && !isCategoryLike ? <div className="mb-4">
                                  <div className="text-sm text-black/60">Color</div>
                                  <div className="mt-2 flex max-h-20 flex-wrap items-center gap-1.5 overflow-y-auto sm:max-h-none sm:gap-2">
                                    {colors.map((c: string) => {
                                      const isSelected = selected.color === c;
                                      const parsed = parseColorEntry(c);
                                      const value = parsed.value ?? parsed.original ?? c;
                                      const bg = isCssColor(value) ? value : '#e6e6e6';
                                      const fg = '#000';
                                      return (
                                        <button
                                          key={c}
                                          onClick={() => handleSelectColor(idx, c)}
                                          className={`h-7 w-7 flex-none items-center rounded-full justify-center border ${isSelected ? 'border-black' : 'border-zinc-200'} transition sm:h-8 sm:w-8`}
                                          title={parsed.label ?? value}
                                          style={{ backgroundColor: bg, color: fg }}
                                        >
                                          {(!isCssColor(value) && value && value.length === 1) ? value.toUpperCase() : null}
                                        </button>
                                      );
                                    })}
                                    {colors.length === 0 ? <div className="text-sm text-black/40">No disponible</div> : null}
                                  </div>
                                </div> : null}

                                <div>
                                  <div className="text-sm text-black/60">{isQuantityCombo ? (isSubcategoria ? 'Colores, cantidades y tallas' : 'Productos, cantidades y tallas') : 'Talla'}</div>
                                  {isQuantityCombo ? (
                                    <div className="mt-2 space-y-3">
                                      {quantitySelections.map((quantitySelection, quantityIndex) => {
                                        const quantityProduct = quantitySelection.productId
                                          ? candidates.find((item: Product) => String(item.id) === String(quantitySelection.productId))
                                          : undefined;
                                        const quantityColors = isSubcategoria ? allColors : [];
                                        const quantitySizes = quantityProduct ? getProductSizes(quantityProduct) : [];
                                        return (
                                          <div key={quantityIndex} className="space-y-2 border border-zinc-200 p-3">
                                            <div className="flex items-center gap-2">
                                              {!isSubcategoria ? (
                                                <div className="relative min-w-0 flex-1">
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setActiveQuantityIndex(quantityIndex);
                                                      setOpenQuantityProductIndex((current) => current === quantityIndex ? null : quantityIndex);
                                                    }}
                                                    className="flex flex-wrap w-full items-center justify-start gap-2 border border-zinc-300 bg-white px-2 py-1.5 text-left text-sm"
                                                  >
                                                    {quantityProduct?.image ? <ProductHoverImage product={quantityProduct} alt={quantityProduct.name} className="h-8 w-7 flex-none object-cover" /> : null}
                                                    <span className="min-w-0 flex-1 truncate text-left font-medium text-black" style={{ textAlign: 'left' }}>{quantityProduct?.name ?? 'Selecciona un producto'}</span>
                                                    <span className="ml-auto flex-none pl-1">⌄</span>
                                                  </button>
                                                  {openQuantityProductIndex === quantityIndex ? (
                                                    <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-64 overflow-y-auto border border-zinc-200 bg-white p-2 shadow-[0_14px_30px_rgba(0,0,0,0.14)]">
                                                      {candidates.map((candidate: Product) => (
                                                        <button
                                                          key={candidate.id}
                                                          type="button"
                                                          onClick={() => {
                                                            setActiveQuantityIndex(quantityIndex);
                                                            setQuantitySelections((prev) => prev.map((item, itemIndex) => itemIndex === quantityIndex
                                                              ? { ...item, productId: candidate.id, color: undefined, size: undefined }
                                                              : item));
                                                            setOpenQuantityProductIndex(null);
                                                          }}
                                                          className={`flex w-full items-center gap-2 rounded-md border p-2 text-left ${quantitySelection.productId === candidate.id ? 'border-black bg-zinc-50' : 'border-transparent hover:border-zinc-200'}`}
                                                        >
                                                          <div className="h-12 w-10 flex-none overflow-hidden rounded bg-zinc-100">
                                                            {candidate.image ? <ProductHoverImage product={candidate} alt={candidate.name} className="h-12 w-10 object-cover" /> : <span className="flex h-full items-center justify-center text-[10px] text-black/40">Sin imagen</span>}
                                                          </div>
                                                          <span className="min-w-0 text-sm font-medium text-black">{candidate.name}</span>
                                                        </button>
                                                      ))}
                                                      {candidates.length === 0 ? <div className="px-2 py-3 text-sm text-black/50">No hay productos disponibles.</div> : null}
                                                    </div>
                                                  ) : null}
                                                </div>
                                              ) : (
                                                <span className="min-w-0 flex-1 text-sm font-medium text-zinc-700">{quantitySelection.color ? quantityProduct?.name : 'Selecciona un color'}</span>
                                              )}
                                              <input
                                                type="number"
                                                min={1}
                                                max={Number(elementos[idx].cantidad)}
                                                value={quantitySelection.quantity}
                                                onChange={(event) => {
                                                  const quantity = Math.max(1, Number(event.target.value) || 1);
                                                  setQuantitySelections((prev) => prev.map((item, itemIndex) => itemIndex === quantityIndex ? { ...item, quantity } : item));
                                                }}
                                                className="w-16 rounded-md border border-zinc-300 px-2 py-2 text-center text-sm"
                                                aria-label="Cantidad"
                                              />
                                              {quantitySelections.length > 1 ? (
                                                <button type="button" onClick={() => setQuantitySelections((prev) => prev.filter((_, itemIndex) => itemIndex !== quantityIndex))} className="px-1 text-lg text-zinc-500 hover:text-red-600" aria-label="Eliminar selección">×</button>
                                              ) : null}
                                            </div>
                                            {isSubcategoria ? <div className="rounded-full flex flex-wrap gap-1.5">
                                              {quantityColors.map((color) => {
                                                const parsed = parseColorEntry(color);
                                                const value = parsed.value ?? parsed.original ?? color;
                                                return <button key={color} type="button" onClick={() => {
                                                  setActiveQuantityIndex(quantityIndex);
                                                  const colorProduct = isSubcategoria
                                                    ? candidates.find((candidate: Product) => (candidate.colors ?? []).some((candidateColor) => normalizeText(candidateColor) === normalizeText(color)))
                                                    : quantityProduct;
                                                  setQuantitySelections((prev) => prev.map((item, itemIndex) => itemIndex === quantityIndex
                                                    ? { ...item, productId: colorProduct?.id, color, size: undefined }
                                                    : item));
                                                }} title={parsed.label ?? value} className={`h-7 w-7 border ${quantitySelection.color === color ? 'border-black' : 'border-zinc-200 rounded-full'}`} style={{ backgroundColor: isCssColor(value) ? value : '#e6e6e6' }} />;
                                              })}
                                            </div> : null}
                                            {quantityProduct ? (
                                              <>
                                                <div className="grid grid-cols-6 gap-2">
                                                  {quantitySizes.map((size) => {
                                                    const available = isSizeAvailable(quantityProduct, size);
                                                    return <button key={size} type="button" disabled={!available} onClick={() => setQuantitySelections((prev) => prev.map((item, itemIndex) => itemIndex === quantityIndex ? { ...item, size } : item))} className={`h-9 rounded-md border text-sm ${quantitySelection.size === size ? 'border-black bg-black text-white' : available ? 'border-zinc-200' : 'border-zinc-200 bg-zinc-100 text-black/40 line-through'}`}>{size}</button>;
                                                  })}
                                                </div>
                                              </>
                                            ) : null}
                                          </div>
                                        );
                                      })}
                                      {candidates.length > 0 ? <button type="button" onClick={() => setQuantitySelections((prev) => [...prev, { quantity: 1 }])} className="border border-dashed border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-600 hover:border-black hover:text-black">+ Agregar otro producto</button> : null}
                                    </div>
                                  ) : (selected.color || isCategoryLike) ? (
                                      <div className="grid grid-cols-8 gap-2">
                                        {sizes.map((s) => {
                                          const isSel = selected.size === s;
                                          const sizeAvailable = product
                                            ? isSizeAvailable(product, s)
                                            : false;
                                          return (
                                            <button
                                              key={s}
                                              disabled={!sizeAvailable}
                                              onClick={() => handleSizeChange(idx, s)}
                                              className={`h-9 border text-sm font-medium transition ${
                                                isSel
                                                  ? 'border-black bg-black text-white'
                                                  : sizeAvailable
                                                    ? 'border-zinc-200 bg-white text-black hover:border-black'
                                                    : 'border-zinc-200 bg-zinc-100 text-black/40 line-through'
                                              }`}
                                            >{s}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <div className="col-span-6 text-sm text-black/40">Selecciona un color para ver tallas</div>
                                    )}
                                </div>
                              </div>

                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-black/60">
                    {isSingleElementQuantityCombo
                      ? `${quantitySelections.reduce((sum, selection) => sum + selection.quantity, 0)} de ${elementos[0]?.cantidad ?? 0} unidades`
                      : `${selections.filter(s => s.productId && s.size).length} de ${elementos.length} configuradas`}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                    <button onClick={onClose} className="rounded-full border px-4 py-2">Cancelar</button>
                    <button disabled={!canAdd} onClick={handleAdd} className={`rounded-full px-4 py-2 text-white ${canAdd ? 'bg-black' : 'bg-black/30'}`}>Comprar</button>
                  </div>
                </div>
              </div>

              <aside className="border-t border-zinc-200 bg-zinc-50 p-4 sm:p-6 lg:border-l lg:border-t-0">
                <div className="flex h-full min-h-[280px] flex-col">
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">Producto seleccionado</p>
                    <h4 className="mt-1 text-lg font-semibold text-black">
                      {activePreviewProduct?.name ?? 'Selecciona un producto'}
                    </h4>
                  </div>
                  <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-white">
                    {activePreviewProduct?.image ? (
                      <ProductHoverImage
                        product={activePreviewProduct}
                        alt={activePreviewProduct.name}
                        className="h-full min-h-[260px] w-full object-cover sm:min-h-[360px]"
                      />
                    ) : (
                      <div className="px-6 text-center text-sm text-black/40">
                        Selecciona un producto para ver su imagen.
                      </div>
                    )}
                  </div>
                  {activePreviewProduct ? (
                    <p className="mt-4 text-sm text-black/55">
                      {activePreviewProduct.category}{activePreviewProduct.subcategory ? ` · ${activePreviewProduct.subcategory}` : ''}
                    </p>
                  ) : null}
                </div>
              </aside>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ComboConfigureModal;
