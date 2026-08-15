import { storageManager, StorageKeys } from '../../../../storage';
import { obtenerActorAuditoria, registrarLog } from '../../../../services/auditService';

export const ESTADOS_SOLICITUD = [
  'Pendiente',
  'En revisión',
  'Respondido',
  'Resuelto',
  'Cerrado',
] as const;

export const TIPOS_SOLICITUD = [
  'Queja',
  'Problema con pedido',
  'Devolución',
  'Cambio',
  'Envío',
  'Otro',
] as const;

export type EstadoSolicitudAsistencia = (typeof ESTADOS_SOLICITUD)[number];
export type TipoSolicitudAsistencia = (typeof TIPOS_SOLICITUD)[number];

export type SolicitudAsistencia = {
  id: string;
  tipo: TipoSolicitudAsistencia;
  nombre: string;
  correo: string;
  pedido: string;
  telefono: string;
  mensaje: string;
  estado: EstadoSolicitudAsistencia;
  fecha: string;
  clienteId?: string | number | null;
  tipoCliente?: 'registrado' | 'guest';
};

const LEGACY_STORAGE_KEY = 'solicitudes_asistencia';
const EVENT_NAME = 'maxeta:solicitudes-asistencia-changed';

const normalizeText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const isValidEstado = (value: unknown): value is EstadoSolicitudAsistencia =>
  typeof value === 'string' && ESTADOS_SOLICITUD.includes(value as EstadoSolicitudAsistencia);

const isValidTipo = (value: unknown): value is TipoSolicitudAsistencia =>
  typeof value === 'string' && TIPOS_SOLICITUD.includes(value as TipoSolicitudAsistencia);

const resolveStoredUsers = (): Array<Record<string, unknown>> => {
  const users = storageManager.get<Array<Record<string, unknown>>>(StorageKeys.USERS) ?? [];
  const normalizedUsers = Array.isArray(users) ? users : [];

  const authSession = storageManager.auth.get() as Record<string, unknown> | null;
  const authUser = authSession && typeof authSession.user === 'object' && authSession.user
    ? (authSession.user as Record<string, unknown>)
    : null;

  if (authUser) {
    return [...normalizedUsers, authUser];
  }

  return normalizedUsers;
};

const matchUserByEmail = (correo: string) => {
  const email = normalizeText(correo).toLowerCase();
  if (!email) {
    return null;
  }

  return resolveStoredUsers().find((user) => {
    const candidateEmails = [
      normalizeText(user.email),
      normalizeText(user.correo),
      normalizeText(user.username),
      normalizeText(user.usuario),
    ].filter(Boolean).map((value) => value.toLowerCase());

    return candidateEmails.includes(email) || candidateEmails.includes(`${email}`);
  }) ?? null;
};

const buildLegacyId = () => `AS-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const enrichSolicitud = (solicitud: Partial<SolicitudAsistencia>): SolicitudAsistencia => {
  const correo = normalizeText(solicitud.correo);
  const matchedUser = matchUserByEmail(correo);
  const clienteId = solicitud.clienteId ?? (matchedUser ? normalizeText(matchedUser.id) || null : null);

  return {
    id: normalizeText(solicitud.id) || buildLegacyId(),
    tipo: isValidTipo(solicitud.tipo) ? solicitud.tipo : 'Otro',
    nombre: normalizeText(solicitud.nombre) || 'Guest',
    correo,
    pedido: normalizeText(solicitud.pedido),
    telefono: normalizeText(solicitud.telefono),
    mensaje: normalizeText(solicitud.mensaje),
    estado: isValidEstado(solicitud.estado) ? solicitud.estado : 'Pendiente',
    fecha: normalizeText(solicitud.fecha) || new Date().toISOString(),
    clienteId: clienteId ?? null,
    tipoCliente: solicitud.tipoCliente ?? (clienteId ? 'registrado' : 'guest'),
  };
};

const readLegacySolicitudes = (): SolicitudAsistencia[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : [];
    return list.map((item) => enrichSolicitud(item as Partial<SolicitudAsistencia>));
  } catch {
    return [];
  }
};

export const leerSolicitudesAsistencia = (): SolicitudAsistencia[] => {
  let stored = storageManager.get<SolicitudAsistencia[]>(StorageKeys.SOLICITUDES_ASISTENCIA);

  if (typeof window !== 'undefined') {
    const legacy = readLegacySolicitudes();
    if ((!stored || stored.length === 0) && legacy.length > 0) {
      guardarSolicitudesAsistencia(legacy);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      return legacy;
    }
  }

  const normalized = Array.isArray(stored) ? stored : [];
  const prepared = normalized.map((item) => enrichSolicitud(item));

  return [...prepared].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
};

export const guardarSolicitudesAsistencia = (solicitudes: SolicitudAsistencia[]) => {
  const normalized = [...solicitudes]
    .map((item) => enrichSolicitud(item))
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  storageManager.set(StorageKeys.SOLICITUDES_ASISTENCIA, normalized);

  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    window.dispatchEvent(new Event(EVENT_NAME));
  }
};

export const crearSolicitudAsistencia = (input: Omit<SolicitudAsistencia, 'id' | 'estado' | 'fecha'> & { id?: string; estado?: EstadoSolicitudAsistencia; fecha?: string }) => {
  const solicitudes = leerSolicitudesAsistencia();
  const record: SolicitudAsistencia = enrichSolicitud({
    ...input,
    id: input.id || buildLegacyId(),
    estado: input.estado || 'Pendiente',
    fecha: input.fecha || new Date().toISOString(),
  });

  solicitudes.push(record);
  guardarSolicitudesAsistencia(solicitudes);

  return record;
};

export const actualizarEstadoSolicitud = (id: string, estado: EstadoSolicitudAsistencia) => {
  const solicitudes = leerSolicitudesAsistencia();
  const index = solicitudes.findIndex((item) => item.id === id);
  if (index === -1) {
    return null;
  }

  const previous = solicitudes[index];
  const next: SolicitudAsistencia = {
    ...previous,
    estado,
    tipoCliente: previous.tipoCliente ?? (previous.clienteId ? 'registrado' : 'guest'),
  };

  solicitudes[index] = next;
  guardarSolicitudesAsistencia(solicitudes);

  const actor = obtenerActorAuditoria();
  registrarLog({
    modulo: 'Clientes',
    submodulo: 'Formularios',
    accion: 'Actualizó el estado de una solicitud',
    descripcion: `El usuario ${actor.usuario} cambió el estado de la solicitud ${id} de "${previous.estado}" a "${estado}".`,
    usuario: actor.usuario,
    rol: actor.rol,
    objetoAfectado: `Solicitud ${id}`,
    referencia: 'clientes.formularios.estado.update',
    datosAnteriores: JSON.stringify({ estado: previous.estado }),
    datosNuevos: JSON.stringify({ estado }),
  });

  return next;
};

export const suscribirseSolicitudesCambios = (listener: () => void) => {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handle = () => listener();
  window.addEventListener(EVENT_NAME, handle);

  return () => {
    window.removeEventListener(EVENT_NAME, handle);
  };
};
