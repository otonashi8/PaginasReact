import { storageManager, StorageKeys } from '../../../storage';

export type CategoriaVisual = {
  categoria: string;
  imagen: string;
  descripcion: string;
  activo: boolean;
};

const normalizeText = (value: unknown): string => typeof value === 'string' ? value.trim() : '';

const normalizeCategoria = (value: unknown): CategoriaVisual | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const item = value as Partial<CategoriaVisual>;
  const categoria = normalizeText(item.categoria);
  if (!categoria) return null;
  return {
    categoria,
    imagen: normalizeText(item.imagen),
    descripcion: normalizeText(item.descripcion),
    activo: item.activo !== false,
  };
};

export const getCategoriasVisuales = (): CategoriaVisual[] => {
  const guardadas = storageManager.get<CategoriaVisual[]>(StorageKeys.INVENTARIO_CATEGORIAS_VISUALES) as CategoriaVisual[] | null;
  if (!Array.isArray(guardadas)) return [];
  return guardadas.map(normalizeCategoria).filter((item): item is CategoriaVisual => Boolean(item));
};

export const getCategoriaVisual = (categoria: string): CategoriaVisual => {
  return getCategoriasVisuales().find((item) => item.categoria.toLowerCase() === categoria.toLowerCase()) ?? {
    categoria,
    imagen: '',
    descripcion: '',
    activo: true,
  };
};

export const saveCategoriaVisual = (categoria: string, cambios: Partial<Omit<CategoriaVisual, 'categoria'>>): CategoriaVisual => {
  const actual = getCategoriaVisual(categoria);
  const actualizado = { ...actual, ...cambios, categoria };
  const otras = getCategoriasVisuales().filter((item) => item.categoria.toLowerCase() !== categoria.toLowerCase());
  storageManager.set(StorageKeys.INVENTARIO_CATEGORIAS_VISUALES, [...otras, actualizado]);
  return actualizado;
};

export const removeCategoriaVisual = (categoria: string): void => {
  storageManager.set(
    StorageKeys.INVENTARIO_CATEGORIAS_VISUALES,
    getCategoriasVisuales().filter((item) => item.categoria.toLowerCase() !== categoria.toLowerCase()),
  );
};
