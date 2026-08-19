import { storageManager, StorageKeys } from '../../../storage';

export type PopUpContentType = 'imagen' | 'video';

export type PopUpFrequency = 'cada-vez' | 'una-vez-sesion';

export type PopUpItem = {
  id: string;
  nombre: string;
  tipoContenido: PopUpContentType;
  recursoMedia: string;
  imagenDesktop: string;
  imagenMobile: string;
  activo: boolean;
  mostrarEn: string;
  redireccion: boolean;
  destino: string;
  frecuencia: PopUpFrequency;
  retraso: number;
  orden: number;
};

const normalizeText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const normalizeFrequency = (value: unknown): PopUpFrequency => {
  const text = normalizeText(value).toLowerCase();
  return text === 'una-vez-por-sesion' || text === 'una-vez-sesion' ? 'una-vez-sesion' : 'cada-vez';
};

const normalizeDelay = (value: unknown): number => {
  const numeric = typeof value === 'string' ? Number(value) : Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return 0;
  }
  return Math.round(numeric);
};

const normalizePopUp = (value: unknown): PopUpItem | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const item = value as Partial<PopUpItem> & Record<string, unknown>;
  const nombre = normalizeText(item.nombre);
  const recursoMedia = normalizeText(item.recursoMedia);
  const imagenDesktop = normalizeText(item.imagenDesktop);
  const imagenMobile = normalizeText(item.imagenMobile);
  const tipoContenido = item.tipoContenido === 'video' ? 'video' : 'imagen';
  const mostrarEn = normalizeText(item.mostrarEn) || '/';
  const redireccion = item.redireccion === true;
  const destino = normalizeText(item.destino);
  const frecuencia = normalizeFrequency(item.frecuencia);
  const retraso = normalizeDelay(item.retraso);
  const orden = Number.isFinite(Number(item.orden)) ? Number(item.orden) : 0;
  const hasImageSource = tipoContenido === 'imagen' && (imagenDesktop || imagenMobile);

  if (!nombre || (tipoContenido === 'video' ? !recursoMedia : !hasImageSource)) {
    return null;
  }

  return {
    id: typeof item.id === 'string' && item.id.trim() ? item.id : crypto.randomUUID(),
    nombre,
    tipoContenido,
    recursoMedia: tipoContenido === 'video' ? recursoMedia : '',
    imagenDesktop,
    imagenMobile,
    activo: item.activo !== false,
    mostrarEn,
    redireccion,
    destino,
    frecuencia,
    retraso,
    orden,
  };
};

export const normalizePopUps = (value: unknown): PopUpItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizePopUp(item))
    .filter((popup): popup is PopUpItem => Boolean(popup));
};

const escapeRegExp = (value: string): string => value.replace(/[-/\^$*+?.()|[\]{}]/g, '\\$&');

const normalizeRoute = (route: string): string => {
  const trimmed = route.trim();
  if (!trimmed) return '/';
  const normalized = trimmed.replace(/\/+/g, '/').replace(/\/$/, '');
  return normalized || '/';
};

const routeMatchesPath = (currentPath: string, routePattern: string): boolean => {
  const normalizedCurrent = normalizeRoute(currentPath);
  const normalizedPattern = normalizeRoute(routePattern);

  if (normalizedPattern.includes(':')) {
    const regexSegments = normalizedPattern
      .split('/')
      .map((segment) => (segment.startsWith(':') ? '[^/]+' : escapeRegExp(segment)));

    const regex = new RegExp(`^
      ${regexSegments.join('/')}
      $`.replace(/\s+/g, ''), 'i');

    return regex.test(normalizedCurrent);
  }

  return normalizedCurrent === normalizedPattern;
};

export const getActivePopUpsForPath = (path: string): PopUpItem[] =>
  getPersistedPopUps()
    .filter((popup) => popup.activo && routeMatchesPath(path, popup.mostrarEn))
    .sort((a, b) => a.orden - b.orden);

export const getActivePopUpForPath = (path: string): PopUpItem | null => getActivePopUpsForPath(path)[0] ?? null;

export const getPersistedPopUps = (): PopUpItem[] => {
  const existing = storageManager.get<PopUpItem[]>(StorageKeys.MARKETING_POPUPS) as PopUpItem[] | null;

  if (existing && Array.isArray(existing)) {
    return normalizePopUps(existing);
  }

  const defaults: PopUpItem[] = [];
  storageManager.set(StorageKeys.MARKETING_POPUPS, defaults);
  return defaults;
};

export const savePopUps = (popups: PopUpItem[]): PopUpItem[] => {
  const normalized = normalizePopUps(popups);
  storageManager.set(StorageKeys.MARKETING_POPUPS, normalized);
  return normalized;
};

export const togglePopUpActive = (popups: PopUpItem[], id: string): PopUpItem[] => {
  const next = popups.map((popup) =>
    popup.id === id ? { ...popup, activo: !popup.activo } : popup,
  );
  return savePopUps(next);
};

export const deletePopUp = (popups: PopUpItem[], id: string): PopUpItem[] => {
  const next = popups.filter((popup) => popup.id !== id);
  return savePopUps(next);
};

const SESSION_STORAGE_POPOVER_KEY = 'ezzeta.marketing.popup.shown.';

export const hasPopUpBeenShownInSession = (id: string): boolean => {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(`${SESSION_STORAGE_POPOVER_KEY}${id}`) === '1';
};

export const markPopUpShownInSession = (id: string): void => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(`${SESSION_STORAGE_POPOVER_KEY}${id}`, '1');
};
