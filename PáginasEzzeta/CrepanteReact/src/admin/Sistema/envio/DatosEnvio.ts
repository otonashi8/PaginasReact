import { storageManager, StorageKeys } from '../../../storage';
import { envioConfigInicial } from './TiposEnvio';
import type { ConfiguracionEnvio } from './TiposEnvio';
import { registrarLog, obtenerActorAuditoria } from '../../../services/auditService';

const CLAVE_ENVIO = `${StorageKeys.CONFIGURACION}.envio`;

export function obtenerConfiguracionEnvio(): ConfiguracionEnvio {
  const datos = storageManager.get<string>(CLAVE_ENVIO) as string | null;
  if (!datos) {
    return envioConfigInicial;
  }

  try {
    const parsed = JSON.parse(datos) as Partial<ConfiguracionEnvio>;
    return {
      ...envioConfigInicial,
      ...parsed,
      tarifaGeneral: Number.isFinite(parsed.tarifaGeneral as number)
        ? (parsed.tarifaGeneral as number)
        : envioConfigInicial.tarifaGeneral,
      tarifas: Array.isArray(parsed.tarifas) ? parsed.tarifas : envioConfigInicial.tarifas,
    };
  } catch {
    return envioConfigInicial;
  }
}

export function guardarConfiguracionEnvio(configuracion: ConfiguracionEnvio) {
  storageManager.set(CLAVE_ENVIO, JSON.stringify(configuracion));
}

export const SHIPPING_CONFIG_EVENT = 'maxeta:shipping-config-changed';

const notifyShippingConfigChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(SHIPPING_CONFIG_EVENT));
  }
};

export function guardarConfiguracionEnvioConLog(
  configuracion: ConfiguracionEnvio,
  opcionesLog?: {
    accion?: string;
    descripcion?: string;
    objetoAfectado?: string;
    referencia?: string;
  },
) {
  const anterior = obtenerConfiguracionEnvio();
  guardarConfiguracionEnvio(configuracion);
  notifyShippingConfigChanged();
  const actor = obtenerActorAuditoria();
  registrarLog({
    modulo: 'Sistema',
    submodulo: 'Envío',
    accion: opcionesLog?.accion ?? 'Actualizó configuración de envío',
    descripcion:
      opcionesLog?.descripcion ?? 'Se actualizó la configuración de envío desde el panel de administración.',
    usuario: actor.usuario,
    rol: actor.rol,
    objetoAfectado: opcionesLog?.objetoAfectado ?? 'Configuración de envío',
    referencia: opcionesLog?.referencia ?? 'shipping.configuration.update',
    datosAnteriores: JSON.stringify(anterior),
    datosNuevos: JSON.stringify(configuracion),
  });
}

export function crearTarifaEnvio(tarifa: { ubicacion: string; costo: number }) {
  const configuracion = obtenerConfiguracionEnvio();
  const nextTarifa = {
    id: Date.now(),
    ubicacion: tarifa.ubicacion.trim(),
    costo: tarifa.costo,
  };
  configuracion.tarifas = [...configuracion.tarifas, nextTarifa];
  guardarConfiguracionEnvioConLog(configuracion, {
    accion: 'Creó tarifa de envío',
    descripcion: `Se creó la tarifa de envío para ${nextTarifa.ubicacion}.`,
    objetoAfectado: `Tarifa: ${nextTarifa.ubicacion}`,
    referencia: 'shipping.rate.create',
  });
  return nextTarifa;
}

export function actualizarTarifaEnvio(tarifa: { id: number; ubicacion: string; costo: number }) {
  const configuracion = obtenerConfiguracionEnvio();
  configuracion.tarifas = configuracion.tarifas.map((item) =>
    item.id === tarifa.id ? { ...item, ubicacion: tarifa.ubicacion.trim(), costo: tarifa.costo } : item
  );
  guardarConfiguracionEnvioConLog(configuracion, {
    accion: 'Actualizó tarifa de envío',
    descripcion: `Se actualizó la tarifa de envío para ${tarifa.ubicacion}.`,
    objetoAfectado: `Tarifa: ${tarifa.ubicacion}`,
    referencia: 'shipping.rate.update',
  });
}

export function eliminarTarifaEnvio(id: number) {
  const configuracion = obtenerConfiguracionEnvio();
  const tarifaEliminada = configuracion.tarifas.find((item) => item.id === id);
  configuracion.tarifas = configuracion.tarifas.filter((item) => item.id !== id);
  guardarConfiguracionEnvioConLog(configuracion, {
    accion: 'Eliminó tarifa de envío',
    descripcion: `Se eliminó la tarifa de envío${tarifaEliminada ? ` para ${tarifaEliminada.ubicacion}` : ''}.`,
    objetoAfectado: tarifaEliminada ? `Tarifa: ${tarifaEliminada.ubicacion}` : `Tarifa: ${id}`,
    referencia: 'shipping.rate.delete',
  });
}
