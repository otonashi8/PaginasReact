import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { getProducts } from '../../services/contentService';
import type { ReglaPrecio } from '../../admin/Sistema/reglas-precios/TiposReglas';
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
    .replace(/\u0300-\u036f/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();

export const ComboConfigureModal = ({ regla, isOpen, onClose }: Props) => {
  const { addToCart } = useWishlist();
  const products = useMemo(() => getProducts(), []);

  const config: any = regla?.configuracion ?? {};
  const elementos = (config.elementos ?? []) as any[];
  const imagenCombo = config.imagenCombo ?? '';

  const [selections, setSelections] = useState<Selection[]>([]);

  const [openIndex, setOpenIndex] = useState<number>(0);

  useEffect(() => {
    setSelections(elementos.map(() => ({})));
    setExpandedCandidates(elementos.map(() => false));
    setOpenIndex(0);
  }, [regla]);

  const carouselRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [expandedCandidates, setExpandedCandidates] = useState<boolean[]>([]);

  const candidatesFor = (el: any) => {
    if (el.tipo === 'producto') {
      const base = products.find((p) => String(p.id) === String(el.valor));
      if (!base) return [];
      if (elementos.length === 1 && Number(el.cantidad) > 1) return [base];
      return products.filter((item) => (
        normalizeText(item.category) === normalizeText(base.category) &&
        normalizeText(item.subcategory) === normalizeText(base.subcategory)
      ));
    }

    if (el.tipo === 'categoria') {
      return products.filter((p) => normalizeText(p.category) === normalizeText(String(el.valor)));
    }

    return products.filter((p) => normalizeText(p.subcategory) === normalizeText(String(el.valor)));
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
      copy[index] = { productId: chosen?.id, color, size: chosen?.sizes?.[0] ?? '' };
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

  const isSingleProductQuantityCombo = elementos.length === 1
    && elementos[0]?.tipo === 'producto'
    && Number(elementos[0]?.cantidad) > 1;

  const canAdd = selections.length === elementos.length && selections.every((s, index) => {
    if (isSingleProductQuantityCombo && index === 0) {
      const total = Object.values(s.sizeQuantities ?? {}).reduce((sum, quantity) => sum + quantity, 0);
      return s.productId && total === Number(elementos[index].cantidad);
    }
    return s.productId && s.size;
  });

  const handleAdd = () => {
    if (!canAdd) return;
    selections.forEach((s, index) => {
      const cantidad = elementos[index]?.cantidad ?? 1;
      if (isSingleProductQuantityCombo && s.productId) {
        Object.entries(s.sizeQuantities ?? {}).forEach(([size, quantity]) => {
          if (quantity > 0) addToCart(s.productId!, size, quantity);
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
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.18 }} className="my-0 w-full max-w-5xl max-h-[calc(100dvh-1rem)] overflow-y-auto rounded-xl bg-white shadow-lg sm:my-4 sm:max-h-[90dvh] sm:rounded-2xl">
            <div className="grid h-full md:grid-cols-[1.3fr_0.9fr]">
              <div className="flex flex-col overflow-hidden border-b p-4 sm:p-4 md:border-b-0 md:border-r">
                <div className="min-h-[150px] max-h-[25vh] flex-1 overflow-hidden rounded-md bg-zinc-50 sm:min-h-[300px] sm:max-h-[32vh] md:max-h-none">
                  {imagenCombo ? <img src={imagenCombo} alt={regla.nombre} className="w-full h-full object-cover" /> : <div className="h-full w-full bg-zinc-100 flex items-center justify-center">Sin imagen</div>}
                </div>
                <div className="mt-3">
                  <h3 className="text-lg font-semibold">{regla.nombre}</h3>
                  <p className="mt-1 text-sm text-black/60">{regla.descripcion}</p>
                </div>
              </div>

              <div className="overflow-visible p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                  <div />
                  <div className="flex items-center gap-3">
                    <button onClick={onClose} className="inline-flex items-center justify-center rounded-full border p-2"> <X size={16} /> </button>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  {elementos.map((el, idx) => {
                    const candidates = candidatesFor(el);
                    const selected = selections[idx] ?? {};
                    const isSubcategoria = el.tipo === 'subcategoria';
                    const isCategoryLike = el.tipo === 'categoria';
                    const isQuantityBySize = isSingleProductQuantityCombo && idx === 0;

                    // Category steps choose a product from the compact list before showing its options.
                    const product = selected.productId ? products.find((p) => p.id === selected.productId) : (!isCategoryLike && !isSubcategoria ? candidates[0] : undefined);

                    // Colors: for subcategory, collect all colors across candidates; otherwise, use product colors
                    const allColors = isSubcategoria
                      ? Array.from(new Set(candidates.flatMap((p: any) => (p.colors?.length ? p.colors : [p.name?.charAt(0) ?? 'Std']).map((c: string) => (c ?? '').trim()))))
                      : [];

                    const colors = isSubcategoria ? allColors : (product ? (product.colors?.length ? product.colors : [product.name?.charAt(0) ?? 'Std']) : []);

                    const isOpen = openIndex === idx;

                    return (
                      <div key={el.id} className="rounded-lg border">
                        <button onClick={() => setOpenIndex(idx)} className={`w-full flex items-center gap-4 p-4 ${isOpen ? '' : ''}`}>
                          <div className="flex-none">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">{idx + 1}</div>
                          </div>

                          <div className="flex-1 text-left">
                            <div className="text-xs text-black/60 uppercase">{String(el.tipo)}</div>
                            <div className="font-medium">{product ? product.name : String(el.valor)}</div>
                          </div>

                          <div className="flex-none">
                            {product?.image ? (
                              <div className="h-12 w-16 overflow-hidden rounded-md bg-zinc-100">
                                <ProductHoverImage product={product} alt={product?.name} className="h-12 w-16 object-cover" />
                              </div>
                            ) : (
                              <div className="h-12 w-16 rounded-md bg-zinc-100 flex items-center justify-center text-xs text-black/40">Sin imagen</div>
                            )}
                          </div>
                        </button>

                        {isOpen ? (
                          <div className="p-4 border-t">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <div className="mb-4">
                                  {isCategoryLike ? (
                                    <div>
                                      <div className="text-xs text-black/60">Seleccionar producto</div>
                                      <div className="mt-2 max-h-52 space-y-2 overflow-y-auto rounded-md border border-zinc-200 p-2">
                                        {candidates.map((cand: any) => {
                                          const isChosen = selected.productId === cand.id;
                                          return (
                                            <button
                                              key={cand.id}
                                              type="button"
                                              onClick={() => setSelections((prev) => {
                                                const copy = [...prev];
                                                copy[idx] = { productId: cand.id, color: undefined, size: undefined };
                                                return copy;
                                              })}
                                              className={`flex w-full items-center gap-3 rounded-md border p-2 text-left ${isChosen ? 'border-black bg-zinc-50' : 'border-transparent hover:border-zinc-200'}`}
                                            >
                                              <div className="h-12 w-10 flex-none overflow-hidden rounded bg-zinc-100">
                                                {cand.image ? <ProductHoverImage product={cand} alt={cand.name} className="h-12 w-10 object-cover" /> : null}
                                              </div>
                                              <span className="text-sm font-medium">{cand.name}</span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ) : !isSubcategoria && candidates.length > 1 ? (
                                    <>
                                      <div className="text-xs text-black/60">Seleccionar producto</div>
                                      <div className="mt-2 relative">
                                        <button type="button" onClick={() => {
                                          const elRef = carouselRefs.current[idx];
                                          if (elRef) elRef.scrollBy({ left: -240, behavior: 'smooth' });
                                        }} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border bg-white">‹</button>

                                        <div className="flex gap-3 overflow-x-auto px-8 py-2" style={{ scrollBehavior: 'smooth' }} ref={(el) => { carouselRefs.current[idx] = el; }}>
                                          {candidates.map((cand: any, cidx: number) => {
                                            const isChosen = selected.productId === cand.id;
                                            const showAll = expandedCandidates[idx];
                                            if (!showAll && cidx > 1) return null;
                                            return (
                                              <button key={cand.id} onClick={() => { setSelections((prev) => { const copy = [...prev]; copy[idx] = { ...(copy[idx] ?? {}), productId: cand.id, color: undefined, size: undefined }; return copy; }); setExpandedCandidates((s) => { const copy = [...s]; copy[idx] = true; return copy; }); }} className={`min-w-[calc(100vw-5rem)] max-w-[220px] flex-shrink-0 flex flex-col items-start gap-2 rounded-lg border p-2 text-left sm:min-w-[180px] sm:max-w-none ${isChosen ? 'border-black bg-zinc-50' : 'border-zinc-200 bg-white'}`}>
                                                <div className="h-28 w-full overflow-hidden rounded-md bg-zinc-100 sm:h-36">
                                                  {cand.image ? (
                                                    <ProductHoverImage product={cand} alt={cand.name} className="h-28 w-full object-cover sm:h-36" />
                                                  ) : (
                                                    <div className="h-28 w-full flex items-center justify-center text-xs text-black/40 sm:h-36">Sin imagen</div>
                                                  )}
                                                </div>
                                                <div className="text-sm font-medium">{cand.name}</div>
                                                <div className="text-xs text-black/50">{(cand.sizes ?? []).slice(0,6).join(' • ') ?? ''}</div>
                                              </button>
                                            );
                                          })}
                                        </div>

                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2">
                                          <button type="button" onClick={() => {
                                            const elRef = carouselRefs.current[idx];
                                            if (elRef) elRef.scrollBy({ left: 240, behavior: 'smooth' });
                                          }} className="inline-flex h-8 w-8 items-center justify-center rounded-full border bg-white">›</button>
                                          {!expandedCandidates[idx] && candidates.length > 2 ? (
                                            <button type="button" onClick={() => setExpandedCandidates((s) => { const copy = [...s]; copy[idx] = true; return copy; })} className="inline-flex h-8 items-center justify-center rounded-full border bg-white px-3 text-xs">Mostrar más</button>
                                          ) : null}
                                        </div>
                                      </div>
                                    </>
                                  ) : null}
                                </div>

                                {!isQuantityBySize ? <div className="mb-4">
                                  <div className="text-xs text-black/60">Color</div>
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
                                          className={`h-7 w-7 flex-none items-center justify-center rounded-full border ${isSelected ? 'border-black' : 'border-zinc-200'} transition sm:h-8 sm:w-8`}
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
                                  <div className="text-xs text-black/60">{isQuantityBySize ? 'Cantidad por talla' : 'Talla'}</div>
                                  <div className={isQuantityBySize ? 'mt-2 space-y-2' : 'mt-2 grid grid-cols-6 gap-2'}>
                                    {isQuantityBySize ? (
                                      (product?.sizes ?? []).map((size) => {
                                        const quantity = selected.sizeQuantities?.[size] ?? 0;
                                        return (
                                          <label key={size} className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 px-3 py-2 text-sm">
                                            <span className="font-medium">Talla {size}</span>
                                            <input
                                              type="number"
                                              min={0}
                                              max={Number(elementos[idx].cantidad)}
                                              value={quantity}
                                              onChange={(event) => {
                                                const nextQuantity = Math.max(0, Number(event.target.value) || 0);
                                                setSelections((prev) => {
                                                  const copy = [...prev];
                                                  copy[idx] = {
                                                    ...(copy[idx] ?? {}),
                                                    productId: product?.id,
                                                    sizeQuantities: { ...(copy[idx]?.sizeQuantities ?? {}), [size]: nextQuantity },
                                                  };
                                                  return copy;
                                                });
                                              }}
                                              className="w-16 rounded border border-zinc-300 px-2 py-1 text-center"
                                            />
                                          </label>
                                        );
                                      })
                                    ) : selected.color ? (
                                      (product?.sizes ?? []).map((s) => {
                                        const isSel = selected.size === s;
                                        return (
                                          <button key={s} onClick={() => handleSizeChange(idx, s)} className={`h-10 rounded-md border ${isSel ? 'border-black bg-black text-white' : 'border-zinc-200 bg-white text-black'} text-sm font-medium`}>{s}</button>
                                        );
                                      })
                                    ) : (
                                      <div className="col-span-6 text-sm text-black/40">Selecciona un color para ver tallas</div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div>
                                {/* Right: large product image or placeholder */}
                                <div className="w-full h-full min-h-[200px] overflow-hidden rounded-md bg-zinc-100 flex items-center justify-center">
                                  {product?.image ? (
                                    <ProductHoverImage product={product} alt={product?.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="text-sm text-black/40">Selecciona un color para ver la imagen</div>
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
                    {isSingleProductQuantityCombo
                      ? `${Object.values(selections[0]?.sizeQuantities ?? {}).reduce((sum, quantity) => sum + quantity, 0)} de ${elementos[0]?.cantidad ?? 0} unidades`
                      : `${selections.filter(s => s.productId && s.size).length} de ${elementos.length} configuradas`}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                    <button onClick={onClose} className="rounded-full border px-4 py-2">Cancelar</button>
                    <button disabled={!canAdd} onClick={handleAdd} className={`rounded-full px-4 py-2 text-white ${canAdd ? 'bg-black' : 'bg-black/30'}`}>Comprar</button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ComboConfigureModal;
