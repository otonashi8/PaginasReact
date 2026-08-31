import { Check, Link as LinkIcon, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { actualizarRed, crearRed, eliminarRed, obtenerRedes, type Red } from './redesService';

const emptyForm = { nombre: '', url: '', iconUrl: '', activo: true };

export const RedesCrudPanel = () => {
  const [redes, setRedes] = useState<Red[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editando, setEditando] = useState<Red | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');

  const cargar = async () => {
    setCargando(true);
    try {
      setRedes(await obtenerRedes());
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : 'No se pudieron cargar las redes.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { void cargar(); }, []);

  const empezarEdicion = (red: Red) => {
    setEditando(red);
    setFormOpen(true);
    setForm({ nombre: red.nombre, url: red.url, iconUrl: red.iconUrl ?? '', activo: red.activo });
    setIconFile(null);
    setMensaje('');
  };

  const cancelar = () => {
    setEditando(null);
    setFormOpen(false);
    setForm(emptyForm);
    setIconFile(null);
  };

  const guardar = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMensaje('');
    try {
      if (editando) {
        await actualizarRed({ ...editando, ...form, iconUrl: form.iconUrl || null }, iconFile);
      } else {
          await crearRed({ ...form, iconUrl: form.iconUrl || null }, iconFile);
      }
      cancelar();
      await cargar();
      setMensaje('Cambios guardados correctamente.');
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : 'No se pudo guardar la red.');
    }
  };

  const borrar = async (red: Red) => {
    if (!window.confirm(`¿Eliminar ${red.nombre}?`)) return;
    try {
      await eliminarRed(red.id);
      await cargar();
      setMensaje('Red eliminada correctamente.');
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : 'No se pudo eliminar la red.');
    }
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 border-b border-zinc-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Sistema</p><h1 className="mt-2 text-2xl font-semibold">Redes sociales</h1><p className="mt-1 text-sm text-zinc-500">Administra los enlaces visibles en el footer y en el botón Síguenos.</p></div>
        {!formOpen && <Button type="button" onClick={() => { setFormOpen(true); setMensaje(''); }} className="gap-2 rounded-none bg-zinc-900 hover:bg-red-600" aria-label="Agregar red"><Plus size={16} />Agregar red</Button>}
      </header>
      {mensaje && <p className="border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">{mensaje}</p>}
      {formOpen ? (
        <form onSubmit={guardar} className="grid gap-4 border border-zinc-200 bg-zinc-50 p-4 md:grid-cols-[1fr_2fr_2fr_2fr_auto] md:items-end">
          <label className="text-sm font-medium">Nombre<input required maxLength={80} value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} className="mt-1 w-full border border-zinc-300 bg-white px-3 py-2 font-normal outline-none focus:border-zinc-900" placeholder="Instagram" /></label>
          <label className="text-sm font-medium">URL<input required type="url" maxLength={500} value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} className="mt-1 w-full border border-zinc-300 bg-white px-3 py-2 font-normal outline-none focus:border-zinc-900" placeholder="https://instagram.com/tu-cuenta" /></label>
          <label className="text-sm font-medium">URL de imagen del icono<input type="url" maxLength={500} value={form.iconUrl} onChange={(event) => setForm({ ...form, iconUrl: event.target.value })} className="mt-1 w-full border border-zinc-300 bg-white px-3 py-2 font-normal outline-none focus:border-zinc-900" placeholder="https://sitio.com/instagram.png" /></label>
          <label className="text-sm font-medium">O subir imagen<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setIconFile(event.target.files?.[0] ?? null)} className="mt-1 block w-full text-sm font-normal file:mr-3 file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-white" /></label>
          <div className="flex gap-2"><Button type="submit" className="rounded-none bg-zinc-900">Guardar</Button><Button type="button" variant="outline" onClick={cancelar} className="rounded-none">Cancelar</Button></div>
          <label className="flex items-center gap-2 text-sm md:col-span-5"><input type="checkbox" checked={form.activo} onChange={(event) => setForm({ ...form, activo: event.target.checked })} />Visible en el sitio</label>
        </form>
      ) : null}
      <div className="overflow-x-auto border border-zinc-200">
        <table className="min-w-full text-left text-sm"><thead className="bg-zinc-50"><tr><th className="border-b border-zinc-200 px-4 py-3">Red</th><th className="border-b border-zinc-200 px-4 py-3">Icono</th><th className="border-b border-zinc-200 px-4 py-3">URL</th><th className="border-b border-zinc-200 px-4 py-3">Estado</th><th className="border-b border-zinc-200 px-4 py-3 text-right">Acciones</th></tr></thead><tbody>
          {cargando ? <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500">Cargando redes...</td></tr> : redes.map((red) => <tr key={red.id} className="hover:bg-zinc-50"><td className="border-b border-zinc-200 px-4 py-3 font-semibold"><span className="inline-flex items-center gap-2"><LinkIcon size={15} className="text-zinc-400" />{red.nombre}</span></td><td className="border-b border-zinc-200 px-4 py-3">{red.iconUrl ? <img src={red.iconUrl} alt={`Icono de ${red.nombre}`} className="size-8 object-contain" /> : <span className="text-xs text-zinc-400">Sin imagen</span>}</td><td className="max-w-md border-b border-zinc-200 px-4 py-3"><a href={red.url} target="_blank" rel="noopener noreferrer" className="break-all text-zinc-600 underline decoration-zinc-300 underline-offset-2">{red.url}</a></td><td className="border-b border-zinc-200 px-4 py-3"><span className={`inline-flex items-center gap-1 text-xs ${red.activo ? 'text-emerald-700' : 'text-zinc-500'}`}>{red.activo ? <Check size={14} /> : <X size={14} />}{red.activo ? 'Activa' : 'Inactiva'}</span></td><td className="border-b border-zinc-200 px-4 py-3 text-right"><Button type="button" variant="ghost" size="icon-sm" onClick={() => empezarEdicion(red)} aria-label={`Editar ${red.nombre}`}><Pencil size={16} /></Button><Button type="button" variant="ghost" size="icon-sm" onClick={() => void borrar(red)} aria-label={`Eliminar ${red.nombre}`}><Trash2 size={16} /></Button></td></tr>)}
          {!cargando && redes.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500">No hay redes configuradas.</td></tr>}
        </tbody></table>
      </div>
    </section>
  );
};
