import type { Pedido } from "../TiposPedidos";
import { ClientePedido } from "../detalle/ClientePedido";
import { DireccionPedido } from "../detalle/DireccionPedido";
import { ProductosPedido } from "../detalle/ProductosPedido";
import PagoPedido from "../detalle/PagoPedido";
import { TotalesPedido } from "./TotalesPedido";
import {HistorialEstados} from "./HistorialEstados";

type Props = {
    pedido: Pedido;
    establecerPedido: React.Dispatch<
        React.SetStateAction<Pedido>
    >;
    guardar: () => void;
    cerrar: () => void;
    modoEdicion: boolean;
};

export const FormularioPedido = ({
    pedido,
    establecerPedido,
    guardar,
    cerrar,
    modoEdicion
}: Props) => {
    const actualizar = <
        K extends keyof Pedido
    >(
        campo: K,
        valor: Pedido[K]
    ) => {
        establecerPedido(prev => ({
            ...prev,
            [campo]: valor
        }));
    };
    return (
        <>
            <div className="border-b border-zinc-200 px-5 py-3">
                <h2 className="text-lg font-semibold leading-tight text-zinc-900">{modoEdicion ? "Editar pedido" : "Nuevo pedido"}</h2>
                <p className="mt-0.5 text-xs text-zinc-500">Administra la información del pedido.</p>
            </div>
            <div className="p-5">
                <section className="space-y-5">
                    <div className="border-b border-zinc-100 pb-3">
                        <h3 className="text-sm font-semibold text-zinc-900">Información general</h3>
                        <p className="mt-0.5 text-xs text-zinc-500">Datos principales del pedido.</p>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-[11px] font-semibold text-zinc-600">Número de pedido</label>
                            <input
                                type="text"
                                value={pedido.numeroPedido}
                                onChange={(e) =>
                                    actualizar(
                                        "numeroPedido",
                                        e.target.value
                                    )
                                }
                                className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-[11px] font-semibold text-zinc-600">Estado</label>
                            <select
                                value={pedido.estado}
                                onChange={(e) =>
                                    actualizar(
                                        "estado",
                                        e.target.value as Pedido["estado"]
                                    )
                                }
                                className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 outline-none transition focus:border-zinc-500"
                            >
                                <option value="pendiente">Pendiente</option>
                                <option value="pagado">Pagado</option>
                                <option value="preparacion">Preparación</option>
                                <option value="enviado">Enviado</option>
                                <option value="entregado">Entregado</option>
                                <option value="cancelado">Cancelado</option>
                            </select>
                        </div>
                    </div>
                </section>

                <div className="mt-6 space-y-6">
                    {/* Cliente */}
                    <ClientePedido pedido={pedido} establecerPedido={establecerPedido}/>
                    {/* Dirección */}
                    <DireccionPedido pedido={pedido} establecerPedido={establecerPedido}/>
                    {/* Productos */}
                    <ProductosPedido pedido={pedido} establecerPedido={establecerPedido}/>
                    {/* Pago */}
                    <PagoPedido pedido={pedido} establecerPedido={establecerPedido}/>
                    {/* Totales */}
                    <TotalesPedido pedido={pedido} establecerPedido={establecerPedido}/>
                    {/* Historial de estados */}
                    <HistorialEstados pedido={pedido} establecerPedido={establecerPedido}/>
                </div>
            </div>
            {/* Acciones */}
            <div className="flex justify-end gap-2 border-t border-zinc-200 bg-zinc-50/50 px-5 py-3">
                <button
                    onClick={cerrar}
                    className="h-9 border border-zinc-300 bg-white px-4 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100"
                >Cancelar
                </button>
                <button
                    onClick={guardar}
                    className="h-9 bg-zinc-950 px-4 text-xs font-medium text-white transition hover:bg-zinc-800"
                >{modoEdicion ? "Guardar cambios" : "Crear pedido"}
                </button>
            </div>
        </>
    );
};