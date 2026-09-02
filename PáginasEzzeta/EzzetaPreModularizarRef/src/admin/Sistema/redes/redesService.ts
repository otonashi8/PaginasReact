import { useSyncExternalStore } from 'react';

export type Red = {
  id: number;
  nombre: string;
  url: string;
  iconUrl: string | null;
  activo: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
};

const REDES_EVENT = 'vitaella:redes-changed';
const REDES_STORAGE_KEY = 'ezzeta.redes.social';
const defaultRedes: Red[] = [
  { id: 1, nombre: 'Instagram', url: 'https://instagram.com/ezzetacompany', iconUrl: null, activo: true },
  { id: 2, nombre: 'Facebook', url: 'https://facebook.com/Ezzetacompany', iconUrl: null, activo: true },
  { id: 3, nombre: 'TikTok', url: 'https://www.tiktok.com/@ezzetacompany', iconUrl: null, activo: true },
  { id: 4, nombre: 'YouTube', url: 'https://www.youtube.com/@Pabloezzeta', iconUrl: null, activo: true },
];

const sanitizeRed = (red: Partial<Red>): Red => ({
  id: Number.isFinite(red.id) ? Number(red.id) : Date.now() + Math.random(),
  nombre: String(red.nombre ?? 'Red social'),
  url: String(red.url ?? '#'),
  iconUrl: red.iconUrl ?? null,
  activo: red.activo !== false,
});

const readStoredRedes = (): Red[] => {
  if (typeof window === 'undefined') {
    return defaultRedes;
  }

  try {
    const raw = window.localStorage.getItem(REDES_STORAGE_KEY);
    if (!raw) {
      return defaultRedes;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return defaultRedes;
    }

    return parsed.map((item) => sanitizeRed(item as Partial<Red>)).filter((item) => item.nombre && item.url);
  } catch {
    return defaultRedes;
  }
};

const persistRedes = (redes: Red[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  const next = redes.map((red) => sanitizeRed(red));
  window.localStorage.setItem(REDES_STORAGE_KEY, JSON.stringify(next));
  snapshot = next;
};

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada.'));
    reader.readAsDataURL(file);
  });

let snapshot = readStoredRedes();
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

const refresh = async () => {
  snapshot = readStoredRedes();
  notify();
};

if (typeof window !== 'undefined' && !window.localStorage.getItem(REDES_STORAGE_KEY)) {
  persistRedes(defaultRedes);
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  if (typeof window !== 'undefined') {
    const handleChange = () => void refresh();
    window.addEventListener(REDES_EVENT, handleChange);
    return () => {
      listeners.delete(listener);
      window.removeEventListener(REDES_EVENT, handleChange);
    };
  }
  return () => listeners.delete(listener);
};

export const useRedes = () => useSyncExternalStore(subscribe, () => snapshot, () => defaultRedes);

export const obtenerRedes = async () => {
  const redes = readStoredRedes();
  persistRedes(redes);
  return redes;
};

export const crearRed = async (red: Pick<Red, 'nombre' | 'url' | 'iconUrl' | 'activo'>, iconFile: File | null) => {
  const nextUrl = iconFile ? await readFileAsDataUrl(iconFile) : red.iconUrl || null;
  const nextRed = sanitizeRed({
    id: Date.now(),
    nombre: red.nombre,
    url: red.url,
    iconUrl: nextUrl,
    activo: red.activo,
  });

  const actual = readStoredRedes();
  const updated = [nextRed, ...actual];
  persistRedes(updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(REDES_EVENT));
  }
  return nextRed;
};

export const getStoredRedes = () => readStoredRedes();

export const actualizarRed = async (red: Red, iconFile: File | null) => {
  const nextUrl = iconFile ? await readFileAsDataUrl(iconFile) : red.iconUrl || null;
  const actual = readStoredRedes();
  const updated = actual.map((item) => item.id === red.id ? { ...item, ...red, iconUrl: nextUrl } : item);

  persistRedes(updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(REDES_EVENT));
  }
  return updated.find((item) => item.id === red.id) ?? { ...red, iconUrl: nextUrl };
};

export const eliminarRed = async (id: number) => {
  const actual = readStoredRedes();
  const next = actual.filter((item) => item.id !== id);
  persistRedes(next);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(REDES_EVENT));
  }
  return next;
};

export const notificarRedesActualizadas = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(REDES_EVENT));
  void refresh();
};
