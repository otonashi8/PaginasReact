import { FileText, LockKeyhole } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getLegalPage, getPageVisibility, subscribeToPageChanges, type LegalPageKey, type LegalPageContent } from '@/admin/Paginas/paginasStorage';

export const LegalPage = ({ pageKey }: { pageKey: LegalPageKey }) => {
  const [content, setContent] = useState<LegalPageContent>(() => getLegalPage(pageKey));
  const [visible, setVisible] = useState(() => getPageVisibility()[pageKey]);

  useEffect(() => subscribeToPageChanges(() => { setContent(getLegalPage(pageKey)); setVisible(getPageVisibility()[pageKey]); }), [pageKey]);

  if (!visible) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-crema px-6 text-center">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-vino-oscuro">Página en mantenimiento</h1>
          <p className="mt-3 text-[#6b4750]">Regresa más tarde para consultar esta información.</p>
        </div>
      </main>
    );
  }

  const isPrivacy = pageKey === 'privacy';

  return (
    <main className="bg-crema">
      <section className={`relative overflow-hidden px-5 pb-15 pt-15 ${isPrivacy ? 'bg-dorado text-vino-oscuro' : 'bg-vino-luz text-crema'}`}>
        <div className="mx-auto w-[min(1000px,92%)]">
          <span className="inline-flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-dorado-suave">
            {isPrivacy ? <LockKeyhole className="size-4" /> : <FileText className="size-4" />}
            {content.eyebrow}
          </span>
          <h1 className="mt-5 max-w-190 font-serif text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[0.98]">{content.title}</h1>
          <p className="mt-6 max-w-155 text-[1.05rem] leading-[1.8] opacity-75">{content.intro}</p>
          <div className="mt-10 text-[0.7rem] font-semibold uppercase tracking-[0.16em] opacity-60">Ezzeta · Última actualización · {content.updatedAt}</div>
        </div>
      </section>
      <section className="mx-auto w-[min(1000px,92%)] py-14 sm:py-20">
        <div className="overflow-hidden rounded-[28px] border border-vino/10 bg-blanco shadow-[0_25px_60px_-40px_rgba(76,21,38,0.5)]">
          <div className="border-b border-vino/10 bg-vino-suave/20 px-6 py-7 sm:px-10">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-vino text-crema">
                <FileText className="size-5" />
              </div>
              <h2 className="font-serif text-[1.4rem] font-semibold text-vino-oscuro">{content.title}</h2>
            </div>
          </div>
          <div className="px-6 py-8 sm:px-10">
            <div className="divide-y divide-vino/10">
              {content.sections.map((section, index) => (
                <article className="grid gap-5 py-7 first:pt-0 last:pb-0 sm:grid-cols-[55px_1fr]" key={`${section.title}-${index}`}>
                  <span className="font-serif text-[1.1rem] font-semibold text-dorado">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h2 className="font-serif text-[1.3rem] font-semibold text-vino-oscuro">{section.title}</h2>
                    <p className="mt-3 leading-[1.8] text-[#6b4750]">{section.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
