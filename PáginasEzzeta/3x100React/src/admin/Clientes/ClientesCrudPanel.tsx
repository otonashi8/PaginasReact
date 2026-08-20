import { useLocation } from 'react-router-dom';
import { useClientes } from "./Clientes/hooks/useClientes";
import { useClientesDashboard } from "./Clientes/hooks/useClientesDashboard";
import { ClientesDashboard } from "./Clientes/ClientesDashboard";
import { TablaClientes } from "./Clientes/TablaClientes";
import { FiltrosClientes } from "./Clientes/componentes/FiltrosClientes";
import { PaginacionClientes } from "../componentes/Paginacion";
import { ModalClienteInfo } from "./Clientes/componentes/ModalClienteInfo";
import { ModalEditarCliente } from "./Clientes/componentes/ModalEditarCliente";
import { ExportButton } from "../componentes/ExportButton";
import { buildCsv, downloadCsv, formatFilenameDateRange } from "../utils/exportCsv";
import { registrarExportacion } from "../../services/auditService";
import { FormulariosCrudPanel } from './Formularios/FormulariosCrudPanel';

export const ClientesCrudPanel = () => {
    const location = useLocation();
    const esRutaFormularios = location.pathname.toLowerCase().includes('/clientes/formularios');

    if (esRutaFormularios) {
        return <FormulariosCrudPanel />;
    }
    const {
        clientes,
        clientesOrdenados,
        clientesPagina,
        clienteSeleccionado,
        clienteEnEdicion,
        busqueda,
        estadoFiltro,
        orden,
        planFiltro,
        tipoFiltro,
        paginaActual,
        paginaTope,
        setBusqueda,
        setEstadoFiltro,
        cambiarOrden,
        setPlanFiltro,
        setTipoFiltro,
        cambiarPagina,
        abrirPerfilCliente,
        editarCliente,
        guardarEdicionCliente,
        eliminarCliente,
        cerrarPerfilCliente,
        cerrarEdicionCliente
    } = useClientes();
    const { kpis, comparativa, rankings, planCounts } = useClientesDashboard(clientes);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Clientes</h1>
                    <p className="text-zinc-500">Administración de clientes de 3x100.</p>
                </div>
            </div>

            <ClientesDashboard
                kpis={kpis}
                comparativa={comparativa}
                rankings={rankings}
                planCounts={planCounts}
            />

            <div className="flex items-center justify-end">
                <ExportButton
                    onExport={() => {
                        if (clientesOrdenados.length === 0) {
                            window.alert('No hay datos para exportar con los filtros actuales.');
                            return;
                        }

                        const filenameRange = formatFilenameDateRange();
                        const filename = `clientes${filenameRange ? `_${filenameRange}` : `_${new Date().toISOString().slice(0, 10)}`}`;
                        const csv = buildCsv(clientesOrdenados, [
                            { label: 'ID', value: (row) => row.id },
                            { label: 'Tipo registro', value: (row) => row.tipoRegistro },
                            { label: 'Nombres', value: (row) => row.nombres },
                            { label: 'Usuario', value: (row) => row.usuario ?? '' },
                            { label: 'Correo', value: (row) => row.correo },
                            { label: 'Teléfono', value: (row) => row.telefono },
                            { label: 'Documento', value: (row) => row.documento ?? '' },
                            { label: 'Estado', value: (row) => row.estado },
                            { label: 'Plan actual', value: (row) => row.planActual ?? '' },
                            { label: 'Fecha registro', value: (row) => row.fechaRegistro },
                            { label: 'Último pedido', value: (row) => row.ultimoPedido ?? '' },
                            { label: 'Total gastado', value: (row) => row.totalGastado },
                            { label: 'Pedidos completados', value: (row) => row.pedidosCompletados },
                            { label: 'Ciudad', value: (row) => row.ciudad },
                            { label: 'Dirección', value: (row) => row.direccion },
                            { label: 'Actividad reciente', value: (row) => row.actividadReciente },
                        ]);
                        downloadCsv(`${filename}.csv`, csv);
                        registrarExportacion(
                            'Clientes',
                            'Exportación',
                            'Listado de clientes',
                            `Se exportó el listado de clientes con ${clientesOrdenados.length} registros.`,
                            'customers.export',
                        );
                    }}
                    className="mb-3"
                />
            </div>

            <div className="space-y-4">
                <FiltrosClientes
                    busqueda={busqueda}
                    onBusquedaChange={setBusqueda}
                    estado={estadoFiltro}
                    onEstadoChange={setEstadoFiltro}
                    orden={orden}
                    onOrdenChange={cambiarOrden}
                    plan={planFiltro}
                    onPlanChange={setPlanFiltro}
                    tipo={tipoFiltro}
                    onTipoChange={setTipoFiltro}
                />
            </div>

            <div className="space-y-6">
                <div className="rounded-none border border-zinc-200 bg-white p-6">
                    <h2 className="text-lg font-semibold">Clientes</h2>
                    <p className="text-sm text-zinc-500">Vista general para clientes registrados y guest.</p>
                </div>

                <TablaClientes
                    clientes={clientesPagina}
                    seleccionarCliente={abrirPerfilCliente}
                    editarCliente={editarCliente}
                    eliminarCliente={eliminarCliente}
                />

                <PaginacionClientes
                    paginaActual={paginaActual}
                    paginaTope={paginaTope}
                    onPaginaChange={cambiarPagina}
                />
            </div>

            <ModalClienteInfo cliente={clienteSeleccionado} onClose={cerrarPerfilCliente} />
            <ModalEditarCliente
                cliente={clienteEnEdicion}
                onClose={cerrarEdicionCliente}
                onSave={guardarEdicionCliente}
            />
        </div>
    );
};
