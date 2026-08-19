import { Eye } from 'lucide-react';
import type { SolicitudAsistencia } from '../utils/solicitudesAsistencia';

const formatDate = (value: string) => {
  if (!value) {
    return '—';
  }

  try {
    return new Date(value).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
};

const getEstadoClass = (estado: SolicitudAsistencia['estado']) => {
  const map: Record<SolicitudAsistencia['estado'], string> = {
    Pendiente: 'bg-amber-100 text-amber-800 border border-amber-200',
    'En revisión': 'bg-sky-100 text-sky-800 border border-sky-200',
    Respondido: 'bg-violet-100 text-violet-800 border border-violet-200',
    Resuelto: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    Cerrado: 'bg-zinc-200 text-zinc-800 border border-zinc-300',
  };

  return map[estado] ?? 'bg-zinc-100 text-zinc-700 border border-zinc-200';
};

type Props = {
  solicitudes: SolicitudAsistencia[];
  onVerDetalle: (solicitud: SolicitudAsistencia) => void;
};

export const TablaFormularios = ({ solicitudes, onVerDetalle }: Props) => {
  return (
    <div className="overflow-hidden rounded-none border border-zinc-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-zinc-100 text-left text-xs font-semibold uppercase tracking-[0.08em] text-zinc-600">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Correo</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Teléfono</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <div className="space-y-2">
                    <p className="text-lg font-semibold uppercase tracking-[0.12em] text-zinc-700">NO HAY FORMULARIOS REGISTRADOS</p>
                    <p className="text-sm text-zinc-500">Las solicitudes enviadas desde el formulario de asistencia aparecerán aquí.</p>
                  </div>
                </td>
              </tr>
            ) : (
              solicitudes.map((solicitud) => (
                <tr key={solicitud.id} className="border-t border-zinc-200 hover:bg-zinc-50">
                  <td className="px-4 py-3 font-semibold text-zinc-800">{solicitud.id}</td>
                  <td className="px-4 py-3 text-zinc-700">{solicitud.tipoCliente === 'registrado' && solicitud.nombre ? solicitud.nombre : 'Guest'}</td>
                  <td className="px-4 py-3 text-zinc-700">{solicitud.correo || '—'}</td>
                  <td className="px-4 py-3 text-zinc-700">{solicitud.tipo}</td>
                  <td className="px-4 py-3 text-zinc-700">{solicitud.pedido || 'No especificado'}</td>
                  <td className="px-4 py-3 text-zinc-700">{solicitud.telefono || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getEstadoClass(solicitud.estado)}`}>
                      {solicitud.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{formatDate(solicitud.fecha)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onVerDetalle(solicitud)}
                      className="inline-flex items-center gap-2 rounded-none border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-zinc-700 transition hover:border-red-600 hover:text-red-600"
                    >
                      <Eye size={14} />
                      Ver
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
