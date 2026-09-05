import { AnimatePresence, motion } from 'framer-motion';
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
        <section className="space-y-6 pb-10">
            {/* ENCABEZADO */}
            <div className="space-y-4">
                <div className="flex flex-col gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-red-600">Compra inteligente</p>
                        <h2 className="text-2xl font-semibold uppercase tracking-[0.12em] text-black sm:text-3xl">Catálogo de Packs</h2>
                        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">Combina tus productos favoritos y obtén un precio especial automáticamente.</p>
                    </div>
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">{outfitProducts.length} productos disponibles</p>
                </div>
                {/* INFORMACIÓN DEL PACK */}
                <div className="grid gap-3 sm:grid-cols-3">
                    {[
                        {
                            step: "Paso 01",
                            title: "Selecciona tus productos",
                            description: "Elige las prendas incluidas en el pack.",
                            icon: <ShoppingBag size={16} />,
                            image:"src/assets/1packs.png",
                        },
                        {
                            step: "Paso 02",
                            title: "Configura tu combinación",
                            description: "Selecciona tallas, colores y cantidades disponibles.",
                            icon: <span className="text-lg font-bold">+</span>,
                            image:"src/assets/2packs.png",
                        },
                        {
                            step: "Paso 03",
                            title: "Descuento automático",
                            description:"El precio especial se aplicará automáticamente al completar el pack.",
                            icon: <span className="text-lg font-bold">✓</span>,
                            image:"src/assets/3packs.png",
                        },
                    ].map((item, index) => (
                        <motion.article
                            key={item.step}
                            initial={{ opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{
                                duration: 0.4,
                                delay: index * 0.08,
                                ease: "easeOut",
                            }}
                            whileHover={{ y: -3 }}
                            className="group relative min-h-[220px] overflow-hidden border border-zinc-200 bg-black"
                        >
                            <img src={item.image} alt={item.title}
                                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/60 transition duration-300 group-hover:bg-black/50" />
                            <div className="relative z-10 flex min-h-[220px] flex-col justify-between p-4 text-white sm:p-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-8 w-8 items-center justify-center border border-white/30 bg-white/10">{item.icon}</span>
                                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">{item.step}</span>
                                    </div>
                                    <span className="text-xs text-white/40">0{index + 1}</span>
                                </div>
                                <div>
                                    <h3 className="max-w-[240px] text-base font-semibold uppercase leading-tight tracking-[0.06em] sm:text-lg">{item.title}</h3>
                                    <p className="mt-2 max-w-[260px] text-xs leading-5 text-white/70">{item.description}</p>
                                    <div className="mt-4 h-px w-8 bg-red-600 transition-all duration-300 group-hover:w-16" />
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
            {/* CATÁLOGO */}
            {comboRules.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 text-center"
                >
                    <p className="text-sm font-medium text-zinc-700">No hay packs activos disponibles.</p>
                    <p className="mt-1 text-sm text-zinc-500">Vuelve pronto para descubrir nuevas combinaciones.</p>
                </motion.div>
            ) : (
                <div className="grid gap-1 sm:grid-cols-2 xl:grid-cols-4">
                    {comboRules.map((regla, index) => {
                        const config: any = regla.configuracion ?? {};

                        const elementos = Array.isArray(config.elementos)
                            ? config.elementos
                            : [];

                        const imagen =
                            config.imagenCombo ||
                            (() => {
                                const firstProd = elementos.find((el: any) => el.tipo === "producto");
                                if (!firstProd) return "";
                                const product = products.find((p) => String(p.id) === String(firstProd.valor));
                                return product?.image ?? "";
                            })();

                        const handleBuy = (event?: any) => {
                            if (event) {
                                event.preventDefault();
                                event.stopPropagation();
                            }setComboToConfigure(regla);
                        };

                        return (
                            <motion.article
                                key={regla.id}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.15 }}
                                transition={{
                                    duration: 0.4,
                                    delay: index * 0.05,
                                    ease: "easeOut",
                                }}
                                whileHover={{ y: -4 }}
                                className="group relative overflow-hidden border border-zinc-200 bg-black transition-colors duration-300 hover:border-black"
                            >
                                {/* IMAGEN DE FONDO */}
                                <div className="relative h-[35rem] w-full overflow-hidden bg-zinc-100 sm:h-[40rem]">
                                    {imagen ? (
                                        <img src={imagen} alt={regla.nombre}
                                            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-[0.12em] text-zinc-400">Sin imagen</div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/5 transition duration-300 group-hover:from-black/95" />
                                    {/* PRECIO */}
                                    {config.precioCombo ? (
                                        <div className="absolute right-3 top-3 border border-white/20 bg-black/70 px-3 py-2 backdrop-blur-sm">
                                            <span className="block text-[9px] uppercase tracking-[0.12em] text-white/60">Precio pack</span>
                                            <span className="text-base font-bold text-red-500">S/{Number(config.precioCombo).toFixed(2)}</span>
                                        </div>
                                    ) : null}
                                    {/* INFORMACIÓN SOBRE LA IMAGEN */}
                                    <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
                                        <h3 className="mt-1.5 line-clamp-2 text-lg font-semibold leading-tight">{regla.nombre}</h3>
                                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/85">{regla.descripcion}</p>
                                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/65 pt-3">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-[0.12em] text-white/75">Incluye</p>
                                                <p className="mt-0.5 text-xs font-medium text-white/85">{elementos.length > 0 ? `${elementos.length} piezas` : "Pack personalizado"}</p>
                                            </div>
                                            <PermissionGate permission={PERMISSIONS.salesCreate}>
                                                <button
                                                    type="button"
                                                    onClick={handleBuy}
                                                    className="inline-flex h-9 items-center gap-2 bg-white px-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-red-600 hover:text-white"
                                                ><ShoppingBag size={14} /><span>Elegir pack</span>
                                                </button>
                                            </PermissionGate>
                                        </div>
                                    </div>
                                </div>
                            </motion.article>
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
