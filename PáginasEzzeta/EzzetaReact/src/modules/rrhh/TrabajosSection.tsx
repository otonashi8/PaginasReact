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
    <section className="bg-white py-12 text-white md:py-16">
        <div className="mx-auto w-[min(1280px,92%)]">
        <div className="mb-8 grid gap-5 border-b border-black/10 pb-7 md:grid-cols-[1fr_auto] md:items-end">
            <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-red-600">RR.HH. / Oportunidades</p>
            <h2 className="mt-2 text-4xl leading-none text-black md:text-5xl">Trabaja con nosotros</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-black/65 md:text-right">Súmate a un equipo que crea productos con propósito, atención cercana y una visión de crecimiento real.</p>
        </div>
        <div className="mb-8 max-w-xl">
            <label className="block">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-black/60">Buscar vacante</span>
            <div className="relative">
                <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Puesto, ubicación o palabra clave"
                className="h-11 w-full border border-black/15 bg-white px-4 pr-10 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-red-500"
                />
                {search && (
                <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-black/45 transition hover:text-red-600"
                    aria-label="Limpiar búsqueda"
                >✕
                </button>
                )}
            </div>
            </label>
        </div>
        {loading ? (
            <div className="border border-black/10 bg-white p-8 text-center text-sm text-black/50">Cargando oportunidades...</div>
        ) : trabajosFiltrados.length === 0 ? (
            <div className="border border-dashed border-red-500/40 bg-white/50 p-10 text-center">
            <p className="text-sm text-black/65">
                {search
                ? `Todavía no hay vacantes disponibles para "${search}".`
                : "Todavía no hay vacantes disponibles."}
            </p>
            <p className="mt-1 text-xs text-black/45">Vuelve pronto para conocer nuevas oportunidades.</p>
            </div>
        ) : (
            <div className="grid gap-5 lg:grid-cols-2">
            {trabajosFiltrados.map((trabajo, index) => (
                <article
                key={trabajo.id}
                className="group overflow-hidden border border-black/10 bg-white shadow-[0_12px_35px_-20px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-1 hover:border-red-500/40"
                >
                <div className="flex h-full flex-col md:flex-row">
                    <div className="flex flex-1 flex-col p-5 md:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-600">{trabajo.puesto}</span>
                        {trabajo.ubicacion ? (
                        <span className="border border-black/10 bg-black/[0.03] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-black/55">{trabajo.ubicacion}</span>
                        ) : null}
                    </div>
                    <h3 className="mt-4 text-3xl leading-[1.05] text-black md:text-[2.15rem]">{trabajo.nombre}</h3>
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-black/55">
                        {trabajo.horario ? (
                        <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5 text-red-600" />{trabajo.horario}</span>
                        ) : null}
                        {trabajo.ubicacion ? (
                        <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5 text-red-600" />{trabajo.ubicacion}</span>
                        ) : null}
                    </div>
                    <p className="mt-5 text-sm leading-6 text-black/65">{trabajo.descripcionBreve}</p>
                    <div className="mt-auto pt-6">
                        <div className="mb-5 border-t border-black/10" />
                        <div className="relative">
                        <button
                            type="button"
                            onClick={() =>
                            setOpenLinksById((current) => ({
                                ...current,
                                [trabajo.id]: !current[trabajo.id],
                            }))
                            }
                            className={`${btnClass} flex h-9 w-full items-center justify-center gap-2 border border-black bg-black px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:border-red-600 hover:bg-red-600`}
                        >Postúlate en<ArrowUpRight className="size-3.5" />
                        </button>
                        {openLinksById[trabajo.id] &&
                        trabajo.redirecciones.length > 0 ? (
                            <div className="absolute bottom-full left-0 z-20 mb-2 w-full border border-black/10 bg-white p-3 shadow-[0_15px_35px_-15px_rgba(0,0,0,0.45)]">
                            <div className="mb-2 flex items-center justify-between">
                                <strong className="text-[10px] font-bold uppercase tracking-[0.16em] text-black">Elige dónde aplicar</strong>
                                <button
                                type="button"
                                onClick={() =>
                                    setOpenLinksById((current) => ({
                                    ...current,
                                    [trabajo.id]: false,
                                    }))
                                }className="text-xs text-black/40 hover:text-red-600"
                                aria-label="Cerrar opciones"
                                >✕
                                </button>
                            </div>
                            <div className="grid gap-2">
                                {trabajo.redirecciones.map(
                                (redirect, redirectIndex) => (
                                    <a
                                    key={`${redirect.nombre}-${redirectIndex}`}
                                    href={redirect.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between gap-2 border border-black/10 bg-white px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-black transition hover:border-red-500 hover:bg-red-50"
                                    ><span>{redirect.nombre}</span><ArrowUpRight className="size-3.5 text-red-600" />
                                    </a>
                                ),
                                )}
                            </div>
                            </div>
                        ) : null}
                        </div>
                    </div>
                    </div>
                    <div className="relative order-first h-64 w-full shrink-0 overflow-hidden bg-[#27272a] md:order-last md:h-auto md:min-h-[390px] md:w-[38%]">
                    {trabajo.imagenUrl ? (
                        <img
                        src={trabajo.imagenUrl}
                        alt={trabajo.puesto}
                        className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full min-h-64 items-center justify-center text-xs uppercase tracking-[0.12em] text-white/40">Sin imagen</div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />
                    <div className="absolute right-4 top-4 flex size-9 items-center justify-center border border-white/30 bg-black/45 text-[10px] font-bold tracking-[0.12em] text-white backdrop-blur-sm">
                        {String(index + 1).padStart(2, "0")}
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
