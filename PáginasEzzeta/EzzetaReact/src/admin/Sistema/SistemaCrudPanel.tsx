import type { PermissionAccess } from '../hooks/usePermissions';

import { ReglasCrudPanel } from './reglas-precios';
import { UsuariosCrudPanel } from './usuarios';
import { RolesCrudPanel } from './usuarios/roles/RolesCrudPanel';
import { CuponesCrudPanel } from './cupones/CuponesCrudPanel';
import { EnvioCrudPanel } from './envio/EnvioCrudPanel';
import { RedesCrudPanel } from './redes/RedesCrudPanel';
import { isSistemaEnvioAccess, isSistemaRedesAccess } from './sistemaModuleMatcher';
import { LogsCrudPanel } from './logs/LogsCrudPanel';

type SistemaCrudPanelProps = {
  access: PermissionAccess;
};

export const SistemaCrudPanel = ({ access }: SistemaCrudPanelProps) => {

  const correspondeAReglas =
    access.name === 'reglas-precios' ||
    access.name === 'reglas' ||
    access.permissionCodes.some((codigo) =>
      codigo.startsWith('pricing_rules.')
    );

  const accessName = access.name.trim().toLowerCase();
  const accessLabelNormalized = access.label
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

  const esModuloEnvio =
    isSistemaEnvioAccess(accessName, accessLabelNormalized, access.path);

  const esModuloRedes =
    isSistemaRedesAccess(accessName, accessLabelNormalized, access.path);

  switch (accessName) {

    case 'reglas-precios':
      return <ReglasCrudPanel />;

    case 'usuarios':
      return <UsuariosCrudPanel access={access} />;

    case 'roles':
      return <RolesCrudPanel access={access} />;

    case 'cupones':
      return <CuponesCrudPanel access={access} />;

    case 'logs':
    case 'auditoria':
      return <LogsCrudPanel />;

    case 'envio':
    case 'envios':
      return <EnvioCrudPanel access={access} />;

    case 'redes':
    case 'redes sociales':
    case 'redes-sociales':
    case 'redessociales':
      return <RedesCrudPanel />;

    default:
      if (esModuloRedes) {
        return <RedesCrudPanel />;
      }

      if (esModuloEnvio) {
        return <EnvioCrudPanel access={access} />;
      }

      if (correspondeAReglas) {
        return <ReglasCrudPanel />;
      }

      return (
        <div className="rounded-none border border-red-300 bg-red-50 p-4 text-red-600">
          No se encontró el módulo solicitado.
        </div>
      );



  }

};