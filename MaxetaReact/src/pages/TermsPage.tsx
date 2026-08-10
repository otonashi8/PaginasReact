import { TypewriterTitle } from '../components/TypewriterTitle';

const tocItems = [
  { id: 'requisitos-compra', label: '1. Requisitos para comprar' },
  { id: 'compra-comprobantes', label: '2. Compra y comprobantes' },
  { id: 'envios', label: '3. Envíos' },
  { id: 'cambios-devoluciones', label: '4. Cambios y devoluciones' },
  { id: 'proteccion-datos', label: '5. Protección de datos' },
  { id: 'libro-reclamaciones', label: '6. Libro de reclamaciones' },
];

const sectionClass =
  'scroll-mt-28 border-t border-black/10 py-10 first:border-t-0 first:pt-0';

export const TermsPage = () => {
  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-14 text-black md:px-8 md:py-20 lg:px-12">
      <section className="mx-auto max-w-7xl">

        {/* Header */}
        <header className="relative mb-14 overflow-hidden rounded-[2rem] bg-black px-7 py-10 text-white md:px-10 md:py-14 lg:px-14 lg:py-16">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/10" />

          <div className="relative max-w-4xl">
            <div className="mb-7 flex items-center gap-3">
              <span className="h-px w-10 bg-white/60" />

              <span className="text-xs font-medium uppercase tracking-[0.22em] text-white/50">
                Legal · EZZETA
              </span>
            </div>

            <TypewriterTitle
              text="Términos de Uso"
              className="text-4xl font-semibold tracking-[-0.05em] text-white md:text-6xl lg:text-7xl"
            />

            <p className="mt-7 max-w-3xl text-sm leading-7 text-white/60 md:text-base md:leading-8">
              Estos términos son aplicables a las marcas EZZETA, MAXETA,
              CREPANTE y UOMO CATTIVO, y regulan la relación entre el cliente
              y la tienda en compras, envíos y atención postventa.
            </p>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-[10px] uppercase tracking-[0.18em] text-white/35">
              <span>Condiciones de uso</span>
              <span>Compras · Envíos · Postventa</span>
              <span>Actualizado · 29.07.2026</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-14">

          {/* Índice */}
          <aside className="lg:sticky lg:top-28 lg:h-fit">
            <nav
              aria-label="Índice de términos y condiciones"
              className="rounded-[1.5rem] border border-black/10 bg-white p-5"
            >
              <div className="flex items-center justify-between border-b border-black/10 pb-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/40">
                  Índice
                </p>

                <span className="text-[10px] text-black/30">
                  06
                </span>
              </div>

              <ul className="mt-3">
                {tocItems.map((item, index) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="group flex items-start gap-3 border-b border-black/5 py-3.5 text-sm transition-colors last:border-b-0 hover:text-red-600"
                    >
                      <span className="mt-0.5 w-5 shrink-0 text-[10px] font-medium text-black/25 transition-colors group-hover:text-red-600">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <span className="leading-5 text-black/60 group-hover:text-black">
                        {item.label.replace(/^\d+\.\s/, '')}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-4 hidden rounded-[1.5rem] bg-black p-5 text-white lg:block">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
                Aplicación
              </p>

              <p className="mt-3 text-sm leading-6 text-white/60">
                Estas condiciones regulan las compras realizadas a través de
                nuestros canales de venta.
              </p>
            </div>
          </aside>

          {/* Términos */}
          <div className="rounded-[2rem] border border-black/10 bg-white px-6 py-8 md:px-10 md:py-10 lg:px-14">

            {/* 01 */}
            <article id="requisitos-compra" className={sectionClass}>
              <div className="grid gap-6 md:grid-cols-[90px_1fr] md:gap-10">
                <div>
                  <span className="text-5xl font-light tracking-[-0.06em] text-black/15 md:text-6xl">
                    01
                  </span>
                </div>

                <div className="max-w-3xl">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">
                    Compra
                  </p>

                  <h2 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">
                    Requisitos para comprar
                  </h2>

                  <p className="mt-5 text-sm leading-7 text-black/60 md:text-base md:leading-8">
                    Para realizar compras, el cliente debe ser mayor de edad o
                    contar con autorización de su representante. La información
                    registrada en la orden debe ser veraz, completa y
                    actualizada.
                  </p>
                </div>
              </div>
            </article>

            {/* 02 */}
            <article id="compra-comprobantes" className={sectionClass}>
              <div className="grid gap-6 md:grid-cols-[90px_1fr] md:gap-10">
                <div>
                  <span className="text-5xl font-light tracking-[-0.06em] text-black/15 md:text-6xl">
                    02
                  </span>
                </div>

                <div className="max-w-3xl">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">
                    Confirmación
                  </p>

                  <h2 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">
                    Compra y comprobantes
                  </h2>

                  <p className="mt-5 text-sm leading-7 text-black/60 md:text-base md:leading-8">
                    Toda compra está sujeta a validación de stock y confirmación
                    de pago. La emisión de boleta o factura se realiza con base
                    en los datos declarados por el cliente durante el proceso
                    de checkout.
                  </p>
                </div>
              </div>
            </article>

            {/* 03 */}
            <article id="envios" className={sectionClass}>
              <div className="grid gap-6 md:grid-cols-[90px_1fr] md:gap-10">
                <div>
                  <span className="text-5xl font-light tracking-[-0.06em] text-black/15 md:text-6xl">
                    03
                  </span>
                </div>

                <div className="max-w-3xl">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">
                    Logística
                  </p>

                  <h2 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">
                    Envíos
                  </h2>

                  <p className="mt-5 text-sm leading-7 text-black/60 md:text-base md:leading-8">
                    Los plazos de entrega son referenciales y pueden variar por
                    zona, temporada o contingencias operativas. El cliente es
                    responsable de brindar una dirección de entrega válida y
                    datos de contacto disponibles.
                  </p>

                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-[#f7f7f5] p-4">
                      <span className="text-[10px] uppercase tracking-[0.16em] text-black/35">
                        Entrega
                      </span>
                      <p className="mt-2 text-sm text-black/65">
                        Plazos sujetos a zona y condiciones operativas.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#f7f7f5] p-4">
                      <span className="text-[10px] uppercase tracking-[0.16em] text-black/35">
                        Cliente
                      </span>
                      <p className="mt-2 text-sm text-black/65">
                        Datos de entrega completos y actualizados.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* 04 */}
            <article id="cambios-devoluciones" className={sectionClass}>
              <div className="grid gap-6 md:grid-cols-[90px_1fr] md:gap-10">
                <div>
                  <span className="text-5xl font-light tracking-[-0.06em] text-black/15 md:text-6xl">
                    04
                  </span>
                </div>

                <div className="max-w-3xl">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">
                    Postventa
                  </p>

                  <h2 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">
                    Cambios y devoluciones
                  </h2>

                  <p className="mt-5 text-sm leading-7 text-black/60 md:text-base md:leading-8">
                    Los cambios o devoluciones aplican según las condiciones de
                    estado del producto, plazos vigentes y presentación del
                    comprobante. No aplican para productos personalizados o en
                    liquidación final.
                  </p>

                  <div className="mt-7 border-l-2 border-black pl-5">
                    <p className="text-sm leading-6 text-black/55">
                      Para conocer las condiciones y procedimientos específicos,
                      consulta nuestra Política de Cambios y Devoluciones.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* 05 */}
            <article id="proteccion-datos" className={sectionClass}>
              <div className="grid gap-6 md:grid-cols-[90px_1fr] md:gap-10">
                <div>
                  <span className="text-5xl font-light tracking-[-0.06em] text-black/15 md:text-6xl">
                    05
                  </span>
                </div>

                <div className="max-w-3xl">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">
                    Privacidad
                  </p>

                  <h2 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">
                    Protección de datos
                  </h2>

                  <p className="mt-5 text-sm leading-7 text-black/60 md:text-base md:leading-8">
                    El tratamiento de datos personales se rige por nuestra
                    Política de Privacidad y la normativa peruana aplicable.
                    Los datos se utilizan para gestionar pedidos, brindar
                    soporte, mejorar nuestros servicios y cumplir con las
                    obligaciones legales correspondientes.
                  </p>

                  <div className="mt-7 flex flex-wrap gap-2">
                    {[
                      'Pedidos',
                      'Soporte',
                      'Mejora del servicio',
                      'Cumplimiento legal',
                    ].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-black/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-black/45"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>

            {/* 06 */}
            <article
              id="libro-reclamaciones"
              className="scroll-mt-28 pt-10"
            >
              <div className="rounded-[1.5rem] bg-black p-7 text-white md:p-10">
                <div className="grid gap-8 md:grid-cols-[90px_1fr_auto] md:items-start md:gap-10">
                  <span className="text-5xl font-light tracking-[-0.06em] text-white/20 md:text-6xl">
                    06
                  </span>

                  <div className="max-w-2xl">
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                      Atención al cliente
                    </p>

                    <h2 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">
                      Libro de reclamaciones
                    </h2>

                    <p className="mt-5 text-sm leading-7 text-white/55 md:text-base md:leading-8">
                      El cliente tiene derecho a registrar quejas o reclamos a
                      través del Libro de Reclamaciones Virtual, disponible en
                      este sitio para la atención y seguimiento correspondiente.
                    </p>
                  </div>

                  <a
                    href="/reclamaciones"
                    className="inline-flex w-fit items-center rounded-full bg-white px-5 py-3 text-xs font-medium uppercase tracking-[0.12em] text-black transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    Ir al libro
                  </a>
                </div>
              </div>
            </article>

          </div>
        </div>

        {/* Footer */}
        <footer className="mt-10 flex flex-col gap-3 border-t border-black/10 pt-6 text-[10px] uppercase tracking-[0.16em] text-black/35 sm:flex-row sm:items-center sm:justify-between">
          <span>EZZETA · MAXETA · CREPANTE · UOMO CATTIVO</span>
          <span>Última actualización · 29.07.2026</span>
        </footer>

      </section>
    </main>
  );
};
