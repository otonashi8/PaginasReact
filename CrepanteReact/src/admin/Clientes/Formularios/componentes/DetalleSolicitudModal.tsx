import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ESTADOS_SOLICITUD, actualizarEstadoSolicitud, type EstadoSolicitudAsistencia, type SolicitudAsistencia } from '../utils/solicitudesAsistencia';

type Props = {
  solicitud: SolicitudAsistencia | null;
  onClose: () => void;
};

const formatDate = (value: string) => {
  if (!value) {
    return '—';
  }

  try {
    return new Date(value).toLocaleString('es-PE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return value;
  }
};

export const DetalleSolicitudModal = ({ solicitud, onClose }: Props) => {
  const [estado, setEstado] = useState<EstadoSolicitudAsistencia>(solicitud?.estado ?? 'Pendiente');

  useEffect(() => {
    setEstado(solicitud?.estado ?? 'Pendiente');
  }, [solicitud]);

  if (!solicitud) {
    return null;
  }

  const guardarCambio = () => {
    if (estado === solicitud.estado) {
      onClose();
      return;
    }

    actualizarEstadoSolicitud(solicitud.id, estado);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-none border border-zinc-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Solicitud</p>
            <h2 className="mt-1 text-xl font-semibold text-zinc-900">{solicitud.id}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-none border border-zinc-300 p-2 text-zinc-700 transition hover:border-red-600 hover:text-red-600">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-2">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-700">Información de solicitud</h3>
            <div className="space-y-3 text-sm text-zinc-700">
              <div className="flex justify-between gap-4 border-b border-zinc-200 pb-2"><span>ID</span><strong>{solicitud.id}</strong></div>
              <div className="flex justify-between gap-4 border-b border-zinc-200 pb-2"><span>Tipo de solicitud</span><strong>{solicitud.tipo}</strong></div>
              <div className="flex justify-between gap-4 border-b border-zinc-200 pb-2"><span>Estado</span><strong>{solicitud.estado}</strong></div>
              <div className="flex justify-between gap-4 border-b border-zinc-200 pb-2"><span>Fecha y hora</span><strong>{formatDate(solicitud.fecha)}</strong></div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-700">Información del cliente</h3>
            <div className="space-y-3 text-sm text-zinc-700">
              <div className="flex justify-between gap-4 border-b border-zinc-200 pb-2"><span>Nombre</span><strong>{solicitud.nombre || '—'}</strong></div>
              <div className="flex justify-between gap-4 border-b border-zinc-200 pb-2"><span>Correo</span><strong>{solicitud.correo || '—'}</strong></div>
              <div className="flex justify-between gap-4 border-b border-zinc-200 pb-2"><span>Teléfono</span><strong>{solicitud.telefono || '—'}</strong></div>
              <div className="flex justify-between gap-4 border-b border-zinc-200 pb-2"><span>Tipo de cliente</span><strong>{solicitud.tipoCliente === 'registrado' ? 'Cliente registrado' : 'Guest'}</strong></div>
              <div className="flex justify-between gap-4 border-b border-zinc-200 pb-2"><span>Cliente</span><strong>{solicitud.tipoCliente === 'registrado' ? 'Registrado' : 'Guest'}</strong></div>
            </div>
          </section>
        </div>

        <div className="border-t border-zinc-200 px-6 py-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-700">Información del pedido</h3>
          <p className="mt-2 text-sm text-zinc-700">{solicitud.pedido || 'No especificado'}</p>
        </div>

        <div className="border-t border-zinc-200 px-6 py-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-700">Mensaje</h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-700">{solicitud.mensaje || '—'}</p>
        </div>

        <div className="border-t border-zinc-200 px-6 py-5">
          <label className="block text-sm font-medium text-zinc-700">
            <span className="mb-2 block">Estado</span>
            <select
              value={estado}
              onChange={(event) => setEstado(event.target.value as EstadoSolicitudAsistencia)}
              className="w-full rounded-none border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-800"
            >
              {ESTADOS_SOLICITUD.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <div className="mt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-none border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-700">
              Cerrar
            </button>
            <button type="button" onClick={guardarCambio} className="rounded-none bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600">
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
