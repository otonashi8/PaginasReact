import { Suspense, lazy, useEffect, useState, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { MainLayout } from './layouts/MainLayout';
import { isPageVisible } from './admin/Paginas/paginasStorage';
import PoliticaPrivacidadPage from './pages/PoliticaPrivacidadPage';
import TerminosCondicionesPage from './pages/TerminosCondicionesPage';
import CheckoutPage from './pages/CheckoutPage';
import UnetenosPage from './pages/UnetenosPage';

function PageVisibilityGate({ pageKey, children, fallback }: { pageKey: 'home' | 'store' | 'about' | 'contact' | 'faq' | 'privacy' | 'terms' | 'complaints' | 'favorites' | 'checkout' | 'unetenos'; children: ReactNode; fallback?: ReactNode }) {
  const [visible, setVisible] = useState(() => isPageVisible(pageKey));
  const location = useLocation();

  useEffect(() => {
    const sync = () => setVisible(isPageVisible(pageKey));
    sync();
    window.addEventListener('vitaela:pages-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('vitaela:pages-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, [pageKey, location.pathname]);

  if (!visible) {
    return <>{fallback ?? (
      <main className="flex min-h-[60vh] items-center justify-center bg-white px-4 py-8 text-center sm:px-6">
          <div className="w-full max-w-md border border-zinc-200 bg-white p-6 shadow-[0_18px_45px_rgba(0,0,0,0.04)] sm:p-8">
              <div className="mx-auto flex h-10 w-10 items-center justify-center border border-zinc-200 bg-zinc-50"><span className="text-lg text-zinc-500">🪏</span></div>
              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Mantenimiento</p>
              <h1 className="mt-2 text-2xl font-semibold leading-tight text-zinc-900 sm:text-3xl">Página en mantenimiento</h1>
              <p className="mt-3 text-xs leading-5 text-zinc-500 sm:text-sm">Volveremos a estar disponibles en breve.</p>
              <div className="mx-auto mt-6 h-px w-12 bg-red-600" />
          </div>
      </main>
    )}</>;
  }
  return <>{children}</>;
}

const HomePage = lazy(() => import('./pages/HomePage').then((module) => ({ default: module.HomePage })));
const StorePage = lazy(() => import('./pages/StorePage').then((module) => ({ default: module.StorePage })));
const ProductPage = lazy(() => import('./pages/ProductPage').then((module) => ({ default: module.ProductPage })));
const PacksPage = lazy(() => import('./pages/PackPage').then((module) => ({ default: module.PacksPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((module) => ({ default: module.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((module) => ({ default: module.ContactPage })));
const WishlistPage = lazy(() => import('./pages/WishlistPage').then((module) => ({ default: module.WishlistPage })));
const RecommendationsPage = lazy(() => import('./pages/RecommendationsPage').then((module) => ({ default: module.RecommendationsPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((module) => ({ default: module.RegisterPage })));
const AdminDashboardPage = lazy(() => import('./admin/AdminDashboardPage').then((module) => ({ default: module.AdminDashboardPage })));

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.search]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-white text-sm text-black/70">Cargando página...</div>}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registro" element={<RegisterPage />} />
              <Route path="/D-Admin/*" element={<AdminDashboardPage />} />
              <Route path="/checkout" element={<PageVisibilityGate pageKey="checkout"><CheckoutPage /></PageVisibilityGate>} />
              <Route element={<MainLayout />}>
                <Route path="/" element={<PageVisibilityGate pageKey="home"><HomePage /></PageVisibilityGate>} />
                <Route path="/tienda" element={<PageVisibilityGate pageKey="store"><StorePage /></PageVisibilityGate>} />
                <Route path="/packs" element={<PageVisibilityGate pageKey="store"><PacksPage /></PageVisibilityGate>} />
                <Route path="/producto/:slug" element={<PageVisibilityGate pageKey="store"><ProductPage /></PageVisibilityGate>} />
                <Route path="/nosotros" element={<PageVisibilityGate pageKey="about"><AboutPage /></PageVisibilityGate>} />
                <Route path="/contacto" element={<PageVisibilityGate pageKey="contact"><ContactPage /></PageVisibilityGate>} />
                <Route path="/deseados" element={<PageVisibilityGate pageKey="favorites"><WishlistPage /></PageVisibilityGate>} />
                <Route path="/politicas" element={<PageVisibilityGate pageKey="privacy"><PoliticaPrivacidadPage /></PageVisibilityGate>} />
                <Route path="/terminos" element={<PageVisibilityGate pageKey="terms"><TerminosCondicionesPage /></PageVisibilityGate>} />
                <Route path="/reclamaciones" element={<PageVisibilityGate pageKey="complaints"><RecommendationsPage /></PageVisibilityGate>} />
                <Route path="/trabajos" element={<PageVisibilityGate pageKey="unetenos"><UnetenosPage /></PageVisibilityGate>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;

