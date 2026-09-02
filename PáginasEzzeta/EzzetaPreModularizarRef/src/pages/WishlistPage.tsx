import { useMemo, useState } from 'react';
import { ArrowRight, Camera, Check, Copy, MessageCircle, Share2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard';
import QuickAddModal from '../components/common/QuickAddModal';
import { resolveProductPrice } from '../services/pricingService';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { getProducts } from '../services/contentService';

export const parseWishlistShareIds = (search: string): number[] => {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const raw = params.get('wishlist') ?? params.get('lista') ?? '';

  if (!raw) {
    return [];
  }

  return Array.from(
    new Set(
      raw
        .split(/[\s,]+/)
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isFinite(value) && value > 0),
    ),
  );
};

export const buildWishlistShareUrl = (favoriteIds: number[], baseUrl: string = `${window.location.origin}/deseados`) => {
  const uniqueIds = Array.from(
    new Set(favoriteIds.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0)),
  );

  const url = new URL(baseUrl);

  if (url.pathname === '/' || url.pathname === '') {
    url.pathname = '/deseados';
  }

  if (uniqueIds.length > 0) {
    url.searchParams.set('wishlist', uniqueIds.join(','));
  }

  return url.toString();
};

export const WishlistPage = () => {
  const { favorites } = useWishlist();
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const products = getProducts();
  const sharedWishlistIds = useMemo(() => parseWishlistShareIds(location.search), [location.search]);
  const activeFavoriteIds = sharedWishlistIds.length > 0 ? sharedWishlistIds : favorites;
  const items = products.filter((product) => activeFavoriteIds.includes(product.id));
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedQuickProduct, setSelectedQuickProduct] = useState<typeof items[number] | null>(null);
  const [shareStatus, setShareStatus] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const pageSize = 8;

  const pageCount = Math.max(Math.ceil(items.length / pageSize), 1);
  const paginatedItems = useMemo(
    () => items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, items],
  );

  const buildSharePayload = () => {
    const shareUrl = buildWishlistShareUrl(activeFavoriteIds, `${window.location.origin}/deseados`);
    const itemLines = items.map((product) => `- ${product.name} (S/${resolveProductPrice(product).precioFinal.toFixed(2)})`).join('\n');
    const shareText = `Mi lista de deseos:\n${itemLines}\n\nRevisa los productos aquí: ${shareUrl}`;
    return { shareText, shareUrl };
  };

  const openAuthModal = (mode: 'login' | 'register') => {
    window.dispatchEvent(new CustomEvent('ezzeta:open-auth-modal', { detail: { mode } }));
  };

  if (isLoading) {
    return <section className="py-16 text-center text-sm text-black/60">Cargando...</section>;
  }

  if (!isAuthenticated) {
    return (
      <section className="mx-auto max-w-2xl rounded-[2rem] border border-black/10 bg-white p-8 text-center shadow-sm sm:p-12">
        <p className="text-sm uppercase tracking-[0.3em] text-black/60">Lista de Deseados</p>
        <h1 className="mt-3 text-2xl font-semibold uppercase tracking-[0.12em] text-black sm:text-3xl">
          Regístrate para acceder a tus favoritos
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-black/70">
          Regístrate para acceder a la función de favoritos/deseados y compartirla con tus conocid@s.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => openAuthModal('register')} className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-red-600">
            Registrarme <ArrowRight size={16} />
          </button>
          <button type="button" onClick={() => openAuthModal('login')} className="inline-flex items-center rounded-full border border-black/15 px-5 py-3 text-sm font-medium text-black transition hover:border-black hover:bg-black hover:text-white">
            Iniciar sesión
          </button>
        </div>
      </section>
    );
  }

  const shareToNetwork = async (network: 'whatsapp' | 'facebook' | 'instagram' | 'copy') => {
    if (!items.length) {
      setShareStatus('No hay productos en la lista para compartir.');
      return;
    }

    const { shareText, shareUrl } = buildSharePayload();

    try {
      if (network === 'copy') {
        await navigator.clipboard.writeText(shareUrl);
        setShareStatus('Enlace copiado al portapapeles.');
        return;
      }

      if (network === 'instagram') {
        await navigator.clipboard.writeText(shareText);
        setShareStatus('Texto listo para pegar en Instagram.');
        window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
        return;
      }

      if (network === 'whatsapp') {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
        setShareStatus('Abriendo WhatsApp para compartir la lista.');
        return;
      }

      if (network === 'facebook') {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        window.open(facebookUrl, '_blank', 'noopener,noreferrer');
        setShareStatus('Abriendo Facebook para compartir la lista.');
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: 'Mi lista de deseos',
          text: shareText,
          url: shareUrl,
        });
        setShareStatus('Compartido correctamente.');
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareStatus('Enlace copiado al portapapeles.');
      }
    } catch {
      setShareStatus('No se pudo compartir la lista.');
    }
  };

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-black/60">Lista de Deseados</p>
        <h1 className="mt-2 text-3xl font-semibold uppercase tracking-[0.2em] text-black">
          {sharedWishlistIds.length > 0 ? 'Lista compartida' : 'Tus piezas favoritas'}
        </h1>
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
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  className="inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-full border border-black/10 bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-red-600"
                >
                  <Share2 size={16} /> Compartir lista
                </button>

                {menuOpen ? (
                  <div className="absolute right-0 z-20 mt-3 w-64 rounded-[1.5rem] border border-black/10 bg-white p-3 shadow-lg">
                    <div className="grid gap-2">
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); void shareToNetwork('whatsapp'); }}
                        className="flex items-center justify-between rounded-full bg-[#25D366] px-3 py-2 text-sm font-medium text-white"
                      >
                        <span className="flex items-center gap-2"><MessageCircle size={15} /> WhatsApp</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); void shareToNetwork('facebook'); }}
                        className="flex items-center justify-between rounded-full bg-[#1877F2] px-3 py-2 text-sm font-medium text-white"
                      >
                        <span className="flex items-center gap-2"><Share2 size={15} /> Facebook</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); void shareToNetwork('instagram'); }}
                        className="flex items-center justify-between rounded-full bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] px-3 py-2 text-sm font-medium text-white"
                      >
                        <span className="flex items-center gap-2"><Camera size={15} /> Instagram</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); void shareToNetwork('copy'); }}
                        className="flex items-center justify-between rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-medium text-black"
                      >
                        <span className="flex items-center gap-2"><Copy size={15} /> Copiar enlace</span>
                        {shareStatus.includes('copiado') ? <Check size={15} className="text-green-600" /> : null}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
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
