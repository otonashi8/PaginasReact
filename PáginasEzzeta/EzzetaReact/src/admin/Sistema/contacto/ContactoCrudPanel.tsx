import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { guardarContacto, obtenerContacto, type Contacto } from './contactoService';

export const ContactoCrudPanel = () => {
  const [form, setForm] = useState<Contacto>(() => obtenerContacto());
  const [mensaje, setMensaje] = useState('');

  useEffect(() => setForm(obtenerContacto()), []);

  const guardar = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    guardarContacto(form);
    setForm(obtenerContacto());
    setMensaje('Datos de contacto guardados correctamente.');
  };

  return (
    <section className="max-w-3xl space-y-6">
      <header className="border-b border-zinc-200 pb-5">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Sistema</p>
        <h1 className="mt-2 text-2xl font-semibold">Contacto</h1>
        <p className="mt-1 text-sm text-zinc-500">Administra los datos visibles y el número usado para WhatsApp.</p>
      </header>
      {mensaje && <p className="border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{mensaje}</p>}
      <form onSubmit={guardar} className="space-y-4 border border-zinc-200 bg-zinc-50 p-5">
        <label className="block text-sm font-medium">Correo electrónico
          <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-1 w-full border border-zinc-300 bg-white px-3 py-2 font-normal outline-none focus:border-zinc-900" />
        </label>
        <label className="block text-sm font-medium">Teléfono visible
          <input required value={form.telefono} onChange={(event) => setForm({ ...form, telefono: event.target.value })} className="mt-1 w-full border border-zinc-300 bg-white px-3 py-2 font-normal outline-none focus:border-zinc-900" placeholder="+51 929 370 461" />
        </label>
        <label className="block text-sm font-medium">Número de WhatsApp
          <input required value={form.whatsapp} onChange={(event) => setForm({ ...form, whatsapp: event.target.value })} className="mt-1 w-full border border-zinc-300 bg-white px-3 py-2 font-normal outline-none focus:border-zinc-900" placeholder="51933141678" />
          <span className="mt-1 block text-xs font-normal text-zinc-500">Incluye el código de país, sin necesidad de escribir el signo +.</span>
        </label>
        <Button type="submit" className="gap-2 rounded-none bg-zinc-900 hover:bg-red-600"><Save size={16} />Guardar cambios</Button>
      </form>
    </section>
  );
};