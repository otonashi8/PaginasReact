import {Eye,Pencil,Printer,    Trash2} from "lucide-react";
import { TablaAcciones } from "../../../componentes/TablaAcciones";
import type { Pedido } from "../TiposPedidos";

type Props = {
    pedido: Pedido;
    onVer?: (pedido: Pedido) => void;
    onEditar?: (pedido: Pedido) => void;
    onEliminar?: (pedido: Pedido) => void;
    onImprimir?: (pedido: Pedido) => void;
};

export const AccionesPedido = ({
    pedido,
    onVer,
    onEditar,
    onEliminar,
    onImprimir
}: Props) => {

    return (
        <TablaAcciones align="left">
            {
                onVer && (
                    <button
                        type="button"
                        onClick={() => onVer(pedido)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-zinc-100"
                        title="Ver pedido"
                    ><Eye size={18} />Ver
                    </button>
                )
            }
            {
                onEditar && (
                    <button
                        type="button"
                        onClick={() => onEditar(pedido)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-zinc-100"
                        title="Editar"
                    ><Pencil size={18} />Editar
                    </button>
                )
            }
            {
                onImprimir && (
                    <button
                        type="button"
                        onClick={() => onImprimir(pedido)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-zinc-100"
                        title="Imprimir"
                    ><Printer size={18} />Imprimir
                    </button>
                )
            }
            {
                onEliminar && (
                    <button
                        type="button"
                        onClick={() => onEliminar(pedido)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                        title="Eliminar"
                    ><Trash2 size={18} />Eliminar
                    </button>
                )
            }
        </TablaAcciones>
    );
};