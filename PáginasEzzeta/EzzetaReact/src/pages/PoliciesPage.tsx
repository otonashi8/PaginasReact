export const PoliciesPage = () => {
  return (
    <section className="mx-auto max-w-6xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50">
          Legal
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
          Política de Privacidad
        </h1>

        <p className="text-base leading-relaxed text-black/60 sm:text-lg">
          En EZZETA COMPANY nos comprometemos a proteger la información
          personal de nuestros usuarios, prospectos y clientes. Esta política
          describe cómo recopilamos, utilizamos, almacenamos y protegemos sus
          datos personales, de acuerdo con la normativa vigente en el Perú.
        </p>

        <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-5">
          <p className="text-sm leading-relaxed text-black/70">
            La presente Política de Privacidad y Tratamiento de Datos
            Personales corresponde a{' '}
            <strong className="font-semibold text-black">
              EZZETA COMPANY E.I.R.L.
            </strong>
            , con RUC N.° 20604863342, domiciliada en Villa El Salvador,
            Lima, Perú.
          </p>
        </div>
      </div>

      {/* Información recopilada */}
      <div className="grid gap-5 md:grid-cols-2">
        <article className="group rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-black text-sm font-semibold text-white">
            01
          </div>

          <h2 className="text-lg font-semibold uppercase tracking-[0.1em] text-black">
            Información que recopilamos
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-black/65">
            Recopilamos información personal mediante los formularios
            disponibles en nuestro sitio web, incluyendo las secciones
            Contáctanos, Suscripciones, Registro y cualquier otro formulario
            habilitado.
          </p>

          <ul className="mt-5 space-y-2 text-sm text-black/65">
            <li>• Nombres y apellidos</li>
            <li>• Documento de identidad o carnet de extranjería</li>
            <li>• RUC, cuando corresponda</li>
            <li>• Dirección y ciudad</li>
            <li>• Correo electrónico y teléfono</li>
            <li>• Información comercial o de contacto</li>
          </ul>

          <p className="mt-5 text-sm leading-relaxed text-black/65">
            La información será almacenada en el banco de datos denominado
            <strong className="font-medium text-black">
              {' '}
              Clientes y Usuarios Web
            </strong>
            , por un plazo indeterminado o hasta que el titular solicite su
            cancelación, conforme a la legislación vigente.
          </p>
        </article>

        {/* Finalidad */}
        <article className="group rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-black text-sm font-semibold text-white">
            02
          </div>

          <h2 className="text-lg font-semibold uppercase tracking-[0.1em] text-black">
            Finalidad del tratamiento
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-black/65">
            Los datos personales serán utilizados para las siguientes
            finalidades:
          </p>

          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-black/65">
            <li>
              • Enviar información relacionada con los servicios o productos
              ofrecidos por EZZETA COMPANY.
            </li>
            <li>
              • Enviar, con su consentimiento, comunicaciones comerciales,
              promociones, ofertas, descuentos, noticias y publicidad.
            </li>
            <li>• Atender consultas, solicitudes o reclamos.</li>
            <li>• Realizar actualizaciones de su información.</li>
            <li>
              • Gestionar compras, pedidos, cotizaciones, despachos, pagos y
              demás operaciones comerciales.
            </li>
          </ul>
        </article>

        {/* Seguridad */}
        <article className="group rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-black text-sm font-semibold text-white">
            03
          </div>

          <h2 className="text-lg font-semibold uppercase tracking-[0.1em] text-black">
            Seguridad de la información
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-black/65">
            EZZETA COMPANY cuenta con medidas técnicas, organizativas y
            legales destinadas a proteger la información personal frente a
            accesos no autorizados, pérdidas, manipulaciones indebidas o
            divulgación no autorizada.
          </p>

          <p className="mt-4 text-sm leading-relaxed text-black/65">
            Los datos personales no serán vendidos ni compartidos con terceros
            ajenos sin su consentimiento, salvo cuando resulte necesario para
            cumplir las finalidades descritas en esta política y bajo las
            correspondientes obligaciones de confidencialidad y seguridad.
          </p>
        </article>

        {/* Cookies */}
        <article className="group rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-black text-sm font-semibold text-white">
            04
          </div>

          <h2 className="text-lg font-semibold uppercase tracking-[0.1em] text-black">
            Cookies y navegación
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-black/65">
            EZZETA COMPANY puede utilizar tecnologías como cookies para
            recopilar información durante la navegación del usuario en nuestro
            sitio web.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-black">Dirección IP</h3>
              <p className="mt-1 text-sm leading-relaxed text-black/60">
                Puede utilizarse con fines estadísticos, de seguridad o para
                mejorar la experiencia del usuario. No suele asociarse
                directamente con un usuario identificado.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-black">Cookies</h3>
              <p className="mt-1 text-sm leading-relaxed text-black/60">
                Son pequeños archivos almacenados en el navegador que permiten
                recordar preferencias, registrar actividad y personalizar
                determinados contenidos.
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-black/60">
            El usuario puede configurar su navegador para bloquear o eliminar
            cookies, aunque esto podría afectar algunas funcionalidades del
            sitio web.
          </p>
        </article>

        {/* Terceros */}
        <article className="group rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-black text-sm font-semibold text-white">
            05
          </div>

          <h2 className="text-lg font-semibold uppercase tracking-[0.1em] text-black">
            Acceso a la información
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-black/65">
            EZZETA COMPANY podrá compartir o encargar el tratamiento de
            información personal a terceros que proporcionen servicios
            necesarios para cumplir las finalidades descritas en esta
            política.
          </p>

          <p className="mt-4 text-sm leading-relaxed text-black/65">
            En estos casos, dichos terceros deberán cumplir con estándares
            adecuados de confidencialidad, protección y uso limitado de los
            datos personales.
          </p>
        </article>

        {/* Derechos */}
        <article className="group rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-black text-sm font-semibold text-white">
            06
          </div>

          <h2 className="text-lg font-semibold uppercase tracking-[0.1em] text-black">
            Derechos del titular
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-black/65">
            Como titular de sus datos personales, usted tiene derecho a:
          </p>

          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-black/65">
            <li>• Acceder a su información personal.</li>
            <li>• Rectificar datos inexactos o incompletos.</li>
            <li>
              • Cancelar sus datos cuando considere que no están siendo
              tratados conforme a la ley.
            </li>
            <li>
              • Oponerse al tratamiento de sus datos en determinadas
              circunstancias.
            </li>
          </ul>
        </article>
      </div>

      {/* Contacto */}
      <article className="overflow-hidden rounded-[1.5rem] border border-black/10 bg-black p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              Privacidad
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              ¿Tienes alguna consulta sobre tus datos?
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Para ejercer sus derechos o resolver dudas relacionadas con el
              tratamiento de sus datos personales, puede comunicarse con
              nosotros.
            </p>
          </div>

          <a
            href="mailto:contacto@ezzetacompany.com"
            className="inline-flex w-fit items-center rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition-colors hover:bg-white/90"
          >
            contacto@ezzetacompany.com
          </a>
        </div>
      </article>

      {/* Marco legal */}
      <article className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold uppercase tracking-[0.1em] text-black">
          Marco legal y modificaciones
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-black/65">
          Esta Política de Privacidad se encuentra en concordancia con la
          normativa vigente sobre protección de datos personales en el Perú,
          incluyendo la Ley N.º 29733 y su reglamento, Decreto Supremo N.º
          003-2013-JUS.
        </p>

        <p className="mt-4 text-sm leading-relaxed text-black/65">
          EZZETA COMPANY E.I.R.L. se reserva el derecho de modificar esta
          Política de Privacidad en cualquier momento. Los cambios serán
          oportunamente comunicados a través de su página web.
        </p>

        <div className="mt-6 border-t border-black/10 pt-5">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-black/45">
            Última actualización
          </p>
          <p className="mt-1 text-sm text-black/70">
            21 de octubre de 2025
          </p>
        </div>
      </article>

      {/* Footer legal */}
      <div className="flex flex-col gap-2 border-t border-black/10 pt-6 text-xs uppercase tracking-[0.12em] text-black/40 sm:flex-row sm:items-center sm:justify-between">
        <span>EZZETA COMPANY E.I.R.L.</span>
        <span>RUC N.° 20604863342 · Villa El Salvador, Lima, Perú</span>
      </div>
    </section>
  );
};