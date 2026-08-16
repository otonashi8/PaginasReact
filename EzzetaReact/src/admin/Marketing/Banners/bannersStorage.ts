import { storageManager, StorageKeys } from '../../../storage';
import legacySlides from '../../../data/homeSlides.json';

export type Banner = {
  id: string;
  nombre: string;
  imagenDesktop: string;
  imagenMobile: string;
  activo: boolean;
  orden: number;
};

const DEFAULT_ROTATION_SECONDS = 5;

const normalizeText = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

const buildDefaultBanners = (): Banner[] =>
  legacySlides.map((slide, index) => ({
    id: `legacy-banner-${index + 1}`,
    nombre: normalizeText(slide?.title) || `Banner ${index + 1}`,
    imagenDesktop: normalizeText(slide?.img) || '',
    imagenMobile: normalizeText(slide?.img) || '',
    activo: true,
    orden: index,
  }));

const normalizeBanner = (value: unknown): Banner | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const item = value as Partial<Banner> & Record<string, unknown>;
  const nombre = normalizeText(item.nombre);
  const desktop = normalizeText(item.imagenDesktop);
  const mobile = normalizeText(item.imagenMobile);

  if (!nombre && !desktop && !mobile) {
    return null;
  }

  const hasDesktop = desktop || mobile;
  const hasMobile = mobile || desktop;

  return {
    id: typeof item.id === 'string' && item.id.trim() ? item.id : crypto.randomUUID(),
    nombre: nombre || 'Banner sin nombre',
    imagenDesktop: hasDesktop,
    imagenMobile: hasMobile,
    activo: item.activo !== false,
    orden: Number.isFinite(Number(item.orden)) ? Number(item.orden) : 0,
  };
};

export const normalizeBanners = (value: unknown): Banner[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const banners = value
    .map((item) => normalizeBanner(item))
    .filter((banner): banner is Banner => Boolean(banner));

  return [...banners].sort((a, b) => {
    if (a.orden !== b.orden) {
      return a.orden - b.orden;
    }

    return a.nombre.localeCompare(b.nombre);
  });
};

export const getActiveBanners = (source: Banner[] = getPersistedBanners()): Banner[] =>
  [...source].filter((banner) => banner.activo).sort((a, b) => a.orden - b.orden);

export const getPersistedBanners = (): Banner[] => {
  const existing = storageManager.get<Banner[]>(StorageKeys.MARKETING_BANNERS) as Banner[] | null;

  if (existing && Array.isArray(existing)) {
    return normalizeBanners(existing);
  }

  const defaults = buildDefaultBanners();
  storageManager.set(StorageKeys.MARKETING_BANNERS, defaults);
  return defaults;
};

export const saveBanners = (banners: Banner[]): Banner[] => {
  const normalized = normalizeBanners(banners);
  storageManager.set(StorageKeys.MARKETING_BANNERS, normalized);
  return normalized;
};

export const getSafeRotationSeconds = (value: unknown): number => {
  const numericValue = typeof value === 'string' ? Number(value) : Number(value ?? DEFAULT_ROTATION_SECONDS);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return DEFAULT_ROTATION_SECONDS;
  }

  return Math.round(numericValue);
};

export const getBannerRotationSeconds = (): number => {
  const stored = storageManager.get<number | string>(StorageKeys.MARKETING_BANNERS_ROTATION) as number | string | null;
  return getSafeRotationSeconds(stored ?? DEFAULT_ROTATION_SECONDS);
};

export const setBannerRotationSeconds = (value: unknown): number => {
  const safeValue = getSafeRotationSeconds(value);
  storageManager.set(StorageKeys.MARKETING_BANNERS_ROTATION, safeValue);
  return safeValue;
};

export const MARKETING_BANNER_KEYS = {
  banners: StorageKeys.MARKETING_BANNERS,
  rotation: StorageKeys.MARKETING_BANNERS_ROTATION,
} as const;

export type BannerRotationKey = keyof typeof MARKETING_BANNER_KEYS;

export const getStorageKey = (key: BannerRotationKey): string =>
  MARKETING_BANNER_KEYS[key];
