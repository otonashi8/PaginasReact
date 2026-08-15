import { useEffect, useMemo, useState } from 'react';
import { leerSolicitudesAsistencia, suscribirseSolicitudesCambios, type EstadoSolicitudAsistencia, type SolicitudAsistencia, type TipoSolicitudAsistencia } from '../utils/solicitudesAsistencia';

const REGISTROS_POR_PAGINA = 8;

export const useFormularios = () => {
  const [solicitudes, setSolicitudes] = useState<SolicitudAsistencia[]>(() => leerSolicitudesAsistencia());
  const [busqueda, setBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<'Todos' | EstadoSolicitudAsistencia>('Todos');
  const [tipoFiltro, setTipoFiltro] = useState<'Todos' | TipoSolicitudAsistencia>('Todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<SolicitudAsistencia | null>(null);

  useEffect(() => {
    const unsubscribe = suscribirseSolicitudesCambios(() => {
      setSolicitudes(leerSolicitudesAsistencia());
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, estadoFiltro, tipoFiltro]);

  const solicitudesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return solicitudes.filter((solicitud) => {
      const cumpleEstado = estadoFiltro === 'Todos' || solicitud.estado === estadoFiltro;
      const cumpleTipo = tipoFiltro === 'Todos' || solicitud.tipo === tipoFiltro;

      if (!cumpleEstado || !cumpleTipo) {
        return false;
      }

      if (!texto) {
        return true;
      }

      const textoBusqueda = [
        solicitud.id,
        solicitud.nombre,
        solicitud.correo,
        solicitud.telefono,
        solicitud.pedido,
        solicitud.tipo,
      ]
        .join(' ')
        .toLowerCase();

      return textoBusqueda.includes(texto);
    });
  }, [busqueda, estadoFiltro, solicitudes, tipoFiltro]);

  const totalPaginas = Math.max(1, Math.ceil(solicitudesFiltradas.length / REGISTROS_POR_PAGINA));

  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(totalPaginas);
    }
  }, [paginaActual, totalPaginas]);

  const solicitudesPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * REGISTROS_POR_PAGINA;
    return solicitudesFiltradas.slice(inicio, inicio + REGISTROS_POR_PAGINA);
  }, [paginaActual, solicitudesFiltradas]);

  const totales = useMemo(() => ({
    total: solicitudes.length,
    pendientes: solicitudes.filter((item) => item.estado === 'Pendiente').length,
    enRevision: solicitudes.filter((item) => item.estado === 'En revisión').length,
    resueltos: solicitudes.filter((item) => item.estado === 'Resuelto').length,
    cerrados: solicitudes.filter((item) => item.estado === 'Cerrado').length,
  }), [solicitudes]);

  return {
    solicitudes: solicitudesPaginadas,
    solicitudesTotales: solicitudesFiltradas.length,
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
    abrirDetalle: setSolicitudSeleccionada,
    cerrarDetalle: () => setSolicitudSeleccionada(null),
    totales,
  };
};
