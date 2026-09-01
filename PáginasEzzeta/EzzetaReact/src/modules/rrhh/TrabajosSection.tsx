import { useEffect, useState } from 'react';
import { MapPin, Clock3, ArrowUpRight } from 'lucide-react';
import { obtenerTrabajosPublicos, type Trabajo } from '@/admin/RRHH/Trabajos/trabajosService';

const btnClass = 'inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(255,255,255,0.18)] bg-red-600 px-4 py-3 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-white transition-all hover:-translate-y-0.5 hover:bg-red';

export default function TrabajosSection() {
  const [trabajos, setTrabajos] = useState<Trabajo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openLinksById, setOpenLinksById] = useState<Record<number, boolean>>({});

  useEffect(() => {
    void (async () => {
      try {
        setTrabajos(await obtenerTrabajosPublicos());
      } catch {
        setTrabajos([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const trabajosFiltrados = trabajos.filter((trabajo) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;

    const hayCoincidencia = [
      trabajo.puesto,
      trabajo.nombre,
      trabajo.descripcionBreve,
      trabajo.horario,
      trabajo.ubicacion,
    ]
      .filter((valor): valor is string => Boolean(valor))
      .some((valor) => valor.toLowerCase().includes(query));

    return hayCoincidencia;
  });

  return (
    <section className="bg-vino-claro py-10 text-white md:py-10">
        <div className="mx-auto w-[min(1280px,92%)]">
        {/* ENCABEZADO */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-red-400">RR.HH</p>
            <h2 className="mt-2 font-serif text-4xl text-black md:text-5xl">Trabaja con nosotros</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-black md:text-base">
            Súmate a un equipo que crea productos con propósito, atención cercana
            y una visión de crecimiento real.
            </p>
        </div>

        <div className="mb-6 max-w-xl">
          <label className="block text-sm font-medium text-black">
            <span className="mb-2 block text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-red-400">Buscar vacante</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Busca por puesto, ubicación o palabra clave"
              className="w-full rounded-full border border-white/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/50 outline-none ring-0 transition focus:border-orange-400"
            />
          </label>
        </div>
        {/* ESTADO DE CARGA */}
        {loading ? (
            <div className="rounded-[24px] border border-white/10 bg-[#1a1a1c] p-8 text-sm text-gray-500">Cargando oportunidades...</div>
        ) : trabajosFiltrados.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-orange-500/40 bg-vino-claro p-10 text-center text-gray-500">
              {search ? `Todavía no hay vacantes disponibles para "${search}". Vuelve pronto.` : 'Todavía no hay vacantes disponibles. Vuelve pronto.'}
            </div>
        ) : (
            <div className="grid gap-6 lg:grid-cols-2">
            {trabajosFiltrados.map((trabajo, index) => (
                <article
                key={trabajo.id}
                className="group overflow-hidden rounded-[24px] border border-white/10 bg-vino-oscuro shadow-[0_18px_45px_-18px_rgba(0,0,0,0.8)]
                    transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
                >
                <div className="flex flex-col md:flex-row">
                    <div className="flex flex-1 flex-col p-5 md:p-6">
                    {/* PUESTO + UBICACIÓN */}
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-red-300">{trabajo.puesto}</span>
                        {trabajo.ubicacion ? (
                        <span
                            className="rounded-full border border-white/15 px-2.5 py-1 text-[0.6rem] font-semibold uppercase
                            tracking-[0.12em] text-black/70"
                        >{trabajo.ubicacion}
                        </span>
                        ) : null}
                    </div>
                    {/* NOMBRE */}
                    <h3 className="mt-5 font-serif text-3xl leading-tight text-black md:text-4xl">{trabajo.nombre}</h3>
                    {/* DATOS */}
                    <div className="mt-4 flex flex-col gap-2.5 text-sm text-black/70">
                        {trabajo.horario ? (
                        <span className="inline-flex items-center gap-2">
                            <Clock3 className="size-4 shrink-0 text-red-400" />
                            {trabajo.horario}
                        </span>
                        ) : null}
                        {trabajo.ubicacion ? (
                        <span className="inline-flex items-center gap-2">
                            <MapPin className="size-4 shrink-0 text-red-400" />
                            {trabajo.ubicacion}
                        </span>
                        ) : null}
                    </div>
                    {/* DESCRIPCIÓN */}
                    <p className="mt-5 text-sm leading-6 text-black md:text-[0.95rem]">{trabajo.descripcionBreve}</p>
                    {/* DIVISOR */}
                    <div className="my-5 border-t border-white/10" />
                    {/* ACCIONES */}
                    <div className="relative flex flex-col gap-3">
                        <button
                        type="button"
                        onClick={() => setOpenLinksById((current) => ({
                            ...current,
                            [trabajo.id]: !current[trabajo.id],
                        }))}
                        className={btnClass}
                        >
                            Postulate en
                            <ArrowUpRight className="size-3.5" />
                        </button>

                        {openLinksById[trabajo.id] && trabajo.redirecciones.length > 0 ? (
                        <div className="absolute bottom-full right-0 z-10 mb-2 w-[min(240px,calc(100vw-4rem))] origin-bottom-right rounded-[18px] border border-[rgba(125,36,56,0.12)] bg-[#fffaf8] p-3 shadow-[0_18px_40px_-20px_rgba(76,21,38,0.7)]">
                            <div className="mb-2 flex items-center justify-between">
                            <strong className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-black">Aplicar</strong>
                            </div>
                            <div className="grid gap-2">
                            {trabajo.redirecciones.map((redirect, redirectIndex) => (
                                <a
                                key={`${redirect.nombre}-${redirectIndex}`}
                                href={redirect.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between gap-2 rounded-xl border border-[rgba(125,36,56,0.10)] bg-white px-3 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-black transition-all hover:border-red-400 hover:bg-red-50"
                                >
                                <span>{redirect.nombre}</span>
                                <ArrowUpRight className="size-3.5 text-red-500" />
                                </a>
                            ))}
                            </div>
                        </div>
                        ) : null}
                    </div>
                    </div>
                    <div
                    className="relative order-first w-full shrink-0 overflow-hidden bg-[#27272a] md:order-last md:w-[42%]"
                    >
                    {trabajo.imagenUrl ? (
                        <img
                        src={trabajo.imagenUrl}
                        alt={trabajo.puesto}
                        className="h-[360px] w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]
                            md:h-full md:min-h-[430px]"
                        />
                    ) : (
                        <div
                        className="flex h-[360px] w-full items-center justify-center text-sm text-[#d8c3ca] md:h-full md:min-h-[430px]"
                        >Sin imagen
                        </div>
                    )}
                    {/* DEGRADADO */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-black/10 via-transparent to-black/20" />
                    {/* NÚMERO SOBRE LA IMAGEN */}
                    <div
                        className="absolute right-4 top-4 flex items-center justify-center rounded-full bg-red-600 px-3 py-1.5 text-[0.6rem]
                        font-bold uppercase tracking-[0.16em] text-white shadow-lg"
                    >{String(index + 1).padStart(2, "0")}
                    </div>
                    </div>
                </div>
                </article>
            ))}
            </div>
        )}
        </div>
    </section>
    );
}
