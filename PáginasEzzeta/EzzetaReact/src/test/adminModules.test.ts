import { describe, expect, it } from 'vitest';
import { isSistemaRedesAccess } from '../admin/Sistema/sistemaModuleMatcher';
import { buildFullDashboardPermissions, buildPermissionsFromRole } from '../services/authService';

describe('admin modules', () => {
  const normalizeText = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  it('includes RR.HH and Páginas in the default admin permissions', () => {
    const permissions = buildFullDashboardPermissions();

    expect(permissions.some((module) => normalizeText(module.label).includes('rrhh'))).toBe(true);
    expect(
      permissions.some((module) => normalizeText(module.label).includes('paginas')),
    ).toBe(true);
  });

  it('keeps the Roles access for the admin role even when stored permissions are incomplete', () => {
    const permissions = buildPermissionsFromRole({
      id: 1,
      codigo: 'ADMIN',
      nombre: 'Administrador',
      descripcion: 'Acceso completo',
      protegido: true,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      permisos: [
        { modulo: 'usuarios', acciones: ['ver', 'crear', 'editar', 'eliminar'] },
        { modulo: 'logs', acciones: ['ver'] },
      ],
    });

    const sistemaModule = permissions.find((module) => module.label === 'Sistema');

    expect(sistemaModule).toBeDefined();
    expect(
      sistemaModule?.accesses.some((access) => {
        const codes = [
          ...(Array.isArray((access as { permission_codes?: string[] }).permission_codes)
            ? (access as { permission_codes?: string[] }).permission_codes ?? []
            : []),
          (access as { permission_code?: string }).permission_code,
        ].filter(Boolean) as string[];

        return access.label === 'Roles' && codes.includes('roles.manage');
      }),
    ).toBe(true);
  });

  it('matches the social networks module for slugged access names', () => {
    expect(isSistemaRedesAccess('redes-sociales', 'Redes Sociales', '/D-Admin/redes')).toBe(true);
    expect(isSistemaRedesAccess('redes-sociales', 'Redes Sociales', '/D-Admin/usuarios')).toBe(true);
  });
});
