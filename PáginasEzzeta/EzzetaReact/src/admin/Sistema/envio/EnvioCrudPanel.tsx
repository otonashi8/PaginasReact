import { Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { PermissionAccess } from '../../hooks/usePermissions';
import { PaginacionClientes } from '../../componentes/Paginacion';
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Envío</h1>
          <p className="text-zinc-500">Configura envío gratis y tarifas según ubicación.</p>
        </div>
        <button
          type="button"
          onClick={comenzarCreacion}
          disabled={!puedeCrear}
          className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          <Plus size={18} /> Nueva tarifa
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Envío gratis desde</h2>
            <p className="text-sm text-zinc-500">Define el monto mínimo para aplicar envío gratuito.</p>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium">Monto mínimo</span>
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
              className="w-full rounded-lg border border-zinc-300 px-4 py-3"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">Tarifa general</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={configuracion.tarifaGeneral !== null ? configuracion.tarifaGeneral : ''}
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
              placeholder="Dejar en blanco para no usar tarifa general"
              className="w-full rounded-lg border border-zinc-300 px-4 py-3"
            />
            <p className="text-xs text-zinc-500">Se utiliza cuando no existe una tarifa específica por departamento.</p>
          </label>
        </div>

        <aside className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold">Estado del envío</h2>
            <p className="mt-2 text-sm text-zinc-500">Los valores se guardan automáticamente en la configuración del sistema.</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
            <p className="font-semibold">Envío gratis desde</p>
            <p>{formatoMoneda(configuracion.montoMinimoEnvioGratis)}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
            <p className="font-semibold">Tarifa general</p>
            <p>{configuracion.tarifaGeneral !== null ? formatoMoneda(configuracion.tarifaGeneral) : 'No configurada'}</p>
          </div>
        </aside>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Tarifas por ubicación</h2>
            <p className="text-sm text-zinc-500">Crea, edita o elimina tarifas de envío según la ubicación.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium">Ubicación</span>
              <input
                type="text"
                value={ubicacion}
                onChange={(event) => setUbicacion(event.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-4 py-3"
              />
              {errores.ubicacion ? <p className="text-xs text-red-600">{errores.ubicacion}</p> : null}
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">Costo</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={costo}
                onChange={(event) => setCosto(event.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-4 py-3"
              />
              {errores.costo ? <p className="text-xs text-red-600">{errores.costo}</p> : null}
            </label>
            <div className="flex items-end gap-3">
              <button
                type="button"
                onClick={guardarTarifa}
                disabled={!puedeCrear && !puedeEditar}
                className="rounded-lg bg-black px-5 py-3 text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {tarifaEditando ? 'Guardar cambios' : 'Agregar tarifa'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-100">
                <tr>
                  <th className="px-4 py-3">Ubicación</th>
                  <th className="px-4 py-3">Costo</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginaTarifas.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-zinc-500">No hay tarifas registradas.</td>
                  </tr>
                ) : (
                  paginaTarifas.map((tarifa) => (
                    <tr key={tarifa.id} className="border-t border-zinc-200 hover:bg-zinc-50">
                      <td className="px-4 py-3 font-semibold tracking-[0.01em]">{tarifa.ubicacion}</td>
                      <td className="px-4 py-3">{formatoMoneda(tarifa.costo)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => comenzarEdicion(tarifa)}
                            className="rounded-lg border border-blue-500 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-500 hover:text-white"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => borrarTarifa(tarifa.id)}
                            disabled={!puedeEliminar}
                            className="rounded-lg border border-red-500 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:border-zinc-300 disabled:text-zinc-400"
                          >
                            <Trash2 size={14} /> Eliminar
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
      </div>
      <PaginacionClientes
        paginaActual={paginaActual}
        paginaTope={paginaTope}
        onPaginaChange={setPaginaActual}
      />
    </div>
  );
};
