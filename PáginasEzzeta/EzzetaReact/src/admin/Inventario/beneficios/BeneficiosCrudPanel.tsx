import type { PermissionAccess } from '../../hooks/usePermissions';
import { ClasificacionCrudPanel } from '../componentes/ClasificacionCrudPanel';

type BeneficiosCrudPanelProps = {
  access: PermissionAccess;
};

export const BeneficiosCrudPanel = ({ access }: BeneficiosCrudPanelProps) => {
  return <ClasificacionCrudPanel access={access} tipo="beneficios" />;
};
