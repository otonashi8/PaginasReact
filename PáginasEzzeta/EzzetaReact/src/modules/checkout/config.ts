import { z } from 'zod';
import { StorageKeys } from '../../storage';
import { getPeruDepartments } from '../../services/peruUbigeoService';

export const DEPARTAMENTOS = getPeruDepartments().map((item) => ({
  departamento: item.code,
  nombre: item.name,
}));

export const UBIGEOS = [
  { departamento: '15', provincia: '01', distrito: '01', nombre: 'Lima' },
  { departamento: '15', provincia: '01', distrito: '02', nombre: 'San Isidro' },
  { departamento: '15', provincia: '02', distrito: '01', nombre: 'Arequipa' },
  { departamento: '15', provincia: '02', distrito: '02', nombre: 'Miraflores' },
  { departamento: '14', provincia: '01', distrito: '01', nombre: 'Trujillo' },
];

export const PAYMENT_METHODS = [
  { value: 'tarjeta', label: 'Tarjeta', icon: () => null },
  { value: 'yape', label: 'Yape', icon: () => null },
] as const;

export const uniqueByCode = <T extends { [key: string]: string }>(items: T[], key: (item: T) => string) => {
  const seen = new Map<string, T>();
  items.forEach((item) => {
    const value = key(item);
    if (!seen.has(value)) seen.set(value, item);
  });
  return Array.from(seen.values());
};

export const contactSchema = z.object({
  fullName: z.string().min(2, 'Ingresa tu nombre completo'),
  email: z.string().email('Correo inválido'),
  phone: z.string().min(7, 'Ingresa un teléfono válido'),
  document: z.string().min(8, 'Ingresa tu documento'),
  department: z.string().min(1, 'Selecciona un departamento'),
  province: z.string().min(1, 'Selecciona una provincia'),
  district: z.string().min(1, 'Selecciona un distrito'),
  locationText: z.string().min(5, 'Ingresa tu dirección'),
  postalCode: z.string().optional().or(z.literal('')),
  reference: z.string().min(3, 'Ingresa una referencia'),
  paymentMethod: z.enum(['tarjeta', 'yape']).optional(),
});

export const cardSchema = z.object({
  cardOwner: z.string().min(2, 'Ingresa el nombre del titular'),
  cardNumber: z.string().min(12, 'Número incompleto'),
  cardExpiry: z.string().min(4, 'Fecha inválida'),
  cardCvv: z.string().min(3, 'CVV inválido'),
});

export const yapeSchema = z.object({
  yapePhone: z.string().min(7, 'Número de Yape inválido'),
});

export const getStoredCheckoutValues = () => {
  try {
    const raw = window.localStorage.getItem(StorageKeys.CHECKOUT);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      fullName: typeof parsed.name === 'string' ? parsed.name : '',
      email: typeof parsed.email === 'string' ? parsed.email : '',
      phone: typeof parsed.phone === 'string' ? parsed.phone : '',
      document: typeof parsed.document === 'string' ? parsed.document : '',
      department: typeof parsed.departmentCode === 'string' ? parsed.departmentCode : '',
      province: typeof parsed.provinceCode === 'string' ? parsed.provinceCode : '',
      district: typeof parsed.districtCode === 'string' ? parsed.districtCode : '',
      locationText: typeof parsed.address === 'string' ? parsed.address : '',
      postalCode: typeof parsed.postalCode === 'string' ? parsed.postalCode : '',
      reference: typeof parsed.reference === 'string' ? parsed.reference : '',
      paymentMethod: parsed.paymentMethod === 'yape' ? 'yape' : 'tarjeta',
    };
  } catch {
    return {};
  }
};
