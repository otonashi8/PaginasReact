import { obtenerActorAuditoria, registrarLog } from '@/services/auditService';

const TRABAJOS_STORAGE_KEY = 'ezzeta.rrhh.trabajos';
const TRABAJOS_EVENT_NAME = 'ezzeta:trabajos-changed';

export type TrabajoRedireccion = {
  nombre: string;
  url: string;
};

export type Trabajo = {
  id: number;
  puesto: string;
  nombre: string;
  descripcionBreve: string;
  horario: string | null;
  ubicacion: string | null;
  redirecciones: TrabajoRedireccion[];
  imagenUrl: string | null;
  activo: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
};

const readTrabajos = (): Trabajo[] => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = JSON.parse(window.localStorage.getItem(TRABAJOS_STORAGE_KEY) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

const writeTrabajos = (trabajos: Trabajo[]) => {
  window.localStorage.setItem(TRABAJOS_STORAGE_KEY, JSON.stringify(trabajos));
  window.dispatchEvent(new Event(TRABAJOS_EVENT_NAME));
};

const fileToDataUrl = (file: File | null): Promise<string | null> => new Promise((resolve, reject) => {
  if (!file) {
    resolve(null);
    return;
  }

  const reader = new FileReader();
  reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
  reader.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada.'));
  reader.readAsDataURL(file);
});

export const obtenerTrabajosPublicos = async () => readTrabajos().filter((trabajo) => trabajo.activo);
export const obtenerTrabajosAdmin = async () => readTrabajos();

export const crearTrabajo = async (trabajo: Omit<Trabajo, 'id' | 'fechaCreacion' | 'fechaActualizacion'>, imagenFile: File | null) => {
  const now = new Date().toISOString();
  const imagenUrl = await fileToDataUrl(imagenFile) ?? trabajo.imagenUrl;
  const created: Trabajo = { ...trabajo, imagenUrl, id: Date.now(), fechaCreacion: now, fechaActualizacion: now };
  writeTrabajos([...readTrabajos(), created]);
  const actor = obtenerActorAuditoria();
  registrarLog({
    modulo: 'RR.HH',
    submodulo: 'Trabajos',
    accion: 'Creó trabajo',
    descripcion: `Se creó la vacante "${trabajo.puesto}".`,
    usuario: actor.usuario,
    rol: actor.rol,
    objetoAfectado: trabajo.puesto,
    referencia: 'rrhh.trabajos.create',
  });
  return created;
};

export const actualizarTrabajo = async (trabajo: Trabajo, imagenFile: File | null) => {
  const imagenUrl = await fileToDataUrl(imagenFile) ?? trabajo.imagenUrl;
  const updated: Trabajo = { ...trabajo, imagenUrl, fechaActualizacion: new Date().toISOString() };
  writeTrabajos(readTrabajos().map((item) => item.id === updated.id ? updated : item));
  const actor = obtenerActorAuditoria();
  registrarLog({
    modulo: 'RR.HH',
    submodulo: 'Trabajos',
    accion: 'Actualizó trabajo',
    descripcion: `Se actualizó la vacante "${trabajo.puesto}".`,
    usuario: actor.usuario,
    rol: actor.rol,
    objetoAfectado: trabajo.puesto,
    referencia: `rrhh.trabajos.update.${trabajo.id}`,
  });
  return updated;
};

export const eliminarTrabajo = async (id: number) => {
  const trabajo = readTrabajos().find((item) => item.id === id) ?? null;
  writeTrabajos(readTrabajos().filter((item) => item.id !== id));

  const actor = obtenerActorAuditoria();
  registrarLog({
    modulo: 'RR.HH',
    submodulo: 'Trabajos',
    accion: 'Eliminó trabajo',
    descripcion: trabajo ? `Se eliminó la vacante "${trabajo.puesto}".` : `Se eliminó el trabajo con id ${id}.`,
    usuario: actor.usuario,
    rol: actor.rol,
    objetoAfectado: trabajo?.puesto ?? `Trabajo ${id}`,
    referencia: `rrhh.trabajos.delete.${id}`,
  });
};
