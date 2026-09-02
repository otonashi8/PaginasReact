import { AnimatePresence, motion } from 'framer-motion';
import { Heart, LogOut, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent, type ChangeEvent } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { CartDrawer } from './common/CartDrawer';
import { SearchDropdown } from './SearchDropdown';
import { getProducts } from '../services/contentService';
import { StorageKeys } from '../storage';
import { getPeruDepartments, getPeruDistricts, getPeruProvinces } from '../services/peruUbigeoService';

type NavigationLink = {
  label: string;
  href: string;
  external?: boolean;
};

const navigationLinks: NavigationLink[] = [
  { label: 'Inicio', href: '/' },
  { label: '3x100', href: 'https://3x100.pe', external: true },
  { label: 'Tienda', href: '/tienda' },
  { label: 'Packs🔥', href: '/packs' },
  { label: 'Contacto', href: '/contacto' },
];

export const Header = ({ onOpenCart }: { onOpenCart?: () => void } = {}) => {
  const { favorites, cart, toggleCart } = useWishlist();
  const { user, isAuthenticated, logout, login, register } = useAuth();
  const navigate = useNavigate();

  const products = getProducts();
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState<'login' | 'register'>('login');
  const [isScrolled, setIsScrolled] = useState(false);
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [savedAccountData, setSavedAccountData] = useState<{ direcciones: Array<Record<string, unknown>>; metodosPago: Array<Record<string, unknown>> }>({ direcciones: [], metodosPago: [] });
  const [accountSection, setAccountSection] = useState<'payments' | 'addresses'>('payments');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | number | null>(null);
  const [editingPaymentId, setEditingPaymentId] = useState<string | number | null>(null);
  const [addressDraft, setAddressDraft] = useState<Record<string, string>>({
    nombre: '',
    departamento: '',
    provincia: '',
    distrito: '',
    direccion: '',
    referencia: '',
  });
  const [paymentDraft, setPaymentDraft] = useState<Record<string, string>>({
    type: 'tarjeta',
    ownerName: '',
    yapeNumber: '',
    cardNumber: '',
    cardExpiry: '',
    last4: '',
  });
  const peruDepartments = getPeruDepartments();
  const peruProvinces = getPeruProvinces(addressDraft.departamento);
  const peruDistricts = getPeruDistricts(addressDraft.departamento, addressDraft.provincia);
  const resolveDisplayLocation = (direction: Record<string, unknown>) => {
    const departmentCode = typeof direction.departamentoCode === 'string' ? direction.departamentoCode : '';
    const provinceCode = typeof direction.provinciaCode === 'string' ? direction.provinciaCode : typeof direction.provincia === 'string' ? direction.provincia : '';
    const districtCode = typeof direction.distritoCode === 'string' ? direction.distritoCode : typeof direction.distrito === 'string' ? direction.distrito : '';

    const formatUbigeo = (value: string, fallback?: string) => {
      if (!value) return fallback ?? '';
      const normalized = value.trim();
      if (/^[0-9]{2}$/.test(normalized) && departmentCode) {
        const ubigeo = (window as typeof window & { __ezzetaUbigeo?: Array<Record<string, string>> }).__ezzetaUbigeo ?? [];
        if (ubigeo.length === 0) return fallback ?? normalized;
        const match = ubigeo.find((item) => item.departamento === departmentCode && item.provincia === normalized && item.distrito === '00');
        return match?.nombre ?? fallback ?? normalized;
      }
      return value;
    };

    const departmentName = typeof direction.departamento === 'string' && direction.departamento.trim() ? direction.departamento : (departmentCode || '');
    const provinceName = formatUbigeo(String(provinceCode), typeof direction.provincia === 'string' ? direction.provincia : undefined);
    const districtName = typeof direction.distrito === 'string' && direction.distrito.trim() ? direction.distrito : (districtCode || '');

    return {
      department: departmentName,
      province: provinceName,
      district: districtName,
    };
  };
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    ruc: '',
  });
  const [registerError, setRegisterError] = useState('');
  const [isRegisterSubmitting, setIsRegisterSubmitting] = useState(false);

  const updateSavedAccountEntry = (key: 'direcciones' | 'metodosPago', id: string | number, nextValue: Record<string, unknown>) => {
    const rawUsers = window.localStorage.getItem(StorageKeys.USERS);
    const users = rawUsers ? JSON.parse(rawUsers) as Array<Record<string, unknown>> : [];
    const normalizedUsers = Array.isArray(users) ? users : [];
    const nextUsers = normalizedUsers.map((entry) => {
      const currentItems = Array.isArray(entry[key]) ? (entry[key] as Array<Record<string, unknown>>) : [];
      const updatedItems = currentItems.map((item) => String((item as { id?: string | number }).id ?? '') === String(id) ? { ...item, ...nextValue, id } : item);
      return { ...entry, [key]: updatedItems };
    });
    window.localStorage.setItem(StorageKeys.USERS, JSON.stringify(nextUsers));
    window.dispatchEvent(new Event('ezzeta:account-data-changed'));
    const updatedRead = () => {
      const currentRaw = window.localStorage.getItem(StorageKeys.USERS);
      const currentUsers = currentRaw ? JSON.parse(currentRaw) as Array<Record<string, unknown>> : [];
      const currentNormalized = Array.isArray(currentUsers) ? currentUsers : [];
      const currentMatches = currentNormalized.filter((entry) => {
        const email = typeof entry.email === 'string' ? entry.email.toLowerCase() : '';
        const username = typeof entry.username === 'string' ? entry.username.toLowerCase() : '';
        const phone = typeof entry.phone === 'string' ? entry.phone : '';
        return Boolean((user?.id && String(entry.id ?? '') === String(user.id)) || email === String(user?.email ?? '').toLowerCase() || username === String(user?.username ?? '').toLowerCase() || phone === String(user?.phone ?? ''));
      });
      const merged = (currentMatches.length > 0 ? currentMatches : currentNormalized.slice(0, 1)).flatMap((entry) => Array.isArray(entry[key]) ? (entry[key] as Array<Record<string, unknown>>) : []);
      const deduped = new Map<string, Record<string, unknown>>();
      merged.forEach((entry) => {
        const entryId = String((entry as { id?: string | number }).id ?? '');
        if (entryId) deduped.set(entryId, entry);
      });
      setSavedAccountData((current) => ({ ...current, [key]: Array.from(deduped.values()) }));
    };
    updatedRead();
  };

  const deleteSavedAccountEntry = (key: 'direcciones' | 'metodosPago', id: string | number) => {
    const rawUsers = window.localStorage.getItem(StorageKeys.USERS);
    const users = rawUsers ? JSON.parse(rawUsers) as Array<Record<string, unknown>> : [];
    const normalizedUsers = Array.isArray(users) ? users : [];
    const nextUsers = normalizedUsers.map((entry) => {
      const currentItems = Array.isArray(entry[key]) ? (entry[key] as Array<Record<string, unknown>>) : [];
      return { ...entry, [key]: currentItems.filter((item) => String((item as { id?: string | number }).id ?? '') !== String(id)) };
    });
    window.localStorage.setItem(StorageKeys.USERS, JSON.stringify(nextUsers));
    window.dispatchEvent(new Event('ezzeta:account-data-changed'));
    const currentMatches = nextUsers.filter((entry) => {
      const email = typeof entry.email === 'string' ? entry.email.toLowerCase() : '';
      const username = typeof entry.username === 'string' ? entry.username.toLowerCase() : '';
      const phone = typeof entry.phone === 'string' ? entry.phone : '';
      return Boolean((user?.id && String(entry.id ?? '') === String(user.id)) || email === String(user?.email ?? '').toLowerCase() || username === String(user?.username ?? '').toLowerCase() || phone === String(user?.phone ?? ''));
    });
    const merged = (currentMatches.length > 0 ? currentMatches : nextUsers.slice(0, 1)).flatMap((entry) => Array.isArray(entry[key]) ? (entry[key] as Array<Record<string, unknown>>) : []);
    const deduped = new Map<string, Record<string, unknown>>();
    merged.forEach((entry) => {
      const entryId = String((entry as { id?: string | number }).id ?? '');
      if (entryId) deduped.set(entryId, entry);
    });
    setSavedAccountData((current) => ({ ...current, [key]: Array.from(deduped.values()) }));
  };

  const saveEditedAddress = () => {
    if (!editingAddressId) return;
    const nextValue: Record<string, unknown> = {
      id: editingAddressId,
      nombre: addressDraft.nombre || 'Ubicación guardada',
      departamento: addressDraft.departamento,
      departamentoCode: peruDepartments.find((item) => item.name === addressDraft.departamento)?.code ?? '',
      provincia: addressDraft.provincia,
      provinciaCode: peruProvinces.find((item) => item.name === addressDraft.provincia)?.code.split('-').at(-1) ?? '',
      distrito: addressDraft.distrito,
      distritoCode: peruDistricts.find((item) => item.name === addressDraft.distrito)?.code.split('-').at(-1) ?? '',
      direccion: addressDraft.direccion,
      referencia: addressDraft.referencia,
    };
    updateSavedAccountEntry('direcciones', editingAddressId, nextValue);
    setEditingAddressId(null);
    setAddressDraft({ nombre: '', departamento: '', provincia: '', distrito: '', direccion: '', referencia: '' });
  };

  const saveEditedPayment = () => {
    if (!editingPaymentId) return;
    const type = paymentDraft.type === 'yape' ? 'yape' : 'tarjeta';
    const nextValue: Record<string, unknown> = {
      id: editingPaymentId,
      type,
      ownerName: paymentDraft.ownerName,
      yapeNumber: paymentDraft.yapeNumber,
      cardNumber: paymentDraft.cardNumber,
      cardExpiry: paymentDraft.cardExpiry,
      last4: paymentDraft.last4 || paymentDraft.cardNumber.replace(/\D/g, '').slice(-4),
    };
    updateSavedAccountEntry('metodosPago', editingPaymentId, nextValue);
    setEditingPaymentId(null);
    setPaymentDraft({ type: 'tarjeta', ownerName: '', yapeNumber: '', cardNumber: '', cardExpiry: '', last4: '' });
  };

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];

    const text = search.toLowerCase();

    return products
      .filter((product) =>
        product.name.toLowerCase().includes(text) ||
        product.category.toLowerCase().includes(text) ||
        product.subcategory.toLowerCase().includes(text)
      )
      .slice(0, 6);
  }, [search, products]);

  useEffect(() => {
    if (!isAccountModalOpen) return;
    const firstPayment = savedAccountData.metodosPago[0];
    if (firstPayment) {
      const type = typeof firstPayment.type === 'string' ? firstPayment.type : '';
      const yapeNumber = typeof firstPayment.yapeNumber === 'string' ? firstPayment.yapeNumber : '';
      const cardNumber = typeof firstPayment.cardNumber === 'string' ? firstPayment.cardNumber : '';
      setSelectedPaymentId(String((firstPayment as { id?: string | number }).id ?? '0'));
      setPaymentDraft({ type: type === 'yape' || yapeNumber ? 'yape' : 'tarjeta', ownerName: typeof firstPayment.ownerName === 'string' ? firstPayment.ownerName : '', yapeNumber, cardNumber, cardExpiry: typeof firstPayment.cardExpiry === 'string' ? firstPayment.cardExpiry : '', last4: typeof firstPayment.last4 === 'string' ? firstPayment.last4 : cardNumber.replace(/\D/g, '').slice(-4) });
    }
    const firstAddress = savedAccountData.direcciones[0];
    if (firstAddress) {
      const firstLocation = resolveDisplayLocation(firstAddress);
      setSelectedAddressId(String((firstAddress as { id?: string | number }).id ?? '0'));
      setAddressDraft({ nombre: typeof firstAddress.nombre === 'string' ? firstAddress.nombre : '', departamento: firstLocation.department, provincia: firstLocation.province, distrito: firstLocation.district, direccion: typeof firstAddress.direccion === 'string' ? firstAddress.direccion : '', referencia: typeof firstAddress.referencia === 'string' ? firstAddress.referencia : '' });
    }
  }, [isAccountModalOpen, savedAccountData]);

  useEffect(() => {
    const readSavedAccountData = () => {
      if (!isAuthenticated || !user) {
        setSavedAccountData({ direcciones: [], metodosPago: [] });
        return;
      }

      try {
        const rawUsers = window.localStorage.getItem(StorageKeys.USERS);
        const users = rawUsers ? JSON.parse(rawUsers) as Array<Record<string, unknown>> : [];
        const normalizedUsers = Array.isArray(users) ? users : [];

        const authRaw = window.localStorage.getItem(StorageKeys.AUTH);
        const authUser = authRaw ? (() => {
          try {
            const auth = JSON.parse(authRaw) as Record<string, unknown>;
            return (auth?.user ?? null) as Record<string, unknown> | null;
          } catch {
            return null;
          }
        })() : null;

        const candidateValues = [
          String(user.id ?? authUser?.id ?? '').trim(),
          String(user.email ?? authUser?.email ?? '').trim().toLowerCase(),
          String(user.username ?? authUser?.username ?? '').trim().toLowerCase(),
          String(user.phone ?? authUser?.phone ?? '').trim(),
          String(authUser?.id ?? '').trim(),
          String(authUser?.email ?? '').trim().toLowerCase(),
          String(authUser?.username ?? '').trim().toLowerCase(),
          String(authUser?.phone ?? '').trim(),
        ].filter(Boolean);

        const matches = normalizedUsers.filter((entry) => {
          const id = String(entry.id ?? '').trim();
          const email = typeof entry.email === 'string' ? entry.email.toLowerCase() : '';
          const username = typeof entry.username === 'string' ? entry.username.toLowerCase() : '';
          const phone = typeof entry.phone === 'string' ? entry.phone : '';
          return candidateValues.some((value) => value && (id === value || email === value || username === value || phone === value));
        });

        const candidateUsers = matches.length > 0 ? matches : normalizedUsers.slice(0, 1);

        const mergeSavedEntries = (key: 'direcciones' | 'metodosPago') => {
          const collected = candidateUsers.flatMap((entry) => Array.isArray(entry[key]) ? (entry[key] as Array<Record<string, unknown>>) : []);
          const seen = new Map<string, Record<string, unknown>>();
          collected.forEach((entry) => {
            const entryId = String((entry as { id?: string | number }).id ?? '');
            if (entryId) {
              seen.set(entryId, entry);
            } else {
              seen.set(`fallback-${seen.size}`, entry);
            }
          });
          return Array.from(seen.values());
        };

        setSavedAccountData({
          direcciones: mergeSavedEntries('direcciones'),
          metodosPago: mergeSavedEntries('metodosPago'),
        });
      } catch {
        setSavedAccountData({ direcciones: [], metodosPago: [] });
      }
    };

    readSavedAccountData();
    window.addEventListener('storage', readSavedAccountData);
    window.addEventListener('ezzeta:account-data-changed', readSavedAccountData);

    return () => {
      window.removeEventListener('storage', readSavedAccountData);
      window.removeEventListener('ezzeta:account-data-changed', readSavedAccountData);
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearch('');
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleAuthModalRequest = (event: Event) => {
      const mode = (event as CustomEvent<{ mode?: 'login' | 'register' }>).detail?.mode;
      if (mode !== 'login' && mode !== 'register') return;

      setLoginModalMode(mode);
      setIsLoginModalOpen(true);
    };

    window.addEventListener('ezzeta:open-auth-modal', handleAuthModalRequest);
    return () => window.removeEventListener('ezzeta:open-auth-modal', handleAuthModalRequest);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop || window.scrollY || document.body.scrollTop;
      setIsScrolled(scrollTop > 0);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerTextClass = 'text-black';
  const headerBackgroundClass = 'border-white/10 bg-transparent';
  const headerButtonClass = 'border-white bg-white/60 text-black hover:border-red-600 hover:text-red-600';
  const headerIconButtonClass = 'border-black/20 bg-white/80 text-black hover:border-red-500 hover:text-red-500';
  const headerSearchClass = 'border-white/20 text-white placeholder:text-black/70';
  const headerNavLinkClass = (isActive: boolean) =>
    isActive
      ? 'text-black'
      : 'text-black/80 hover:text-red-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]';

  const renderNavItem = (link: NavigationLink) => {
    const baseClassName = 'transition';

    if (link.external) {
      return (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className={`${baseClassName} ${isScrolled ? 'text-black/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] hover:text-red-400' : 'text-black/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] hover:text-red-600'}`}
        >
          {link.label}
        </a>
      );
    }

    return (
      <NavLink
        key={link.href}
        to={link.href}
        className={({ isActive }) => `${baseClassName} ${headerNavLinkClass(isActive)}`}
      >
        {link.label}
      </NavLink>
    );
  };

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError('');
    setIsLoginSubmitting(true);

    try {
      await login({ identifier: loginIdentifier.trim(), password: loginPassword });
      setLoginIdentifier('');
      setLoginPassword('');
      setIsLoginModalOpen(false);
      setLoginModalMode('login');
      navigate('/');
    } catch (submitError) {
      setLoginError(submitError instanceof Error ? submitError.message : 'No se pudo iniciar sesión.');
    } finally {
      setIsLoginSubmitting(false);
    }
  };

  const handleRegisterChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;

    setRegisterForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRegisterError('');
    setIsRegisterSubmitting(true);

    try {
      await register({
        ...registerForm,
        ruc: registerForm.ruc?.trim() || undefined,
      });
      setIsLoginModalOpen(false);
      setLoginModalMode('login');
      navigate('/');
    } catch (submitError) {
      setRegisterError(submitError instanceof Error ? submitError.message : 'No se pudo completar el registro.');
    } finally {
      setIsRegisterSubmitting(false);
    }
  };

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();

    if (!search.trim()) {
      navigate('/tienda');
      return;
    }

    navigate(`/tienda?search=${encodeURIComponent(search.trim())}`);
    setSearch('');
  };

  return (
    <>
      <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-xl transition duration-300 ${headerBackgroundClass}`}>
        <div className="mx-auto flex w-full max-w-[1920px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`rounded-full border p-2.5 ${isScrolled ? 'border-white/20 bg-white/5 text-white' : 'border-zinc-200 bg-white text-black'} lg:hidden`}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link to="/" className={`text-base font-semibold uppercase tracking-[0.3em] sm:text-xl lg:mr-auto ${headerTextClass}`}>
            EZZETA
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-6 text-sm font-medium uppercase tracking-[0.24em] lg:flex">
            {navigationLinks.map((link) => renderNavItem(link))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  setLoginIdentifier('');
                  setLoginPassword('');
                  setLoginError('');
                  setLoginModalMode('login');
                  setIsLoginModalOpen(true);
                }}
                className={`hidden rounded-full border px-3 py-2 text-sm font-medium transition sm:inline-flex ${headerButtonClass}`}
              >
                Iniciar sesión
              </button>
            ) : null}

            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`hidden items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition sm:inline-flex ${headerButtonClass}`}
                >
                  Hola, {user.username}
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 rounded-xl border border-black/10 bg-white shadow-lg"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountModalOpen(true);
                          setIsUserMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-black transition hover:bg-red-50 hover:text-red-600"
                      >
                        <User size={16} />
                        Mi cuenta
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await logout();
                          setIsUserMenuOpen(false);
                          navigate('/');
                        }}
                        className="flex w-full items-center gap-2 border-t border-black/10 px-4 py-3 text-sm font-medium text-black transition hover:bg-red-50 hover:text-red-600"
                      >
                        <LogOut size={16} />
                        Cerrar sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : null}

            <div className="relative hidden h-full md:block" ref={searchRef}>
              <form
                onSubmit={handleSearch}
                className={`hidden items-center gap-2 rounded-full px-3 py-2 text-sm md:flex ${headerSearchClass}`}
              >
                <Search size={16} className="text-black" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar"
                  className="w-40 bg-transparent outline-none placeholder:text-current/40 md:w-52 lg:w-72"
                />
              </form>
              <SearchDropdown
                products={searchResults}
                search={search}
                onClose={() => setSearch('')}
                onViewAll={() => {
                  navigate(`/tienda?search=${encodeURIComponent(search)}`);
                  setSearch('');
                }}
                onSelectProduct={(product) => {
                  navigate(`/producto/${product.slug}`);
                  setSearch('');
                }}
              />
            </div>

            <Link to="/deseados" className={`relative rounded-full border p-2.5 ${headerIconButtonClass}`}>
              <Heart size={18} />
              {favorites.length > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-semibold text-white">
                  {favorites.length}
                </span>
              ) : null}
            </Link>

            <button
              type="button"
              aria-label="Carrito"
              className={`relative rounded-full border p-2.5 ${headerIconButtonClass}`}
              onClick={() => (onOpenCart ? onOpenCart() : toggleCart())}
            >
              <ShoppingBag size={18} />
              {cart.length > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-semibold text-white">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-b border-black/10 bg-white lg:hidden"
            >
              <div className="flex flex-col gap-3 px-4 py-3 sm:px-6">
                <form
                  onSubmit={(event) => {
                    handleSearch(event);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-sm text-black/60"
                >
                  <Search size={16} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar productos"
                    className="w-full bg-transparent outline-none placeholder:text-black/40"
                  />
                </form>

                <div className="flex flex-col gap-2 sm:flex-row">
                  {isAuthenticated && user ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountModalOpen(true);
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:border-red-600 hover:text-red-600"
                      >
                        <User size={16} />
                        Mi cuenta
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await logout();
                          setIsMobileMenuOpen(false);
                          navigate('/');
                        }}
                        className="flex-1 flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:border-red-600 hover:text-red-600"
                      >
                        <LogOut size={16} />
                        Cerrar sesión
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setLoginIdentifier('');
                        setLoginPassword('');
                        setLoginError('');
                        setLoginModalMode('login');
                        setIsLoginModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex-1 rounded-full bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
                    >
                      Iniciar sesión
                    </button>
                  )}
                </div>

                <nav className="flex flex-col divide-y divide-black/10 rounded-2xl border border-black/10 bg-white">
                  {navigationLinks.map((link) => {
                    if (link.external) {
                      return (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block rounded-xl px-4 py-3 text-sm font-medium uppercase tracking-[0.18em] text-black/70 transition hover:bg-red-50 hover:text-red-600"
                        >
                          {link.label}
                        </a>
                      );
                    }

                    return (
                      <NavLink
                        key={link.href}
                        to={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `block rounded-xl px-4 py-3 text-sm font-medium uppercase tracking-[0.18em] transition ${
                            isActive ? 'bg-black text-white' : 'text-black/70 hover:bg-red-50 hover:text-red-600'
                          }`
                        }
                      >
                        {link.label}
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <CartDrawer />

      <AnimatePresence>
        {isAccountModalOpen && isAuthenticated && user ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-black/60 p-3 sm:px-4 sm:py-6"
            onClick={() => setIsAccountModalOpen(false)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-5xl max-h-[92dvh] overflow-y-auto rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-2xl sm:rounded-[2rem] sm:p-8"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-black/60">Cuenta</p>
                  <h2 className="mt-2 text-2xl font-semibold text-black">{user.username}</h2>
                </div>
                <button type="button" onClick={() => setIsAccountModalOpen(false)} className="rounded-full border border-black/10 p-2 text-black/70 hover:border-red-600 hover:text-red-600">
                  <X size={18} />
                </button>
              </div>

              <div className="mb-6 grid grid-cols-2 rounded-xl border border-black/10 bg-[#fffaf9] p-1">
                <button type="button" onClick={() => setAccountSection('payments')} className={`rounded-lg px-3 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition ${accountSection === 'payments' ? 'bg-black text-white' : 'text-black/60 hover:text-red-600'}`}>
                  Métodos de pago
                </button>
                <button type="button" onClick={() => setAccountSection('addresses')} className={`rounded-lg px-3 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition ${accountSection === 'addresses' ? 'bg-black text-white' : 'text-black/60 hover:text-red-600'}`}>
                  Libreta de direcciones
                </button>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <section style={{ display: accountSection === 'payments' ? undefined : 'none' }} className="min-w-0 rounded-2xl border border-black/10 bg-[#ffffff] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-black/80">Métodos de pago</h3>
                    <span className="text-xs text-black/45">{savedAccountData.metodosPago.length} guardados</span>
                  </div>
                  {savedAccountData.metodosPago.length > 0 ? (
                    <div className="mt-4 max-h-[24rem] space-y-3 overflow-y-auto pr-2">
                      {savedAccountData.metodosPago.map((metodo, index) => {
                        const id = String((metodo as { id?: string | number }).id ?? `${index}`);
                        const type = typeof metodo.type === 'string' ? metodo.type : '';
                        const yapeNumber = typeof metodo.yapeNumber === 'string' ? metodo.yapeNumber : '';
                        const cardNumber = typeof metodo.cardNumber === 'string' ? metodo.cardNumber : '';
                        const ownerName = typeof metodo.ownerName === 'string' ? metodo.ownerName : '';
                        const last4 = typeof metodo.last4 === 'string' ? metodo.last4 : cardNumber.replace(/\D/g, '').slice(-4);
                        const isYape = type === 'yape' || Boolean(yapeNumber);

                        return (
                          <div key={`${type}-${id}`} onClick={() => { setSelectedPaymentId(id); setEditingPaymentId(id); setPaymentDraft({ type: isYape ? 'yape' : 'tarjeta', ownerName, yapeNumber, cardNumber, cardExpiry: typeof metodo.cardExpiry === 'string' ? metodo.cardExpiry : '', last4 }); }} className={`cursor-pointer rounded-xl border p-3 text-sm text-black/80 transition ${id === (selectedPaymentId ?? String((savedAccountData.metodosPago[0] as { id?: string | number }).id ?? '0')) ? 'border-red-600 bg-[#fff4f1]' : 'border-black/10 bg-white hover:border-red-300'}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-black">{isYape ? 'Yape' : 'Tarjeta'}</p>
                                <p className="mt-1">{isYape ? `Número: ${yapeNumber || 'No disponible'}` : `Titular: ${ownerName || 'No disponible'}`}</p>
                                {!isYape ? <p className="mt-1 text-black/60">•••• {last4 || '0000'}</p> : null}
                              </div>
                              <span className="rounded-full bg-[#fff4f1] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-600">Guardado</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-black/80">Todavía no tienes métodos de pago guardados.</p>
                  )}
                  {editingPaymentId !== null ? (
                    <div className="mt-4 hidden space-y-3 rounded-xl border border-black/10 bg-[#fffaf9] p-3">
                      <select value={paymentDraft.type} onChange={(event) => setPaymentDraft((current) => ({ ...current, type: event.target.value }))} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm">
                        <option value="tarjeta">Tarjeta</option>
                        <option value="yape">Yape</option>
                      </select>
                      {paymentDraft.type === 'tarjeta' ? (
                        <>
                          <input value={paymentDraft.ownerName} onChange={(event) => setPaymentDraft((current) => ({ ...current, ownerName: event.target.value }))} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm" placeholder="Titular" />
                          <input value={paymentDraft.cardNumber} onChange={(event) => setPaymentDraft((current) => ({ ...current, cardNumber: event.target.value, last4: event.target.value.replace(/\D/g, '').slice(-4) }))} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm" placeholder="Número de tarjeta" />
                          <input value={paymentDraft.cardExpiry} onChange={(event) => setPaymentDraft((current) => ({ ...current, cardExpiry: event.target.value }))} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm" placeholder="Fecha de caducidad (MM/AA)" />
                        </>
                      ) : (
                        <input value={paymentDraft.yapeNumber} onChange={(event) => setPaymentDraft((current) => ({ ...current, yapeNumber: event.target.value }))} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm" placeholder="Número de Yape" />
                      )}
                      <div className="flex gap-2">
                        <button type="button" onClick={saveEditedPayment} className="rounded-full bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600">Guardar</button>
                        <button type="button" onClick={() => { setEditingPaymentId(null); setPaymentDraft({ type: 'tarjeta', ownerName: '', yapeNumber: '', cardNumber: '', cardExpiry: '', last4: '' }); }} className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-black">Cancelar</button>
                      </div>
                    </div>
                  ) : null}
                </section>

                <section style={{ display: accountSection === 'payments' ? undefined : 'none' }} className="min-w-0 rounded-2xl border border-black/10 bg-[#ffffff] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/50">Información del método</p>
                  {savedAccountData.metodosPago.length > 0 ? (() => {
                    const selected = savedAccountData.metodosPago.find((metodo, index) => String((metodo as { id?: string | number }).id ?? `${index}`) === (selectedPaymentId ?? String((savedAccountData.metodosPago[0] as { id?: string | number }).id ?? '0'))) ?? savedAccountData.metodosPago[0];
                    const type = typeof selected.type === 'string' ? selected.type : '';
                    const yapeNumber = typeof selected.yapeNumber === 'string' ? selected.yapeNumber : '';
                    const isYape = type === 'yape' || Boolean(yapeNumber);
                    const selectedId = String((selected as { id?: string | number }).id ?? 0);
                    return (
                      <div className="mt-4 text-sm text-black/80">
                        <p className="text-xl font-semibold text-black">{isYape ? 'Yape' : 'Tarjeta guardada'}</p>
                        <div className="mt-4 space-y-3">
                          {isYape ? <input value={paymentDraft.yapeNumber} onChange={(event) => setPaymentDraft((current) => ({ ...current, yapeNumber: event.target.value }))} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm" placeholder="Número de Yape" /> : <>
                            <input value={paymentDraft.ownerName} onChange={(event) => setPaymentDraft((current) => ({ ...current, ownerName: event.target.value }))} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm" placeholder="Titular" />
                            <input value={paymentDraft.cardNumber} onChange={(event) => setPaymentDraft((current) => ({ ...current, cardNumber: event.target.value, last4: event.target.value.replace(/\D/g, '').slice(-4) }))} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm" placeholder="Número de tarjeta" />
                            <input value={paymentDraft.cardExpiry} onChange={(event) => setPaymentDraft((current) => ({ ...current, cardExpiry: event.target.value }))} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm" placeholder="Fecha de caducidad (MM/AA)" />
                          </>}
                        </div>
                        <div className="mt-6 flex gap-2">
                          <button type="button" onClick={saveEditedPayment} className="rounded-full bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600">Guardar</button>
                          <button type="button" onClick={() => setEditingPaymentId(null)} className="rounded-full border border-black/10 px-2.5 py-1 text-xs font-medium text-black">Cancelar</button>
                          <button type="button" onClick={() => deleteSavedAccountEntry('metodosPago', selectedId)} className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100">Eliminar</button>
                        </div>
                      </div>
                    );
                  })() : <p className="mt-4 text-sm text-black/80">Selecciona un método para ver su información.</p>}
                </section>

                <section style={{ display: accountSection === 'addresses' ? undefined : 'none' }} className="min-w-0 rounded-2xl border border-black/10 bg-[#ffffff] p-4 lg:col-span-2 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-6">
                  <div className="flex items-center justify-between gap-3 lg:col-span-2">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-black/80">Direcciones guardadas</h3>
                    <span className="text-xs text-black/45">Selecciona una ubicación</span>
                  </div>
                  {savedAccountData.direcciones.length > 0 ? (
                    <div className="mt-4 grid content-start items-start gap-2 self-start sm:grid-cols-2 lg:col-start-1 lg:grid-cols-1">
                      {savedAccountData.direcciones.map((direccion, index) => {
                        const id = String((direccion as { id?: string | number }).id ?? `${index}`);
                        const nombre = typeof direccion.nombre === 'string' ? direccion.nombre : `Ubicación ${index + 1}`;
                        const location = resolveDisplayLocation(direccion as Record<string, unknown>);
                        const isSelected = id === (selectedAddressId ?? String((savedAccountData.direcciones[0] as { id?: string | number }).id ?? '0'));

                        return (
                          <button key={`${nombre}-${id}`} type="button" onClick={() => { const selectedLocation = resolveDisplayLocation(direccion as Record<string, unknown>); setSelectedAddressId(id); setEditingAddressId(id); setAddressDraft({ nombre, departamento: selectedLocation.department, provincia: selectedLocation.province, distrito: selectedLocation.district, direccion: typeof direccion.direccion === 'string' ? direccion.direccion : '', referencia: typeof direccion.referencia === 'string' ? direccion.referencia : '' }); }} className={`h-[88px] self-start overflow-hidden rounded-xl border p-3 text-left text-sm transition ${isSelected ? 'border-red-600 bg-[#fff4f1]' : 'border-black/10 bg-white hover:border-red-300'}`}>
                            <p className="font-semibold text-black">{nombre}</p>
                            <p className="mt-1 text-black/60">{location.department} / {location.province} / {location.district}</p>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-black/80">Todavía no tienes direcciones guardadas.</p>
                  )}
                  {savedAccountData.direcciones.length > 0 ? (() => {
                    const selected = savedAccountData.direcciones.find((direccion, index) => String((direccion as { id?: string | number }).id ?? `${index}`) === (selectedAddressId ?? String((savedAccountData.direcciones[0] as { id?: string | number }).id ?? '0'))) ?? savedAccountData.direcciones[0];
                    const selectedIndex = savedAccountData.direcciones.indexOf(selected);
                    const selectedId = String((selected as { id?: string | number }).id ?? selectedIndex);
                    return (
                      <div className="mt-4 border-t border-black/10 pt-4 text-sm text-black/80 lg:col-start-2 lg:row-start-2 lg:mt-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/50">Información de ubicación</p>
                        <p className="mt-2 text-lg font-semibold text-black">{typeof selected.nombre === 'string' ? selected.nombre : `Ubicación ${selectedIndex + 1}`}</p>
                        <div className="mt-4 space-y-3">
                          <input value={addressDraft.nombre} onChange={(event) => setAddressDraft((current) => ({ ...current, nombre: event.target.value }))} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm" placeholder="Nombre de la dirección" />
                          <select value={addressDraft.departamento} onChange={(event) => setAddressDraft((current) => ({ ...current, departamento: event.target.value, provincia: '', distrito: '' }))} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm">
                            <option value="">Departamento</option>
                            {peruDepartments.map((item) => <option key={item.code} value={item.name}>{item.name}</option>)}
                          </select>
                          <select value={addressDraft.provincia} onChange={(event) => setAddressDraft((current) => ({ ...current, provincia: event.target.value, distrito: '' }))} disabled={!addressDraft.departamento} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm disabled:bg-black/5">
                            <option value="">Provincia</option>
                            {peruProvinces.map((item) => <option key={item.code} value={item.name}>{item.name}</option>)}
                          </select>
                          <select value={addressDraft.distrito} onChange={(event) => setAddressDraft((current) => ({ ...current, distrito: event.target.value }))} disabled={!addressDraft.provincia} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm disabled:bg-black/5">
                            <option value="">Distrito</option>
                            {peruDistricts.map((item) => <option key={item.code} value={item.name}>{item.name}</option>)}
                          </select>
                          <input value={addressDraft.direccion} onChange={(event) => setAddressDraft((current) => ({ ...current, direccion: event.target.value }))} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm" placeholder="Dirección" />
                          <input value={addressDraft.referencia} onChange={(event) => setAddressDraft((current) => ({ ...current, referencia: event.target.value }))} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm" placeholder="Referencia" />
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button type="button" onClick={saveEditedAddress} className="rounded-full bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600">Guardar</button>
                          <button type="button" onClick={() => setEditingAddressId(null)} className="rounded-full border border-black/10 px-2.5 py-1 text-xs font-medium text-black">Cancelar</button>
                          <button type="button" onClick={() => deleteSavedAccountEntry('direcciones', selectedId)} className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100">Eliminar</button>
                        </div>
                      </div>
                    );
                  })() : null}
                  {editingAddressId !== null ? (
                    <div className="mt-4 hidden space-y-3 rounded-xl border border-black/10 bg-[#fffaf9] p-3">
                      <input value={addressDraft.nombre} onChange={(event) => setAddressDraft((current) => ({ ...current, nombre: event.target.value }))} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm" placeholder="Nombre de la dirección" />
                      <select value={addressDraft.departamento} onChange={(event) => setAddressDraft((current) => ({ ...current, departamento: event.target.value, provincia: '', distrito: '' }))} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm">
                        <option value="">Departamento</option>
                        {peruDepartments.map((item) => <option key={item.code} value={item.name}>{item.name}</option>)}
                      </select>
                      <select value={addressDraft.provincia} onChange={(event) => setAddressDraft((current) => ({ ...current, provincia: event.target.value, distrito: '' }))} disabled={!addressDraft.departamento} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm disabled:bg-black/5">
                        <option value="">Provincia</option>
                        {peruProvinces.map((item) => <option key={item.code} value={item.name}>{item.name}</option>)}
                      </select>
                      <select value={addressDraft.distrito} onChange={(event) => setAddressDraft((current) => ({ ...current, distrito: event.target.value }))} disabled={!addressDraft.provincia} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm disabled:bg-black/5">
                        <option value="">Distrito</option>
                        {peruDistricts.map((item) => <option key={item.code} value={item.name}>{item.name}</option>)}
                      </select>
                      <input value={addressDraft.direccion} onChange={(event) => setAddressDraft((current) => ({ ...current, direccion: event.target.value }))} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm" placeholder="Dirección" />
                      <input value={addressDraft.referencia} onChange={(event) => setAddressDraft((current) => ({ ...current, referencia: event.target.value }))} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm" placeholder="Referencia" />
                      <div className="flex gap-2">
                        <button type="button" onClick={saveEditedAddress} className="rounded-full bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600">Guardar</button>
                        <button type="button" onClick={() => { setEditingAddressId(null); setAddressDraft({ nombre: '', departamento: '', provincia: '', distrito: '', direccion: '', referencia: '' }); }} className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-black">Cancelar</button>
                      </div>
                    </div>
                  ) : null}
                </section>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isLoginModalOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-black/60 p-3 sm:px-4 sm:py-6"
            onClick={() => setIsLoginModalOpen(false)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-xl max-h-[92dvh] overflow-y-auto rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-2xl sm:rounded-[2rem] sm:p-8"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-5 text-center sm:mb-6 sm:text-left">
                {loginModalMode === 'login' ? (
                  <>
                    <p className="text-sm uppercase tracking-[0.3em] text-black/60">Iniciar sesión</p>
                    <h2 className="mt-2 text-2xl font-semibold text-black sm:text-3xl">Acceso a tu cuenta</h2>
                    <p className="mt-3 text-sm text-black/70">Inicia sesión para acceder a tus favoritos, direcciones guardadas y métodos de pago.</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm uppercase tracking-[0.3em] text-black/60">Registro de cuenta</p>
                    <h2 className="mt-2 text-2xl font-semibold text-black sm:text-3xl">Crear cuenta</h2>
                    <p className="mt-3 text-sm text-black/70">Registra tu cuenta y disfruta de beneficios exclusivos como favoritos y direcciones guardadas.</p>
                  </>
                )}
              </div>

              {loginModalMode === 'login' ? (
                <form className="space-y-3 sm:space-y-4" onSubmit={handleLoginSubmit}>
                <div>
                  <label className="mb-1 block text-sm font-medium text-black" htmlFor="header-login-identifier">
                    Correo electrónico
                  </label>
                  <input
                    id="header-login-identifier"
                    type="email"
                    value={loginIdentifier}
                    onChange={(event) => setLoginIdentifier(event.target.value)}
                    className="w-full rounded-full border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black focus:ring-2 focus:ring-red-500/20"
                    placeholder="correo@empresa.com"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-black" htmlFor="header-login-password">
                    Contraseña
                  </label>
                  <input
                    id="header-login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                    className="w-full rounded-full border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black focus:ring-2 focus:ring-red-500/20"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {loginError ? <p className="text-sm text-red-600">{loginError}</p> : null}

                <button
                  type="submit"
                  className="w-full rounded-full bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-black/50"
                  disabled={isLoginSubmitting}
                >{isLoginSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </button>
                </form>
              ) : (
                <form className="grid gap-4 sm:space-y-0" onSubmit={handleRegisterSubmit}>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-black" htmlFor="username">Usuario</label>
                    <input id="username" name="username" value={registerForm.username} onChange={handleRegisterChange} className="w-full rounded-full border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black" placeholder="Tu usuario" required />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-black" htmlFor="email">Correo</label>
                    <input id="email" name="email" type="email" value={registerForm.email} onChange={handleRegisterChange} className="w-full rounded-full border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black" placeholder="correo@empresa.com" required />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-black" htmlFor="password">Contraseña</label>
                    <input id="password" name="password" type="password" value={registerForm.password} onChange={handleRegisterChange} className="w-full rounded-full border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black" placeholder="••••••••" required />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-black" htmlFor="phone">Teléfono</label>
                    <input id="phone" name="phone" value={registerForm.phone} onChange={handleRegisterChange} className="w-full rounded-full border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black" placeholder="987654321" required />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-black" htmlFor="ruc">DNI/RUC/CE (opcional)</label>
                    <input id="ruc" name="ruc" value={registerForm.ruc} onChange={handleRegisterChange} className="w-full rounded-full border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black" placeholder="20600000000" />
                  </div>

                  {registerError ? <p className="text-sm text-red-600">{registerError}</p> : null}

                  <div className="sm:col-span-2">
                    <button type="submit" className="w-full rounded-full bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-black/50" disabled={isRegisterSubmitting}>
                      {isRegisterSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
                    </button>
                  </div>

                  <p className="mt-4 text-sm text-black/70 sm:col-span-2">
                    ¿Ya tienes cuenta?{' '}
                    <button type="button" onClick={() => setLoginModalMode('login')} className="font-medium text-red-600 hover:text-red-700">Iniciar sesión</button>
                  </p>
                </form>
              )}

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-black/10" />
                <span className="text-xs uppercase tracking-[0.25em] text-black/40">o</span>
                <div className="h-px flex-1 bg-black/10" />
              </div>

              {loginModalMode === 'login' ? (
                <>
                  <p className="text-center text-sm text-black/70 sm:text-left">¿No tienes cuenta aún?</p>
                  <button
                    type="button"
                    onClick={() => setLoginModalMode('register')}
                    className="mt-4 w-full block rounded-full border border-black/10 bg-white px-4 py-3 text-center text-sm font-medium text-black transition hover:border-red-600 hover:text-red-600 sm:w-auto"
                  >
                    Crear cuenta
                  </button>
                </>
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};
