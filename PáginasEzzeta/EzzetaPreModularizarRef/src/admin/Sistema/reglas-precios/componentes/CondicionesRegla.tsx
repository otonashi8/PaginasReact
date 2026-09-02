import type { ReglaPrecio } from "../TiposReglas";

type Props = {
    regla: ReglaPrecio;
    establecerRegla: React.Dispatch<
        React.SetStateAction<ReglaPrecio>
    >;
};

export const CondicionesRegla = ({
    regla,
    establecerRegla
}: Props) => {
    const configuracion = regla.configuracion ?? {};
    const actualizar = (
        campo: keyof typeof configuracion,
        valor: unknown
    ) => {
        establecerRegla(prev => ({
            ...prev,
            configuracion: {
                ...prev.configuracion,
                [campo]: valor
            }
        }));
    };

    return (
        <section className="space-y-5 border border-zinc-200 bg-white p-4">
            <div>
                <h3 className="text-sm font-semibold text-zinc-900">Condiciones adicionales</h3>
                <p className="mt-0.5 text-xs text-zinc-500">Limita cuándo podrá utilizarse esta regla.</p>
            </div>
            <div className="grid gap-3 lg:grid-cols-4">
                <div>
                    <label className="mb-1.5 block text-[11px] font-medium text-zinc-600">Compra mínima (S/)</label>
                    <input
                        type="number"
                        min={0}
                        value={configuracion.compraMinima ?? 0}
                        onChange={(e) =>
                            actualizar(
                                "compraMinima",
                                Number(e.target.value)
                            )
                        }
                        className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs text-zinc-700 outline-none transition focus:border-zinc-500"
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-[11px] font-medium text-zinc-600">Compra máxima (S/)</label>
                    <input
                        type="number"
                        min={0}
                        value={configuracion.compraMaxima ?? 0}
                        onChange={(e) =>
                            actualizar(
                                "compraMaxima",
                                Number(e.target.value)
                            )
                        }
                        className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs text-zinc-700 outline-none transition focus:border-zinc-500"
                    />
                </div>
            
                <div>
                    <label className="mb-1.5 block text-[11px] font-medium text-zinc-600">Máximo de usos</label>
                    <input
                        type="number"
                        min={0}
                        value={configuracion.maximoUsos ?? 0}
                        onChange={(e) =>
                            actualizar(
                                "maximoUsos",
                                Number(e.target.value)
                            )
                        }
                        className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs text-zinc-700 outline-none transition focus:border-zinc-500"
                    />
                </div>
                <div>
                    <label className="mb-1.5 block text-[11px] font-medium text-zinc-600">Máximo por cliente</label>
                    <input
                        type="number"
                        min={0}
                        value={configuracion.maximoPorCliente ?? 0}
                        onChange={(e) =>
                            actualizar(
                                "maximoPorCliente",
                                Number(e.target.value)
                            )
                        }
                        className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs text-zinc-700 outline-none transition focus:border-zinc-500"
                    />
                </div>
            </div>
            <div className="border-t border-zinc-200 pt-3">
                <label className="flex cursor-pointer items-center gap-2.5">
                    <input
                        type="checkbox"
                        checked={configuracion.acumulable ?? true}
                        onChange={(e) =>
                            actualizar(
                                "acumulable",
                                e.target.checked
                            )
                        }
                        className="h-3.5 w-3.5 accent-zinc-900"
                    />
                    <span className="text-xs text-zinc-700">Permitir combinar esta regla con otras promociones</span>
                </label>
            </div>
        </section>
    );
};