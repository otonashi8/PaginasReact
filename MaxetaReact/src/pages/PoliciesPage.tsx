import { TypewriterTitle } from '../components/TypewriterTitle';

export const PoliciesPage = () => {
  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-16 text-black md:px-8 lg:px-12">
      <section className="mx-auto max-w-6xl">

        {/* Header */}
        <header className="mb-14 max-w-3xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-black" />
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-black/50">
              Información legal
            </span>
          </div>

          <TypewriterTitle
            text="Política de Privacidad"
            className="text-4xl font-semibold tracking-[-0.04em] md:text-6xl"
          />

          <p className="mt-6 max-w-2xl text-base leading-7 text-black/60 md:text-lg">
            En EZZETA nos comprometemos a proteger la información personal de
            nuestros clientes y visitantes. Esta política describe cómo
            recopilamos, utilizamos, almacenamos y protegemos tus datos
            personales cuando utilizas nuestro sitio web y realizas compras
            en línea.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs uppercase tracking-[0.14em] text-black/40">
            <span>Última actualización</span>
            <span className="text-black/70">29 de julio de 2026</span>
          </div>
        </header>

        {/* Introducción */}
        <article className="mb-5 rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] md:p-8">
          <div className="flex gap-5">
            <span className="hidden text-sm font-medium text-black/30 sm:block">
              01
            </span>

            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Introducción
              </h2>

              <p className="mt-4 max-w-4xl text-sm leading-7 text-black/65 md:text-base">
                Bienvenido a EZZETA. Esta Política de Privacidad explica cómo
                recopilamos, utilizamos y protegemos tu información personal
                cuando navegas por nuestro sitio web y realizas compras de
                productos de moda con nosotros.
              </p>
            </div>
          </div>
        </article>

        {/* Grid principal */}
        <div className="grid gap-5 md:grid-cols-2">

          {/* Información que recopilamos */}
          <article className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] md:p-7">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-xs font-medium tracking-[0.18em] text-black/30">
                02
              </span>

              <span className="rounded-full border border-black/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-black/45">
                Datos
              </span>
            </div>

            <h2 className="text-lg font-semibold uppercase tracking-[0.1em]">
              Información que recopilamos
            </h2>

            <div className="mt-6 space-y-5 text-sm leading-6 text-black/65">
              <div>
                <h3 className="font-medium text-black">
                  Información personal
                </h3>
                <p className="mt-1">
                  Nombre, correo electrónico, número de teléfono, dirección de
                  envío y dirección de facturación.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-black">
                  Detalles del pedido
                </h3>
                <p className="mt-1">
                  Artículos adquiridos, historial de compras y solicitudes de
                  devolución o cambio.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-black">
                  Información de pago
                </h3>
                <p className="mt-1">
                  No almacenamos los datos de tu tarjeta. Los pagos se
                  procesan de forma segura mediante pasarelas de terceros.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-black">
                  Datos técnicos
                </h3>
                <p className="mt-1">
                  Dirección IP, tipo de navegador, detalles del dispositivo y
                  comportamiento de navegación recopilados mediante cookies y
                  herramientas de análisis.
                </p>
              </div>
            </div>
          </article>

          {/* Uso de la información */}
          <article className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] md:p-7">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-xs font-medium tracking-[0.18em] text-black/30">
                03
              </span>

              <span className="rounded-full border border-black/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-black/45">
                Uso
              </span>
            </div>

            <h2 className="text-lg font-semibold uppercase tracking-[0.1em]">
              Cómo utilizamos tu información
            </h2>

            <ul className="mt-6 space-y-4 text-sm leading-6 text-black/65">
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                <span>
                  Procesar y entregar tus pedidos de manera rápida y precisa.
                </span>
              </li>

              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                <span>
                  Enviarte actualizaciones de pedidos, promociones y mensajes
                  de atención al cliente.
                </span>
              </li>

              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                <span>
                  Analizar el comportamiento de los usuarios y mejorar tu
                  experiencia de compra.
                </span>
              </li>

              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                <span>
                  Personalizar contenido y recomendaciones de productos.
                </span>
              </li>
            </ul>
          </article>

          {/* Compartir información */}
          <article className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] md:p-7">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-xs font-medium tracking-[0.18em] text-black/30">
                04
              </span>

              <span className="rounded-full border border-black/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-black/45">
                Privacidad
              </span>
            </div>

            <h2 className="text-lg font-semibold uppercase tracking-[0.1em]">
              Compartir tu información
            </h2>

            <p className="mt-5 text-sm leading-6 text-black/65">
              No vendemos ni alquilamos tus datos personales. Solo podemos
              compartir tu información cuando sea necesario para prestar
              nuestros servicios o cuando exista una obligación legal.
            </p>

            <ul className="mt-5 space-y-3 text-sm text-black/65">
              <li>
                <strong className="text-black">Socios de entrega:</strong>{' '}
                para enviar tus pedidos.
              </li>

              <li>
                <strong className="text-black">Proveedores de pago:</strong>{' '}
                para procesar las transacciones de forma segura.
              </li>

              <li>
                <strong className="text-black">Autoridades legales:</strong>{' '}
                cuando sea requerido por ley.
              </li>
            </ul>
          </article>

          {/* Cookies */}
          <article className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] md:p-7">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-xs font-medium tracking-[0.18em] text-black/30">
                05
              </span>

              <span className="rounded-full border border-black/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-black/45">
                Cookies
              </span>
            </div>

            <h2 className="text-lg font-semibold uppercase tracking-[0.1em]">
              Cookies y tecnologías de seguimiento
            </h2>

            <p className="mt-5 text-sm leading-7 text-black/65">
              Utilizamos cookies para recordar tu carrito, recomendar
              productos y analizar el rendimiento del sitio web. Puedes
              gestionar la configuración de cookies desde las opciones de tu
              navegador.
            </p>
          </article>

          {/* Seguridad */}
          <article className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] md:p-7">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-xs font-medium tracking-[0.18em] text-black/30">
                06
              </span>

              <span className="rounded-full border border-black/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-black/45">
                Seguridad
              </span>
            </div>

            <h2 className="text-lg font-semibold uppercase tracking-[0.1em]">
              Seguridad de los datos
            </h2>

            <p className="mt-5 text-sm leading-7 text-black/65">
              Implementamos medidas de seguridad estándar en la industria,
              como cifrado SSL, cortafuegos y acceso limitado, para proteger
              tu información frente a accesos no autorizados, pérdida,
              alteración o divulgación indebida.
            </p>
          </article>

          {/* Terceros */}
          <article className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] md:p-7">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-xs font-medium tracking-[0.18em] text-black/30">
                07
              </span>

              <span className="rounded-full border border-black/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-black/45">
                Enlaces
              </span>
            </div>

            <h2 className="text-lg font-semibold uppercase tracking-[0.1em]">
              Enlaces de terceros
            </h2>

            <p className="mt-5 text-sm leading-7 text-black/65">
              Nuestro sitio web puede contener enlaces a sitios web de
              terceros, como redes sociales o servicios de envío. No somos
              responsables de sus prácticas de privacidad ni del contenido
              disponible en dichos sitios.
            </p>
          </article>

          {/* Derechos del usuario */}
          <article className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] md:p-7">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-xs font-medium tracking-[0.18em] text-black/30">
                08
              </span>

              <span className="rounded-full border border-black/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-black/45">
                Derechos
              </span>
            </div>

            <h2 className="text-lg font-semibold uppercase tracking-[0.1em]">
              Derechos del usuario
            </h2>

            <p className="mt-5 text-sm leading-7 text-black/65">
              Puedes solicitar acceso, actualización, rectificación,
              oposición o eliminación de tus datos personales, de acuerdo
              con la normativa vigente. También puedes revocar el
              consentimiento para aquellos usos que no sean esenciales para
              la prestación de nuestros servicios.
            </p>
          </article>
        </div>

        {/* Contacto */}
        <article className="mt-5 overflow-hidden rounded-[1.5rem] bg-black p-7 text-white shadow-[0_15px_40px_rgba(0,0,0,0.08)] md:p-10">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">
                09 · Contacto
              </span>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
                ¿Tienes alguna pregunta?
              </h2>

              <p className="mt-4 text-sm leading-7 text-white/60 md:text-base">
                Si tienes alguna consulta sobre esta Política de Privacidad,
                el tratamiento de tus datos personales o el uso de nuestra
                plataforma, puedes comunicarte con nosotros.
              </p>
            </div>

            <a
              href="mailto:contacto@maxeta.com.pe"
              className="inline-flex w-fit items-center rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition-transform duration-300 hover:-translate-y-0.5"
            >
              contacto@maxeta.com.pe
            </a>
          </div>
        </article>

        {/* Footer legal */}
        <footer className="mt-8 flex flex-col gap-3 border-t border-black/10 pt-6 text-xs uppercase tracking-[0.14em] text-black/40 md:flex-row md:items-center md:justify-between">
          <span>EZZETA · Política de Privacidad</span>
          <span>Última actualización · 29.07.2026</span>
        </footer>

      </section>
    </main>
  );
};