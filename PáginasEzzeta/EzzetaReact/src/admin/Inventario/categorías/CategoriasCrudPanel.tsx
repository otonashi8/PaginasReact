import type { PermissionAccess } from '../../hooks/usePermissions';
import { ClasificacionCrudPanel } from '../componentes/ClasificacionCrudPanel';

type CategoriasCrudPanelProps = {
  access: PermissionAccess;
};

export const CategoriasCrudPanel = ({ access }: CategoriasCrudPanelProps) => {
  return <ClasificacionCrudPanel access={access} tipo="categorias" />;
};
