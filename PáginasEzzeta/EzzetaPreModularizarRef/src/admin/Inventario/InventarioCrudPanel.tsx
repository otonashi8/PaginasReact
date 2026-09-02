import type { PermissionAccess } from '../hooks/usePermissions';

import { BeneficiosCrudPanel } from './beneficios/BeneficiosCrudPanel';
import { CategoriasCrudPanel } from './categorías/CategoriasCrudPanel';
import { ProductosCrudPanel } from './productos';
import { SubcategoriasCrudPanel } from './subcategorías/SubcategoriasCrudPanel';
import { TallasCrudPanel } from './tallas/TallasCrudPanel';

type InventarioCrudPanelProps = {
  access: PermissionAccess;
};

const normalizarNombreModulo = (valor: string) => valor
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toLowerCase();

const normalizarRutaModulo = (ruta: string | null) => {
  if (!ruta) {
    return [] as string[];
  }

  const limpio = ruta
    .replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '')
    .replace(/\/+/g, ' ')
    .replace(/[_-]+/g, ' ');

  return limpio
    .split(/\s+/)
    .map((segmento) => normalizarNombreModulo(segmento))
    .filter(Boolean);
};

export const getInventarioAccessType = (access: PermissionAccess): 'productos' | 'categoria' | 'subcategoria' | 'beneficio' | 'talla' | 'desconocido' => {
  const tokens = [
    access.name,
    access.label,
    access.path?.split('/').filter(Boolean).pop() ?? '',
    access.path ?? '',
  ].flatMap((valor) => {
    const limpio = normalizarNombreModulo(valor);
    return limpio ? [limpio] : [];
  });

  const codigoPermiso = access.permissionCodes.map((codigo) => normalizarNombreModulo(codigo));
  const segmentosRuta = normalizarRutaModulo(access.path);
  const nombreModulo = tokens.find(Boolean) ?? '';

  const coincideCon = (...valores: string[]) => {
    const conjunto = new Set(valores.map((valor) => normalizarNombreModulo(valor)));
    return [nombreModulo, ...segmentosRuta, ...codigoPermiso].some((valor) => conjunto.has(valor));
  };

  if (coincideCon('categoria', 'categorias', 'category', 'categories')) {
    return 'categoria';
  }

  if (coincideCon('subcategoria', 'subcategorias', 'subcategory', 'subcategories')) {
    return 'subcategoria';
  }

  if (coincideCon('beneficio', 'beneficios', 'benefit', 'benefits')) {
    return 'beneficio';
  }

  if (coincideCon('talla', 'tallas', 'size', 'sizes')) {
    return 'talla';
  }

  if (coincideCon('productos', 'producto', 'inventario')) {
    return 'productos';
  }

  return 'desconocido';
};

export const InventarioCrudPanel = ({ access }: InventarioCrudPanelProps) => {
  const tipo = getInventarioAccessType(access);

  switch (tipo) {
    case 'productos':
      return <ProductosCrudPanel access={access} />;
    case 'categoria':
      return <CategoriasCrudPanel access={access} />;
    case 'subcategoria':
      return <SubcategoriasCrudPanel access={access} />;
    case 'beneficio':
      return <BeneficiosCrudPanel access={access} />;
    case 'talla':
      return <TallasCrudPanel access={access} />;
    default:
      return (
        <div className="rounded-none border border-red-300 bg-red-50 p-4 text-red-600">
          No se encontró el módulo solicitado.
        </div>
      );
  }
};