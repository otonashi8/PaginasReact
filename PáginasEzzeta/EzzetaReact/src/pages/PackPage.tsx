import { AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { PermissionGate } from '../components/PermissionGate';
import QuickAddModal from '../components/common/QuickAddModal';
import { useProductsCatalog } from '../services/contentService';
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

const isProductAvailable = (product: Product) => product.stock !== 0;

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
  const [selectedPoloSlug, setSelectedPoloSlug] = useState('');
  const [selectedJeanSlug, setSelectedJeanSlug] = useState('');
  const [selectedPoleraSlug, setSelectedPoleraSlug] = useState('');
  const [selectedPoloSize, setSelectedPoloSize] = useState('');
  const [selectedJeanSize, setSelectedJeanSize] = useState('');
  const [selectedPoleraSize, setSelectedPoleraSize] = useState('');
  const [quickBuyProduct, setQuickBuyProduct] = useState<Product | null>(null);
  const [comboToConfigure, setComboToConfigure] = useState<any | null>(null);
  const products = useProductsCatalog();
  const comboRules = useMemo(() => obtenerReglas().filter(r => r.tipo === 'combo' && r.estado), []);

  const poloProducts = useMemo(() => products.filter((product) => isPoloProduct(product) && isProductAvailable(product)), [products]);
  const jeanProducts = useMemo(() => products.filter((product) => isJeanProduct(product) && isProductAvailable(product)), [products]);
  const poleraProducts = useMemo(() => products.filter((product) => isPoleraProduct(product) && isProductAvailable(product)), [products]);

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

  const closeQuickBuy = () => {
    setQuickBuyProduct(null);
  };

  return (
    <section className="space-y-8 pb-10">
        {/* ENCABEZADO */}
        <div className="space-y-5">
            <div className="flex flex-col gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-red-600">Compra inteligente</p>
                    <h2 className="text-2xl font-semibold uppercase tracking-[0.12em] text-black sm:text-3xl">Catálogo de Packs</h2>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">Combina tus productos favoritos y obtén un precio especial automáticamente.</p>
                </div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">{outfitProducts.length} productos disponibles</p>
            </div>
            {/* INFORMACIÓN DEL PACK */}
            <div className="grid gap-px overflow-hidden border border-zinc-200 bg-zinc-200 sm:grid-cols-3">
                <div className="bg-black px-5 py-4 text-white">
                    <div className="mb-2 flex items-center gap-2">
                        <ShoppingBag size={15} />
                        <span className="text-[15px] font-semibold uppercase tracking-[0.16em] text-white/60">Paso 01</span>
                    </div>
                    <p className="text-sm font-semibold">Selecciona tus productos</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/60">Elige las prendas incluidas en el pack.</p>
                </div>
                <div className="bg-white px-5 py-4">
                    <div className="mb-2 flex items-center gap-2">
                        <span className="text-sm font-bold text-red-600">+</span>
                        <span className="text-[15px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Paso 02</span>
                    </div>
                    <p className="text-sm font-semibold text-zinc-900">Configura tu combinación</p>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-500">Selecciona tallas, colores y cantidades disponibles.</p>
                </div>
                <div className="bg-white px-5 py-4">
                    <div className="mb-2 flex items-center gap-2">
                        <span className="text-sm font-bold text-red-600">✓</span>
                        <span className="text-[15px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Paso 03</span>
                    </div>
                    <p className="text-sm font-semibold text-zinc-900">Descuento automático</p>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-500">El precio especial se aplicará automáticamente al completar el pack.</p>
                </div>
            </div>
        </div>
        {/* CATÁLOGO */}
        {comboRules.length === 0 ? (
            <div className="border border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 text-center">
                <p className="text-sm font-medium text-zinc-700">No hay packs activos disponibles.</p>
                <p className="mt-1 text-sm text-zinc-500">Vuelve pronto para descubrir nuevas combinaciones.</p>
            </div>
        ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {comboRules.map((regla) => {
                    const config: any = regla.configuracion ?? {};
                    const elementos = Array.isArray(config.elementos)
                        ? config.elementos
                        : [];
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
                        }setComboToConfigure(regla);
                    };
                    return (
                        <article
                            key={regla.id}
                            className="group overflow-hidden border border-zinc-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-black hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)]"
                        >
                            {/* IMAGEN */}
                            <div className="relative h-72 w-full overflow-hidden bg-zinc-100 sm:h-80">
                                {imagen ? (
                                    <img
                                        src={imagen}
                                        alt={regla.nombre}
                                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.12em] text-zinc-400">Sin imagen</div>
                                )}
                                {/* ETIQUETA */}
                                {config.precioCombo ? (
                                    <div className="absolute bottom-3 right-3 bg-white px-3 py-2 shadow-sm">
                                        <span className="block text-[9px] uppercase tracking-[0.12em] text-zinc-400">Precio pack</span>
                                        <span className="text-base font-bold text-red-600">S/{Number(config.precioCombo).toFixed(2)}</span>
                                    </div>
                                ) : null}
                            </div>
                            {/* INFORMACIÓN */}
                            <div className="space-y-4 p-4">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-600">Combo</p>
                                    <h3 className="mt-1.5 line-clamp-2 text-lg font-semibold leading-tight text-black">{regla.nombre}</h3>
                                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-500">{regla.descripcion}</p>
                                </div>
                                <div className="flex items-center justify-between gap-3 border-t border-zinc-100 pt-3">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Incluye</p>
                                        <p className="mt-0.5 text-xs font-medium text-zinc-700">
                                            {elementos.length > 0
                                                ? `${elementos.length} piezas`
                                                : 'Pack personalizado'}
                                        </p>
                                    </div>
                                    <PermissionGate permission={PERMISSIONS.salesCreate}>
                                        <button
                                            onClick={handleBuy}
                                            className="inline-flex h-9 items-center gap-2 bg-black px-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-red-600"
                                        ><ShoppingBag size={14} /><span>Elegir pack</span>
                                        </button>
                                    </PermissionGate>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        )}
        {/* MODAL PRODUCTO */}
        <AnimatePresence>
            {quickBuyProduct ? (
                <QuickAddModal
                    product={quickBuyProduct}
                    isOpen={Boolean(quickBuyProduct)}
                    onClose={closeQuickBuy}
                />
            ) : null}
        </AnimatePresence>
        {/* MODAL CONFIGURACIÓN DEL COMBO */}
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
