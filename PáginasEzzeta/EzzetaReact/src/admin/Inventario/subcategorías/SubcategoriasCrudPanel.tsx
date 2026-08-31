import type { PermissionAccess } from '../../hooks/usePermissions';
import { ClasificacionCrudPanel } from '../componentes/ClasificacionCrudPanel';

type SubcategoriasCrudPanelProps = {
  access: PermissionAccess;
};

export const SubcategoriasCrudPanel = ({ access }: SubcategoriasCrudPanelProps) => {
  return <ClasificacionCrudPanel access={access} tipo="subcategorias" />;
};
