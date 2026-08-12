import { storageManager } from '../../../storage';
import type { SubscriptionPlan } from '../../../plans';
import { registrarLog } from '../../../services/auditService';

const STORAGE_KEY = 'ezzeta.admin.plans';

const defaultPlans: SubscriptionPlan[] = [
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

const getStoredPlans = (): SubscriptionPlan[] => {
  const stored = storageManager.get<SubscriptionPlan[]>(STORAGE_KEY);
  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    writePlans(defaultPlans);
    return defaultPlans;
  }

  return stored;
};

const writePlans = (plans: SubscriptionPlan[]) => {
  storageManager.set(STORAGE_KEY, plans);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('maxeta:plans-changed'));
  }
};

export const obtenerPlanes = (): SubscriptionPlan[] => getStoredPlans();

export const obtenerPlanPorId = (id: SubscriptionPlan['id']): SubscriptionPlan | undefined =>
  getStoredPlans().find((plan) => plan.id === id);

export const actualizarPlan = (plan: SubscriptionPlan): SubscriptionPlan => {
  const planes = getStoredPlans().map((item) => (item.id === plan.id ? plan : item));
  writePlans(planes);

  registrarLog({
    modulo: 'Sistema',
    submodulo: 'Planes',
    accion: 'Actualizó plan',
    descripcion: `Se actualizó el plan ${plan.nombre} con precio S/ ${plan.precio} y descuento ${plan.descuento}%.`,
    objetoAfectado: `Plan ${plan.nombre}`,
    referencia: `plans.${plan.id}.update`,
  });

  return plan;
};
