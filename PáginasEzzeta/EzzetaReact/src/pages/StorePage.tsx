import { AnimatePresence, motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProductsCatalog } from '../services/contentService';
import type { Product } from '../types';
import ProductCard from '../components/common/ProductCard';
import QuickAddModal from '../components/common/QuickAddModal';

type FilterSection = 'categories' | 'subcategories' | 'price' | 'sizes';

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const buildUniqueValues = (items: string[]) =>
  Array.from(
    new Map(
      items
        .filter(Boolean)
        .map((value) => [normalizeText(value), value.trim()])
    ).values()
  ).sort((a, b) => normalizeText(a).localeCompare(normalizeText(b)));

type SortOption = 'ultimos' | 'popularidad' | 'vista';

const gridClassMap: Record<1 | 2 | 3 | 4, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
};

export const StorePage = () => {
  const products = useProductsCatalog();
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedSubcategory, setSelectedSubcategory] = useState('Todas');
  const [draftCategory, setDraftCategory] = useState<string>('Todas');
  const [draftSubcategory, setDraftSubcategory] = useState('Todas');
  const [quickCartProduct, setQuickCartProduct] = useState<Product | null>(null);
  const [priceBounds, setPriceBounds] = useState<[number, number]>([0, 0]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<[number, number]>([0, 0]);
  const [draftPriceRange, setDraftPriceRange] = useState<[number, number]>([0, 0]);
  const [selectedSize, setSelectedSize] = useState('Todas');
  const [draftSize, setDraftSize] = useState('Todas');
  const [sortBy] = useState<SortOption>('vista');
  const [productsPerRow, setProductsPerRow] = useState<1 | 2 | 3 | 4>(4);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<FilterSection, boolean>>({
    categories: false,
    subcategories: false,
    price: false,
    sizes: false,
  });

  const categoryOptions = useMemo(
    () => ['Todas', ...buildUniqueValues(products.map((product) => product.category))],
    [products]
  );

  const allSubcategories = useMemo(
    () => buildUniqueValues(products.map((product) => product.subcategory)),
    [products]
  );

  const subcategories = useMemo(() => {
    if (draftCategory === 'Todas') {
      return allSubcategories;
    }

    return buildUniqueValues(
      products
        .filter((product) => normalizeText(product.category) === normalizeText(draftCategory))
        .flatMap((product) => product.subcategory ? [product.subcategory] : [])
    );
  }, [draftCategory, allSubcategories, products]);

  const sizeOptions = useMemo(
    () => buildUniqueValues(products.flatMap((product) => product.sizes)),
    [products]
  );

  const sortedProducts = useMemo(() => {
    const source = [...products];

    if (sortBy === 'ultimos') {
      return source.sort((a, b) => b.id - a.id);
    }

    if (sortBy === 'popularidad') {
      return source.sort((a, b) => {
        const featuredA = a.featured ? 1 : 0;
        const featuredB = b.featured ? 1 : 0;

        if (featuredA !== featuredB) {
          return featuredB - featuredA;
        }

        return b.id - a.id;
      });
    }

    return source.sort((a, b) => a.price - b.price);
  }, [products, sortBy]);

  const filteredProducts = useMemo(() => {
    return sortedProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === 'Todas' || normalizeText(product.category) === normalizeText(selectedCategory);
      const matchesSubcategory =
        selectedSubcategory === 'Todas' || normalizeText(product.subcategory) === normalizeText(selectedSubcategory);
      const matchesPrice = product.price >= selectedPriceRange[0] && product.price <= selectedPriceRange[1];
      const matchesSize = selectedSize === 'Todas' || product.sizes.includes(selectedSize);
      const matchesSearch =
      !search ||
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase()) ||
      (product.subcategory ?? "")
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesCategory && matchesSubcategory && matchesPrice && matchesSize && matchesSearch;
    });
  }, [sortedProducts, selectedCategory, selectedSubcategory, selectedPriceRange, selectedSize, search]);

  const pageCount = Math.max(Math.ceil(filteredProducts.length / pageSize), 1);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSection = (section: FilterSection) => {
    setOpenSections((current) => ({ ...current, [section]: !current[section] }));
  };

  const openFiltersModal = () => {
    setDraftCategory(selectedCategory);
    setDraftSubcategory(selectedSubcategory);
    setDraftSize(selectedSize);
    setDraftPriceRange(selectedPriceRange);
    setIsFiltersModalOpen(true);
  };

  const closeFiltersModal = () => setIsFiltersModalOpen(false);

  const applyFilters = () => {
    setSelectedCategory(draftCategory);
    setSelectedSubcategory(draftSubcategory);
    setSelectedSize(draftSize);
    setSelectedPriceRange(draftPriceRange);
    closeFiltersModal();
  };

  const resetFilters = () => {
    setSelectedCategory("Todas");
    setSelectedSubcategory("Todas");
    setSelectedSize("Todas");
    setSelectedPriceRange(priceBounds);
    setDraftCategory("Todas");
    setDraftSubcategory("Todas");
    setDraftSize("Todas");
    setDraftPriceRange(priceBounds);
  };

  useEffect(() => {
      if (!products.length) return;

      const prices = products.map((product) => product.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      setPriceBounds([minPrice, maxPrice]);
      setSelectedPriceRange([minPrice, maxPrice]);
      setDraftPriceRange([minPrice, maxPrice]);
    }, [products]);

  useEffect(() => {
      const categoryParam = searchParams.get('category');
      const subcategoryParam = searchParams.get('subcategory');

      if (categoryParam) {
          const matchedCategory = categoryOptions.find((option) => normalizeText(option) === normalizeText(categoryParam));
          setSelectedCategory(matchedCategory ?? 'Todas');
          setDraftCategory(matchedCategory ?? 'Todas');
      }

      if (subcategoryParam) {
          const matchedSubcategory = allSubcategories.find((option) => normalizeText(option) === normalizeText(subcategoryParam));
          setSelectedSubcategory(matchedSubcategory ?? 'Todas');
          setDraftSubcategory(matchedSubcategory ?? 'Todas');
      } else {
          setSelectedSubcategory('Todas');
          setDraftSubcategory('Todas');
      }
  }, [searchParams, categoryOptions, allSubcategories]);

  useEffect(() => {
    if (selectedSubcategory === 'Todas') {
      return;
    }

    const availableSubcategories =
      selectedCategory === 'Todas'
        ? allSubcategories
        : buildUniqueValues(
            products
              .filter((product) => normalizeText(product.category) === normalizeText(selectedCategory))
              .flatMap((product) => product.subcategory ? [product.subcategory] : [])
          );

    if (!availableSubcategories.some((subcategory) => normalizeText(subcategory) === normalizeText(selectedSubcategory))) {
      setSelectedSubcategory('Todas');
    }
  }, [products, selectedCategory, selectedSubcategory, allSubcategories]);

  useEffect(() => {
    if (draftSubcategory === 'Todas') {
      return;
    }

    const availableSubcategories =
      draftCategory === 'Todas'
        ? allSubcategories
        : buildUniqueValues(
            products
              .filter((product) => normalizeText(product.category) === normalizeText(draftCategory))
              .flatMap((product) => product.subcategory ? [product.subcategory] : [])
          );

    if (!availableSubcategories.some((subcategory) => normalizeText(subcategory) === normalizeText(draftSubcategory))) {
      setDraftSubcategory('Todas');
    }
  }, [products, draftCategory, draftSubcategory, allSubcategories]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedSubcategory, selectedPriceRange, selectedSize, sortBy, search]);

  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount);
    }
  }, [currentPage, pageCount]);

  const goToPage = (page: number) => {
    const nextPage = Math.min(pageCount, Math.max(1, page));
    setCurrentPage(nextPage);
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    });
  };

  const openQuickCart = (product: Product) => {
    setQuickCartProduct(product);
  };

  const closeQuickCart = () => setQuickCartProduct(null);

  return (
    <section className="relative overflow-hidden bg-white pb-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top,rgba(193,18,31,0.08),transparent_60%)]" />
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
          <motion.header
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="border-b border-black/10 pb-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-black/45">Tienda / Colección</p>
                <h1 className="mt-2 text-3xl font-semibold uppercase tracking-[0.12em] text-black sm:text-4xl">Colección masculina</h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-black/60">Explora piezas esenciales con una estética contemporánea y sofisticada.</p>
              </div>
              <p className="text-sm uppercase tracking-[0.18em] text-black/45">{filteredProducts.length} productos</p>
            </div>
          </motion.header>
          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex flex-col gap-3 border-b border-black/10 pb-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="text-[16px] font-bold uppercase tracking-[0.2em] text-black/45">Explora nuestra selección</p>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                <button
                  type="button"
                  onClick={openFiltersModal}
                  className="inline-flex h-9 items-center justify-center gap-2 border border-black/15 bg-white px-4 text-sm font-medium text-black transition hover:border-black hover:bg-black hover:text-white"
                ><SlidersHorizontal size={14} />Filtros
                </button>
                <label className="sr-only" htmlFor="store-sort">Productos por fila</label>
                <div className="inline-flex h-9 overflow-hidden border border-black/15 bg-white">
                  {[1, 2, 3, 4].map((cols) => (
                    <button
                      key={cols}
                      type="button"
                      onClick={() =>
                        setProductsPerRow(cols as 1 | 2 | 3 | 4)
                      }
                      className={`min-w-9 border-r border-black/10 px-3 text-sm font-medium transition last:border-r-0 ${
                        productsPerRow === cols
                          ? "bg-black text-white"
                          : "text-black hover:bg-black/5"
                      }`}
                      aria-pressed={productsPerRow === cols}
                    >{cols}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="col-span-2 h-9 border border-black/15 bg-white px-4 text-sm font-medium text-black transition hover:border-black hover:bg-black hover:text-white sm:col-span-1"
                >Limpiar filtros
                </button>
              </div>
            </motion.div>
            {filteredProducts.length === 0 ? (
              <div className="border border-dashed border-black/15 bg-zinc-50 p-10 text-center">
                <p className="text-sm text-black/65">No hay productos que coincidan con los filtros seleccionados.</p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-red-600 underline-offset-4 hover:underline"
                >Limpiar filtros
                </button>
              </div>
            ) : (
              <>
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`grid gap-4 sm:gap-5 ${gridClassMap[productsPerRow]}`}
                >
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickAdd={openQuickCart}
                    />
                  ))}
                </motion.div>
                <div className="flex flex-col gap-3 border-t border-black/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-black/50">
                    Mostrando{" "}
                    <span className="font-medium text-black">
                      {paginatedProducts.length}
                    </span>{" "}
                    de{" "}
                    <span className="font-medium text-black">
                      {filteredProducts.length}
                    </span>{" "}
                    productos
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-9 border border-black/15 bg-white px-4 text-xs font-medium text-black transition hover:border-black hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                    >Anterior
                    </button>
                    <span className="min-w-16 text-center text-xs text-black/60">{currentPage} / {pageCount}</span>
                    <button
                      type="button"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === pageCount}
                      className="h-9 border border-black/15 bg-white px-4 text-xs font-medium text-black transition hover:border-black hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                    >Siguiente
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      <QuickAddModal
        product={quickCartProduct ?? (paginatedProducts[0] ?? null) as any}
        isOpen={Boolean(quickCartProduct)}
        initialSize={quickCartProduct?.sizes?.[0] || 'M'}
        onClose={closeQuickCart}
      />

      <AnimatePresence>
        {isFiltersModalOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] bg-black/45"
          >
            <motion.div
              initial={{ x: -420, opacity: 0.85 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -420, opacity: 0.9 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="relative flex h-full w-full max-w-md flex-col border-r border-black/10 bg-white shadow-[0_26px_70px_rgba(0,0,0,0.24)]"
            >
              <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-[0.24em] text-black/40">Tienda</p>
                  <h2 className="mt-1 text-sm font-semibold uppercase tracking-[0.22em] text-black">Filtros</h2>
                </div>
                <button
                  type="button"
                  onClick={closeFiltersModal}
                  className="inline-flex size-8 items-center justify-center border border-black/10 text-black transition hover:border-black hover:bg-black hover:text-white"
                  aria-label="Cerrar filtros"
                ><X size={15} />
                </button>
              </div>
              <div className="flex-1 space-y-0 overflow-y-auto px-5">
                <div className="border-b border-black/10 py-4">
                  <motion.button
                    type="button"
                    onClick={() => toggleSection("categories")}
                    whileTap={{ scale: 0.98 }}
                    className="flex w-full items-center justify-between text-[15px] font-bold uppercase tracking-[0.2em] text-black transition hover:text-red-600"
                  ><span>Categorías</span>
                    <motion.span
                      animate={{
                        rotate: openSections.categories ? 180 : 0,
                      }}
                      transition={{ duration: 0.25 }}
                      className="text-sm leading-none"
                    >▾
                    </motion.span>
                  </motion.button>
                  <AnimatePresence initial={false}>
                    {openSections.categories ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-wrap gap-1.5 pt-3">
                          {categoryOptions.map((category) => (
                            <button
                              key={category}
                              type="button"
                              onClick={() => setDraftCategory(category)}
                              className={`border px-3 py-2 text-[15px] font-medium uppercase tracking-[0.1em] transition ${
                                draftCategory === category
                                  ? "border-black bg-black text-white"
                                  : "border-black/10 bg-white text-black/65 hover:border-black/40 hover:text-black"
                              }`}
                            >{category}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
                <div className="border-b border-black/10 py-4">
                  <motion.button
                    type="button"
                    onClick={() => toggleSection("subcategories")}
                    whileTap={{ scale: 0.98 }}
                    className="flex w-full items-center justify-between text-[15px] font-bold uppercase tracking-[0.2em] text-black transition hover:text-red-600"
                  >
                    <span>Subcategorías</span>
                    <motion.span
                      animate={{
                        rotate: openSections.subcategories ? 180 : 0,
                      }}
                      transition={{ duration: 0.25 }}
                      className="text-sm leading-none"
                    >▾
                    </motion.span>
                  </motion.button>
                  <AnimatePresence initial={false}>
                    {openSections.subcategories ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-wrap gap-1.5 pt-3">
                          {["Todas", ...subcategories].map((subcategory) => (
                            <button
                              key={subcategory}
                              type="button"
                              onClick={() => setDraftSubcategory(subcategory)}
                              className={`border px-3 py-2 text-[15px] font-medium uppercase tracking-[0.1em] transition ${
                                draftSubcategory === subcategory
                                  ? "border-black bg-black text-white"
                                  : "border-black/10 bg-white text-black/65 hover:border-black/40 hover:text-black"
                              }`}
                            >{subcategory}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
                <div className="border-b border-black/10 py-4">
                  <motion.button
                    type="button"
                    onClick={() => toggleSection("price")}
                    whileTap={{ scale: 0.98 }}
                    className="flex w-full items-center justify-between text-[15px] font-bold uppercase tracking-[0.2em] text-black transition hover:text-red-600"
                  >
                    <span>Precio</span>
                    <motion.span
                      animate={{
                        rotate: openSections.price ? 180 : 0,
                      }}
                      transition={{ duration: 0.25 }}
                      className="text-sm leading-none"
                    >▾
                    </motion.span>
                  </motion.button>
                  <AnimatePresence initial={false}>
                    {openSections.price ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4 overflow-hidden pt-4"
                      >
                        <div className="relative flex h-8 items-center">
                          <div className="absolute left-0 right-0 h-1 bg-black/10" />
                          <div
                            className="absolute h-1 bg-black"
                            style={{
                              left: `${((draftPriceRange[0] - priceBounds[0]) /(priceBounds[1] - priceBounds[0])) *100}%`,
                              right: `${100 -((draftPriceRange[1] - priceBounds[0]) /(priceBounds[1] - priceBounds[0])) *100}%`,
                            }}
                          />
                          <input
                            type="range"
                            min={priceBounds[0]}
                            max={priceBounds[1]}
                            value={draftPriceRange[0]}
                            onChange={(event) => {
                              const nextMin = Number(event.target.value);

                              setDraftPriceRange(([_, max]) => [
                                Math.min(nextMin, max),
                                max,
                              ]);
                            }}
                            className="pointer-events-none absolute h-8 w-full cursor-pointer appearance-none bg-transparent outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-black"
                          />
                          <input
                            type="range"
                            min={priceBounds[0]}
                            max={priceBounds[1]}
                            value={draftPriceRange[1]}
                            onChange={(event) => {
                              const nextMax = Number(event.target.value);
                              setDraftPriceRange(([min]) => [
                                min,
                                Math.max(min, nextMax),
                              ]);
                            }}
                            className="pointer-events-none absolute h-8 w-full cursor-pointer appearance-none bg-transparent outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-black"
                          />
                        </div>
                        <div className="flex items-center justify-between text-[15px] uppercase tracking-[0.12em] text-black/40">
                          <span>S/ {priceBounds[0]}.00</span>
                          <span>S/ {priceBounds[1]}.00</span>
                        </div>
                        <p className="text-center text-sm font-semibold tracking-[0.04em] text-black">
                          S/ {draftPriceRange[0]}.00 – S/{" "}
                          {draftPriceRange[1]}.00
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
                <div className="border-b border-black/10 py-4">
                  <motion.button
                    type="button"
                    onClick={() => toggleSection("sizes")}
                    whileTap={{ scale: 0.98 }}
                    className="flex w-full items-center justify-between text-[15px] font-bold uppercase tracking-[0.2em] text-black transition hover:text-red-600"
                  >
                    <span>Tallas</span>
                    <motion.span
                      animate={{
                        rotate: openSections.sizes ? 180 : 0,
                      }}
                      transition={{ duration: 0.25 }}
                      className="text-sm leading-none"
                    >▾
                    </motion.span>
                  </motion.button>
                  <AnimatePresence initial={false}>
                    {openSections.sizes ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-4 gap-1.5 pt-3">
                          {["Todas", ...sizeOptions].map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => setDraftSize(size)}
                              className={`h-9 border text-[15px] font-medium uppercase tracking-[0.1em] transition ${
                                draftSize === size
                                  ? "border-black bg-black text-white"
                                  : "border-black/10 bg-white text-black/65 hover:border-black/40 hover:text-black"
                              }`}
                            >{size}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-black/10 bg-white px-5 py-4">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="h-10 border border-black/15 bg-white px-4 text-[15px] font-bold uppercase tracking-[0.14em] text-black transition hover:border-black hover:bg-black hover:text-white"
                >Limpiar
                </button>
                <button
                  type="button"
                  onClick={applyFilters}
                  className="h-10 border border-black bg-black px-4 text-[13px] font-bold uppercase tracking-[0.14em] text-white transition hover:border-red-600 hover:bg-red-600"
                >Aplicar filtros
                </button>
              </div>
            </motion.div>
            <button
              type="button"
              onClick={closeFiltersModal}
              className="absolute inset-0 -z-10 cursor-default"
              aria-label="Cerrar modal de filtros"
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
};
