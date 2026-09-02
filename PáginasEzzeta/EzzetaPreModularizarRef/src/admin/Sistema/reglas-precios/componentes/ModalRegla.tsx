import {RenderizadorTipoRegla} from "./RenderizadorTipoRegla";
import {CondicionesRegla} from "./CondicionesRegla";
import {CuponRegla} from "./CuponRegla";
import {tiposRegla,type ReglaPrecio,type TipoReglaPrecio} from "../TiposReglas";

type Props = {
    abierto: boolean;
    regla: ReglaPrecio;
    establecerRegla: React.Dispatch<
        React.SetStateAction<ReglaPrecio>
    >;
    modoEdicion: boolean;
    cerrar: () => void;
    guardar: () => void;
};

export const ModalRegla = ({
    abierto,
    regla,
    establecerRegla,
    modoEdicion,
    cerrar,
    guardar
}: Props) => {

    if (!abierto) {
        return null;
    }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4">
            <div className="flex max-h-[92vh] w-full max-w-7xl flex-col bg-white shadow-xl">

                {/* HEADER */}
                <div className="border-b border-zinc-200 px-5 py-3.5">
                    <h2 className="text-lg font-semibold text-zinc-900">
                        {modoEdicion ? "Editar regla" : "Nueva regla"}
                    </h2>

                    <p className="mt-0.5 text-xs text-zinc-500">
                        Configure una regla de precios.
                    </p>
                </div>

                {/* CONTENIDO */}
                <div className="flex-1 overflow-y-auto">
                    <div className="grid gap-5 p-5 xl:grid-cols-[320px_1fr]">
                        <section className="space-y-4">
                            <section className="space-y-4 border border-zinc-200 bg-white p-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-zinc-900">Información general</h3>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-medium text-zinc-700">Nombre</label>
                                        <input
                                            type="text"
                                            value={regla.nombre}
                                            onChange={(e) =>
                                                establecerRegla(prev => ({
                                                    ...prev,
                                                    nombre: e.target.value
                                                }))
                                            }
                                            className="h-9 w-full border border-zinc-300 px-2.5 text-xs outline-none transition focus:border-zinc-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-medium text-zinc-700">Descripción</label>
                                        <textarea
                                            rows={3}
                                            value={regla.descripcion}
                                            onChange={(e) =>
                                                establecerRegla(prev => ({
                                                    ...prev,
                                                    descripcion: e.target.value
                                                }))
                                            }
                                            className="w-full resize-none border border-zinc-300 px-2.5 py-2 text-xs outline-none transition focus:border-zinc-500"
                                        />
                                    </div>
                                </div>
                            </section>
                            <section className="space-y-4 border border-zinc-200 bg-white p-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-zinc-900">Configuración</h3>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-medium text-zinc-700">Tipo de regla</label>
                                        <select
                                            value={regla.tipo}
                                            onChange={(e) =>
                                                establecerRegla(prev => ({
                                                    ...prev,
                                                    tipo: e.target.value as TipoReglaPrecio
                                                }))
                                            }
                                            className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs outline-none transition focus:border-zinc-500"
                                        >
                                            {tiposRegla.map(tipo => (
                                                <option
                                                    key={tipo.valor}
                                                    value={tipo.valor}
                                                >{tipo.etiqueta}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2.5">
                                        <div>
                                            <label className="mb-1.5 block text-[11px] font-medium text-zinc-700">Prioridad</label>
                                            <input
                                                type="number"
                                                min={1}
                                                value={regla.prioridad}
                                                onChange={(e) =>
                                                    establecerRegla(prev => ({
                                                        ...prev,
                                                        prioridad: Number(e.target.value)
                                                    }))
                                                }
                                                className="h-9 w-full border border-zinc-300 px-2.5 text-xs outline-none transition focus:border-zinc-500"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <label className="flex h-9 w-full items-center gap-2 border border-zinc-200 px-2.5 text-xs text-zinc-700">
                                                <input
                                                    type="checkbox"
                                                    checked={regla.estado}
                                                    onChange={(e) =>
                                                        establecerRegla(prev => ({
                                                            ...prev,
                                                            estado: e.target.checked
                                                        }))
                                                    }
                                                    className="h-3.5 w-3.5 accent-zinc-900"
                                                />Regla activa
                                            </label>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2.5">
                                        <div>
                                            <label className="mb-1.5 block text-[11px] font-medium text-zinc-700">Inicio</label>
                                            <input
                                                type="date"
                                                value={regla.fechaInicio}
                                                onChange={(e) =>
                                                    establecerRegla(prev => ({
                                                        ...prev,
                                                        fechaInicio: e.target.value
                                                    }))
                                                }
                                                className="h-9 w-full border border-zinc-300 px-2.5 text-xs outline-none transition focus:border-zinc-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-[11px] font-medium text-zinc-700">Fin</label>
                                            <input
                                                type="date"
                                                value={regla.fechaFin}
                                                onChange={(e) =>
                                                    establecerRegla(prev => ({
                                                        ...prev,
                                                        fechaFin: e.target.value
                                                    }))
                                                }
                                                className="h-9 w-full border border-zinc-300 px-2.5 text-xs outline-none transition focus:border-zinc-500"
                                            />
                                        </div>
                                    </div>

                                </div>
                            </section>
                        </section>
                        <section className="space-y-4">
                            <RenderizadorTipoRegla
                                regla={regla}
                                establecerRegla={establecerRegla}
                            />
                            <CondicionesRegla
                                regla={regla}
                                establecerRegla={establecerRegla}
                            />
                            <CuponRegla
                                regla={regla}
                                establecerRegla={establecerRegla}
                            />
                        </section>
                    </div>
                </div>
                {/* FOOTER */}
                <div className="flex justify-end gap-2 border-t border-zinc-200 bg-zinc-50 px-5 py-3">
                    <button
                        onClick={cerrar}
                        className="h-9 border border-zinc-300 bg-white px-4 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100"
                    >Cancelar
                    </button>
                    <button
                        onClick={guardar}
                        className="h-9 bg-black px-4 text-xs font-medium text-white transition hover:bg-zinc-800"
                    >Guardar regla
                    </button>
                </div>
            </div>
        </div>
    );
};