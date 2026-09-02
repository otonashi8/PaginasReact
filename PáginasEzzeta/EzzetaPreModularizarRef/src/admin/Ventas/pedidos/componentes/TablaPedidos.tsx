import type { Pedido } from "../TiposPedidos";
import {AccionesPedido} from "./AccionesPedido";
import { EstadoPedidoBadge } from "./EstadoPedidoBadge";
import { formatearFechaPedido } from "../utils/formatearFechaPedido";

type Props = {
    pedidos: Pedido[];
    editar: (pedido: Pedido) => void;
    eliminar: (id: number) => void;
};

export const TablaPedidos = ({
    pedidos,
    editar,
    eliminar
}: Props) => {
    return (
        <div className="overflow-hidden border border-zinc-200 bg-white">
            <div className="overflow-x-auto">
                <table className="min-w-[900px] w-full">
                    <thead>
                        <tr className="border-b border-zinc-200 bg-zinc-50">
                            <th className="px-2 py-1 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Pedido</th>
                            <th className="px-2 py-1 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Cliente</th>
                            <th className="px-2 py-1 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Estado</th>
                            <th className="px-2 py-1 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Pago</th>
                            <th className="px-2 py-1 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Total</th>
                            <th className="px-2 py-1 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Fecha</th>
                            <th className="px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {pedidos.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-4 py-12 text-center text-sm text-zinc-400"
                                >No existen pedidos.
                                </td>
                            </tr>
                        ) : (
                            pedidos.map((pedido) => (
                                <tr
                                    key={pedido.id}
                                    className="group transition-colors hover:bg-zinc-50/70"
                                >
                                    <td className="px-2 py-1.5">
                                        <span className="text-sm font-semibold text-zinc-950">{pedido.numeroPedido}</span>
                                    </td>
                                    <td className="px-2 py-1.5">
                                        <span className="text-sm text-zinc-700">{pedido.cliente.nombre}</span>
                                    </td>
                                    <td className="px-2 py-1.5">
                                        <EstadoPedidoBadge
                                            estado={pedido.estado}
                                        />
                                    </td>
                                    <td className="px-2 py-1.5">
                                        <span className="text-sm text-zinc-600">{pedido.metodoPago}</span>
                                    </td>
                                    <td className="px-2 py-1.5 text-right">
                                        <span className="text-sm font-semibold text-zinc-950">S/ {pedido.total.toFixed(2)}</span>
                                    </td>
                                    <td className="px-2 py-1.5">
                                        <span className="whitespace-nowrap text-xs text-zinc-500">{formatearFechaPedido(pedido.fechaPedido)}</span>
                                    </td>
                                    <td className="px-2 py-1.5">
                                        <div className="flex justify-center">
                                            <AccionesPedido
                                                pedido={pedido}
                                                onEditar={editar}
                                                onEliminar={(pedido) =>
                                                    eliminar(pedido.id)
                                                }
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};