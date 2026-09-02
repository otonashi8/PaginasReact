import type { ReglaPrecio } from "../TiposReglas";
import { SelectorTipoRegla } from "./SelectorTipoRegla";
import { RenderizadorTipoRegla } from "./RenderizadorTipoRegla";

type Props = {
    regla: ReglaPrecio;
    establecerRegla: React.Dispatch<
        React.SetStateAction<ReglaPrecio>
    >;
    guardar: () => void;
    cerrar: () => void;
    modoEdicion: boolean;
};

export const FormularioRegla = ({
    regla,
    establecerRegla,
    guardar,
    cerrar,
    modoEdicion
}: Props) => {
    const actualizar = <
        K extends keyof ReglaPrecio
    >(
        campo: K,
        valor: ReglaPrecio[K]
    ) => {
        establecerRegla(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4">
            <div className="flex max-h-[92vh] w-full max-w-6xl flex-col bg-white shadow-xl">
                <div className="border-b border-zinc-200 px-5 py-3.5">
                    <h2 className="text-lg font-semibold text-zinc-900">{modoEdicion ? "Editar regla" : "Nueva regla"}</h2>
                    <p className="mt-0.5 text-xs text-zinc-500">Configure una regla de precios.</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <div className="grid gap-6 p-5 xl:grid-cols-[320px_1fr]">
                        <section className="space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold text-zinc-900">Información general</h3>
                                <p className="mt-0.5 text-xs text-zinc-500">Datos básicos de la regla.</p>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-medium text-zinc-600">Nombre</label>
                                    <input
                                        type="text"
                                        value={regla.nombre}
                                        onChange={(e) =>
                                            actualizar(
                                                "nombre",
                                                e.target.value
                                            )
                                        }
                                        className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs text-zinc-700 outline-none transition focus:border-zinc-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-medium text-zinc-600">Prioridad</label>
                                        <input
                                            type="number"
                                            min={1}
                                            value={regla.prioridad}
                                            onChange={(e) =>
                                                actualizar(
                                                    "prioridad",
                                                    Number(e.target.value)
                                                )
                                            }
                                            className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs text-zinc-700 outline-none transition focus:border-zinc-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-medium text-zinc-600">Estado</label>
                                        <select
                                            value={
                                                regla.estado
                                                    ? "activo"
                                                    : "inactivo"
                                            }
                                            onChange={(e) =>
                                                actualizar(
                                                    "estado",
                                                    e.target.value === "activo"
                                                )
                                            }
                                            className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs text-zinc-700 outline-none transition focus:border-zinc-500"
                                        >
                                            <option value="activo">Activa</option>
                                            <option value="inactivo">Inactiva</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-medium text-zinc-600">Inicio</label>
                                        <input
                                            type="date"
                                            value={regla.fechaInicio}
                                            onChange={(e) =>
                                                actualizar(
                                                    "fechaInicio",
                                                    e.target.value
                                                )
                                            }
                                            className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs text-zinc-700 outline-none transition focus:border-zinc-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-medium text-zinc-600">Fin</label>
                                        <input
                                            type="date"
                                            value={regla.fechaFin}
                                            onChange={(e) =>
                                                actualizar(
                                                    "fechaFin",
                                                    e.target.value
                                                )
                                            }
                                            className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs text-zinc-700 outline-none transition focus:border-zinc-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-medium text-zinc-600">Activación</label>
                                    <label className="flex h-9 cursor-pointer items-center gap-2.5 border border-zinc-300 px-2.5 transition hover:bg-zinc-50">
                                        <input
                                            type="checkbox"
                                            checked={regla.requiereCupon}
                                            onChange={(e) =>
                                                actualizar(
                                                    "requiereCupon",
                                                    e.target.checked
                                                )
                                            }
                                            className="h-3.5 w-3.5 accent-zinc-900"
                                        />
                                        <span className="text-xs text-zinc-700">Requiere cupón</span>
                                    </label>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-medium text-zinc-600">Descripción</label>
                                    <textarea
                                        rows={3}
                                        value={regla.descripcion}
                                        onChange={(e) =>
                                            actualizar(
                                                "descripcion",
                                                e.target.value
                                            )
                                        }
                                        className="w-full resize-none border border-zinc-300 bg-white px-2.5 py-2 text-xs text-zinc-700 outline-none transition focus:border-zinc-500"
                                    />
                                </div>
                            </div>
                        </section>
                        <section className="space-y-5">
                            <SelectorTipoRegla
                                regla={regla}
                                establecerRegla={establecerRegla}
                            />
                            <RenderizadorTipoRegla
                                regla={regla}
                                establecerRegla={establecerRegla}
                            />
                        </section>
                    </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-zinc-200 bg-zinc-50 px-5 py-3">
                    <button
                        type="button"
                        onClick={cerrar}
                        className="h-9 border border-zinc-300 bg-white px-4 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100"
                    >Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={guardar}
                        className="h-9 bg-black px-4 text-xs font-medium text-white transition hover:bg-zinc-800"
                    >
                        {modoEdicion
                            ? "Actualizar regla"
                            : "Crear regla"}
                    </button>
                </div>
            </div>
        </div>
    );
};