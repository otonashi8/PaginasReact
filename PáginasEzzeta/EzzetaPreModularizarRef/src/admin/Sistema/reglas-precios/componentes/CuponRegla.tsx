import type { ReglaPrecio } from "../TiposReglas";

type Props = {
    regla: ReglaPrecio;
    establecerRegla: React.Dispatch<
        React.SetStateAction<ReglaPrecio>
    >;
};

export const CuponRegla = ({
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
            requiereCupon:
                campo === "cupon"
                    ? Boolean(valor)
                    : prev.requiereCupon,
            configuracion: {
                ...prev.configuracion,
                [campo]: valor
            }
        }));
    };

    return (
        <section className="space-y-5 border border-zinc-200 bg-white p-4">
            <div>
                <h3 className="text-sm font-semibold text-zinc-900">Cupón</h3>
                <p className="mt-0.5 max-w-2xl text-xs leading-relaxed text-zinc-500">Si se especifica un código, la regla solamente se aplicará cuando el cliente ingrese ese cupón.</p>
            </div>
            <div className="border-t border-zinc-200 pt-3">
                <label className="flex cursor-pointer items-center gap-2.5">
                    <input
                        type="checkbox"
                        checked={regla.requiereCupon}
                        onChange={(e) =>
                            establecerRegla((prev) => ({
                                ...prev,
                                requiereCupon: e.target.checked,
                                configuracion: {
                                    ...prev.configuracion,
                                    cupon: e.target.checked
                                        ? prev.configuracion.cupon ?? ""
                                        : "",
                                },
                            }))
                        }
                        className="h-3.5 w-3.5 accent-zinc-900"
                    />
                    <span className="text-xs font-medium text-zinc-700">Requerir cupón</span>
                </label>
            </div>
            {regla.requiereCupon && (
                <div>
                    <label className="mb-1.5 block text-[11px] font-medium text-zinc-600">Código del cupón</label>
                    <input
                        type="text"
                        value={configuracion.cupon ?? ""}
                        onChange={(e) =>
                            actualizar("cupon", e.target.value)
                        }
                        placeholder="Ej: BIENVENIDO10"
                        className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs text-zinc-700 uppercase outline-none transition placeholder:normal-case placeholder:text-zinc-400 focus:border-zinc-500"
                    />
                </div>
            )}
        </section>
    );
};