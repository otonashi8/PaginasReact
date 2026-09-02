import type { Cliente } from "../TiposClientes";
import { TablaAcciones } from "../../../componentes/TablaAcciones";

type Props = {
    cliente: Cliente;
    verPerfil: (cliente: Cliente) => void;
    editarCliente: (cliente: Cliente) => void;
    eliminarCliente: (cliente: Cliente) => void;
};

export const AccionesCliente = ({
    cliente,
    verPerfil,
    editarCliente,
    eliminarCliente
}: Props) => {
    return (
        <TablaAcciones>
            <button
                type="button"
                onClick={() => verPerfil(cliente)}
                className="block w-full px-3 py-2 text-left text-xs font-medium text-zinc-700 transition hover:bg-zinc-100"
            >
                Info
            </button>
            <button
                type="button"
                onClick={() => editarCliente(cliente)}
                className="block w-full px-3 py-2 text-left text-xs font-medium text-zinc-700 transition hover:bg-zinc-100"
            >
                Editar
            </button>
            <button
                type="button"
                onClick={() => eliminarCliente(cliente)}
                className="block w-full px-3 py-2 text-left text-xs font-medium text-red-700 transition hover:bg-red-50"
            >
                Eliminar
            </button>
        </TablaAcciones>
    );
};
