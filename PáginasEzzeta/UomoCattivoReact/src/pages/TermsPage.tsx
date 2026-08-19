import { getTermsContent } from '../services/contentService';

export const TermsPage = () => {
  const terms = getTermsContent();

  return (
    <section className="overflow-hidden rounded-[2.5rem] border border-black/10 bg-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.18)]">
      {/* Header */}
      <div className="border-b border-black/10 px-8 py-10 md:px-12 md:py-14">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-black/50">
          Información legal
        </p>

        <h1 className="max-w-4xl text-3xl font-semibold uppercase leading-[1.1] tracking-[0.12em] text-black md:text-5xl">
          {terms.title}
        </h1>

        <p className="mt-6 max-w-2xl text-sm leading-7 text-black/60 md:text-base">
          {terms.description}
        </p>
      </div>

      {/* Terminos */}
      <div className="divide-y divide-black/10">
        {terms.sections.map((section, index) => (
          <article
            key={section.title}
            className="group grid gap-2 px-2 py-2 transition-colors duration-300 hover:bg-[#F7F3EC] md:grid-cols-[80px_1fr] md:px-12 md:py-10"
          >
            {/* Numero */}
            <div>
              <span className="text-xs font-medium tracking-[0.2em] text-black/35">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>

            {/* Contenido */}
            <div className="max-w-4xl">
              <div className="flex items-start justify-between gap-6">
                <h2 className="text-lg font-semibold uppercase tracking-[0.06em] text-black md:text-xl">
                  {section.title}
                </h2>

                <span className="mt-2 hidden h-px w-8 shrink-0 bg-black/20 transition-all duration-300 group-hover:w-14 group-hover:bg-black/40 md:block" />
              </div>

              <div className="mt-5 space-y-3">
                <p className="text-sm leading-7 text-black/65">
                  {section.text}
                </p>

                {section.text2 && (
                  <p className="text-sm leading-7 text-black/65">
                    {section.text2}
                  </p>
                )}

                {section.text3 && (
                  <p className="text-sm leading-7 text-black/65">
                    {section.text3}
                  </p>
                )}

                {section.text4 && (
                  <p className="text-sm leading-7 text-black/65">
                    {section.text4}
                  </p>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
