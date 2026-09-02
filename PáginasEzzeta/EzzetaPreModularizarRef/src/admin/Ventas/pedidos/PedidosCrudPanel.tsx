import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { PermissionAccess } from "../../hooks/usePermissions";
import { usePedidos } from "./hooks/usePedidos";
import { TablaPedidos } from "./componentes/TablaPedidos";
import { ModalPedido } from "./componentes/ModalPedido";
import { FiltrosPedidos } from "./componentes/FiltrosPedidos";
import { ResumenPedidos } from "./detalle/ResumenPedidos";
import { ExportButton } from "../../componentes/ExportButton";
import { PaginacionClientes } from "../../componentes/Paginacion";
import { buildCsv, downloadCsv, formatFilenameDateRange } from "../../utils/exportCsv";
import { registrarExportacion } from "../../../services/auditService";
import { buildVentasPorDia } from "./utils/ventasPorDia";
import { paginarLista } from "../../utils/paginacion";

type Props = {
    access: PermissionAccess;
};

export const PedidosCrudPanel = ({
    access: _
}: Props) => {
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [puntoHover, setPuntoHover] = useState<{ x: number; y: number; label: string; ventas: number } | null>(null);
    const elementosPorPagina = 10;

    const {
        pedidos,
        pedidosFiltrados,
        busqueda,
        setBusqueda,
        estadoFiltro,
        setEstadoFiltro,
        pedidoActual,
        establecerPedidoActual,
        modalAbierto,
        modoEdicion,
        abrirNuevoPedido,
        abrirEdicion,
        cerrarModal,
        guardarPedido,
        borrarPedido
    } = usePedidos();

    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda, estadoFiltro, pedidosFiltrados.length]);

    const paginaPedidos = useMemo(
        () => paginarLista(pedidosFiltrados, paginaActual, elementosPorPagina),
        [paginaActual, pedidosFiltrados],
    );

    const paginaTope = Math.max(1, Math.ceil(pedidosFiltrados.length / elementosPorPagina));

    const pedidosEnRango = useMemo(() => {
        return pedidosFiltrados.filter((pedido) => {
            if (!fechaInicio && !fechaFin) {
                return true;
            }

            const fechaPedido = new Date(pedido.fechaPedido);
            const inicio = fechaInicio ? new Date(`${fechaInicio}T00:00:00`) : null;
            const fin = fechaFin ? new Date(`${fechaFin}T23:59:59.999`) : null;

            if (inicio && fechaPedido < inicio) {
                return false;
            }

            if (fin && fechaPedido > fin) {
                return false;
            }

            return true;
        });
    }, [fechaFin, fechaInicio, pedidosFiltrados]);

    const ventasPorDia = useMemo(
        () => buildVentasPorDia(pedidosEnRango, fechaInicio, fechaFin),
        [fechaFin, fechaInicio, pedidosEnRango],
    );

    const maxVentas = Math.max(...ventasPorDia.map((item) => item.ventas), 1);

    const chartPoints = ventasPorDia.length > 0
        ? ventasPorDia.map((item, index) => {
            const x = ventasPorDia.length === 1 ? 50 : 8 + (index / Math.max(1, ventasPorDia.length - 1)) * 84;
            const y = 78 - (item.ventas / maxVentas) * 58;
            return `${x},${y}`;
        }).join(' ')
        : '';

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Pedidos</h1>
                    <p className="text-zinc-500">Administración de pedidos.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <ExportButton
                        onExport={() => {
                            if (pedidosEnRango.length === 0) {
                                window.alert('No hay datos para exportar con los filtros actuales.');
                                return;
                            }
                            const filenameRange = formatFilenameDateRange(fechaInicio, fechaFin);
                            const filename = `pedidos${filenameRange ? `_${filenameRange}` : `_${new Date().toISOString().slice(0, 10)}`}`;
                            const csv = buildCsv<typeof pedidosEnRango[number]>(pedidosEnRango, [
                                { label: 'Número pedido', value: (row) => row.numeroPedido },
                                { label: 'Cliente', value: (row) => row.cliente.nombre },
                                { label: 'Correo cliente', value: (row) => row.cliente.correo },
                                { label: 'Teléfono cliente', value: (row) => row.cliente.telefono },
                                { label: 'Estado', value: (row) => row.estado },
                                { label: 'Método de pago', value: (row) => row.metodoPago },
                                { label: 'Subtotal', value: (row) => row.subtotal },
                                { label: 'Descuento total', value: (row) => row.descuentoTotal },
                                { label: 'Costo envío', value: (row) => row.costoEnvio },
                                { label: 'Total', value: (row) => row.total },
                                { label: 'Fecha pedido', value: (row) => row.fechaPedido },
                                { label: 'Fecha actualización', value: (row) => row.fechaActualizacion },
                                {
                                    label: 'Productos',
                                    value: (row) => row.productos.map((product) => `${product.cantidad}x ${product.nombre}`).join('; '),
                                },
                            ]);
                            downloadCsv(`${filename}.csv`, csv);
                            registrarExportacion(
                                'Pedidos',
                                'Exportación',
                                'Pedidos',
                                `Se exportaron ${pedidosEnRango.length} pedidos en CSV.`,
                                'orders.export',
                            );
                        }}
                        className="mb-3"
                    />
                    <button
                        type="button"
                        onClick={abrirNuevoPedido}
                        className="flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-white transition hover:bg-zinc-800"
                    ><Plus size={18} />Nuevo pedido
                    </button>
                </div>
            </div>
            <ResumenPedidos pedidos={pedidos} />
            <div className="rounded-none border border-zinc-200 bg-white p-3 shadow-sm">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">Ventas</p>
                        <h2 className="mt-0.5 text-base font-semibold text-zinc-900">Ventas por día</h2>
                    </div>
                    <div className="flex flex-wrap items-end gap-2">
                        <label className="text-xs text-zinc-600">
                            <span className="mb-1 block">Desde</span>
                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={(event) => setFechaInicio(event.target.value)}
                                className="w-full rounded-none border border-zinc-300 px-2 py-1.5 text-xs outline-none transition focus:border-zinc-900"
                            />
                        </label>
                        <label className="text-xs text-zinc-600">
                            <span className="mb-1 block">Hasta</span>
                            <input
                                type="date"
                                value={fechaFin}
                                onChange={(event) => setFechaFin(event.target.value)}
                                className="w-full rounded-none border border-zinc-300 px-2 py-1.5 text-xs outline-none transition focus:border-zinc-900"
                            />
                        </label>
                        <button
                            type="button"
                            onClick={() => {
                                setFechaInicio("");
                                setFechaFin("");
                            }}
                            className="rounded-none border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-700 transition hover:border-zinc-900"
                        >Limpiar
                        </button>
                        <ExportButton
                            onExport={() => {
                                if (ventasPorDia.length === 0) {
                                    window.alert('No hay ventas para exportar con este rango.');
                                    return;
                                }
                                const filenameRange = formatFilenameDateRange(fechaInicio, fechaFin);
                                const filename = `ventas_por_dia${filenameRange ? `_${filenameRange}` : `_${new Date().toISOString().slice(0, 10)}`}`;
                                const csv = buildCsv<typeof ventasPorDia[number]>(ventasPorDia, [
                                    { label: 'Fecha', value: (row) => row.fecha },
                                    { label: 'Etiqueta', value: (row) => row.label },
                                    { label: 'Ventas', value: (row) => row.ventas },
                                ]);
                                downloadCsv(`${filename}.csv`, csv);
                                registrarExportacion(
                                    'Pedidos',
                                    'Analytics',
                                    'Ventas por día',
                                    `Se exportaron ${ventasPorDia.length} días de ventas.`,
                                    'orders.sales_by_day.export',
                                );
                            }}
                        />
                    </div>
                </div>
                <div className="mt-4">
                    {ventasPorDia.length === 0 ? (
                        <p className="text-xs text-zinc-500">Sin ventas para este rango de fechas.</p>
                    ) : (
                        <div className="relative h-60 w-full">
                            <svg
                                viewBox="0 0 100 100"
                                className="h-60 w-full"
                                preserveAspectRatio="none"
                                aria-label="Ventas por día"
                            >
                                <line
                                    x1="8"
                                    y1="82"
                                    x2="92"
                                    y2="82"
                                    stroke="#d4d4d8"
                                    strokeWidth="0.12"
                                />
                                <polyline
                                    fill="none"
                                    stroke="#111827"
                                    strokeWidth="0.12"
                                    points={chartPoints}
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                />
                                {ventasPorDia.map((row, index) => {
                                    const x =
                                        ventasPorDia.length === 1
                                            ? 50
                                            : 8 +
                                            (index / Math.max(1, ventasPorDia.length - 1)) * 84;
                                    const y = 78 - (row.ventas / maxVentas) * 58;
                                    return (
                                        <g key={row.fecha}>
                                            <circle
                                                cx={x}
                                                cy={y}
                                                r={
                                                    puntoHover?.label === row.label
                                                        ? 1.7
                                                        : 1.1
                                                }
                                                fill="#111827"
                                                stroke="#f5f5f5"
                                                strokeWidth="0.2"
                                                className="cursor-pointer"
                                                onMouseEnter={() =>
                                                    setPuntoHover({
                                                        x,
                                                        y,
                                                        label: row.label,
                                                        ventas: row.ventas,
                                                    })
                                                }
                                                onMouseLeave={() => setPuntoHover(null)}
                                            />
                                        </g>
                                    );
                                })}
                            </svg>
                            {puntoHover && (
                                <div
                                    className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full border border-zinc-200 bg-white px-2 py-1 text-[9px] font-medium text-zinc-700 shadow-sm"
                                    style={{
                                        left: `${puntoHover.x}%`,
                                        top: `${Math.max(8, puntoHover.y)}%`,
                                    }}
                                >
                                    <div>Generado: S/ {puntoHover.ventas.toFixed(2)}</div>
                                    <div className="text-zinc-400">{puntoHover.label}</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <FiltrosPedidos
                busqueda={busqueda}
                onBusquedaChange={setBusqueda}
                estado={estadoFiltro}
                onEstadoChange={setEstadoFiltro}
            />

            <TablaPedidos
                pedidos={paginaPedidos}
                editar={abrirEdicion}
                eliminar={borrarPedido}
            />

            <PaginacionClientes
                paginaActual={paginaActual}
                paginaTope={paginaTope}
                onPaginaChange={setPaginaActual}
            />

            <ModalPedido
                abierto={modalAbierto}
                pedido={pedidoActual}
                establecerPedido={establecerPedidoActual}
                guardar={guardarPedido}
                cerrar={cerrarModal}
                modoEdicion={modoEdicion}
            />
        </div>
    );
};