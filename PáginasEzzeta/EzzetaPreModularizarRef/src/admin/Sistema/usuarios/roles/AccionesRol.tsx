import { Pencil, Trash2 } from "lucide-react";
import { TablaAcciones } from "../../../componentes/TablaAcciones";
import type { Rol } from "../TiposUsuarios";

type Props = {
    rol: Rol;
    editar: (
        rol: Rol
    ) => void;
    eliminar: (
        id: number
    ) => void;
};

export const AccionesRol = ({
    rol,
    editar,
    eliminar
}: Props) => {

    const esAdministrador =
        rol.codigo.toUpperCase() === "ADMIN";
    return (
        <TablaAcciones>
            <button
                type="button"
                onClick={() =>
                    editar(rol)
                }className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-zinc-100"
                title="Editar"
            ><Pencil size={18} />Editar
            </button>
            <button
                type="button"
                disabled={esAdministrador}
                onClick={() => {
                    if (!esAdministrador) {
                        eliminar(rol.id);
                    }
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ${
                    esAdministrador
                        ? "cursor-not-allowed border-zinc-200 text-zinc-400"
                        : "border-red-300 text-red-600 hover:bg-red-50"
                }`}
                title={
                    esAdministrador
                        ? "No se puede eliminar el rol Administrador"
                        : "Eliminar"
                }
            ><Trash2 size={18} />Borrar
            </button>
        </TablaAcciones>
    );
};