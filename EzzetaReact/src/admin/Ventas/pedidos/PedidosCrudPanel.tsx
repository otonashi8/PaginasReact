import { Plus } from "lucide-react";
import type { PermissionAccess } from "../../hooks/usePermissions";
import { usePedidos } from "./hooks/usePedidos";
import { TablaPedidos } from "./componentes/TablaPedidos";
import { ModalPedido } from "./componentes/ModalPedido";
import { FiltrosPedidos } from "./componentes/FiltrosPedidos";
import { ResumenPedidos } from "./detalle/ResumenPedidos";
import { ExportButton } from "../../componentes/ExportButton";
import { buildCsv, downloadCsv, formatFilenameDateRange } from "../../utils/exportCsv";
import { registrarExportacion } from "../../../services/auditService";

type Props = {
    access: PermissionAccess;
};

export const PedidosCrudPanel = ({
    access: _
}: Props) => {

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

    return (
        <div className="space-y-6">

            {/* Encabezado */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Pedidos</h1>
                    <p className="text-zinc-500">Administración de pedidos.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <ExportButton
                        onExport={() => {
                            if (pedidosFiltrados.length === 0) {
                                window.alert('No hay datos para exportar con los filtros actuales.');
                                return;
                            }

                            const filenameRange = formatFilenameDateRange();
                            const filename = `pedidos${filenameRange ? `_${filenameRange}` : `_${new Date().toISOString().slice(0, 10)}`}`;
                            const csv = buildCsv<typeof pedidosFiltrados[number]>(pedidosFiltrados, [
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
                                `Se exportaron ${pedidosFiltrados.length} pedidos en CSV.`,
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

            {/* Resumen */}
            <ResumenPedidos pedidos={pedidos} />

            {/* Buscador */}
            <FiltrosPedidos
                busqueda={busqueda}
                onBusquedaChange={setBusqueda}
                estado={estadoFiltro}
                onEstadoChange={setEstadoFiltro}
            />

            {/* Tabla */}
            <TablaPedidos
                pedidos={pedidosFiltrados}
                editar={abrirEdicion}
                eliminar={borrarPedido}
            />

            {/* Modal */}
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