import { useEffect, useMemo, useState } from 'react';
import { Pencil, Save } from 'lucide-react';
import type { PermissionAccess } from '../../hooks/usePermissions';
import type { SubscriptionPlan } from '../../../plans';
import { obtenerPlanes, actualizarPlan } from './DatosPlanes';

const formatoMoneda = (valor: number) => `S/ ${valor.toFixed(2)}`;

type Props = {
  access: PermissionAccess;
};

export const PlanesCrudPanel = ({ access }: Props) => {
  const [planes, setPlanes] = useState<SubscriptionPlan[]>(() => obtenerPlanes());
  const [planEditando, setPlanEditando] = useState<SubscriptionPlan | null>(null);
  const [beneficioTemporal, setBeneficioTemporal] = useState('');

  useEffect(() => {
    const listener = () => setPlanes(obtenerPlanes());
    window.addEventListener('maxeta:plans-changed', listener);
    return () => window.removeEventListener('maxeta:plans-changed', listener);
  }, []);

  const puedeEditar = Boolean(access.actions.update);

  const handleEditar = (plan: SubscriptionPlan) => {
    setPlanEditando(plan);
    setBeneficioTemporal('');
  };

  const handleCancelar = () => {
    setPlanEditando(null);
    setBeneficioTemporal('');
  };

  const handleGuardar = () => {
    if (!planEditando) return;
    actualizarPlan(planEditando);
    setPlanes(obtenerPlanes());
    setPlanEditando(null);
  };

  const planActual = planEditando ?? planes[0] ?? null;

  const planListado = useMemo(() => planes, [planes]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Planes</h1>
          <p className="text-zinc-500">Administra los planes disponibles y sus beneficios desde el panel administrativo.</p>
        </div>
        <button
          type="button"
          onClick={() => setPlanEditando(planListado[0] ?? null)}
          disabled={!puedeEditar || planListado.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          <Pencil size={18} /> Editar primer plan
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-3">
            {planListado.map((plan) => (
              <div key={plan.id} className="rounded-3xl border border-zinc-200 p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{plan.icono}</div>
                  <div>
                    <h2 className="text-xl font-semibold">{plan.nombre}</h2>
                    <p className="text-sm text-zinc-500">{plan.duracion}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-zinc-500">Precio</p>
                  <p className="text-2xl font-semibold text-zinc-900">{formatoMoneda(plan.precio)}</p>
                  <p className="text-sm text-zinc-500">Descuento</p>
                  <p className="text-sm font-semibold text-zinc-700">{plan.descuento}%</p>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-zinc-500">Beneficios</p>
                  <ul className="space-y-1 text-sm text-zinc-700">
                    {plan.beneficios.map((beneficio) => (
                      <li key={beneficio}>• {beneficio}</li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => handleEditar(plan)}
                  className="mt-4 w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                >
                  Editar plan
                </button>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold">Editor de plan</h2>
            <p className="mt-2 text-sm text-zinc-500">Actualiza el precio, descuento y beneficios del plan seleccionado.</p>
          </div>

          {!planActual ? (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">Selecciona un plan para editarlo.</div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700">Nombre</label>
                <input
                  type="text"
                  value={planActual.nombre}
                  disabled
                  className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-3 bg-zinc-100 text-sm text-zinc-700"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-medium text-zinc-700">
                  Precio
                  <input
                    type="number"
                    min={0}
                    value={planActual.precio}
                    disabled={!puedeEditar}
                    onChange={(event) => setPlanEditando((current) => current ? { ...current, precio: Number(event.target.value) } : current)}
                    className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm"
                  />
                </label>

                <label className="block text-sm font-medium text-zinc-700">
                  Descuento (%)
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={planActual.descuento}
                    disabled={!puedeEditar}
                    onChange={(event) => setPlanEditando((current) => current ? { ...current, descuento: Number(event.target.value) } : current)}
                    className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm"
                  />
                </label>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-zinc-700">Beneficios</label>
                <div className="space-y-2 rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
                  {planActual.beneficios.map((beneficio, index) => (
                    <div key={beneficio} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm">
                      <span>{beneficio}</span>
                      <button
                        type="button"
                        disabled={!puedeEditar}
                        onClick={() => setPlanEditando((current) => {
                          if (!current) return current;
                          return {
                            ...current,
                            beneficios: current.beneficios.filter((_, i) => i !== index),
                          };
                        })}
                        className="rounded-full border border-zinc-300 px-2 py-1 text-xs text-zinc-500 transition hover:bg-zinc-100"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <input
                      type="text"
                      value={beneficioTemporal}
                      disabled={!puedeEditar}
                      onChange={(event) => setBeneficioTemporal(event.target.value)}
                      placeholder="Nuevo beneficio"
                      className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm"
                    />
                    <button
                      type="button"
                      disabled={!beneficioTemporal.trim() || !puedeEditar}
                      onClick={() => {
                        if (!planEditando || !beneficioTemporal.trim()) return;
                        setPlanEditando({
                          ...planEditando,
                          beneficios: [...planEditando.beneficios, beneficioTemporal.trim()],
                        });
                        setBeneficioTemporal('');
                      }}
                      className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                    >
                      Añadir
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancelar}
                  className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleGuardar}
                  disabled={!puedeEditar}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                >
                  <Save size={16} /> Guardar cambios
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
