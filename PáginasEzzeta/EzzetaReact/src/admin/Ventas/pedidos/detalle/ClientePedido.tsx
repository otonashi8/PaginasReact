import type { Pedido } from "../TiposPedidos";

type Props = {
    pedido: Pedido;
    establecerPedido: React.Dispatch<
        React.SetStateAction<Pedido>
    >;
};

export const ClientePedido = ({
    pedido,
    establecerPedido
}: Props) => {
    const actualizar = <
        K extends keyof Pedido["cliente"]
    >(
        campo: K,
        valor: Pedido["cliente"][K]
    ) => {
        establecerPedido(prev => ({
            ...prev,
            cliente: {
                ...prev.cliente,
                [campo]: valor
            }
        }));
    };

    return (
        <section className="space-y-5">
            <div className="border-b border-zinc-100 pb-3">
                <h3 className="text-sm font-semibold text-zinc-900">Cliente</h3>
                <p className="mt-0.5 text-xs text-zinc-500">Información del comprador.</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
                <div>
                    <label className="mb-1.5 block text-[11px] font-semibold text-zinc-600">Nombre</label>
                    <input
                        type="text"
                        value={pedido.cliente.nombre}
                        onChange={(e) =>
                            actualizar("nombre", e.target.value)
                        }
                        className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500"
                    />
                </div>
                <div>
                    <label className="mb-1.5 block text-[11px] font-semibold text-zinc-600">Correo</label>

                    <input
                        type="email"
                        value={pedido.cliente.correo}
                        onChange={(e) =>
                            actualizar("correo", e.target.value)
                        }
                        className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500"
                    />
                </div>
                <div>
                    <label className="mb-1.5 block text-[11px] font-semibold text-zinc-600">Teléfono</label>
                    <input
                        type="text"
                        value={pedido.cliente.telefono}
                        onChange={(e) =>
                            actualizar("telefono", e.target.value)
                        }
                        className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500"
                    />
                </div>
            </div>
        </section>
    );
};