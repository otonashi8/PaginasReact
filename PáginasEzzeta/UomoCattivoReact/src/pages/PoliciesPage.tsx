import { getPolicies } from '../services/contentService';

export const PoliciesPage = () => {
  const policies = getPolicies();

  return (
    <section className="overflow-hidden rounded-[2.5rem] border border-black/10 bg-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.18)]">
      {/* Header */}
      <div className="border-b border-black/10 px-8 py-10 md:px-12 md:py-14">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-black/50">
          Información importante
        </p>

        <h1 className="max-w-3xl text-3xl font-semibold uppercase leading-[1.1] tracking-[0.12em] text-black md:text-5xl">
          Políticas de compra
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-7 text-black/60 md:text-base">
          Conoce nuestras políticas y condiciones antes de realizar tu compra.
          Queremos que tengas toda la información necesaria para disfrutar de
          una experiencia clara y sencilla.
        </p>
      </div>

      {/* Policies */}
      <div className="grid gap-px bg-black/10 md:grid-cols-2 lg:grid-cols-3">
        {policies.map((policy, index) => (
          <article
            key={policy.title}
            className="group bg-[#F7F3EC] p-7 transition-all duration-300 hover:bg-[#EFE9DE] md:p-8"
          >
            <div className="mb-8 flex items-center justify-between">
              <span className="text-xs font-medium tracking-[0.2em] text-black/35">
                {String(index + 1).padStart(2, '0')}
              </span>

              <span className="h-px w-10 bg-black/20 transition-all duration-300 group-hover:w-16 group-hover:bg-black/50" />
            </div>

            <h2 className="text-lg font-semibold uppercase tracking-[0.08em] text-black md:text-xl">
              {policy.title}
            </h2>

            <div className="mt-5 space-y-3">
              <p className="text-sm leading-6 text-black/65">
                {policy.text}
              </p>

              {policy.text2 && (
                <p className="text-sm leading-6 text-black/65">
                  {policy.text2}
                </p>
              )}

              {policy.text3 && (
                <p className="text-sm leading-6 text-black/65">
                  {policy.text3}
                </p>
              )}

              {policy.text4 && (
                <p className="text-sm leading-6 text-black/65">
                  {policy.text4}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
