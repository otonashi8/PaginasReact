import { AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { PermissionGate } from '../components/PermissionGate';
import QuickAddModal from '../components/common/QuickAddModal';
import { useWishlist } from '../context/WishlistContext';
import { getProducts } from '../services/contentService';
import ComboConfigureModal from '../components/common/ComboConfigureModal';
import { obtenerReglas } from '../admin/Sistema/reglas-precios/DatosReglas';
import type { Product } from '../types';
import { PERMISSIONS } from '../utils/permissionCodes';

const POLO_SUBCATEGORIES = ['luxury', 'caffarena', 'supremo', 'prime', 'monarca', 'barrido'];
const POLERA_SUBCATEGORIES = ['basica', 'cr', 'canguro', 'drip'];
const JEAN_SUBCATEGORIES = ['clasico', 'flared', 'baggy', 'ballom', 'mom'];

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const isPoloProduct = (product: Product) => {
  const category = normalizeText(product.category);
  const subcategory = normalizeText(product.subcategory);

  return (category.includes('polo') || category.includes('polos')) && POLO_SUBCATEGORIES.includes(subcategory);
};

const isJeanProduct = (product: Product) => {
  const category = normalizeText(product.category);
  const subcategory = normalizeText(product.subcategory);

  return (category.includes('jean') || category.includes('jeans') || category.includes('pantalon')) && JEAN_SUBCATEGORIES.includes(subcategory);
};

const isPoleraProduct = (product: Product) => {
  const category = normalizeText(product.category);
  const subcategory = normalizeText(product.subcategory);

  return (category.includes('polera') || category.includes('poleras')) && POLERA_SUBCATEGORIES.includes(subcategory);
};

const interleaveProducts = (groups: Product[][]) => {
  const maxLength = Math.max(...groups.map((group) => group.length), 0);
  const result: Product[] = [];

  for (let index = 0; index < maxLength; index += 1) {
    groups.forEach((group) => {
      const current = group[index];

      if (current) {
        result.push(current);
      }
    });
  }

  return result;
};

export const PacksPage = () => {
  const { favorites, toggleFavorite, addToCart } = useWishlist();
  const [selectedPoloSlug, setSelectedPoloSlug] = useState('');
  const [selectedJeanSlug, setSelectedJeanSlug] = useState('');
  const [selectedPoleraSlug, setSelectedPoleraSlug] = useState('');
  const [selectedPoloSize, setSelectedPoloSize] = useState('');
  const [selectedJeanSize, setSelectedJeanSize] = useState('');
  const [selectedPoleraSize, setSelectedPoleraSize] = useState('');
  const [quickBuyProduct, setQuickBuyProduct] = useState<Product | null>(null);
  const [comboToConfigure, setComboToConfigure] = useState<any | null>(null);
  const products = useMemo(() => getProducts(), []);
  const comboRules = useMemo(() => obtenerReglas().filter(r => r.tipo === 'combo' && r.estado), []);

  const poloProducts = useMemo(() => products.filter(isPoloProduct), [products]);
  const jeanProducts = useMemo(() => products.filter(isJeanProduct), [products]);
  const poleraProducts = useMemo(() => products.filter(isPoleraProduct), [products]);

  const outfitProducts = useMemo(() => {
    const grouped = [
      [...poloProducts].sort((a, b) => a.id - b.id),
      [...jeanProducts].sort((a, b) => a.id - b.id),
      [...poleraProducts].sort((a, b) => a.id - b.id),
    ];

    const mixed = interleaveProducts(grouped);

    return Array.from(new Map(mixed.map((product) => [product.id, product])).values());
  }, [poloProducts, jeanProducts, poleraProducts]);

  useEffect(() => {
    if (!selectedPoloSlug && poloProducts.length) {
      setSelectedPoloSlug(poloProducts[0].slug);
    }

    if (!selectedJeanSlug && jeanProducts.length) {
      setSelectedJeanSlug(jeanProducts[0].slug);
    }

    if (!selectedPoleraSlug && poleraProducts.length) {
      setSelectedPoleraSlug(poleraProducts[0].slug);
    }
  }, [poloProducts, jeanProducts, poleraProducts, selectedPoloSlug, selectedJeanSlug, selectedPoleraSlug]);

  const selectedPolo = useMemo(() => poloProducts.find((product) => product.slug === selectedPoloSlug), [poloProducts, selectedPoloSlug]);
  const selectedJean = useMemo(() => jeanProducts.find((product) => product.slug === selectedJeanSlug), [jeanProducts, selectedJeanSlug]);
  const selectedPolera = useMemo(
    () => poleraProducts.find((product) => product.slug === selectedPoleraSlug),
    [poleraProducts, selectedPoleraSlug]
  );

  useEffect(() => {
    if (!selectedPolo) {
      setSelectedPoloSize('');
      return;
    }

    if (!selectedPolo.sizes.includes(selectedPoloSize)) {
      setSelectedPoloSize(selectedPolo.sizes[0] ?? '');
    }
  }, [selectedPolo, selectedPoloSize]);

  useEffect(() => {
    if (!selectedJean) {
      setSelectedJeanSize('');
      return;
    }

    if (!selectedJean.sizes.includes(selectedJeanSize)) {
      setSelectedJeanSize(selectedJean.sizes[0] ?? '');
    }
  }, [selectedJean, selectedJeanSize]);

  useEffect(() => {
    if (!selectedPolera) {
      setSelectedPoleraSize('');
      return;
    }

    if (!selectedPolera.sizes.includes(selectedPoleraSize)) {
      setSelectedPoleraSize(selectedPolera.sizes[0] ?? '');
    }
  }, [selectedPolera, selectedPoleraSize]);

  const coverImage = outfitProducts[0]?.image ?? products[0]?.image ?? '';

  const closeQuickBuy = () => {
    setQuickBuyProduct(null);
  };

  const addOutfitToCart = () => {
    if (!selectedPolo || !selectedJean || !selectedPolera || !selectedPoloSize || !selectedJeanSize || !selectedPoleraSize) {
      return;
    }

    addToCart(selectedPolo.id, selectedPoloSize);
    addToCart(selectedJean.id, selectedJeanSize);
    addToCart(selectedPolera.id, selectedPoleraSize);
  };

  return (
    <section className="space-y-8 pb-10">
      <div className="space-y-5 pd-10">
        <div className="flex flex-wrap items-center justify-between gap-50">
          <h2 className="text-2xl font-semibold uppercase tracking-[0.16em] text-black">Catálogo de Packs</h2>
          <p className="text-sm text-black/60">{outfitProducts.length} productos disponibles</p>
        </div>

        {comboRules.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-black/70">
            No hay packs activos disponibles.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {comboRules.map((regla) => {
              const config: any = regla.configuracion ?? {};
              const elementos = Array.isArray(config.elementos) ? config.elementos : [];

              const imagen =
                config.imagenCombo ||
                (() => {
                  const firstProd = elementos.find((el: any) => el.tipo === 'producto');
                  if (!firstProd) return '';
                  const product = products.find((p) => String(p.id) === String(firstProd.valor));
                  return product?.image ?? '';
                })();

              const handleBuy = (event?: any) => {
                if (event) {
                  event.preventDefault();
                  event.stopPropagation();
                }
                setComboToConfigure(regla);
              };

              return (
                <article
                  key={regla.id}
                  className="group overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-white shadow-[0_12px_35px_rgba(0,0,0,0.04)]"
                >
                  <div className="relative h-80 w-full overflow-hidden bg-zinc-100">
                    {imagen ? (
                      <img src={imagen} alt={regla.nombre} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-black/40">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs uppercase tracking-[0.18em] text-black/50">Combo</p>
                        <h3 className="mt-2 text-xl font-semibold text-black">{regla.nombre}</h3>
                        <p className="mt-2 text-sm text-black/70">{regla.descripcion}</p>
                      </div>

                      <div className="text-right">
                        {config.precioCombo ? (
                          <div className="text-lg font-bold text-red-600">
                            S/{Number(config.precioCombo).toFixed(2)}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="min-w-0 text-xs text-black/60">
                        {elementos.length > 0
                          ? `${elementos.length} piezas incluidas`
                          : 'Pack personalizado'}
                      </div>

                      <PermissionGate permission={PERMISSIONS.salesCreate}>
                        <button
                          onClick={handleBuy}
                          className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-red-600"
                        ><ShoppingBag size={14} />
                        </button>
                      </PermissionGate>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {quickBuyProduct ? (
          <QuickAddModal product={quickBuyProduct} isOpen={Boolean(quickBuyProduct)} onClose={closeQuickBuy} />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {comboToConfigure ? (
          <ComboConfigureModal
            regla={comboToConfigure}
            isOpen={Boolean(comboToConfigure)}
            onClose={() => setComboToConfigure(null)}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
};

export default PacksPage;
