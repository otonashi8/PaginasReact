export type SiteRouteOption = {
  label: string;
  value: string;
  allowRedirect: boolean;
  isDynamic?: boolean;
};

export const siteRouteOptions: SiteRouteOption[] = [
  { label: 'Inicio', value: '/', allowRedirect: true },
  { label: 'Tienda', value: '/tienda', allowRedirect: true },
  { label: 'Packs', value: '/packs', allowRedirect: true },
  { label: 'Producto', value: '/producto/:slug', allowRedirect: false, isDynamic: true },
  { label: 'Nosotros', value: '/nosotros', allowRedirect: true },
  { label: 'Contacto', value: '/contacto', allowRedirect: true },
  { label: 'Beneficios', value: '/beneficios', allowRedirect: true },
  { label: 'Deseados', value: '/deseados', allowRedirect: true },
  { label: 'Políticas', value: '/politicas', allowRedirect: true },
  { label: 'Términos', value: '/terminos', allowRedirect: true },
  { label: 'Libro de reclamaciones', value: '/reclamaciones', allowRedirect: true },
  { label: 'Trabaja con nosotros', value: '/trabajos', allowRedirect: true },
  { label: 'Comunidad', value: '/comunidad', allowRedirect: true },
];
