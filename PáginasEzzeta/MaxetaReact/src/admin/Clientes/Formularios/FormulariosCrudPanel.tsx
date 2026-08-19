import { Search } from 'lucide-react';
import { PaginacionClientes } from '../../componentes/Paginacion';
import { useFormularios } from './hooks/useFormularios';
import { DetalleSolicitudModal } from './componentes/DetalleSolicitudModal';
import { TablaFormularios } from './componentes/TablaFormularios';
import { ESTADOS_SOLICITUD, TIPOS_SOLICITUD } from './utils/solicitudesAsistencia';

export const FormulariosCrudPanel = () => {
  const {
    solicitudes,
    solicitudesTotales,
    busqueda,
    setBusqueda,
    estadoFiltro,
    setEstadoFiltro,
    tipoFiltro,
    setTipoFiltro,
    paginaActual,
    setPaginaActual,
    totalPaginas,
    solicitudSeleccionada,
    abrirDetalle,
    cerrarDetalle,
    totales,
  } = useFormularios();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Formularios</h1>
          <p className="text-zinc-500">Solicitudes enviadas desde el formulario de asistencia.</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-none border border-zinc-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Total</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">{totales.total}</p>
        </div>
        <div className="rounded-none border border-zinc-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Pendientes</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">{totales.pendientes}</p>
        </div>
        <div className="rounded-none border border-zinc-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">En revisión</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">{totales.enRevision}</p>
        </div>
        <div className="rounded-none border border-zinc-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Resueltos</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">{totales.resueltos}</p>
        </div>
        <div className="rounded-none border border-zinc-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Cerrados</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">{totales.cerrados}</p>
        </div>
      </div>

      <div className="rounded-none border border-zinc-200 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <label className="flex-1">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-600">Buscar</span>
            <div className="flex items-center gap-2 border border-zinc-300 bg-white px-3 py-2">
              <Search size={16} className="text-zinc-500" />
              <input
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="ID, nombre, correo, teléfono, pedido o tipo"
                className="w-full bg-transparent text-sm text-zinc-900 outline-none"
              />
            </div>
          </label>

          <label className="min-w-[180px]">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-600">Estado</span>
            <select
              value={estadoFiltro}
              onChange={(event) => setEstadoFiltro(event.target.value as 'Todos' | typeof ESTADOS_SOLICITUD[number])}
              className="w-full rounded-none border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-800"
            >
              <option value="Todos">Todos</option>
              {ESTADOS_SOLICITUD.map((estado) => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
          </label>

          <label className="min-w-[180px]">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-600">Tipo</span>
            <select
              value={tipoFiltro}
              onChange={(event) => setTipoFiltro(event.target.value as 'Todos' | typeof TIPOS_SOLICITUD[number])}
              className="w-full rounded-none border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-800"
            >
              <option value="Todos">Todos</option>
              {TIPOS_SOLICITUD.map((tipo) => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <PaginacionClientes
        paginaActual={paginaActual}
        paginaTope={totalPaginas}
        onPaginaChange={setPaginaActual}
      />

      <TablaFormularios solicitudes={solicitudes} onVerDetalle={abrirDetalle} />

      <PaginacionClientes
        paginaActual={paginaActual}
        paginaTope={totalPaginas}
        onPaginaChange={setPaginaActual}
      />

      <div className="text-sm text-zinc-500">
        {solicitudesTotales} resultado{solicitudesTotales === 1 ? '' : 's'}
      </div>

      <DetalleSolicitudModal solicitud={solicitudSeleccionada} onClose={cerrarDetalle} />
    </div>
  );
};
