import { useState } from 'react';
import { getPageVisibility, pageVisibilityOptions, savePageVisibility } from '../paginasStorage';

export const VisibilidadCrudPanel = () => {
  const [visibility, setVisibility] = useState(getPageVisibility());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    savePageVisibility(visibility);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Páginas</p>
        <h1 className="mt-2 text-2xl font-semibold">Visibilidad</h1>
        <p className="mt-2 text-sm text-zinc-500">Desactiva temporalmente una página mientras está en mantenimiento.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {pageVisibilityOptions.map((page) => (
          <label className="flex items-center justify-between gap-3 border border-zinc-200 p-4" key={page.key}>
            <span>{page.label}</span>
            <input
              type="checkbox"
              checked={visibility[page.key]}
              onChange={(event) => setVisibility({ ...visibility, [page.key]: event.target.checked })}
            />
          </label>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button type="button" className="bg-zinc-900 px-4 py-2 text-white" onClick={handleSave}>
          Guardar cambios
        </button>

        {saved && <span className="text-xs font-medium text-emerald-600">¡Cambios guardados!</span>}
      </div>
    </section>
  );
};