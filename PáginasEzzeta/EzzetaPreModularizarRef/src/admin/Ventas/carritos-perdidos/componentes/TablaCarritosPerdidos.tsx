import { Eye, User, Check, Trash2 } from "lucide-react";
import type { CarritoPerdido } from "../tipos/TiposCarritosPerdidos";
import { formatearFechaCarrito } from "../utils/formatearFechaCarrito";
import type { OrdenCarrito } from "../hooks/useCarritosPerdidos";
import { storageManager, StorageKeys } from "../../../../storage";
import { TablaAcciones } from "../../../componentes/TablaAcciones";

type Props = {
    carritos: CarritoPerdido[];
    loading: boolean;
    paginaActual: number;
    paginaTope: number;
    onPaginaChange: (pagina: number) => void;
    orden: OrdenCarrito;
    ordenAsc: boolean;
    cambiarOrden: (campo: OrdenCarrito) => void;
    onVerCarrito: (carrito: CarritoPerdido) => void;
    onVerCliente: (carrito: CarritoPerdido) => void;
    onMarcarRecuperado: (carrito: CarritoPerdido) => void;
    onEliminar: (carrito: CarritoPerdido) => void;
};

const cabeceras: { label: string; campo: OrdenCarrito | "acciones" }[] = [
    { label: "Cliente", campo: "cliente" },
    { label: "Tipo", campo: "tipo" },
    { label: "Correo", campo: "correo" },
    { label: "Cant. Prod.", campo: "cantidad" },
    { label: "Valor", campo: "valor" },
    { label: "Estado", campo: "estado" },
    { label: "Fecha creación", campo: "fecha" },
    { label: "Acciones", campo: "acciones" }
];

export const TablaCarritosPerdidos = ({
    carritos,
    loading,
    paginaActual,
    paginaTope,
    onPaginaChange,
    orden,
    ordenAsc,
    cambiarOrden,
    onVerCarrito,
    onVerCliente,
    onMarcarRecuperado,
    onEliminar
}: Props) => {
    const obtenerUsuarioPorId = (id?: string) => {
        if (!id) return null;
        const users = storageManager.get<Record<string, any>[]>(StorageKeys.USERS) || [];
        return users.find((user) => user.id === id) ?? null;
    };

    const renderCliente = (carrito: CarritoPerdido) => {
        const usuario = obtenerUsuarioPorId(carrito.userId);
        const esGuest = carrito.origen === "guest" || Boolean(carrito.guestId) || !carrito.userId;

        if (esGuest) {
            return carrito.checkoutEmail || carrito.guestId || "Guest";
        }

        return usuario?.username ?? usuario?.email ?? carrito.checkoutEmail ?? carrito.userId ?? "Registrado";
    };

    const renderCorreo = (carrito: CarritoPerdido) => {
        const usuario = obtenerUsuarioPorId(carrito.userId);
        return usuario?.email ?? carrito.checkoutEmail ?? "-";
    };

    const renderEstado = (carrito: CarritoPerdido) => {
        if (carrito.estado === "recuperado") {
            return "Recuperado";
        }

        if (carrito.userId || carrito.checkoutEmail || carrito.checkoutPhone) {
            return "Recuperable";
        }
        return "Perdido";
    };

    return (
        <div className="space-y-3">
            <div className="overflow-hidden border border-zinc-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto text-sm">
                        <thead className="bg-zinc-50 text-left">
                            <tr>
                                {cabeceras.map((col) => {
                                    const campo = col.campo;
                                    return (
                                        <th
                                            key={campo}
                                            className="whitespace-nowrap px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500"
                                        >
                                            {campo !== "acciones" ? (
                                                <button
                                                    type="button"
                                                    onClick={() => cambiarOrden(campo)}
                                                    className="inline-flex items-center gap-1.5 transition hover:text-zinc-900"
                                                >
                                                    {col.label}
                                                    {orden === col.campo && (
                                                        <span className="text-[9px] text-zinc-900">
                                                            {ordenAsc ? "▲" : "▼"}
                                                        </span>
                                                    )}
                                                </button>
                                            ) : (
                                                col.label
                                            )}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={11}
                                        className="px-4 py-10 text-center text-xs text-zinc-400"
                                    >Cargando carritos...
                                    </td>
                                </tr>
                            ) : carritos.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={11}
                                        className="px-4 py-10 text-center text-xs text-zinc-400"
                                    >No hay carritos perdidos.
                                    </td>
                                </tr>
                            ) : (
                                carritos.map((carrito) => (
                                    <tr
                                        key={carrito.id}
                                        className="transition-colors hover:bg-zinc-50/70"
                                    >
                                        <td
                                            className="max-w-[180px] truncate px-4 py-2.5 font-medium text-zinc-900"
                                            title={renderCliente(carrito)}
                                        >{renderCliente(carrito)}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-2.5 text-zinc-600">
                                            {(carrito.origen === "guest" ||
                                                Boolean(carrito.guestId) ||
                                                !carrito.userId)
                                                ? "Guest"
                                                : "Registrado"}
                                        </td>
                                        <td
                                            className="max-w-[180px] truncate px-4 py-2.5 text-zinc-600"
                                            title={renderCorreo(carrito)}
                                        >{renderCorreo(carrito)}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-2.5 text-zinc-600">{carrito.cantidadItems}</td>
                                        <td className="whitespace-nowrap px-4 py-2.5 text-right font-semibold text-zinc-900">S/ {carrito.total.toFixed(2)}</td>
                                        <td className="whitespace-nowrap px-4 py-2.5">{renderEstado(carrito)}</td>
                                        <td className="whitespace-nowrap px-4 py-2.5 text-[11px] text-zinc-500">{formatearFechaCarrito(carrito.fecha)}</td>
                                        <td className="whitespace-nowrap px-4 py-2.5 text-right">
                                            <div className="flex justify-end">
                                                <TablaAcciones align="left">
                                                <button
                                                    type="button"
                                                    onClick={() => onVerCarrito(carrito)}
                                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 transition hover:bg-zinc-100"
                                                    title="Ver carrito"
                                                ><Eye size={14} />Ver
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => onVerCliente(carrito)}
                                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 transition hover:bg-zinc-100"
                                                    title="Ver cliente"
                                                ><User size={14} />Cliente
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onMarcarRecuperado(carrito)}
                                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 transition hover:bg-zinc-100"
                                                    title="Marcar recuperado"
                                                ><Check size={14} />Recuperado
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onEliminar(carrito)}
                                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                                                    title="Eliminar carrito"
                                                ><Trash2 size={14} />Eliminar
                                                </button>
                                                </TablaAcciones>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Paginación */}
            <div className="flex flex-col gap-2 border border-zinc-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-zinc-500">
                    Página{" "}
                    <span className="font-medium text-zinc-900">
                        {paginaActual}
                    </span>{" "}
                    de{" "}
                    <span className="font-medium text-zinc-900">
                        {paginaTope}
                    </span>
                </p>

                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() =>
                            onPaginaChange(Math.max(1, paginaActual - 1))
                        }
                        disabled={paginaActual === 1}
                        className="border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >Anterior
                    </button>
                    <button
                        type="button"
                        onClick={() =>
                            onPaginaChange(
                                Math.min(paginaTope, paginaActual + 1)
                            )
                        }
                        disabled={paginaActual === paginaTope}
                        className="border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >Siguiente
                    </button>
                </div>
            </div>
        </div>
    );
};
