import type { PermissionAccess } from '../hooks/usePermissions';

import { BannersCrudPanel } from './Banners/BannersCrudPanel';

type MarketingCrudPanelProps = {
  access: PermissionAccess;
};

export const MarketingCrudPanel = ({ access }: MarketingCrudPanelProps) => {
  const correspondeABanners =
    access.name === 'marketing'
    || access.name === 'banners'
    || access.name === 'banner'
    || access.permissionCodes.some((codigoPermiso) => codigoPermiso.startsWith('marketing.'))
    || access.permissionCodes.some((codigoPermiso) => codigoPermiso.startsWith('banners.'));

  switch (access.name) {
    case 'banners':
    case 'banner':
    case 'marketing':
      return <BannersCrudPanel />;

    default:
      if (correspondeABanners) {
        return <BannersCrudPanel />;
      }

      return (
        <div className="rounded-none border border-red-300 bg-red-50 p-4 text-red-600">
          No se encontró el módulo solicitado.
        </div>
      );
  }
};
