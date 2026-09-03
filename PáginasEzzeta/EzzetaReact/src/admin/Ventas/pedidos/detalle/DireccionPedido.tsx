import type { Pedido } from "../TiposPedidos";

type Props = {
    pedido: Pedido;
    establecerPedido: React.Dispatch<
        React.SetStateAction<Pedido>
    >;
};

export const DireccionPedido = ({
    pedido,
    establecerPedido
}: Props) => {
    const actualizar = <
        K extends keyof Pedido["direccion"]
    >(
        campo: K,
        valor: Pedido["direccion"][K]
    ) => {
        establecerPedido(prev => ({
            ...prev,
            direccion: {
                ...prev.direccion,
                [campo]: valor
            }
        }));
    };

    return (
        <section className="space-y-5">
            <div className="border-b border-zinc-100 pb-3">
                <h3 className="text-sm font-semibold text-zinc-900">Dirección de entrega</h3>
                <p className="mt-0.5 text-xs text-zinc-500">Información utilizada para el envío.</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
                <div>
                    <label className="mb-1.5 block text-[11px] font-semibold text-zinc-600">Departamento</label>
                    <input
                        type="text"
                        value={pedido.direccion.departamento}
                        onChange={(e) =>
                            actualizar("departamento", e.target.value)
                        }
                        className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500"
                    />
                </div>
                <div>
                    <label className="mb-1.5 block text-[11px] font-semibold text-zinc-600">Provincia</label>
                    <input
                        type="text"
                        value={pedido.direccion.provincia}
                        onChange={(e) =>
                            actualizar("provincia", e.target.value)
                        }
                        className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500"
                    />
                </div>
                <div>
                    <label className="mb-1.5 block text-[11px] font-semibold text-zinc-600">Distrito</label>
                    <input
                        type="text"
                        value={pedido.direccion.distrito}
                        onChange={(e) =>
                            actualizar("distrito", e.target.value)
                        }
                        className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500"
                    />
                </div>
                <div>
                    <label className="mb-1.5 block text-[11px] font-semibold text-zinc-600">Código postal</label>
                    <input
                        type="text"
                        value={pedido.direccion.codigoPostal}
                        onChange={(e) =>
                            actualizar("codigoPostal", e.target.value)
                        }
                        className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500"
                    />
                </div>

                <div className="lg:col-span-2">
                    <label className="mb-1.5 block text-[11px] font-semibold text-zinc-600">Dirección</label>
                    <input
                        type="text"
                        value={pedido.direccion.direccion}
                        onChange={(e) =>
                            actualizar("direccion", e.target.value)
                        }
                        className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500"
                    />
                </div>
                <div className="lg:col-span-2">
                    <label className="mb-1.5 block text-[11px] font-semibold text-zinc-600">Referencia</label>
                    <textarea
                        rows={2}
                        value={pedido.direccion.referencia}
                        onChange={(e) =>
                            actualizar("referencia", e.target.value)
                        }
                        className="w-full resize-none border border-zinc-300 bg-white px-2.5 py-2 text-xs text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500"
                    />
                </div>
            </div>
        </section>
    );
};