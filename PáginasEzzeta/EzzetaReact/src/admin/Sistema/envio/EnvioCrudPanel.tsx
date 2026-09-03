import { Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { PermissionAccess } from '../../hooks/usePermissions';
import { PaginacionClientes } from '../../componentes/Paginacion';
import { getPeruDepartments } from '../../../services/peruUbigeoService';
import type { ConfiguracionEnvio, TarifaEnvio } from './TiposEnvio';
import {
  crearTarifaEnvio,
  eliminarTarifaEnvio,
  guardarConfiguracionEnvioConLog,
  obtenerConfiguracionEnvio,
  actualizarTarifaEnvio,
} from './DatosEnvio';

const formatoMoneda = (valor: number) => `S/ ${valor.toFixed(2)}`;

const validarNumeroNoNegativo = (valor: number) => Number.isFinite(valor) && valor >= 0;
const departamentosPeru = getPeruDepartments();

const useEnvioCrud = () => {
  const configuracionInicial = obtenerConfiguracionEnvio();
  const [configuracion, setConfiguracion] = useState<ConfiguracionEnvio>(configuracionInicial);
  const [ubicacion, setUbicacion] = useState('');
  const [costo, setCosto] = useState('');
  const [tarifaEditando, setTarifaEditando] = useState<TarifaEnvio | null>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const tarifasOrdenadas = useMemo(() => {
    return [...configuracion.tarifas].sort((a, b) => a.ubicacion.localeCompare(b.ubicacion));
  }, [configuracion.tarifas]);

  const actualizarMontoEnvioGratis = (valor: number) => {
    const nuevo = { ...configuracion, montoMinimoEnvioGratis: valor };
    guardarConfiguracionEnvioConLog(nuevo, {
      accion: 'Actualizó monto mínimo de envío gratis',
      descripcion: `Se actualizó el monto mínimo de envío gratis a S/ ${valor.toFixed(2)}.`,
      objetoAfectado: 'Envío gratis',
      referencia: 'shipping.free-shipping.threshold.update',
    });
    setConfiguracion(nuevo);
  };

  const actualizarTarifaGeneral = (valor: number | null) => {
    const nuevo = { ...configuracion, tarifaGeneral: valor };
    guardarConfiguracionEnvioConLog(nuevo, {
      accion: 'Actualizó tarifa general de envío',
      descripcion: valor !== null ? `Se actualizó la tarifa general de envío a S/ ${valor.toFixed(2)}.` : 'Se eliminó la tarifa general de envío.',
      objetoAfectado: 'Tarifa general',
      referencia: 'shipping.general-rate.update',
    });
    setConfiguracion(nuevo);
  };

  const guardarTarifa = () => {
    const siguienteErrores: Record<string, string> = {};
    const ubicacionTrim = ubicacion.trim();
    const costoNumero = Number(costo);

    if (!ubicacionTrim) {
      siguienteErrores.ubicacion = 'La ubicación es obligatoria.';
    }
    if (!Number.isFinite(costoNumero) || costo === '') {
      siguienteErrores.costo = 'El costo es obligatorio y debe ser un número.';
    } else if (!validarNumeroNoNegativo(costoNumero)) {
      siguienteErrores.costo = 'El costo no puede ser negativo.';
    }

    const ubicacionDuplicada = configuracion.tarifas.some((item) =>
      item.ubicacion.toLowerCase() === ubicacionTrim.toLowerCase() && item.id !== tarifaEditando?.id
    );

    if (ubicacionDuplicada) {
      siguienteErrores.ubicacion = 'Ya existe una tarifa para esta ubicación.';
    }

    if (Object.keys(siguienteErrores).length > 0) {
      setErrores(siguienteErrores);
      return;
    }

    if (tarifaEditando) {
      actualizarTarifaEnvio({ id: tarifaEditando.id, ubicacion: ubicacionTrim, costo: costoNumero });
      setConfiguracion({
        ...configuracion,
        tarifas: configuracion.tarifas.map((item) =>
          item.id === tarifaEditando.id ? { ...item, ubicacion: ubicacionTrim, costo: costoNumero } : item
        ),
      });
    } else {
      const nuevaTarifa = crearTarifaEnvio({ ubicacion: ubicacionTrim, costo: costoNumero });
      setConfiguracion({
        ...configuracion,
        tarifas: [...configuracion.tarifas, nuevaTarifa],
      });
    }

    setTarifaEditando(null);
    setUbicacion('');
    setCosto('');
    setErrores({});
  };

  const comenzarCreacion = () => {
    setTarifaEditando(null);
    setUbicacion('');
    setCosto('');
    setErrores({});
  };

  const comenzarEdicion = (tarifa: TarifaEnvio) => {
    setTarifaEditando(tarifa);
    setUbicacion(tarifa.ubicacion);
    setCosto(tarifa.costo.toString());
    setErrores({});
  };

  const borrarTarifa = (id: number) => {
    if (!window.confirm('¿Eliminar esta tarifa de envío?')) {
      return;
    }
    eliminarTarifaEnvio(id);
    setConfiguracion({
      ...configuracion,
      tarifas: configuracion.tarifas.filter((item) => item.id !== id),
    });
  };

  return {
    configuracion,
    tarifasOrdenadas,
    ubicacion,
    costo,
    tarifaEditando,
    errores,
    setUbicacion,
    setCosto,
    actualizarMontoEnvioGratis,
    actualizarTarifaGeneral,
    guardarTarifa,
    comenzarCreacion,
    comenzarEdicion,
    borrarTarifa,
  };
};

export const EnvioCrudPanel = ({ access }: { access: PermissionAccess }) => {
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 10;
  const {
    configuracion,
    tarifasOrdenadas,
    ubicacion,
    costo,
    tarifaEditando,
    errores,
    setUbicacion,
    setCosto,
    actualizarMontoEnvioGratis,
    actualizarTarifaGeneral,
    guardarTarifa,
    comenzarCreacion,
    comenzarEdicion,
    borrarTarifa,
  } = useEnvioCrud();

  const paginaTarifas = useMemo(() => {
    const inicio = (paginaActual - 1) * elementosPorPagina;
    return tarifasOrdenadas.slice(inicio, inicio + elementosPorPagina);
  }, [paginaActual, tarifasOrdenadas]);

  const paginaTope = Math.max(1, Math.ceil(tarifasOrdenadas.length / elementosPorPagina));

  const puedeEditar = Boolean(access.actions.update);
  const puedeCrear = Boolean(access.actions.create);
  const puedeEliminar = Boolean(access.actions.delete);

  return (
      <div className="space-y-6">
          {/* HEADER */}
          <div className="flex flex-col gap-4 border-b border-zinc-200 pb-5 md:flex-row md:items-end md:justify-between">
              <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-red-600">Configuración logística</p>
                  <h1 className="text-2xl font-semibold uppercase tracking-[0.12em] text-black">Envío</h1>
                  <p className="mt-1 text-sm text-zinc-500">Configura envío gratis y tarifas según ubicación.</p>
              </div>
              <button
                  type="button"
                  onClick={comenzarCreacion}
                  disabled={!puedeCrear}
                  className="inline-flex h-9 items-center justify-center gap-2 bg-black px-4 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-zinc-300"
              ><Plus size={15} />Nueva tarifa
              </button>
          </div>
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              {/* FORMULARIO */}
              <section className="space-y-5 border border-zinc-200 bg-white p-4">
                  <div>
                      <h2 className="text-sm font-semibold text-zinc-900">Configuración general</h2>
                      <p className="mt-1 text-xs text-zinc-500">Define cuándo se aplicará el envío gratuito y la tarifa general.</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                      {/* ENVÍO GRATIS */}
                      <label className="grid gap-1.5">
                          <span className="text-[11px] font-medium text-zinc-700">Envío gratis desde</span>
                          <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400">S/</span>
                              <input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  value={configuracion.montoMinimoEnvioGratis.toFixed(2)}
                                  onChange={(event) => {
                                      const valor = Number(event.target.value);
                                      if (!Number.isNaN(valor) && valor >= 0) {
                                          actualizarMontoEnvioGratis(valor);
                                      }
                                  }}
                                  className="h-9 w-full border border-zinc-300 pl-8 pr-2.5 text-xs outline-none transition focus:border-zinc-500"
                              />
                          </div>
                          <p className="text-[10px] text-zinc-400">Monto mínimo para activar el envío gratuito.</p>
                      </label>
                      {/* TARIFA GENERAL */}
                      <label className="grid gap-1.5">
                          <span className="text-[11px] font-medium text-zinc-700">Tarifa general</span>
                          <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400">S/</span>
                              <input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  value={
                                      configuracion.tarifaGeneral !== null
                                          ? configuracion.tarifaGeneral
                                          : ''
                                  }
                                  onChange={(event) => {
                                      const value = event.target.value;
                                      if (value.trim() === '') {
                                          actualizarTarifaGeneral(null);
                                          return;
                                      }
                                      const valor = Number(value);
                                      if (!Number.isNaN(valor) && valor >= 0) {
                                          actualizarTarifaGeneral(valor);
                                      }
                                  }}
                                  placeholder="Sin tarifa general"
                                  className="h-9 w-full border border-zinc-300 pl-8 pr-2.5 text-xs outline-none transition focus:border-zinc-500"
                              />
                          </div>
                          <p className="text-[10px] text-zinc-400">Se usa cuando no existe una tarifa específica.</p>
                      </label>
                  </div>
              </section>
              {/* RESUMEN */}
              <aside className="space-y-4 border border-zinc-200 bg-white p-4">
                  <div>
                      <h2 className="text-sm font-semibold text-zinc-900">Estado del envío</h2>
                      <p className="mt-1 text-xs text-zinc-500">Valores actuales de la configuración del sistema.</p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                      <div className="border border-zinc-200 bg-zinc-50 px-3 py-2.5">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Envío gratis desde</p>
                          <p className="mt-1 text-sm font-semibold text-zinc-900">{formatoMoneda(configuracion.montoMinimoEnvioGratis)}</p>
                      </div>
                      <div className="border border-zinc-200 bg-zinc-50 px-3 py-2.5">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Tarifa general</p>
                          <p className="mt-1 text-sm font-semibold text-zinc-900">
                              {configuracion.tarifaGeneral !== null
                                  ? formatoMoneda(configuracion.tarifaGeneral)
                                  : 'No configurada'}
                          </p>
                      </div>
                  </div>
              </aside>
          </div>
          {/* TARIFAS POR UBICACIÓN */}
          <section className="space-y-5 border border-zinc-200 bg-white p-4">
              <div className="flex flex-col gap-3 border-b border-zinc-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                      <h2 className="text-sm font-semibold text-zinc-900">Tarifas por ubicación</h2>
                      <p className="mt-1 text-xs text-zinc-500">Crea, edita o elimina tarifas según el departamento.</p>
                  </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto] sm:items-end">
                  <label className="grid gap-1.5">
                      <span className="text-[11px] font-medium text-zinc-700">Ubicación</span>
                      <select
                          value={ubicacion}
                          onChange={(event) => setUbicacion(event.target.value)}
                          className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs outline-none transition focus:border-zinc-500"
                      >
                          <option value="">Selecciona un departamento</option>
                          {tarifaEditando &&
                          ubicacion &&
                          !departamentosPeru.some(
                              (departamento) => departamento.name === ubicacion
                          ) ? (
                              <option value={ubicacion}>{ubicacion}</option>
                          ) : null}
                          {departamentosPeru.map((departamento) => (
                              <option
                                  key={departamento.code}
                                  value={departamento.name}
                              >{departamento.name}
                              </option>
                          ))}
                      </select>
                      {errores.ubicacion ? (
                          <p className="text-[10px] text-red-600">{errores.ubicacion}</p>
                      ) : null}
                  </label>
                  {/* COSTO */}
                  <label className="grid gap-1.5">
                      <span className="text-[11px] font-medium text-zinc-700">Costo</span>
                      <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400">S/</span>
                          <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={costo}
                              onChange={(event) => setCosto(event.target.value)}
                              className="h-9 w-full border border-zinc-300 pl-8 pr-2.5 text-xs outline-none transition focus:border-zinc-500"
                          />
                      </div>
                      {errores.costo ? (
                          <p className="text-[10px] text-red-600">{errores.costo}</p>
                      ) : null}
                  </label>
                  {/* ACCIÓN */}
                  <div className="flex items-end">
                      <button
                          type="button"
                          onClick={guardarTarifa}
                          disabled={!puedeCrear && !puedeEditar}
                          className="h-9 w-full bg-black px-4 text-xs font-semibold uppercase tracking-[0.06em] text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-zinc-300 sm:w-auto"
                      >
                          {tarifaEditando
                              ? 'Guardar cambios'
                              : 'Agregar tarifa'}
                      </button>
                  </div>
              </div>
              {/* TABLA */}
              <div className="overflow-hidden border border-zinc-200">
                  <div className="overflow-x-auto">
                      <table className="min-w-full table-auto text-xs">
                          <thead className="bg-zinc-50">
                              <tr className="text-left">
                                  <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Ubicación</th>
                                  <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Costo</th>
                                  <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Acciones</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100">
                              {paginaTarifas.length === 0 ? (
                                  <tr>
                                      <td
                                          colSpan={3}
                                          className="px-4 py-8 text-center text-xs text-zinc-500"
                                      >No hay tarifas registradas.
                                      </td>
                                  </tr>
                              ) : (
                                  paginaTarifas.map((tarifa) => (
                                      <tr
                                          key={tarifa.id}
                                          className="transition-colors hover:bg-zinc-50/70"
                                      >
                                          <td className="px-4 py-2.5 text-xs font-semibold text-zinc-900">{tarifa.ubicacion}</td>
                                          <td className="px-4 py-2.5 text-xs text-zinc-700">{formatoMoneda(tarifa.costo)}</td>
                                          <td className="px-4 py-2.5">
                                              <div className="flex justify-end gap-1.5">
                                                  <button
                                                      type="button"
                                                      onClick={() =>
                                                          comenzarEdicion(tarifa)
                                                      }className="h-8 border border-zinc-300 bg-white px-3 text-[10px] font-medium text-zinc-700 transition hover:bg-zinc-100"
                                                  >Editar
                                                  </button>
                                                  <button
                                                      type="button"
                                                      onClick={() =>
                                                          borrarTarifa(tarifa.id)
                                                      }
                                                      disabled={!puedeEliminar}
                                                      className="inline-flex h-8 items-center gap-1.5 border border-red-200 bg-white px-3 text-[10px] font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-zinc-300 disabled:text-zinc-400"
                                                  ><Trash2 size={13} />Eliminar
                                                  </button>
                                              </div>
                                          </td>
                                      </tr>
                                  ))
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          </section>
          {/* PAGINACIÓN */}
          <PaginacionClientes
              paginaActual={paginaActual}
              paginaTope={paginaTope}
              onPaginaChange={setPaginaActual}
          />
      </div>
  );
};
