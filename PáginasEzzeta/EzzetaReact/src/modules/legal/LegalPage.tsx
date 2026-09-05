import { FileText, LockKeyhole } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getLegalPage, getPageVisibility, subscribeToPageChanges, type LegalPageKey, type LegalPageContent } from '@/admin/Paginas/paginasStorage';

export const LegalPage = ({ pageKey }: { pageKey: LegalPageKey }) => {
  const [content, setContent] = useState<LegalPageContent>(() => getLegalPage(pageKey));
  const [visible, setVisible] = useState(() => getPageVisibility()[pageKey]);

  useEffect(() => subscribeToPageChanges(() => { setContent(getLegalPage(pageKey)); setVisible(getPageVisibility()[pageKey]); }), [pageKey]);

  if (!visible) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-6 text-center">
        <div>
          <h1 className="text-3xl font-semibold text-black">Página en mantenimiento</h1>
          <p className="mt-3 text-[#6b4750]">Regresa más tarde para consultar esta información.</p>
        </div>
      </main>
    );
  }

  const isPrivacy = pageKey === 'privacy';

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Hero */}
      <section
        className={`relative overflow-hidden border-b border-zinc-800 px-5 py-12 sm:px-8 lg:px-12 ${
          isPrivacy ? "bg-black text-white" : "bg-zinc-950 text-white"
        }`}
      >
        <div className="mx-auto max-w-[1600px]">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-red-500">
                {isPrivacy ? (
                  <LockKeyhole className="size-4" />
                ) : (
                  <FileText className="size-4" />
                )}
                {content.eyebrow}
              </span>

              <h1 className="mt-5 max-w-5xl text-[clamp(2.5rem,6vw,6.5rem)] font-semibold leading-[0.92] tracking-[-0.06em]">
                {content.title}
              </h1>

              <p className="mt-7 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
                {content.intro}
              </p>
            </div>

            <div className="border-l border-zinc-800 pl-5 lg:mb-1">
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                Ezzeta
              </span>

              <span className="mt-2 block text-sm font-medium text-zinc-300">
                Última actualización
              </span>

              <span className="mt-1 block text-sm font-semibold text-white">
                {content.updatedAt}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-5 py-8 sm:px-8 sm:py-12 lg:px-12">
        <div className="mx-auto max-w-[1600px]">
          <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-8 border-t-2 border-black pt-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-600">
                  Documento
                </span>

                <h2 className="mt-3 text-lg font-semibold leading-tight">
                  {content.title}
                </h2>

                <div className="mt-6 h-px bg-zinc-200" />

                <p className="mt-4 text-sm leading-6 text-zinc-500">
                  Información importante sobre nuestras políticas y condiciones.
                </p>
              </div>
            </aside>

            {/* Main document */}
            <div className="min-w-0 border-t-2 border-black">
              <div className="flex items-center justify-between gap-4 border-b border-zinc-200 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center bg-black text-white">
                    <FileText className="size-4" />
                  </div>

                  <h2 className="text-sm font-semibold uppercase tracking-[0.08em]">
                    {content.title}
                  </h2>
                </div>

                <span className="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 sm:block">
                  {String(content.sections.length).padStart(2, "0")} secciones
                </span>
              </div>

              <div className="divide-y divide-zinc-200">
                {content.sections.map((section, index) => (
                  <article
                    className="grid gap-5 py-7 sm:grid-cols-[64px_minmax(0,1fr)] sm:gap-8 sm:py-9"
                    key={`${section.title}-${index}`}
                  >
                    <span className="text-sm font-bold tracking-[0.12em] text-red-600">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="max-w-4xl">
                      <h2 className="text-xl font-semibold leading-tight tracking-[-0.02em] sm:text-2xl">
                        {section.title}
                      </h2>

                      <p className="mt-4 text-sm leading-7 text-zinc-600 sm:text-[15px] sm:leading-8">
                        {section.text}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
