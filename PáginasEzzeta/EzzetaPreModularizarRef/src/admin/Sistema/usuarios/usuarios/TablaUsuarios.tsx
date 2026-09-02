import type {Rol,Usuario} from "../TiposUsuarios";
import type { PermissionAccess } from "../../../hooks/usePermissions";
import { useAuth } from "../../../../context/AuthContext";
import { EstadoUsuarioBadge } from "./EstadoUsuarioBadge";
import { AccionesUsuario } from "./AccionesUsuario";

type Props = {
    usuarios: Usuario[];
    roles: Rol[];
    access: PermissionAccess;
    editar: (
        usuario: Usuario
    ) => void;
    eliminar: (
        id: number
    ) => void;
    cambiarEstado: (
        usuario: Usuario
    ) => void;
};

export const TablaUsuarios = ({
    usuarios,
    roles,
    access,
    editar,
    eliminar,
    cambiarEstado
}: Props) => {
    const { hasPermission } = useAuth();
    function obtenerNombreRol(
        rolId: number
    ) {
        return (
            roles.find(
                rol => rol.id === rolId
            )?.nombre
            ?? "-"
        );
    }

    return (
        <div className="overflow-hidden border border-zinc-200 bg-white">
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-zinc-50">
                        <tr className="text-left">
                            <th className="whitespace-nowrap px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-zinc-500">Usuario</th>
                            <th className="whitespace-nowrap px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-zinc-500">Nombre completo</th>
                            <th className="whitespace-nowrap px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-zinc-500">Rol</th>
                            <th className="whitespace-nowrap px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-zinc-500">Estado</th>
                            <th className="whitespace-nowrap px-4 py-2.5 text-right text-sm font-semibold uppercase tracking-[0.12em] text-zinc-500">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {usuarios.length === 0 && (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="px-4 py-10 text-center text-sm text-zinc-400"
                                >No existen usuarios registrados.
                                </td>
                            </tr>
                        )}

                        {usuarios.map((usuario) => (
                            <tr
                                key={usuario.id}
                                className="transition-colors hover:bg-zinc-50/70"
                            >
                                <td className="px-4 py-2.5">
                                    <div className="min-w-[160px]">
                                        <p className="text-sm font-semibold text-zinc-900">{usuario.usuario}</p>
                                        <p className="mt-0.5 text-[11px] text-zinc-500">{usuario.correo}</p>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-4 py-2.5 text-sm text-zinc-700">{usuario.nombres} {usuario.apellidos}</td>
                                <td className="whitespace-nowrap px-4 py-2.5 text-sm text-zinc-600">{obtenerNombreRol(usuario.rolId)}</td>
                                <td className="px-4 py-2.5">
                                    <button
                                        type="button"
                                        onClick={() => cambiarEstado(usuario)}
                                        className="transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
                                        title={
                                            usuario.protegido
                                                ? "El estado del administrador no puede cambiarse"
                                                : "Cambiar estado"
                                        }
                                        disabled={usuario.protegido}
                                    >
                                        <EstadoUsuarioBadge
                                            estado={usuario.estado}
                                        />
                                    </button>
                                </td>
                                <td className="px-4 py-2.5">
                                    <div className="flex justify-end">
                                        <AccionesUsuario
                                            usuario={usuario}
                                            editar={editar}
                                            eliminar={eliminar}
                                            mostrarEditar={!access.actions.update || hasPermission(access.actions.update)}
                                            mostrarEliminar={!access.actions.delete || hasPermission(access.actions.delete)}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};