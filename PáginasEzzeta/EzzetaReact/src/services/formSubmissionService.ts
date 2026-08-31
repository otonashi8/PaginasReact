import { StorageKeys } from '../storage';

export const guardarCliente = async (payload: Record<string, unknown>) => {
  const key = StorageKeys.USERS;
  const existing = JSON.parse(window.localStorage.getItem(key) ?? '[]');
  const list = Array.isArray(existing) ? existing : [];

  const normalized = {
    ...payload,
    id: typeof payload.id === 'string' || typeof payload.id === 'number' ? payload.id : `guest-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  const next = [...list, normalized];
  window.localStorage.setItem(key, JSON.stringify(next));

  return normalized;
};
