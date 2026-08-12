import { storageManager } from './storage';

export type WholesalePlanId = 'bronze' | 'silver' | 'gold';

export interface SubscriptionPlan {
  id: WholesalePlanId;
  nombre: string;
  precio: number;
  descuento: number;
  color: string;
  icono: string;
  duracion: string;
  durationDays: number;
  beneficios: string[];
}

const STORAGE_KEY = 'ezzeta.admin.subscription-plans';
const ADMIN_STORAGE_KEY = 'ezzeta.admin.plans';

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'bronze',
    nombre: 'Bronce',
    precio: 29,
    descuento: 5,
    color: '#b87333',
    icono: '🥉',
    duracion: '30 días',
    durationDays: 30,
    beneficios: ['Descuento base del 5%', 'Acceso a ofertas exclusivas', 'Soporte estándar'],
  },
  {
    id: 'silver',
    nombre: 'Plata',
    precio: 79,
    descuento: 12,
    color: '#9ca3af',
    icono: '🥈',
    duracion: '30 días',
    durationDays: 30,
    beneficios: ['Descuento base del 12%', 'Prioridad en stock', 'Acceso a ofertas exclusivas'],
  },
  {
    id: 'gold',
    nombre: 'Oro',
    precio: 149,
    descuento: 20,
    color: '#d4af37',
    icono: '🥇',
    duracion: '30 días',
    durationDays: 30,
    beneficios: ['Descuento base del 20%', 'Atención premium', 'Acceso a ofertas exclusivas'],
  },
];

export const planCatalog: Record<WholesalePlanId, SubscriptionPlan> = subscriptionPlans.reduce(
  (accumulator, plan) => {
    accumulator[plan.id] = plan;
    return accumulator;
  },
  {} as Record<WholesalePlanId, SubscriptionPlan>,
);

const readPlans = (): SubscriptionPlan[] => {
  const adminStored = storageManager.get<SubscriptionPlan[]>(ADMIN_STORAGE_KEY);
  if (adminStored && Array.isArray(adminStored) && adminStored.length > 0) {
    return adminStored;
  }

  const stored = storageManager.get<SubscriptionPlan[]>(STORAGE_KEY);

  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    writePlans(subscriptionPlans);
    return subscriptionPlans;
  }

  return stored;
};

const writePlans = (plans: SubscriptionPlan[]) => {
  storageManager.set(STORAGE_KEY, plans);
  try {
    storageManager.set(ADMIN_STORAGE_KEY, plans);
  } catch {
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('maxeta:plans-changed'));
  }
};

export const getPlanById = (id: WholesalePlanId): SubscriptionPlan => {
  const stored = readPlans().find((plan) => plan.id === id);
  return stored ?? planCatalog[id];
};

export const getPlanOptions = (): SubscriptionPlan[] => readPlans();

export const getDefaultPlanId = (): WholesalePlanId => 'bronze';
