import { useSyncExternalStore } from 'react';
import { storageManager, StorageKeys } from '../../../storage';

export type Contacto = {
  email: string;
  telefono: string;
  whatsapp: string;
};

const CONTACTO_EVENT = 'ezzeta:contacto-changed';
const defaultContacto: Contacto = {
  email: 'contacto@ezzeta.com',
  telefono: '+51 929 370 461',
  whatsapp: '51933141678',
};

const sanitizeContacto = (value: Partial<Contacto> | null | undefined): Contacto => ({
  email: String(value?.email ?? defaultContacto.email).trim(),
  telefono: String(value?.telefono ?? defaultContacto.telefono).trim(),
  whatsapp: String(value?.whatsapp ?? defaultContacto.whatsapp).replace(/\D/g, ''),
});

const readContacto = (): Contacto => sanitizeContacto(storageManager.get<Contacto>(StorageKeys.CONTACTO));

let snapshot = readContacto();
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  if (typeof window !== 'undefined') {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === StorageKeys.CONTACTO) {
        snapshot = readContacto();
        notify();
      }
    };
    const handleChange = () => {
      snapshot = readContacto();
      notify();
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener(CONTACTO_EVENT, handleChange);
    return () => {
      listeners.delete(listener);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(CONTACTO_EVENT, handleChange);
    };
  }
  return () => listeners.delete(listener);
};

export const useContacto = () => useSyncExternalStore(subscribe, () => snapshot, () => defaultContacto);

export const obtenerContacto = () => readContacto();

export const guardarContacto = (value: Contacto) => {
  const next = sanitizeContacto(value);
  storageManager.set(StorageKeys.CONTACTO, next);
  snapshot = next;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CONTACTO_EVENT));
  }
  notify();
  return next;
};

export const obtenerEnlaceWhatsApp = (numero: string, mensaje = 'Hola, necesito ayuda en Ezzeta.') =>
  `https://wa.me/${numero.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`;