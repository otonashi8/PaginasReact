import type { Pedido } from "../TiposPedidos";
import { calcularTotales } from "../utils/calcularTotales";

type Props = {
    pedido: Pedido;
    establecerPedido: React.Dispatch<
        React.SetStateAction<Pedido>
    >;
};

export const TotalesPedido = ({
    pedido,
    establecerPedido
}: Props) => {

    function actualizar(
        campo: keyof Pedido,
        valor: number
    ) {
        establecerPedido(prev =>
            calcularTotales({
                ...prev,
                [campo]: valor
            })
        );
    }

    return (
        <section className="space-y-5">
            <div className="border-b border-zinc-100 pb-3">
                <h3 className="text-sm font-semibold text-zinc-900">Totales</h3>
                <p className="mt-0.5 text-xs text-zinc-500">Resumen económico del pedido.</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-4">
                <div>
                    <label className="mb-1.5 block text-[11px] font-semibold text-zinc-600">Subtotal</label>
                    <div className="flex h-9 items-center border border-zinc-200 bg-zinc-50 px-2.5 text-xs font-semibold text-zinc-700">S/ {pedido.subtotal.toFixed(2)}</div>
                </div>
                <div>
                    <label className="mb-1.5 block text-[11px] font-semibold text-zinc-600">Descuento</label>
                    <input
                        type="number"
                        min={0}
                        value={pedido.descuentoTotal}
                        onChange={(e) =>
                            actualizar(
                                "descuentoTotal",
                                Number(e.target.value)
                            )
                        }
                        className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 outline-none transition focus:border-zinc-500"
                    />
                </div>
                <div>
                    <label className="mb-1.5 block text-[11px] font-semibold text-zinc-600">Envío</label>
                    <input
                        type="number"
                        min={0}
                        value={pedido.costoEnvio}
                        onChange={(e) =>
                            actualizar(
                                "costoEnvio",
                                Number(e.target.value)
                            )
                        }
                        className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 outline-none transition focus:border-zinc-500"
                    />
                </div>
                <div>
                    <label className="mb-1.5 block text-[11px] font-semibold text-zinc-600">Total</label>
                    <div className="flex h-9 items-center border border-zinc-200 bg-zinc-50 px-2.5 text-xs font-bold text-zinc-900">S/ {pedido.total.toFixed(2)}</div>
                </div>
            </div>
            <div className="border border-emerald-200 bg-emerald-50/70 p-4">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                    <h4 className="text-xs font-semibold text-emerald-900">Vista rápida</h4>
                    <span className="text-[10px] font-medium uppercase tracking-wide text-emerald-700">Resumen</span>
                </div>
                <div className="mt-3 space-y-2 text-xs text-emerald-950">
                    <div className="flex justify-between gap-4">
                        <span>Subtotal</span>
                        <span className="font-medium">S/ {pedido.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span>Descuentos</span>
                        <span className="font-medium">- S/ {pedido.descuentoTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span>Envío</span>
                        <span className="font-medium">S/ {pedido.costoEnvio.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-emerald-200 pt-3">
                        <div className="flex items-center justify-between gap-4 text-sm font-bold text-emerald-950">
                            <span>Total</span>
                            <span>S/ {pedido.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};