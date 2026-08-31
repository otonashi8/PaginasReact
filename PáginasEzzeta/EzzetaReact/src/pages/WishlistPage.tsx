import { useMemo, useState } from 'react';
import { ArrowRight, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard';
import QuickAddModal from '../components/common/QuickAddModal';
import { PermissionGate } from '../components/PermissionGate';
import { resolveProductPrice } from '../services/pricingService';
import { useWishlist } from '../context/WishlistContext';
import { getProducts } from '../services/contentService';
import { PERMISSIONS } from '../utils/permissionCodes';

export const WishlistPage = () => {
  const { favorites } = useWishlist();
  const products = getProducts();
  const items = products.filter((product) => favorites.includes(product.id));
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedQuickProduct, setSelectedQuickProduct] = useState<typeof items[number] | null>(null);
  const [shareStatus, setShareStatus] = useState('');
  const pageSize = 8;

  const pageCount = Math.max(Math.ceil(items.length / pageSize), 1);
  const paginatedItems = useMemo(
    () => items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, items]
  );

  const shareWishlist = async () => {
    if (!items.length) {
      setShareStatus('No hay productos en la lista.');
      return;
    }

    const itemLines = items.map((product) => `- ${product.name} (S/${resolveProductPrice(product).precioFinal.toFixed(2)})`).join('\n');
    const shareText = `Mi lista de deseos:\n${itemLines}\n\nRevisa los productos aquí: ${window.location.href}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Mi lista de deseos',
          text: shareText,
        });
        setShareStatus('Compartido correctamente.');
      } else {
        await navigator.clipboard.writeText(shareText);
        setShareStatus('Lista copiada al portapapeles.');
      }
    } catch {
      setShareStatus('No se pudo compartir.');
    }
  };

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-black/60">Lista de Deseados</p>
        <h1 className="mt-2 text-3xl font-semibold uppercase tracking-[0.2em] text-black">Tus piezas favoritas</h1>
      </div>

      {items.length === 0 ? (
        <div className="rounded-[2rem] border border-black/10 bg-white p-10 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-black">Tu lista está vacía</h2>
          <p className="mt-3 text-sm text-black/70">Guarda tus prendas favoritas y vuelve a ellas cuando quieras.</p>
          <Link to="/tienda" className="mt-6 inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-red-600">
            Volver a la tienda <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4 rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-semibold uppercase tracking-[0.2em] text-black">Tus piezas favoritas</h2>
            <PermissionGate permission={PERMISSIONS.wishlistShare}>
              <button
                type="button"
                onClick={shareWishlist}
                className="inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-full border border-black/10 bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-red-600"
              >
                <Share2 size={16} /> Compartir lista
              </button>
            </PermissionGate>
          </div>

          <QuickAddModal
            product={selectedQuickProduct ?? (paginatedItems[0] ?? null) as any}
            isOpen={Boolean(selectedQuickProduct)}
            initialSize={selectedQuickProduct?.sizes?.[0]}
            onClose={() => setSelectedQuickProduct(null)}
          />

          {shareStatus ? (
            <div className="rounded-[1.5rem] border border-black/10 bg-white p-4 text-sm text-black/70">{shareStatus}</div>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            {paginatedItems.map((product) => (
              <ProductCard key={product.id} product={product} onQuickAdd={setSelectedQuickProduct} />
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm">
            <p className="text-sm text-black/60">Mostrando {paginatedItems.length} de {items.length} productos</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-center text-sm text-black/70 sm:text-left">{currentPage} / {pageCount}</span>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                disabled={currentPage === pageCount}
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
};
