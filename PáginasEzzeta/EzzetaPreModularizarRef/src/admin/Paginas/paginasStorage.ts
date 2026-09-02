import { obtenerActorAuditoria, registrarLog } from '@/services/auditService';

export type LegalPageKey = 'privacy' | 'terms';
export type SitePageKey = 'home' | 'store' | 'about' | 'contact' | 'faq' | 'privacy' | 'terms' | 'complaints' | 'favorites' | 'checkout' | 'unetenos';

export type LegalSection = { title: string; text: string };

export type LegalPageContent = {
  key: LegalPageKey;
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
  updatedAt: string;
};

export type PageVisibility = {
  [key in SitePageKey]: boolean;
};

const CONTENT_KEY = 'vitaela.paginas-legales';
const VISIBILITY_KEY = 'vitaela.paginas-visibilidad';
const EVENT_NAME = 'vitaela:pages-changed';

export const pageVisibilityOptions: Array<{ key: SitePageKey; label: string }> = [
  { key: 'home', label: 'Inicio' },
  { key: 'store', label: 'Tienda' },
  { key: 'about', label: 'Nosotros' },
  { key: 'contact', label: 'Contacto' },
  { key: 'faq', label: 'Preguntas frecuentes' },
  { key: 'privacy', label: 'Política de privacidad' },
  { key: 'terms', label: 'Términos y condiciones' },
  { key: 'complaints', label: 'Libro de reclamaciones' },
  { key: 'favorites', label: 'Favoritos' },
  { key: 'checkout', label: 'Checkout' },
  { key: 'unetenos', label: 'Trabajos / Únete a nosotros' },
];

const defaultVisibility: PageVisibility = {
  home: true,
  store: true,
  about: true,
  contact: true,
  faq: true,
  privacy: true,
  terms: true,
  complaints: true,
  favorites: true,
  checkout: true,
  unetenos: true,
};

const defaults: Record<LegalPageKey, LegalPageContent> = {
  privacy: { key: 'privacy', eyebrow: 'Tu privacidad importa', title: 'Política de privacidad', intro: 'Esta política explica qué información recopilamos, por qué la usamos y cuáles son tus opciones al navegar o comprar en Ezzeta.', updatedAt: 'Agosto 2026', sections: [
    { title: 'Información que recopilamos', text: 'Recopilamos los datos que compartes al realizar una compra, solicitar atención o completar un formulario: nombre, correo, teléfono, dirección y los datos necesarios para gestionar tu pedido.' },
    { title: 'Cómo utilizamos tus datos', text: 'Usamos tu información para procesar pedidos, coordinar entregas, responder consultas, mejorar nuestros productos y enviarte comunicaciones cuando nos hayas dado permiso.' },
    { title: 'Protección de la información', text: 'Aplicamos medidas razonables de seguridad para proteger tus datos contra accesos no autorizados. Los datos de pago son procesados mediante plataformas seguras.' },
    { title: 'Tus derechos', text: 'Puedes solicitar acceso, actualización, corrección o eliminación de tus datos personales escribiéndonos desde nuestra página de Contacto.' },
    { title: 'Cookies', text: 'Utilizamos cookies necesarias para que el sitio funcione correctamente y, cuando corresponda, para comprender cómo se utiliza la tienda.' },
  ] },
  terms: { key: 'terms', eyebrow: 'Compra con claridad', title: 'Términos y condiciones', intro: 'Estos términos regulan el uso de la tienda online Ezzeta y las compras realizadas a través de ella.', updatedAt: 'Agosto 2026', sections: [
    { title: 'Uso del sitio', text: 'Al navegar en Ezzeta aceptas utilizar la tienda de manera responsable y proporcionar información verdadera, completa y actualizada.' },
    { title: 'Productos y precios', text: 'Las características, disponibilidad y precios pueden actualizarse sin previo aviso. Mostramos el precio vigente al momento de confirmar tu pedido.' },
    { title: 'Pedidos y pagos', text: 'Un pedido se considera recibido cuando mostramos su confirmación. Aceptamos los métodos habilitados durante el checkout.' },
    { title: 'Entregas', text: 'Coordinamos la entrega con los datos proporcionados en el pedido. Los tiempos estimados dependen de cobertura y disponibilidad.' },
    { title: 'Cambios y devoluciones', text: 'Puedes solicitar cambios o devoluciones dentro de los 15 días posteriores a la compra, sujeto a las condiciones comunicadas por atención.' },
    { title: 'Propiedad intelectual', text: 'El contenido, identidad visual, textos e imágenes de Ezzeta pertenecen a la marca o se utilizan con autorización.' },
  ] },
};

const read = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try { const parsed = JSON.parse(window.localStorage.getItem(key) || 'null'); return parsed ?? fallback; } catch { return fallback; }
};

export const getLegalPage = (key: LegalPageKey): LegalPageContent => read<Record<LegalPageKey, LegalPageContent>>(CONTENT_KEY, defaults)[key] ?? defaults[key];
export const saveLegalPage = (content: LegalPageContent) => {
  window.localStorage.setItem(CONTENT_KEY, JSON.stringify({ ...read(CONTENT_KEY, defaults), [content.key]: { ...content, updatedAt: new Date().toLocaleDateString('es-PE') } }));
  const actor = obtenerActorAuditoria();
  registrarLog({
    modulo: 'Páginas',
    submodulo: content.key === 'privacy' ? 'Política de privacidad' : 'Términos y condiciones',
    accion: 'Actualizó contenido legal',
    descripcion: `Se actualizó la página "${content.title}".`,
    usuario: actor.usuario,
    rol: actor.rol,
    objetoAfectado: content.title,
    referencia: `paginas.legal.${content.key}`,
  });
  window.dispatchEvent(new Event(EVENT_NAME));
};
export const getPageVisibility = (): PageVisibility => ({ ...defaultVisibility, ...read<Partial<PageVisibility>>(VISIBILITY_KEY, {}) });
export const isPageVisible = (pageKey: SitePageKey): boolean => getPageVisibility()[pageKey] ?? true;
export const savePageVisibility = (visibility: PageVisibility) => {
  window.localStorage.setItem(VISIBILITY_KEY, JSON.stringify(visibility));
  const actor = obtenerActorAuditoria();
  registrarLog({
    modulo: 'Páginas',
    submodulo: 'Visibilidad',
    accion: 'Actualizó visibilidad de páginas',
    descripcion: 'Se actualizó la visibilidad de las páginas del sitio.',
    usuario: actor.usuario,
    rol: actor.rol,
    objetoAfectado: 'Visibilidad',
    referencia: 'paginas.visibility.update',
  });
  window.dispatchEvent(new Event(EVENT_NAME));
};
export const subscribeToPageChanges = (listener: () => void) => { window.addEventListener(EVENT_NAME, listener); return () => window.removeEventListener(EVENT_NAME, listener); };