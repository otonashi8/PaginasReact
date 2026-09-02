import { Pencil, Trash2 } from "lucide-react";
import { TablaAcciones } from "../../../componentes/TablaAcciones";
import type { Usuario } from "../TiposUsuarios";

type Props = {
    usuario: Usuario;
    editar: (
        usuario: Usuario
    ) => void;
    eliminar: (
        id: number
    ) => void;
    mostrarEditar?: boolean;
    mostrarEliminar?: boolean;
};

export const AccionesUsuario = ({
    usuario,
    editar,
    eliminar,
    mostrarEditar = true,
    mostrarEliminar = true
}: Props) => {
    return (
        <TablaAcciones>
            {
                mostrarEditar && (
                    <button
                        type="button"
                        onClick={() =>
                            editar(usuario)
                        }
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-zinc-100"
                        title="Editar"
                    ><Pencil size={16} />Editar
                    </button>
                )
            }
            {
                mostrarEliminar && (
                    <button
                        type="button"
                        disabled={usuario.protegido}
                        onClick={() =>
                            eliminar(usuario.id)
                        }
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        title="Eliminar"
                    ><Trash2 size={16} />Eliminar
                    </button>
                )
            }
        </TablaAcciones>
    );
};