import { ImageIcon, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Trabajo, TrabajoRedireccion } from './trabajosService';
import { actualizarTrabajo, crearTrabajo, eliminarTrabajo, obtenerTrabajosAdmin } from './trabajosService';

const emptyRedireccion = (): TrabajoRedireccion => ({ nombre: '', url: '' });

const emptyForm = () => ({
  puesto: '',
  nombre: '',
  descripcionBreve: '',
  horario: '',
  ubicacion: '',
  redirecciones: [emptyRedireccion()],
  imagenUrl: '',
  activo: true,
});

const normalizeRedirecciones = (items: TrabajoRedireccion[]) => items.filter((item) => item.nombre.trim() && item.url.trim());

export const TrabajosCrudPanel = () => {
  const [trabajos, setTrabajos] = useState<Trabajo[]>([]);
  const [form, setForm] = useState(emptyForm());
  const [editando, setEditando] = useState<Trabajo | null>(null);
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await obtenerTrabajosAdmin();
      setTrabajos(data);
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : 'No se pudieron cargar los trabajos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void cargar(); }, []);

  const trabajosFiltrados = trabajos.filter((trabajo) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;

    return [
      trabajo.puesto,
      trabajo.nombre,
      trabajo.descripcionBreve,
      trabajo.horario,
      trabajo.ubicacion,
    ]
      .filter((valor): valor is string => Boolean(valor))
      .some((valor) => valor.toLowerCase().includes(query));
  });

  useEffect(() => {
    if (!imagenFile) {
      setPreview(form.imagenUrl || null);
      return;
    }

    const objectUrl = URL.createObjectURL(imagenFile);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imagenFile, form.imagenUrl]);

  const resetForm = () => {
    setEditando(null);
    setForm(emptyForm());
    setImagenFile(null);
    setPreview(null);
    setMensaje('');
    setModalAbierto(false);
  };

  const onGuardar = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const redirecciones = normalizeRedirecciones(form.redirecciones);

    if (!form.puesto.trim() || !form.nombre.trim() || !form.descripcionBreve.trim()) {
      setMensaje('Completa puesto, nombre y descripción breve.');
      return;
    }

    if (redirecciones.length === 0) {
      setMensaje('Agrega al menos una redirección para la vacante.');
      return;
    }

    try {
      const payload = {
        puesto: form.puesto.trim(),
        nombre: form.nombre.trim(),
        descripcionBreve: form.descripcionBreve.trim(),
        horario: form.horario.trim(),
        ubicacion: form.ubicacion.trim(),
        redirecciones,
        imagenUrl: form.imagenUrl.trim(),
        activo: form.activo,
      };

      if (editando) {
        await actualizarTrabajo({ ...editando, ...payload }, imagenFile);
        setMensaje('Trabajo actualizado correctamente.');
      } else {
        await crearTrabajo(payload, imagenFile);
        setMensaje('Trabajo creado correctamente.');
      }

      resetForm();
      await cargar();
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : 'No se pudo guardar el trabajo.');
    }
  };

  const onEditar = (trabajo: Trabajo) => {
    setEditando(trabajo);
    setForm({
      puesto: trabajo.puesto,
      nombre: trabajo.nombre,
      descripcionBreve: trabajo.descripcionBreve,
      horario: trabajo.horario ?? '',
      ubicacion: trabajo.ubicacion ?? '',
      redirecciones: trabajo.redirecciones.length ? trabajo.redirecciones : [emptyRedireccion()],
      imagenUrl: trabajo.imagenUrl ?? '',
      activo: trabajo.activo,
    });
    setImagenFile(null);
    setMensaje('');
    setModalAbierto(true);
  };

  const onEliminar = async (trabajo: Trabajo) => {
    if (!window.confirm(`¿Eliminar la vacante de ${trabajo.puesto}?`)) return;
    try {
      await eliminarTrabajo(trabajo.id);
      await cargar();
      setMensaje('Vacante eliminada correctamente.');
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : 'No se pudo eliminar la vacante.');
    }
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 border-b border-zinc-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">RR.HH</p>
          <h1 className="mt-2 text-2xl font-semibold">Trabajos</h1>
          <p className="mt-1 text-sm text-zinc-500">Administra las ofertas disponibles en la página Únetenos.</p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setEditando(null);
            setForm(emptyForm());
            setImagenFile(null);
            setPreview(null);
            setMensaje('');
            setModalAbierto(true);
          }}
          className="gap-2 rounded-none bg-zinc-900 hover:bg-red-600"
          aria-label="Agregar trabajo"
        >
          <Plus size={16} />Agregar vacante
        </Button>
      </header>

      {mensaje && <p className="border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">{mensaje}</p>}

      <div className="max-w-md">
        <label className="block text-sm font-medium text-zinc-700">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Buscar trabajo</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Puesto, persona, ubicación..."
            className="w-full border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
        </label>
      </div>

      <Dialog open={modalAbierto} onOpenChange={(open) => {
        if (!open) resetForm();
        else setModalAbierto(true);
      }}>
        <DialogContent className="max-h-[90vh] w-[min(900px,calc(100%-2rem))] overflow-y-auto rounded-none border border-zinc-200 bg-white p-0">
          <DialogHeader className="border-b border-zinc-200 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <DialogTitle className="text-xl font-semibold text-zinc-900">
                  {editando ? 'Editar vacante' : 'Nueva vacante'}
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm text-zinc-500">
                  {editando ? 'Actualiza la información de la oferta laboral.' : 'Completa los datos para crear una nueva vacante.'}
                </DialogDescription>
              </div>
              <button type="button" onClick={resetForm} className="rounded-none border border-zinc-300 p-2 text-zinc-600 hover:border-zinc-400 hover:text-zinc-900" aria-label="Cerrar modal"><X size={16} /></button>
            </div>
          </DialogHeader>

          <form onSubmit={onGuardar} className="grid gap-4 p-6 md:grid-cols-2">
            <label className="text-sm font-medium md:col-span-1">Puesto<input required value={form.puesto} onChange={(event) => setForm({ ...form, puesto: event.target.value })} className="mt-1 w-full border border-zinc-300 bg-white px-3 py-2" placeholder="Ej: Asistente comercial" /></label>
            <label className="text-sm font-medium md:col-span-1">Nombre del responsable<input required value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} className="mt-1 w-full border border-zinc-300 bg-white px-3 py-2" placeholder="Ej: Andrea García" /></label>
            <label className="text-sm font-medium md:col-span-2">Descripción breve<textarea required rows={4} value={form.descripcionBreve} onChange={(event) => setForm({ ...form, descripcionBreve: event.target.value })} className="mt-1 w-full border border-zinc-300 bg-white px-3 py-2" placeholder="Describe la vacante en pocas líneas" /></label>
            <label className="text-sm font-medium">Horario<input value={form.horario} onChange={(event) => setForm({ ...form, horario: event.target.value })} className="mt-1 w-full border border-zinc-300 bg-white px-3 py-2" placeholder="Ej: Lunes a sábado, 9am-6pm" /></label>
            <label className="text-sm font-medium">Ubicación<input value={form.ubicacion} onChange={(event) => setForm({ ...form, ubicacion: event.target.value })} className="mt-1 w-full border border-zinc-300 bg-white px-3 py-2" placeholder="Ej: Lima, Perú" /></label>
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">Redirecciones</span>
                <button type="button" onClick={() => setForm({ ...form, redirecciones: [...form.redirecciones, emptyRedireccion()] })} className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-700 hover:text-red-600">+ agregar</button>
              </div>
              <div className="space-y-3">
                {form.redirecciones.map((link, index) => (
                  <div key={`${link.nombre}-${index}`} className="grid gap-2 md:grid-cols-[1fr_2fr_auto]">
                    <input value={link.nombre} onChange={(event) => {
                      const next = [...form.redirecciones];
                      next[index] = { ...next[index], nombre: event.target.value };
                      setForm({ ...form, redirecciones: next });
                    }} className="border border-zinc-300 bg-white px-3 py-2" placeholder="Indeed" />
                    <input value={link.url} onChange={(event) => {
                      const next = [...form.redirecciones];
                      next[index] = { ...next[index], url: event.target.value };
                      setForm({ ...form, redirecciones: next });
                    }} className="border border-zinc-300 bg-white px-3 py-2" placeholder="https://..." />
                    <button type="button" onClick={() => {
                      const next = form.redirecciones.filter((_, itemIndex) => itemIndex !== index);
                      setForm({ ...form, redirecciones: next.length ? next : [emptyRedireccion()] });
                    }} className="self-center border border-zinc-300 px-3 py-2 text-sm text-zinc-600 hover:border-red-300 hover:text-red-600">Quitar</button>
                  </div>
                ))}
              </div>
            </div>
            <label className="text-sm font-medium md:col-span-1">Imagen URL<input value={form.imagenUrl} onChange={(event) => setForm({ ...form, imagenUrl: event.target.value })} className="mt-1 w-full border border-zinc-300 bg-white px-3 py-2" placeholder="https://ejemplo.com/imagen.jpg" /></label>
            <label className="text-sm font-medium md:col-span-1">O subir imagen<input type="file" accept="image/*" onChange={(event) => setImagenFile(event.target.files?.[0] ?? null)} className="mt-1 block w-full text-sm file:mr-3 file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-white" /></label>
            {(preview || form.imagenUrl) && (
              <div className="md:col-span-2 rounded-none border border-zinc-200 bg-white p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700"><ImageIcon size={16} />Previsualización</div>
                <img src={preview ?? form.imagenUrl} alt="Previsualización de la vacante" className="h-48 w-full object-cover object-center border border-zinc-200" />
              </div>
            )}
            <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" checked={form.activo} onChange={(event) => setForm({ ...form, activo: event.target.checked })} />Visible para clientes</label>
            <div className="md:col-span-2 flex flex-wrap gap-3">
              <Button type="submit" className="rounded-none bg-zinc-900 hover:bg-red-600">{editando ? 'Actualizar vacante' : 'Guardar vacante'}</Button>
              <Button type="button" variant="outline" onClick={resetForm} className="rounded-none">Cancelar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="overflow-x-auto border border-zinc-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="border-b border-zinc-200 px-4 py-3">Puesto</th>
              <th className="border-b border-zinc-200 px-4 py-3">Descripción</th>
              <th className="border-b border-zinc-200 px-4 py-3">Ubicación</th>
              <th className="border-b border-zinc-200 px-4 py-3">Estado</th>
              <th className="border-b border-zinc-200 px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500">Cargando vacantes...</td></tr>
            ) : trabajosFiltrados.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                {search ? `No se encontraron vacantes para "${search}".` : 'No hay vacantes registradas.'}
              </td></tr>
            ) : trabajosFiltrados.map((trabajo) => (
              <tr key={trabajo.id} className="align-top hover:bg-zinc-50">
                <td className="border-b border-zinc-200 px-4 py-3 font-semibold">{trabajo.puesto}<div className="mt-1 text-xs text-zinc-500">{trabajo.nombre}</div></td>
                <td className="border-b border-zinc-200 px-4 py-3 max-w-md text-zinc-600">{trabajo.descripcionBreve}</td>
                <td className="border-b border-zinc-200 px-4 py-3 text-zinc-600">{trabajo.ubicacion || '—'}</td>
                <td className="border-b border-zinc-200 px-4 py-3"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${trabajo.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-200 text-zinc-600'}`}>{trabajo.activo ? 'Activo' : 'Inactivo'}</span></td>
                <td className="border-b border-zinc-200 px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => onEditar(trabajo)} aria-label={`Editar ${trabajo.puesto}`}><Pencil size={16} /></Button>
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => void onEliminar(trabajo)} aria-label={`Eliminar ${trabajo.puesto}`}><Trash2 size={16} /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
