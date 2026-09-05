import { useEffect, useState } from 'react';
import { MapPin, Clock3 } from 'lucide-react';
import { obtenerTrabajosPublicos, type Trabajo } from '@/admin/RRHH/Trabajos/trabajosService';

const btnClass = 'inline-flex items-center justify-center gap-2 border border-[rgba(255,255,255,0.18)] bg-red-600 px-4 py-3 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-white transition-all hover:-translate-y-0.5 hover:bg-red';

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
        <section className="bg-white text-black">
            {/* HERO */}
            <div className="relative overflow-hidden bg-black text-white">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute -right-20 -top-32 h-96 w-96 rounded-full bg-red-600 blur-3xl" />
                    <div className="absolute -bottom-40 left-10 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
                </div>

                <div className="relative mx-auto grid w-[min(1500px,92%)] gap-8 px-0 py-16 md:grid-cols-[1fr_0.7fr] md:items-end md:py-24">
                    <div>
                        <p className="mb-4 text-[14px] font-bold uppercase tracking-[0.3em] text-red-500">RR.HH. / Oportunidades</p>
                        <h1 className="max-w-3xl text-5xl leading-[0.92] tracking-tight md:text-7xl">Trabaja con<span className="block text-red-500">nosotros</span></h1>
                    </div>
                    <div className="max-w-md border-l border-white/20 pl-5 md:ml-auto">
                        <p className="text-sm leading-7 text-white/65 md:text-base">Súmate a un equipo que crea productos con propósito, atención cercana y una visión de crecimiento real.</p>
                        <div className="mt-6 flex items-center gap-3 text-[14px] font-bold uppercase tracking-[0.2em] text-white/65">
                            <span className="h-px w-8 bg-red-500" />Crece con EZZETA
                        </div>
                    </div>
                </div>
            </div>
            {/* BENEFICIOS */}
            <section className="border-b border-black/10 bg-zinc-50 py-8 md:py-12">
                <div className="mx-auto w-[min(1280px,92%)]">
                    <div className="mb-10 grid gap-5 border-b border-black/10 pb-7 md:grid-cols-[1fr_auto] md:items-end">
                        <div>
                            <p className="text-[14px] font-bold uppercase tracking-[0.28em] text-red-600">Lo que encontrarás</p>
                            <h2 className="mt-2 text-4xl leading-none tracking-tight md:text-5xl">Beneficios para ti</h2>
                        </div>
                        <p className="max-w-md text-sm leading-6 text-black/70 md:text-right">Queremos que tu crecimiento profesional también sea parte de nuestra historia.</p>
                    </div>
                    <div className="grid gap-px border border-black/10 bg-black/10 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            {number: "01",
                                title: "Crecimiento real",
                                description:"Desarrolla tus habilidades y encuentra nuevas oportunidades para avanzar.",
                            },
                            {number: "02",
                                title: "Equipo cercano",
                                description:"Trabaja junto a personas que comparten tus ganas de aprender y construir.",
                            },
                            {number: "03",
                                title: "Ambiente dinámico",
                                description:"Forma parte de una cultura activa, creativa y orientada a resultados.",
                            },
                            {number: "04",
                                title: "Nuevos desafíos",
                                description:"Participa en proyectos que te permitan salir de tu zona de confort.",
                            },
                        ].map((beneficio) => (
                            <article
                                key={beneficio.number}
                                className="group bg-white p-6 transition hover:bg-black hover:text-white"
                            >
                                <span className="text-[14px] font-bold tracking-[0.2em] text-red-600">{beneficio.number}</span>
                                <h3 className="mt-4 text-xl font-semibold tracking-tight">{beneficio.title}</h3>
                                <p className="mt-3 text-sm leading-6 text-black/55 transition-colors group-hover:text-white/85">{beneficio.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
            {/* EXPERIENCIA EZZETA */}
            <section className="relative overflow-hidden bg-black py-11 text-white md:py-14">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full border-[80px] border-red-600" />
                </div>
                <div className="relative mx-auto w-[min(1280px,92%)]">
                    <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-end">
                        <div>
                            <p className="text-[14px] font-bold uppercase tracking-[0.28em] text-red-500">Nuestra cultura</p>
                            <h2 className="mt-3 max-w-xl text-4xl leading-[0.95] tracking-tight md:text-6xl">
                                ¡Vive la experiencia<span className="block text-red-500">EZZETA!</span>
                            </h2>
                        </div>
                        <div className="max-w-xl md:ml-auto">
                            <p className="text-base leading-7 text-white">En EZZETA creemos que las mejores ideas nacen cuando las personas tienen la libertad de crear, aprender y compartir.</p>
                            <p className="mt-4 text-sm leading-6 text-white/80">Aquí cada reto es una oportunidad para crecer, aportar y dejar una huella.</p>
                        </div>
                    </div>
                    <div className="mt-6 grid gap-px border border-white/15 bg-white/15 md:grid-cols-3">
                        {[
                            {title: "Aprende",
                                description:"Conoce nuevas herramientas, procesos y formas de hacer las cosas.",
                            },
                            {title: "Conecta",
                                description:"Comparte ideas y construye relaciones con personas que inspiran.",
                            },
                            {title: "Transforma",
                                description:"Convierte tus ideas en acciones que generan resultados.",
                            },
                        ].map((item, index) => (
                            <div
                                key={item.title}
                                className="bg-black p-4 md:p-6"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[14px] font-bold tracking-[0.2em] text-red-500">0{index + 1}</span>
                                    <span className="text-lg text-white/25">↗</span>
                                </div>
                                <h3 className="mt-5 text-2xl tracking-tight">{item.title}</h3>
                                <p className="mt-3 text-md leading-6 text-white/70">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            {/* VACANTES */}
            <section className="bg-white py-11 md:py-15">
                <div className="mx-auto w-[min(1280px,92%)]">
                    <div className="mb-8 grid gap-5 border-b border-black/10 pb-7 md:grid-cols-[1fr_auto] md:items-end">
                        <div>
                            <p className="text-[14px] font-bold uppercase tracking-[0.28em] text-red-600">Únete al equipo</p>
                            <h2 className="mt-2 text-4xl leading-none tracking-tight md:text-5xl">Vacantes disponibles</h2>
                        </div>
                        <p className="max-w-md text-md leading-6 text-black/65 md:text-right">Encuentra una oportunidad para desarrollar tu talento y crecer junto a nosotros.</p>
                    </div>
                    {/* BUSCADOR */}
                    <div className="mb-8 max-w-xl">
                        <label className="block">
                            <span className="mb-2 block text-[14px] font-bold uppercase tracking-[0.2em] text-black/60">Buscar vacante</span>
                            <div className="relative">
                                <input
                                    value={search}
                                    onChange={(event) =>setSearch(event.target.value)}
                                    placeholder="Puesto, ubicación o palabra clave"
                                    className="h-11 w-full border border-black/15 bg-white px-4 pr-10 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-red-500"
                                />

                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-black/45 transition hover:text-red-600"
                                        aria-label="Limpiar búsqueda"
                                    >✕
                                    </button>
                                )}
                            </div>
                        </label>
                    </div>
                    {/* ESTADOS */}
                    {loading ? (
                        <div className="border border-black/10 bg-white p-8 text-center text-sm text-black/50">Cargando oportunidades...</div>
                    ) : trabajosFiltrados.length === 0 ? (
                        <div className="border border-dashed border-red-500/40 bg-white/50 p-10 text-center">
                            <p className="text-sm text-black/65">{search ? `Todavía no hay vacantes disponibles para "${search}".` : "Todavía no hay vacantes disponibles."}</p>
                            <p className="mt-1 text-sm text-black/45">Vuelve pronto para conocer nuevas oportunidades.</p>
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
                                                <span className="text-[14px] font-bold uppercase tracking-[0.18em] text-red-600">{trabajo.puesto}</span>
                                                {trabajo.ubicacion ? (
                                                    <span className="border border-black/10 bg-black/[0.03] px-2 py-1 text-[12px] font-semibold uppercase tracking-[0.1em] text-black/55">{trabajo.ubicacion}</span>
                                                ) : null}
                                            </div>
                                            <h3 className="mt-4 text-3xl leading-[1.05] tracking-tight text-black md:text-[2.15rem]">{trabajo.nombre}</h3>
                                            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-black/55">
                                                {trabajo.horario ? (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Clock3 className="size-3.5 text-red-600" />{trabajo.horario}
                                                    </span>
                                                ) : null}
                                                {trabajo.ubicacion ? (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <MapPin className="size-3.5 text-red-600" />{trabajo.ubicacion}
                                                    </span>
                                                ) : null}
                                            </div>
                                            <p className="mt-5 text-sm leading-6 text-black/65">{trabajo.descripcionBreve}</p>
                                            <div className="mt-auto pt-6">
                                                <div className="mb-5 border-t border-black/10" />
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setOpenLinksById(
                                                                (current) => ({...current,[trabajo.id]:!current[trabajo.id],}),
                                                            )
                                                        }
                                                        className={`${btnClass} flex h-9 w-full items-center justify-center gap-2 border border-black bg-black px-4 text-[14px] font-bold uppercase tracking-[0.14em] text-white transition hover:border-red-600 hover:bg-red-600`}
                                                    >Postúlate en
                                                    </button>
                                                    {openLinksById[trabajo.id] &&
                                                    trabajo.redirecciones.length >
                                                        0 ? (
                                                        <div className="absolute bottom-full left-0 z-20 mb-2 w-full border border-black/10 bg-white p-3 shadow-[0_15px_35px_-15px_rgba(0,0,0,0.45)]">
                                                            <div className="mb-2 flex items-center justify-between gap-3 border-b border-black/10 pb-2">
                                                                <strong className="text-[14px] font-bold uppercase tracking-[0.16em] text-black">Elige dónde aplicar</strong>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setOpenLinksById(
                                                                            (
                                                                                current,
                                                                            ) => ({
                                                                                ...current,
                                                                                [trabajo.id]:
                                                                                    false,
                                                                            }),
                                                                        )
                                                                    }
                                                                    className="flex h-6 w-6 shrink-0 items-center justify-center text-sm text-black/40 transition hover:bg-red-50 hover:text-red-600"
                                                                    aria-label="Cerrar opciones"
                                                                >✕
                                                                </button>
                                                            </div>
                                                            <div className="grid gap-2">
                                                                {trabajo.redirecciones.map(
                                                                    (
                                                                        redirect,
                                                                        redirectIndex,
                                                                    ) => (
                                                                        <a
                                                                            key={`${redirect.nombre}-${redirectIndex}`}
                                                                            href={
                                                                                redirect.url
                                                                            }
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="group flex items-center justify-between gap-3 border border-black/10 bg-white px-3 py-2.5 text-[14px] font-bold uppercase tracking-[0.08em] text-black transition hover:border-red-500 hover:bg-red-50"
                                                                        >
                                                                            <span className="truncate">{redirect.nombre}</span>
                                                                            <span className="shrink-0 text-sm text-black/40 transition group-hover:translate-x-0.5 group-hover:text-red-600">→</span>
                                                                        </a>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="relative order-first h-64 w-full shrink-0 overflow-hidden bg-zinc-900 md:order-last md:h-auto md:min-h-[390px] md:w-[38%]">
                                            {trabajo.imagenUrl ? (
                                                <img
                                                    src={trabajo.imagenUrl}
                                                    alt={trabajo.puesto}
                                                    className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full min-h-64 items-center justify-center text-sm uppercase tracking-[0.12em] text-white/40">Sin imagen</div>
                                            )}
                                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />
                                            <div className="absolute right-4 top-4 flex size-9 items-center justify-center border border-white/30 bg-black/45 text-[14px] font-bold tracking-[0.12em] text-white backdrop-blur-sm">
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
        </section>
    );
}
