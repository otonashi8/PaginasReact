import { ImageIcon, PlayCircle, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  deletePopUp,
  getPersistedPopUps,
  savePopUps,
  togglePopUpActive,
  type PopUpContentType,
  type PopUpFrequency,
  type PopUpItem,
} from './popupStorage';
import { siteRouteOptions } from '../../../routes/siteRoutes';

type PopUpFormState = {
  nombre: string;
  tipoContenido: PopUpContentType;
  recursoMedia: string;
  imagenDesktop: string;
  imagenMobile: string;
  activo: boolean;
  mostrarEn: string;
  redireccion: boolean;
  destino: string;
  frecuencia: PopUpFrequency;
  retraso: number;
};

const createEmptyFormState = (): PopUpFormState => ({
  nombre: '',
  tipoContenido: 'imagen',
  recursoMedia: '',
  imagenDesktop: '',
  imagenMobile: '',
  activo: true,
  mostrarEn: siteRouteOptions[0]?.value ?? '/',
  redireccion: false,
  destino: siteRouteOptions.find((route) => route.allowRedirect)?.value ?? '/',
  frecuencia: 'cada-vez',
  retraso: 0,
});

type Message = { type: 'success' | 'error'; text: string } | null;

export const PopUpCrudPanel = () => {
  const [popUps, setPopUps] = useState<PopUpItem[]>(() => getPersistedPopUps());
  const [formState, setFormState] = useState<PopUpFormState>(() => createEmptyFormState());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  const buildOrderValue = () => Math.max(-1, ...popUps.map((popup) => popup.orden)) + 1;

  const sortedPopUps = useMemo(
    () => [...popUps].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [popUps],
  );

  const handleOpenCreateForm = () => {
    setEditingId(null);
    setFormState(createEmptyFormState());
    setMessage(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (popup: PopUpItem) => {
    setEditingId(popup.id);
    setFormState({
      nombre: popup.nombre,
      tipoContenido: popup.tipoContenido,
      recursoMedia: popup.recursoMedia,
      imagenDesktop: popup.imagenDesktop,
      imagenMobile: popup.imagenMobile,
      activo: popup.activo,
      mostrarEn: popup.mostrarEn,
      redireccion: popup.redireccion,
      destino: popup.destino || (siteRouteOptions.find((route) => route.allowRedirect)?.value ?? '/'),
      frecuencia: popup.frecuencia,
      retraso: popup.retraso,
    });
    setMessage(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormState(createEmptyFormState());
    setMessage(null);
  };

  const validateForm = (): string | null => {
    if (!formState.nombre.trim()) {
      return 'El nombre interno es obligatorio.';
    }

    if (formState.tipoContenido === 'video' && !formState.recursoMedia.trim()) {
      return 'El recurso multimedia es obligatorio para videos.';
    }

    if (formState.tipoContenido === 'imagen' && !formState.imagenDesktop.trim() && !formState.imagenMobile.trim()) {
      return 'Debes agregar al menos una imagen desktop o mobile.';
    }

    if (!formState.mostrarEn.trim()) {
      return 'Debes seleccionar dónde mostrar el Pop-Up.';
    }

    if (formState.redireccion && !formState.destino.trim()) {
      return 'Debes seleccionar un destino de redirección.';
    }

    return null;
  };

  const handleSave = () => {
    const errorMessage = validateForm();
    if (errorMessage) {
      setMessage({ type: 'error', text: errorMessage });
      return;
    }

    const nextPopUp: PopUpItem = {
      id: editingId ?? crypto.randomUUID(),
      nombre: formState.nombre.trim(),
      tipoContenido: formState.tipoContenido,
      recursoMedia: formState.tipoContenido === 'video' ? formState.recursoMedia.trim() : '',
      imagenDesktop: formState.tipoContenido === 'imagen' ? formState.imagenDesktop.trim() : '',
      imagenMobile: formState.tipoContenido === 'imagen' ? formState.imagenMobile.trim() : '',
      activo: formState.activo,
      mostrarEn: formState.mostrarEn,
      redireccion: formState.redireccion,
      destino: formState.redireccion ? formState.destino : '',
      frecuencia: formState.frecuencia,
      retraso: formState.retraso,
      orden: editingId ? popUps.find((popup) => popup.id === editingId)?.orden ?? buildOrderValue() : buildOrderValue(),
    };

    const nextList = editingId
      ? popUps.map((item) => (item.id === editingId ? nextPopUp : item))
      : [...popUps, nextPopUp];

    const persisted = savePopUps(nextList);
    setPopUps(persisted);
    setMessage({ type: 'success', text: editingId ? 'Pop-Up actualizado correctamente.' : 'Pop-Up creado correctamente.' });
    setIsFormOpen(false);
    setEditingId(null);
    setFormState(createEmptyFormState());
  };

  const handleToggleActive = (id: string) => {
    const nextList = togglePopUpActive(popUps, id);
    setPopUps(nextList);
    setMessage({ type: 'success', text: 'Estado de Pop-Up actualizado.' });
  };

  const handleDelete = (id: string) => {
    const item = popUps.find((popup) => popup.id === id);
    if (!item) return;

    const confirmed = window.confirm(`¿Eliminar definitivamente el Pop-Up "${item.nombre}"?`);
    if (!confirmed) return;

    const nextList = deletePopUp(popUps, id);
    setPopUps(nextList);
    setMessage({ type: 'success', text: 'Pop-Up eliminado correctamente.' });
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Marketing</p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900">Pop-Up</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600">
            Crea y administra Pop-Ups con imagen o video. La selección de página, redirección y frecuencia se añadirán luego.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateForm}
          className="inline-flex items-center gap-2 rounded-none bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
        >
          <Plus size={16} />
          Crear Pop-Up
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
          <span>{message.text}</span>
        </div>
      ) : null}

      {isFormOpen ? (
        <div className="rounded-none border border-zinc-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-zinc-900">{editingId ? 'Editar Pop-Up' : 'Nuevo Pop-Up'}</h2>
            <button
              type="button"
              onClick={handleCloseForm}
              className="text-sm text-zinc-500 transition hover:text-red-600"
            >
              Cancelar
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-zinc-700 md:col-span-2">
              <span className="mb-1 block font-medium">Nombre interno</span>
              <input
                value={formState.nombre}
                onChange={(event) => setFormState((current) => ({ ...current, nombre: event.target.value }))}
                className="w-full rounded-none border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-800"
                placeholder="Promoción 3x100"
              />
            </label>

            <label className="text-sm text-zinc-700">
              <span className="mb-1 block font-medium">Tipo de contenido</span>
              <select
                value={formState.tipoContenido}
                onChange={(event) => setFormState((current) => ({ ...current, tipoContenido: event.target.value as PopUpContentType }))}
                className="w-full rounded-none border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-800"
              >
                <option value="imagen">Imagen</option>
                <option value="video">Video</option>
              </select>
            </label>

            <label className="text-sm text-zinc-700">
              <span className="mb-1 block font-medium">Mostrar en</span>
              <select
                value={formState.mostrarEn}
                onChange={(event) => setFormState((current) => ({ ...current, mostrarEn: event.target.value }))}
                className="w-full rounded-none border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-800"
              >
                {siteRouteOptions.map((page) => (
                  <option key={page.value} value={page.value}>{page.label}</option>
                ))}
              </select>
            </label>

            <label className="text-sm text-zinc-700">
              <span className="mb-1 block font-medium">Redirección</span>
              <select
                value={formState.redireccion ? 'si' : 'no'}
                onChange={(event) => setFormState((current) => ({
                  ...current,
                  redireccion: event.target.value === 'si',
                }))}
                className="w-full rounded-none border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-800"
              >
                <option value="no">No</option>
                <option value="si">Sí</option>
              </select>
            </label>

            {formState.redireccion ? (
              <label className="text-sm text-zinc-700 md:col-span-2">
                <span className="mb-1 block font-medium">Destino</span>
                <select
                  value={formState.destino}
                  onChange={(event) => setFormState((current) => ({ ...current, destino: event.target.value }))}
                  className="w-full rounded-none border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-800"
                >
                  {siteRouteOptions.filter((page) => page.allowRedirect).map((page) => (
                    <option key={page.value} value={page.value}>{page.label}</option>
                  ))}
                </select>
              </label>
            ) : null}

            <label className="text-sm text-zinc-700">
              <span className="mb-1 block font-medium">Frecuencia</span>
              <select
                value={formState.frecuencia}
                onChange={(event) => setFormState((current) => ({
                  ...current,
                  frecuencia: event.target.value as PopUpFrequency,
                }))}
                className="w-full rounded-none border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-800"
              >
                <option value="cada-vez">Cada vez que se entra</option>
                <option value="una-vez-sesion">Una vez por sesión</option>
              </select>
            </label>

            <label className="text-sm text-zinc-700">
              <span className="mb-1 block font-medium">Retraso (segundos)</span>
              <input
                type="number"
                min={0}
                value={formState.retraso}
                onChange={(event) => setFormState((current) => ({ ...current, retraso: Number(event.target.value) || 0 }))}
                className="w-full rounded-none border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-800"
              />
            </label>

            {formState.tipoContenido === 'video' ? (
              <label className="text-sm text-zinc-700 md:col-span-2">
                <span className="mb-1 block font-medium">Recurso multimedia</span>
                <input
                  value={formState.recursoMedia}
                  onChange={(event) => setFormState((current) => ({ ...current, recursoMedia: event.target.value }))}
                  className="w-full rounded-none border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-800"
                  placeholder="https://..."
                />
              </label>
            ) : (
              <>
                <label className="text-sm text-zinc-700 md:col-span-2">
                  <span className="mb-1 block font-medium">Imagen Desktop</span>
                  <input
                    value={formState.imagenDesktop}
                    onChange={(event) => setFormState((current) => ({ ...current, imagenDesktop: event.target.value }))}
                    className="w-full rounded-none border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-800"
                    placeholder="https://..."
                  />
                </label>
                <label className="text-sm text-zinc-700 md:col-span-2">
                  <span className="mb-1 block font-medium">Imagen Mobile</span>
                  <input
                    value={formState.imagenMobile}
                    onChange={(event) => setFormState((current) => ({ ...current, imagenMobile: event.target.value }))}
                    className="w-full rounded-none border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-800"
                    placeholder="https://..."
                  />
                </label>
              </>
            )}

            <div className="text-sm text-zinc-700">
              <span className="mb-1 block font-medium">Vista previa</span>
              <div className="inline-flex items-center gap-2 rounded-none border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
                {formState.tipoContenido === 'video' ? <PlayCircle size={18} /> : <ImageIcon size={18} />}
                <span>{formState.tipoContenido === 'video' ? 'Video' : 'Imagen'}</span>
              </div>
            </div>

            <label className="text-sm text-zinc-700">
              <span className="mb-1 block font-medium">Estado</span>
              <select
                value={formState.activo ? 'activo' : 'inactivo'}
                onChange={(event) => setFormState((current) => ({ ...current, activo: event.target.value === 'activo' }))}
                className="w-full rounded-none border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-800"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </label>
          </div>

          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={handleCloseForm}
              className="rounded-none border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-red-600 hover:text-red-600"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-none bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              {editingId ? 'Guardar cambios' : 'Crear Pop-Up'}
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-none border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-700">
              <tr>
                <th className="border-b border-zinc-200 px-4 py-3 font-semibold">Nombre</th>
                <th className="border-b border-zinc-200 px-4 py-3 font-semibold">Contenido</th>
                <th className="border-b border-zinc-200 px-4 py-3 font-semibold">Mostrar en</th>
                <th className="border-b border-zinc-200 px-4 py-3 font-semibold">Frecuencia</th>
                <th className="border-b border-zinc-200 px-4 py-3 font-semibold">Retraso</th>
                <th className="border-b border-zinc-200 px-4 py-3 font-semibold">Redirección</th>
                <th className="border-b border-zinc-200 px-4 py-3 font-semibold">Estado</th>
                <th className="border-b border-zinc-200 px-4 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedPopUps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-zinc-500">
                    No hay Pop-Ups registrados. Haz clic en "+ Crear Pop-Up" para comenzar.
                  </td>
                </tr>
              ) : null}

              {sortedPopUps.map((popup) => (
                <tr key={popup.id} className="align-top">
                  <td className="border-b border-zinc-200 px-4 py-3 text-zinc-800">
                    <div className="font-medium">{popup.nombre}</div>
                    <div className="mt-1 text-xs text-zinc-500">{popup.id}</div>
                  </td>
                  <td className="border-b border-zinc-200 px-4 py-3 text-zinc-700">
                    <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zinc-600">
                      {popup.tipoContenido === 'video' ? (
                        <><PlayCircle size={14} /> Video</>
                      ) : (
                        <><ImageIcon size={14} /> Imagen</>
                      )}
                    </div>
                  </td>
                  <td className="border-b border-zinc-200 px-4 py-3 text-zinc-700">
                    {siteRouteOptions.find((item) => item.value === popup.mostrarEn)?.label ?? popup.mostrarEn}
                  </td>
                  <td className="border-b border-zinc-200 px-4 py-3 text-zinc-700">
                    {popup.frecuencia === 'una-vez-sesion' ? 'Una vez por sesión' : 'Cada vez que se entra'}
                  </td>
                  <td className="border-b border-zinc-200 px-4 py-3 text-zinc-700">
                    {popup.retraso}s
                  </td>
                  <td className="border-b border-zinc-200 px-4 py-3 text-zinc-700">
                    {popup.redireccion ? (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                          Sí
                        </span>
                        <span className="text-xs text-zinc-500">
                          {siteRouteOptions.find((item) => item.value === popup.destino)?.label ?? popup.destino}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                        No
                      </span>
                    )}
                  </td>
                  <td className="border-b border-zinc-200 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(popup.id)}
                      className={`inline-flex rounded-none border px-2.5 py-1 text-xs font-medium transition ${
                        popup.activo
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:text-emerald-800'
                          : 'border-zinc-200 bg-zinc-100 text-zinc-600 hover:border-zinc-300 hover:text-zinc-800'
                      }`}
                    >
                      {popup.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="border-b border-zinc-200 px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditForm(popup)}
                        className="rounded-none border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-red-600 hover:text-red-600"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(popup.id)}
                        className="rounded-none border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
