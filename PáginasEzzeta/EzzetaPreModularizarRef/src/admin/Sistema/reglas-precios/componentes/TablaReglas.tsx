import type { ReglaPrecio } from "../TiposReglas";
import { tiposRegla } from "../TiposReglas";
import { TablaAcciones } from "../../../componentes/TablaAcciones";

type Props = {
    reglas: ReglaPrecio[];
    editar: (regla: ReglaPrecio) => void;
    cambiarEstado: (regla: ReglaPrecio) => void;
    cambiarPrioridad: (regla: ReglaPrecio, prioridad: number) => void;
    cambiarFechaInicio: (regla: ReglaPrecio, fechaInicio: string) => void;
    cambiarFechaFin: (regla: ReglaPrecio, fechaFin: string) => void;
    eliminar: (id: number) => void;
};

export const TablaReglas = ({
    reglas,
    editar,
    cambiarEstado,
    cambiarPrioridad,
    cambiarFechaInicio,
    cambiarFechaFin,
    eliminar
}: Props) => {
    const obtenerEtiquetaTipo = (
        tipo: ReglaPrecio["tipo"]
    ) => {
        return (
            tiposRegla.find(
                t => t.valor === tipo
            )?.etiqueta ?? tipo
        );
    };

    return (
        <div className="overflow-hidden border border-zinc-200 bg-white">
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto text-xs">
                    <thead className="bg-zinc-50">
                        <tr className="text-left">
                            <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Nombre</th>
                            <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Tipo</th>
                            <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Prioridad</th>
                            <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Cupón</th>
                            <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Estado</th>
                            <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Vigencia</th>
                            <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {reglas.length === 0 && (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-4 py-8 text-center text-xs text-zinc-500"
                                >No existen reglas registradas.
                                </td>
                            </tr>
                        )}
                        {reglas.map(regla => (
                            <tr
                                key={regla.id}
                                className="transition-colors hover:bg-zinc-50/70"
                            >
                                {/* NOMBRE */}
                                <td className="px-4 py-2.5">
                                    <div className="max-w-xs">
                                        <p className="text-[15px] font-semibold text-zinc-900">{regla.nombre}</p>
                                        <p className="mt-0.5 truncate text-[15px] text-zinc-500">{regla.descripcion}</p>
                                    </div>
                                </td>
                                {/* TIPO */}
                                <td className="px-4 py-2.5 text-[15px] text-zinc-700">{obtenerEtiquetaTipo(regla.tipo)}</td>

                                {/* PRIORIDAD */}
                                <td className="px-4 py-2.5">
                                    <input
                                        type="number"
                                        min={1}
                                        value={regla.prioridad}
                                        onChange={(event) =>
                                            cambiarPrioridad(
                                                regla,
                                                Number(event.target.value)
                                            )
                                        }
                                        className="h-8 w-16 border border-zinc-300 px-2 text-[15px] text-zinc-900 outline-none transition focus:border-zinc-500"
                                    />
                                </td>

                                {/* CUPÓN */}
                                <td className="px-4 py-2.5">
                                    {regla.requiereCupon ? (
                                        <span className="inline-flex border border-blue-200 bg-blue-50 px-2 py-1 text-[15px] font-medium text-blue-700">Sí</span>
                                    ) : (
                                        <span className="inline-flex border border-zinc-200 bg-zinc-50 px-2 py-1 text-[15px] font-medium text-zinc-500">No</span>
                                    )}
                                </td>

                                {/* ESTADO */}
                                <td className="px-4 py-2.5">
                                    <button
                                        type="button"
                                        onClick={() => cambiarEstado(regla)}
                                        className={`inline-flex h-7 items-center border px-2.5 text-[15px] font-semibold transition ${
                                            regla.estado
                                                ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                                                : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                                        }`}
                                    >{regla.estado ? 'Activo' : 'Inactivo'}
                                    </button>
                                </td>
                                {/* VIGENCIA */}
                                <td className="px-4 py-2.5">
                                    <div className="flex min-w-[135px] flex-col gap-1.5">
                                        <input
                                            type="date"
                                            value={regla.fechaInicio ?? ''}
                                            onChange={(event) =>
                                                cambiarFechaInicio(
                                                    regla,
                                                    event.target.value
                                                )
                                            }
                                            className="h-8 w-full border border-zinc-300 px-2 text-[15px] text-zinc-900 outline-none transition focus:border-zinc-500"
                                        />
                                        <input
                                            type="date"
                                            value={regla.fechaFin ?? ''}
                                            onChange={(event) =>
                                                cambiarFechaFin(
                                                    regla,
                                                    event.target.value
                                                )
                                            }
                                            className="h-8 w-full border border-zinc-300 px-2 text-[15px] text-zinc-900 outline-none transition focus:border-zinc-500"
                                        />
                                    </div>
                                </td>
                                {/* ACCIONES */}
                                <td className="px-4 py-2.5 text-right">
                                    <TablaAcciones>
                                        <button
                                            onClick={() => editar(regla)}
                                            className="block w-full px-3 py-2 text-left text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
                                        >Editar
                                        </button>
                                        <button
                                            onClick={() => eliminar(regla.id)}
                                            className="block w-full px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                                        >Eliminar
                                        </button>
                                    </TablaAcciones>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};