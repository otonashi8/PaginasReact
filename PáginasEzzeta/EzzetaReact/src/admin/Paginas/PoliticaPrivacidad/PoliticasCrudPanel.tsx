import { useState } from 'react';
import { getLegalPage, saveLegalPage, type LegalPageContent } from '../paginasStorage';

export const LegalEditor = ({ initial }: { initial: LegalPageContent }) => {
  const [content, setContent] = useState(initial);
  const [saved, setSaved] = useState(false);
  const updateSection = (index: number, field: 'title' | 'text', value: string) => setContent((current) => ({ ...current, sections: current.sections.map((section, sectionIndex) => sectionIndex === index ? { ...section, [field]: value } : section) }));
  const addSection = () => setContent((current) => ({ ...current, sections: [...current.sections, { title: 'Nueva sección', text: '' }] }));
  const removeSection = (index: number) => setContent((current) => ({ ...current, sections: current.sections.filter((_, sectionIndex) => sectionIndex !== index) }));
  const handleSave = () => {
    saveLegalPage(content);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <section className="space-y-4">
        {/* Encabezado */}
        <div>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Páginas</p>
            <h1 className="mt-2 text-2xl font-semibold text-zinc-950">{content.title}</h1>
        </div>
        {/* Información general */}
        <section className="rounded-none border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4">
                <h2 className="text-base font-semibold text-zinc-950">Información general</h2>
                <p className="mt-1 text-sm text-zinc-500">Configura el título y el contenido introductorio de la página.</p>
            </div>

            <div className="space-y-4">
                <label className="block text-sm text-zinc-700">
                    <span className="mb-2 block font-medium">Título</span>
                    <input
                        type="text"
                        value={content.title}
                        onChange={(event) =>
                            setContent({
                                ...content,
                                title: event.target.value,
                            })
                        }className="w-full rounded-none border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-900"
                        placeholder="Título de la página"
                    />
                </label>
                <label className="block text-sm text-zinc-700">
                    <span className="mb-2 block font-medium">Texto introductorio</span>
                    <textarea
                        value={content.intro}
                        onChange={(event) =>
                            setContent({
                                ...content,
                                intro: event.target.value,
                            })
                        }className="min-h-12 w-full resize-y rounded-none border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-900"
                        placeholder="Escribe el texto introductorio de la página."
                    />
                </label>
            </div>
        </section>
        {/* Secciones */}
        <section className="rounded-none border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-base font-semibold text-zinc-950">Secciones</h2>
                    <p className="mt-1 text-sm text-zinc-500">Administra el contenido que compone la página.</p>
                </div>
                <button
                    type="button"
                    onClick={addSection}
                    className="inline-flex w-full items-center justify-center border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-950 sm:w-auto"
                >Agregar sección
                </button>
            </div>

            <div className="space-y-3">
                {content.sections.length === 0 ? (
                    <div className="border border-dashed border-zinc-300 px-4 py-8 text-center">
                        <p className="text-sm text-zinc-500">No hay secciones agregadas.</p>
                        <p className="mt-1 text-xs text-zinc-400">Utiliza "Agregar sección" para comenzar.</p>
                    </div>
                ) : (
                    content.sections.map((section, index) => (
                        <div
                            key={`${section.title}-${index}`}
                            className="border border-zinc-200 bg-zinc-50 p-4"
                        >
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <span className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Sección {index + 1}</span>
                                <button
                                    type="button"
                                    onClick={() => removeSection(index)}
                                    className="text-sm font-medium text-red-600 transition hover:text-red-800"
                                >Eliminar
                                </button>
                            </div>
                            <div className="space-y-4">
                                <label className="block text-sm text-zinc-700">
                                    <span className="mb-2 block font-medium">Título de sección</span>
                                    <input
                                        aria-label={`Título de sección ${index + 1}`}
                                        type="text"
                                        value={section.title}
                                        onChange={(event) =>
                                            updateSection(
                                                index,
                                                'title',
                                                event.target.value
                                            )
                                        }className="w-full rounded-none border border-zinc-300 bg-white px-3 py-2.5 text-sm font-medium text-zinc-900 outline-none transition focus:border-zinc-900"
                                        placeholder="Título de la sección"
                                    />
                                </label>
                                <label className="block text-sm text-zinc-700">
                                    <span className="mb-2 block font-medium">Contenido</span>
                                    <textarea
                                        aria-label={`Texto de sección ${index + 1}`}
                                        value={section.text}
                                        onChange={(event) =>
                                            updateSection(
                                                index,
                                                'text',
                                                event.target.value
                                            )
                                        }className="min-h-12 w-full resize-y rounded-none border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-900"
                                        placeholder="Escribe el contenido de esta sección."
                                    />
                                </label>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
        {/* Acciones */}
        <div className="flex flex-col gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:items-center sm:justify-end">
            <button
                type="button"
                onClick={handleSave}
                className="w-full rounded-none bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 sm:w-auto"
            >Guardar cambios
            </button>
            {saved && <span className="text-xs font-medium text-emerald-600">¡Cambios guardados!</span>}
        </div>
    </section>
    );
};

export const PoliticasCrudPanel = () => <LegalEditor initial={getLegalPage('privacy')} />;