import { TypewriterTitle } from '../components/TypewriterTitle';

const privacySections = [
  { id: 'introduccion', number: '01', label: 'Introducción' },
  { id: 'informacion', number: '02', label: 'Información recopilada' },
  { id: 'uso', number: '03', label: 'Uso de la información' },
  { id: 'compartir', number: '04', label: 'Compartir información' },
  { id: 'cookies', number: '05', label: 'Cookies' },
  { id: 'seguridad', number: '06', label: 'Seguridad' },
  { id: 'terceros', number: '07', label: 'Enlaces de terceros' },
  { id: 'contacto', number: '08', label: 'Contacto' },
];

export const PoliciesPage = () => {
  return (
    <main className="min-h-screen bg-[#f3f1ed] px-5 py-14 text-[#151515] md:px-8 md:py-20 lg:px-12">
      <section className="mx-auto max-w-7xl">

        {/* Intro / Hero */}
        <header className="mb-16 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">

          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-12 bg-black" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-black/40">
                Crepante · Legal
              </span>
            </div>

            <TypewriterTitle
              text="Política de Privacidad"
              className="max-w-4xl text-4xl font-semibold tracking-[-0.055em] md:text-6xl lg:text-7xl"
            />

            <p className="mt-7 max-w-2xl text-sm leading-7 text-black/55 md:text-base md:leading-8">
              En CREPANTE nos comprometemos a proteger tu información
              personal. Esta política explica cómo recopilamos, utilizamos y
              protegemos tus datos cuando navegas por nuestro sitio y realizas
              compras en línea.
            </p>
          </div>

          {/* Meta */}
          <div className="lg:justify-self-end">
            <div className="border-l border-black/15 pl-5">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">
                Documento
              </span>

              <span className="mt-2 block text-sm text-black/70">
                Política de Privacidad
              </span>

              <span className="mt-5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">
                Última actualización
              </span>

              <span className="mt-2 block text-sm text-black/70">
                29 de julio de 2026
              </span>
            </div>
          </div>
        </header>

        {/* Layout */}
        <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">

          {/* Navegación */}
          <aside className="lg:sticky lg:top-28 lg:h-fit">
            <div className="border-y border-black/10 py-5">
              <p className="mb-4 text-[20px] font-semibold uppercase tracking-[0.2em] text-black/35">
                Contenido
              </p>

              <nav aria-label="Índice de política de privacidad">
                <ul>
                  {privacySections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="group flex items-center gap-3 border-b border-black/5 py-2.5 text-xs transition-colors hover:text-black"
                      >
                        <span className="w-6 font-mono text-[18px] text-black/25 transition-colors group-hover:text-black">
                          {section.number}
                        </span>

                        <span className="text-black/50 text-[18px] transition-colors group-hover:text-black">
                          {section.label}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="mt-6 hidden lg:block">
              <p className="text-[20px] uppercase tracking-[0.18em] text-black/30">
                Crepante
              </p>

              <p className="mt-3 text-[18px] leading-5 text-black/45">
                Tu privacidad forma parte de nuestra forma de construir una
                experiencia de compra segura y transparente.
              </p>
            </div>
          </aside>

          {/* Documento */}
          <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-[#faf9f6]">

            {/* 01 */}
            <article
              id="introduccion"
              className="scroll-mt-28 px-6 py-9 md:px-10 md:py-12 lg:px-14"
            >
              <div className="flex gap-6 md:gap-10">
                <span className="pt-1 font-mono text-[20px] text-black/25">
                  01
                </span>

                <div className="max-w-3xl">
                  <h2 className="text-xl font-semibold tracking-[-0.025em] md:text-2xl">
                    Introducción
                  </h2>

                  <p className="mt-5 text-[18px] leading-7 text-black/60 md:text-base md:leading-8">
                    Bienvenido a{' '}
                    <a
                      href="https://crepante.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-black text-[18px] underline decoration-black/20 underline-offset-4 transition hover:decoration-black"
                    >
                      crepante.com
                    </a>
                    . Esta Política de Privacidad explica cómo recopilamos,
                    utilizamos y protegemos tu información personal cuando
                    realizas compras en línea de productos de moda con
                    nosotros.
                  </p>
                </div>
              </div>
            </article>

            <div className="mx-6 border-t border-black/10 md:mx-10 lg:mx-14" />

            {/* 02 */}
            <article
              id="informacion"
              className="scroll-mt-28 px-6 py-9 md:px-10 md:py-12 lg:px-14"
            >
              <div className="flex gap-6 md:gap-10">
                <span className="pt-1 font-mono text-[20px] text-black/25">
                  02
                </span>

                <div className="w-full max-w-4xl">
                  <h2 className="text-xl font-semibold tracking-[-0.025em] md:text-2xl">
                    Información que recopilamos
                  </h2>

                  <div className="mt-7 grid gap-3 md:grid-cols-2">

                    <div className="rounded-[1.25rem] bg-[#f3f1ed] p-5">
                      <span className="text-[20px] font-semibold uppercase tracking-[0.16em] text-black/35">
                        Información personal
                      </span>

                      <p className="mt-3 text-[18px] leading-6 text-black/60">
                        Tu nombre, correo electrónico, número de teléfono,
                        dirección de envío y facturación.
                      </p>
                    </div>

                    <div className="rounded-[1.25rem] bg-[#f3f1ed] p-5">
                      <span className="text-[20px] font-semibold uppercase tracking-[0.16em] text-black/35">
                        Detalles del pedido
                      </span>

                      <p className="mt-3 text-[18px] leading-6 text-black/60">
                        Artículos que compras, historial de compras y
                        solicitudes de devolución o cambio.
                      </p>
                    </div>

                    <div className="rounded-[1.25rem] bg-[#f3f1ed] p-5">
                      <span className="text-[20px] font-semibold uppercase tracking-[0.16em] text-black/35">
                        Información de pago
                      </span>

                      <p className="mt-3 text-[18px] leading-6 text-black/60">
                        No almacenamos los datos de tu tarjeta. Todos los pagos
                        se procesan de forma segura mediante pasarelas de
                        terceros.
                      </p>
                    </div>

                    <div className="rounded-[1.25rem] bg-[#f3f1ed] p-5">
                      <span className="text-[20px] font-semibold uppercase tracking-[0.16em] text-black/35">
                        Datos técnicos
                      </span>

                      <p className="mt-3 text-[18px] leading-6 text-black/60">
                        Dirección IP, tipo de navegador, detalles del
                        dispositivo y comportamiento de navegación recopilados
                        mediante cookies.
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            </article>

            <div className="mx-6 border-t border-black/10 md:mx-10 lg:mx-14" />

            {/* 03 */}
            <article
              id="uso"
              className="scroll-mt-28 px-6 py-9 md:px-10 md:py-12 lg:px-14"
            >
              <div className="flex gap-6 md:gap-10">
                <span className="pt-1 font-mono text-[20px] text-black/25">
                  03
                </span>

                <div className="max-w-4xl">
                  <h2 className="text-xl font-semibold tracking-[-0.025em] md:text-2xl">
                    Cómo utilizamos tu información
                  </h2>

                  <div className="mt-7 grid gap-4 sm:grid-cols-2 ">
                    {[
                      'Procesar y entregar tus pedidos de manera rápida y precisa.',
                      'Enviarte actualizaciones de pedidos, promociones y mensajes de atención al cliente.',
                      'Analizar el comportamiento de los usuarios y mejorar tu experiencia de compra.',
                      'Personalizar contenido y recomendaciones de productos.',
                    ].map((item, index) => (
                      <div
                        key={item}
                        className="flex gap-4 border-l border-black/10 py-1 pl-5"
                      >
                        <span className="font-mono text-[20px] text-black/25">
                          0{index + 1}
                        </span>

                        <p className="text-[18px] leading-6 text-black/60">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>

            <div className="mx-6 border-t border-black/10 md:mx-10 lg:mx-14" />

            {/* 04 */}
            <article
              id="compartir"
              className="scroll-mt-28 bg-[#151515] px-6 py-10 text-white md:px-10 md:py-14 lg:px-14"
            >
              <div className="flex gap-6 md:gap-10">
                <span className="pt-1 font-mono text-[20px] text-white/25">
                  04
                </span>

                <div className="max-w-4xl">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                    Transparencia
                  </p>

                  <h2 className="mt-3 text-xl font-semibold tracking-[-0.025em] md:text-2xl">
                    Compartir tu información
                  </h2>

                  <p className="mt-5 max-w-2xl text-[18px] leading-7 text-white/55 md:text-base md:leading-8">
                    <strong className="text-[18px] text-white">
                      No vendemos ni alquilamos tus datos personales.
                    </strong>{' '}
                    Solo podemos compartir tu información cuando sea necesario
                    para prestar nuestros servicios o cuando exista una
                    obligación legal.
                  </p>

                  <div className="mt-8 grid gap-3 md:grid-cols-3">
                    <div className="rounded-[1.25rem] border border-white/10 p-5">
                      <span className="text-[10px] uppercase tracking-[0.16em] text-white/30">
                        01
                      </span>

                      <h3 className="mt-4 text-sm font-medium">
                        Socios de entrega
                      </h3>

                      <p className="mt-2 text-[18px] leading-5 text-white/45">
                        Para enviar tus pedidos.
                      </p>
                    </div>

                    <div className="rounded-[1.25rem] border border-white/10 p-5">
                      <span className="text-[10px] uppercase tracking-[0.16em] text-white/30">
                        02
                      </span>

                      <h3 className="mt-4 text-sm font-medium">
                        Proveedores de pago
                      </h3>

                      <p className="mt-2 text-[18px] leading-5 text-white/45">
                        Para procesar las transacciones de forma segura.
                      </p>
                    </div>

                    <div className="rounded-[1.25rem] border border-white/10 p-5">
                      <span className="text-[10px] uppercase tracking-[0.16em] text-white/30">
                        03
                      </span>

                      <h3 className="mt-4 text-sm font-medium">
                        Autoridades legales
                      </h3>

                      <p className="mt-2 text-[18px] leading-5 text-white/45">
                        Cuando sea requerido por ley.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* 05 + 06 */}
            <div className="grid md:grid-cols-2">

              <article
                id="cookies"
                className="scroll-mt-28 border-b border-black/10 px-6 py-9 md:border-b-0 md:border-r md:px-10 md:py-12 lg:px-14"
              >
                <span className="font-mono text-[20px] text-black/25">
                  05
                </span>

                <h2 className="mt-5 text-xl font-semibold tracking-[-0.025em]">
                  Cookies y tecnologías de seguimiento
                </h2>

                <p className="mt-5 text-[18px] leading-7 text-black/60">
                  Usamos cookies para recordar tu carrito, recomendar
                  productos y analizar el rendimiento del sitio web.
                </p>

                <div className="mt-6 rounded-[1rem] bg-[#f3f1ed] p-4">
                  <p className="text-xs leading-5 text-black/50">
                    <span className="font-semibold text-black/70">
                      Nota:
                    </span>{' '}
                    Puedes gestionar la configuración de cookies en tu
                    navegador.
                  </p>
                </div>
              </article>

              <article
                id="seguridad"
                className="scroll-mt-28 px-6 py-9 md:px-10 md:py-12 lg:px-14"
              >
                <span className="font-mono text-[20px] text-black/25">
                  06
                </span>

                <h2 className="mt-5 text-xl font-semibold tracking-[-0.025em]">
                  Seguridad de los datos
                </h2>

                <p className="mt-5 text-[18px] leading-7 text-black/60">
                  Implementamos medidas de seguridad estándar en la industria
                  para proteger tu información.
                </p>

                <ul className="mt-6 space-y-3">
                  {['Cifrado SSL', 'Cortafuegos (Firewalls)', 'Acceso limitado a los datos'].map(
                    (item) => (
                      <li
                        key={item}
                        className="flex items-center gap-3 text-sm text-black/60"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-black" />
                        {item}
                      </li>
                    ),
                  )}
                </ul>
              </article>

            </div>

            <div className="mx-6 border-t border-black/10 md:mx-10 lg:mx-14" />

            {/* 07 */}
            <article
              id="terceros"
              className="scroll-mt-28 px-6 py-9 md:px-10 md:py-12 lg:px-14"
            >
              <div className="flex gap-6 md:gap-10">
                <span className="pt-1 font-mono text-[20px] text-black/25">
                  07
                </span>

                <div className="max-w-3xl">
                  <h2 className="text-xl font-semibold tracking-[-0.025em] md:text-2xl">
                    Enlaces de terceros
                  </h2>

                  <p className="mt-5 text-[18px] leading-7 text-black/60 md:text-base md:leading-8">
                    Nuestro sitio web puede contener enlaces a sitios web de
                    terceros, por ejemplo, redes sociales o servicios de
                    envío. No somos responsables de sus prácticas de privacidad
                    ni de su contenido.
                  </p>
                </div>
              </div>
            </article>

            {/* 08 */}
            <article
              id="contacto"
              className="scroll-mt-28 bg-[#f3f1ed] px-6 py-10 md:px-10 md:py-14 lg:px-14"
            >
              <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
                <div className="max-w-2xl">
                  <span className="font-mono text-[20px] text-black/25">
                    08
                  </span>

                  <p className="mt-5 text-[20px] font-semibold uppercase tracking-[0.2em] text-black/35">
                    Información de contacto
                  </p>

                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em] md:text-3xl">
                    ¿Tienes alguna pregunta?
                  </h2>

                  <p className="mt-4 text-[18px] leading-7 text-black/55">
                    Si tienes alguna pregunta sobre esta Política de
                    Privacidad, puedes comunicarte directamente con nosotros.
                  </p>
                </div>

                <a
                  href="mailto:contacto@crepante.com"
                  className="group inline-flex w-fit items-center gap-3 rounded-full bg-black px-5 py-3 text-xs font-medium uppercase tracking-[0.1em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-black/90"
                >
                  contacto@crepante.com

                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </a>
              </div>
            </article>

          </div>
        </div>

        {/* Footer */}
        <footer className="mt-10 flex flex-col gap-3 border-t border-black/10 pt-6 text-[10px] uppercase tracking-[0.16em] text-black/35 sm:flex-row sm:items-center sm:justify-between">
          <span>CREPANTE · Política de Privacidad</span>

          <span>
            crepante.com · 29.07.2026
          </span>
        </footer>

      </section>
    </main>
  );
};
