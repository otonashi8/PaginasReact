import type { PermissionAccess } from '../hooks/usePermissions';
import { TrabajosCrudPanel } from './Trabajos/TrabajosCrudPanel';

type RRHHCrudPanelProps = {
  access: PermissionAccess;
};

export const RRHHCrudPanel = ({ access }: RRHHCrudPanelProps) => {
  const accessName = access.name.trim().toLowerCase();
  const accessLabelNormalized = access.label.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

  if (accessName === 'trabajos' || accessLabelNormalized.includes('trabajo') || access.path?.toLowerCase().includes('/rrhh')) {
    return <TrabajosCrudPanel />;
  }

  return (
    <div className="rounded-none border border-red-300 bg-red-50 p-4 text-red-600">
      No se encontró el módulo solicitado.
    </div>
  );
};
