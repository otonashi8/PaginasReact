import { AnimatePresence, motion } from 'framer-motion';
import { Heart, LogOut, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { SearchDropdown } from './SearchDropdown';

export type NavigationLink = {
  label: string;
  href: string;
  external?: boolean;
};

export const navigationLinks: NavigationLink[] = [
  { label: 'Inicio', href: '/' },
  { label: '3x100', href: 'https://3x100.pe', external: true },
  { label: 'Tienda', href: '/tienda' },
  { label: 'Packs🔥', href: '/packs' },
  { label: 'Contacto', href: '/contacto' },
];

type HeaderNavigationProps = {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onCloseMobileMenu: () => void;
  isUserMenuOpen: boolean;
  onToggleUserMenu: () => void;
  onOpenAccount: () => void;
  onOpenLogin: () => void;
  onSearchChange: (value: string) => void;
  search: string;
  searchResults: Parameters<typeof SearchDropdown>[0]['products'];
  onSearch: (event: React.FormEvent) => void;
  onOpenCart?: () => void;
};

export const HeaderNavigation = ({
  isMobileMenuOpen,
  onToggleMobileMenu,
  onCloseMobileMenu,
  isUserMenuOpen,
  onToggleUserMenu,
  onOpenAccount,
  onOpenLogin,
  onSearchChange,
  search,
  searchResults,
  onSearch,
  onOpenCart,
}: HeaderNavigationProps) => {
  const { favorites, cart, toggleCart } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const headerTextClass = 'text-black';
  const headerButtonClass = 'border-black/15 bg-white text-black hover:border-red-600 hover:text-red-600';
  const headerIconButtonClass = 'border-black/20 bg-white/80 text-black hover:border-red-500 hover:text-red-500';
  const headerSearchClass = 'border-black/15 text-black placeholder:text-black/50';

  const renderNavItem = (link: NavigationLink) => {
    if (link.external) {
      return <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="text-black/80 transition hover:text-red-600">{link.label}</a>;
    }

    return <NavLink key={link.href} to={link.href} className={({ isActive }) => `transition ${isActive ? 'text-black' : 'text-black/80 hover:text-red-400'}`}>{link.label}</NavLink>;
  };

  const handleLogout = async () => {
    await logout();
    onCloseMobileMenu();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/10 bg-white/95 backdrop-blur-xl transition duration-300">
      <div className="mx-auto flex w-full max-w-[1920px] items-center justify-between gap-2 px-2 py-2 sm:px-6 lg:px-8">
        <button type="button" onClick={onToggleMobileMenu} className="p-2.5 text-black lg:hidden">
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Link to="/" className={`text-base font-semibold uppercase tracking-[0.3em] sm:text-xl lg:mr-auto ${headerTextClass}`}>EZZETA</Link>
        <nav className="hidden flex-1 items-center justify-center gap-6 text-sm font-medium uppercase tracking-[0.24em] lg:flex">{navigationLinks.map(renderNavItem)}</nav>
        <div className="flex items-center gap-2 sm:gap-3">
          {!isAuthenticated ? <button type="button" onClick={onOpenLogin} className={`hidden border px-3 py-2 text-sm font-medium transition sm:inline-flex ${headerButtonClass}`}>Iniciar sesión</button> : null}
          {isAuthenticated && user ? (
            <div className="relative" ref={userMenuRef}>
              <button type="button" onClick={onToggleUserMenu} className={`hidden items-center gap-2 border px-3 py-2 text-sm font-medium transition sm:inline-flex ${headerButtonClass}`}>Hola, {user.username}</button>
              <AnimatePresence>
                {isUserMenuOpen ? <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="absolute right-0 mt-2 w-48 rounded-xl border border-black/10 bg-white shadow-lg">
                  <button type="button" onClick={onOpenAccount} className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-black transition hover:bg-red-50 hover:text-red-600"><User size={16} />Mi cuenta</button>
                  <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 border-t border-black/10 px-4 py-3 text-sm font-medium text-black transition hover:bg-red-50 hover:text-red-600"><LogOut size={16} />Cerrar sesión</button>
                </motion.div> : null}
              </AnimatePresence>
            </div>
          ) : null}
          <div className="relative hidden h-full md:block" ref={searchRef}>
            <form onSubmit={onSearch} className={`hidden items-center gap-2 px-3 py-2 text-sm md:flex ${headerSearchClass}`}><Search size={16} className="text-black" /><input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Buscar" className="w-40 bg-transparent outline-none placeholder:text-current/40 md:w-52 lg:w-72" /></form>
            <SearchDropdown products={searchResults} search={search} onClose={() => onSearchChange('')} onViewAll={() => { navigate(`/tienda?search=${encodeURIComponent(search)}`); onSearchChange(''); }} onSelectProduct={(product) => { navigate(`/producto/${product.slug}`); onSearchChange(''); }} />
          </div>
          <Link to="/deseados" className={`relative border rounded-full p-2.5 ${headerIconButtonClass}`}><Heart size={18} />{favorites.length > 0 ? <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-semibold text-white">{favorites.length}</span> : null}</Link>
          <button type="button" aria-label="Carrito" className={`relative border rounded-full p-2.5 ${headerIconButtonClass}`} onClick={() => (onOpenCart ? onOpenCart() : toggleCart())}><ShoppingBag size={18} />{cart.length > 0 ? <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-semibold text-white">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span> : null}</button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen ? <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden border-b border-black/10 bg-white lg:hidden">
          <div className="flex flex-col gap-3 px-4 py-3 sm:px-6">
            <form onSubmit={(event) => { onSearch(event); onCloseMobileMenu(); }} className="flex items-center gap-2 border border-black/10 bg-white px-3 py-2 text-sm text-black/60"><Search size={16} /><input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Buscar productos" className="w-full bg-transparent outline-none placeholder:text-black/40" /></form>
            <div className="flex flex-col gap-2 sm:flex-row">
              {isAuthenticated && user ? <>
              <button type="button" onClick={() => { onOpenAccount(); onCloseMobileMenu(); }} className="flex-1 flex items-center justify-center gap-2 border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:border-red-600 hover:text-red-600">
                <User size={16} />Mi cuenta
              </button>
              <button type="button" onClick={handleLogout} className="flex-1 flex items-center justify-center gap-2 border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:border-red-600 hover:text-red-600">
                <LogOut size={16} />Cerrar sesión
              </button>
              </> 
              : 
              <button type="button" onClick={() => { onOpenLogin(); onCloseMobileMenu(); }} className="flex-1 bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600">Iniciar sesión</button>}
            </div>
            <nav className="flex flex-col divide-y divide-black/10 border border-black/10 bg-white">{navigationLinks.map((link) => link.external ? 
            <a key={link.href} href={link.href} target="_blank" rel="noreferrer" onClick={onCloseMobileMenu} className="block px-4 py-3 text-sm font-medium uppercase tracking-[0.18em] text-black/70 transition hover:bg-red-50 hover:text-red-600">{link.label}</a> 
            : 
            <NavLink key={link.href} to={link.href} onClick={onCloseMobileMenu} className={({ isActive }) => `block px-4 py-3 text-sm font-medium uppercase tracking-[0.18em] transition ${isActive ? 'bg-black text-white' : 'text-black/70 hover:bg-red-50 hover:text-red-600'}`}>{link.label}</NavLink>)}
            </nav>
          </div>
        </motion.div> : null}
      </AnimatePresence>
    </header>
  );
};
