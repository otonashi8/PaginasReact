import { AlertCircle, ChevronDown, ChevronUp, ImageIcon, Pencil, Plus, Power, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { registrarLog, obtenerActorAuditoria } from '../../../services/auditService';
import { PaginacionClientes } from '../../componentes/Paginacion';
import {
  getBannerRotationSeconds,
  getPersistedBanners,
  saveBanners,
  setBannerRotationSeconds,
  type Banner,
} from './bannersStorage';

type BannerFormState = {
  nombre: string;
  imagenDesktop: string;
  imagenMobile: string;
  activo: boolean;
  orden: number;
};

type BannerMessage = {
  type: 'success' | 'error';
  text: string;
};

const createEmptyForm = (orden = 0): BannerFormState => ({
  nombre: '',
  imagenDesktop: '',
  imagenMobile: '',
  activo: true,
  orden,
});

const buildOrderValue = (banners: Banner[]) => Math.max(0, ...banners.map((banner) => banner.orden), 0) + 1;

export const BannersCrudPanel = () => {
  const [banners, setBanners] = useState<Banner[]>(() => getPersistedBanners());
  const [rotationValue, setRotationValue] = useState<string>(() => String(getBannerRotationSeconds()));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<BannerFormState>(() => createEmptyForm());
  const [message, setMessage] = useState<BannerMessage | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 10;

  const sortedBanners = useMemo(
    () => [...banners].sort((a, b) => a.orden - b.orden),
    [banners],
  );

  useEffect(() => {
    setPaginaActual(1);
  }, [banners.length]);

  const paginaBanners = useMemo(() => {
    const inicio = (paginaActual - 1) * elementosPorPagina;
    return sortedBanners.slice(inicio, inicio + elementosPorPagina);
  }, [paginaActual, sortedBanners]);

  const paginaTope = Math.max(1, Math.ceil(sortedBanners.length / elementosPorPagina));

  const closeForm = () => {
    setEditingId(null);
    setIsFormOpen(false);
    setForm(createEmptyForm(buildOrderValue(banners)));
  };

  const handleSaveRotation = () => {
    const nextValue = setBannerRotationSeconds(rotationValue);
    const actor = obtenerActorAuditoria();
    registrarLog({
      modulo: 'Marketing',
      submodulo: 'Banners',
      accion: 'Actualizó rotación',
      descripcion: `Se actualizó la rotación del carrusel a ${nextValue} segundos.`,
      usuario: actor.usuario,
      rol: actor.rol,
      objetoAfectado: 'Configuración carrusel',
      datosAnteriores: String(getBannerRotationSeconds()),
      datosNuevos: String(nextValue),
    });
    setMessage({
      type: 'success',
      text: `Tiempo de rotación actualizado a ${nextValue} segundos.`,
    });
    setRotationValue(String(nextValue));
  };

  const handleSaveBanner = () => {
    const nombre = form.nombre.trim();
    const desktop = form.imagenDesktop.trim();
    const mobile = form.imagenMobile.trim();

    if (!nombre) {
      setMessage({ type: 'error', text: 'El nombre del banner es obligatorio.' });
      return;
    }

    if (!desktop && !mobile) {
      setMessage({ type: 'error', text: 'Debes agregar al menos una imagen desktop o mobile.' });
      return;
    }

    const nextBanner: Banner = {
      id: editingId ?? crypto.randomUUID(),
      nombre,
      imagenDesktop: desktop || mobile,
      imagenMobile: mobile || desktop,
      activo: form.activo,
      orden: Number.isFinite(Number(form.orden)) ? Number(form.orden) : buildOrderValue(banners),
    };

    const nextBanners = editingId
      ? banners.map((banner) => (banner.id === editingId ? nextBanner : banner))
      : [...banners, nextBanner];

    const persisted = saveBanners(nextBanners);
    setBanners(persisted);

    const actor = obtenerActorAuditoria();
    registrarLog({
      modulo: 'Marketing',
      submodulo: 'Banners',
      accion: editingId ? 'Actualizó banner' : 'Creó banner',
      descripcion: editingId ? `Se actualizó el banner "${nombre}".` : `Se creó el banner "${nombre}".`,
      usuario: actor.usuario,
      rol: actor.rol,
      objetoAfectado: nombre,
      referencia: nextBanner.id,
      datosAnteriores: editingId ? JSON.stringify(banners.find((banner) => banner.id === editingId) ?? null) : null,
      datosNuevos: JSON.stringify(nextBanner),
    });

    setMessage({
      type: 'success',
      text: editingId ? 'Banner actualizado correctamente.' : 'Banner agregado correctamente.',
    });
    closeForm();
  };

  const handleEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setForm({
      nombre: banner.nombre,
      imagenDesktop: banner.imagenDesktop,
      imagenMobile: banner.imagenMobile,
      activo: banner.activo,
      orden: banner.orden,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (banner: Banner) => {
    const confirmed = window.confirm(`¿Eliminar definitivamente el banner "${banner.nombre}"?`);
    if (!confirmed) {
      return;
    }

    const nextBanners = saveBanners(banners.filter((item) => item.id !== banner.id));
    setBanners(nextBanners);

    const actor = obtenerActorAuditoria();
    registrarLog({
      modulo: 'Marketing',
      submodulo: 'Banners',
      accion: 'Eliminó banner',
      descripcion: `Se eliminó el banner "${banner.nombre}".`,
      usuario: actor.usuario,
      rol: actor.rol,
      objetoAfectado: banner.nombre,
      referencia: banner.id,
      datosAnteriores: JSON.stringify(banner),
      datosNuevos: null,
    });

    setMessage({ type: 'success', text: 'Banner eliminado correctamente.' });
    if (editingId === banner.id) {
      closeForm();
    }
  };

  const toggleBannerStatus = (bannerId: string) => {
    const previousBanner = banners.find((banner) => banner.id === bannerId) ?? null;
    const nextBanners = saveBanners(
      banners.map((banner) =>
        banner.id === bannerId ? { ...banner, activo: !banner.activo } : banner,
      ),
    );

    const actor = obtenerActorAuditoria();
    registrarLog({
      modulo: 'Marketing',
      submodulo: 'Banners',
      accion: previousBanner?.activo ? 'Desactivó banner' : 'Reactivó banner',
      descripcion: previousBanner ? `Se ${previousBanner.activo ? 'desactivó' : 'reactivó'} el banner "${previousBanner.nombre}".` : 'Se actualizó el estado del banner.',
      usuario: actor.usuario,
      rol: actor.rol,
      objetoAfectado: previousBanner?.nombre ?? 'Banner',
      referencia: bannerId,
      datosAnteriores: JSON.stringify(previousBanner),
      datosNuevos: JSON.stringify(nextBanners.find((banner) => banner.id === bannerId) ?? null),
    });

    setBanners(nextBanners);
    setMessage({ type: 'success', text: 'Estado del banner actualizado.' });
  };

  const moveBanner = (bannerId: string, direction: 'up' | 'down') => {
    const index = sortedBanners.findIndex((banner) => banner.id === bannerId);
    if (index === -1) {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedBanners.length) {
      return;
    }

    const next = [...sortedBanners];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    const reordered = next.map((banner, arrayIndex) => ({ ...banner, orden: arrayIndex }));
    const persisted = saveBanners(reordered);

    const actor = obtenerActorAuditoria();
    registrarLog({
      modulo: 'Marketing',
      submodulo: 'Banners',
      accion: 'Reordenó banners',
      descripcion: `Se actualizó el orden de los banners para la vista del carrusel.`,
      usuario: actor.usuario,
      rol: actor.rol,
      objetoAfectado: 'Orden del carrusel',
      datosAnteriores: JSON.stringify(sortedBanners),
      datosNuevos: JSON.stringify(reordered),
    });

    setBanners(persisted);
    setMessage({ type: 'success', text: 'Orden del banner actualizado.' });
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Marketing</p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900">Banners</h1>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setForm(createEmptyForm(buildOrderValue(banners)));
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-none bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
        >
          <Plus size={16} />
          Agregar banner
        </button>
      </div>

      {message ? (
        <div
          className={`flex items-start gap-2 border px-3 py-2 text-sm ${
            message.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {message.type === 'error' ? <AlertCircle size={16} className="mt-0.5" /> : <Power size={16} className="mt-0.5" />}
          <span>{message.text}</span>
        </div>
      ) : null}

      <div className="rounded-none border border-zinc-200 bg-zinc-50 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <label className="flex-1 text-sm text-zinc-700">
            <span className="mb-1 block font-medium">Tiempo de rotación</span>
            <input
              type="number"
              min={1}
              step={1}
              value={rotationValue}
              onChange={(event) => setRotationValue(event.target.value)}
              className="w-full rounded-none border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-800"
            />
          </label>

          <button
            type="button"
            onClick={handleSaveRotation}
            className="rounded-none border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 transition hover:border-red-600 hover:text-red-600"
          >
            Guardar rotación
          </button>
        </div>
        <p className="mt-2 text-xs text-zinc-500">El carrusel usa este valor automáticamente en segundos.</p>
      </div>

      {isFormOpen ? (
        <div className="rounded-none border border-zinc-200 bg-white p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-zinc-900">{editingId ? 'Editar banner' : 'Nuevo banner'}</h2>
            <button
              type="button"
              onClick={closeForm}
              className="text-sm text-zinc-500 transition hover:text-red-600"
            >
              Cancelar
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-zinc-700 md:col-span-2">
              <span className="mb-1 block font-medium">Nombre</span>
              <input
                value={form.nombre}
                onChange={(event) => setForm((current) => ({ ...current, nombre: event.target.value }))}
                className="w-full rounded-none border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-800"
                placeholder="Ej. Primavera 2026"
              />
            </label>

            <label className="text-sm text-zinc-700">
              <span className="mb-1 block font-medium">Imagen PC</span>
              <input
                value={form.imagenDesktop}
                onChange={(event) => setForm((current) => ({ ...current, imagenDesktop: event.target.value }))}
                className="w-full rounded-none border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-800"
                placeholder="https://..."
              />
            </label>

            <label className="text-sm text-zinc-700">
              <span className="mb-1 block font-medium">Imagen Celular</span>
              <input
                value={form.imagenMobile}
                onChange={(event) => setForm((current) => ({ ...current, imagenMobile: event.target.value }))}
                className="w-full rounded-none border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-800"
                placeholder="https://..."
              />
            </label>

            <label className="text-sm text-zinc-700">
              <span className="mb-1 block font-medium">Estado</span>
              <select
                value={form.activo ? 'activo' : 'inactivo'}
                onChange={(event) => setForm((current) => ({ ...current, activo: event.target.value === 'activo' }))}
                className="w-full rounded-none border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-800"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </label>

            <label className="text-sm text-zinc-700">
              <span className="mb-1 block font-medium">Orden</span>
              <input
                type="number"
                min={0}
                value={form.orden}
                onChange={(event) => setForm((current) => ({ ...current, orden: Number(event.target.value) || 0 }))}
                className="w-full rounded-none border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-800"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={closeForm}
              className="rounded-none border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-red-600 hover:text-red-600"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveBanner}
              className="rounded-none bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              {editingId ? 'Guardar cambios' : 'Crear banner'}
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-none border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-700">
              <tr>
                <th className="border-b border-zinc-200 px-4 py-3 font-semibold">Banner</th>
                <th className="border-b border-zinc-200 px-4 py-3 font-semibold">Preview</th>
                <th className="border-b border-zinc-200 px-4 py-3 font-semibold">Estado</th>
                <th className="border-b border-zinc-200 px-4 py-3 font-semibold">Orden</th>
                <th className="border-b border-zinc-200 px-4 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginaBanners.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                    No hay banners registrados.
                  </td>
                </tr>
              ) : null}

              {paginaBanners.map((banner) => (
                <tr key={banner.id} className="align-top">
                  <td className="border-b border-zinc-200 px-4 py-3 text-zinc-800">
                    <div className="font-medium">{banner.nombre}</div>
                    <div className="mt-1 text-xs text-zinc-500">{banner.id}</div>
                  </td>
                  <td className="border-b border-zinc-200 px-4 py-3">
                    <div className="flex gap-2">
                      {(banner.imagenDesktop || banner.imagenMobile) ? (
                        <div className="relative h-16 w-24 overflow-hidden border border-zinc-200 bg-zinc-50">
                          <img
                            src={banner.imagenDesktop || banner.imagenMobile}
                            alt={banner.nombre}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-16 w-24 items-center justify-center border border-dashed border-zinc-300 bg-zinc-50 text-zinc-400">
                          <ImageIcon size={18} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="border-b border-zinc-200 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleBannerStatus(banner.id)}
                      className={`inline-flex rounded-none border px-2.5 py-1 text-xs font-medium transition ${
                        banner.activo
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:text-emerald-800'
                          : 'border-zinc-200 bg-zinc-100 text-zinc-600 hover:border-zinc-300 hover:text-zinc-800'
                      }`}
                    >
                      {banner.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="border-b border-zinc-200 px-4 py-3 text-zinc-700">{banner.orden}</td>
                  <td className="border-b border-zinc-200 px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(banner)}
                        className="rounded-none border border-zinc-300 bg-white px-2 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-red-600 hover:text-red-600"
                      >
                        <span className="inline-flex items-center gap-1"><Pencil size={12} /> Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBanner(banner.id, 'up')}
                        className="rounded-none border border-zinc-300 bg-white px-2 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-red-600 hover:text-red-600"
                        aria-label={`Mover banner ${banner.nombre} arriba`}
                      >
                        <ChevronUp size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBanner(banner.id, 'down')}
                        className="rounded-none border border-zinc-300 bg-white px-2 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-red-600 hover:text-red-600"
                        aria-label={`Mover banner ${banner.nombre} abajo`}
                      >
                        <ChevronDown size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(banner)}
                        className="rounded-none border border-red-200 bg-red-50 px-2 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
                      >
                        <span className="inline-flex items-center gap-1"><Trash2 size={12} /> Eliminar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <PaginacionClientes
        paginaActual={paginaActual}
        paginaTope={paginaTope}
        onPaginaChange={setPaginaActual}
      />
    </section>
  );
};
