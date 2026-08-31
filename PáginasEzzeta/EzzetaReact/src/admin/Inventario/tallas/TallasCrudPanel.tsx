import type { PermissionAccess } from '../../hooks/usePermissions';
import { ClasificacionCrudPanel } from '../componentes/ClasificacionCrudPanel';

type TallasCrudPanelProps = {
  access: PermissionAccess;
};

export const TallasCrudPanel = ({ access }: TallasCrudPanelProps) => {
  return <ClasificacionCrudPanel access={access} tipo="tallas" />;
};
