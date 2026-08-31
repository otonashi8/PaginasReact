import { useEffect, useState } from 'react';
import { Mail, Phone, Send, MessageSquare } from 'lucide-react';
import { crearSolicitudAsistencia, type TipoSolicitudAsistencia } from '../admin/Clientes/Formularios/utils/solicitudesAsistencia';
import { useAuth } from '../context/AuthContext';

type TipoSolicitud = TipoSolicitudAsistencia;

export const ContactPage = () => {
  const { user: authUser, isAuthenticated } = useAuth();
  const [tipo, setTipo] = useState<TipoSolicitud>('Queja');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [pedido, setPedido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !authUser) {
      return;
    }

    setNombre((current) => current || authUser.username || authUser.email || 'Cliente registrado');
    setCorreo((current) => current || authUser.email || '');
    setTelefono((current) => current || authUser.phone || '');
  }, [authUser, isAuthenticated]);
  const limpiarFormulario = () => {
    setTipo('Queja');
    setNombre('');
    setCorreo('');
    setPedido('');
    setTelefono('');
    setMensaje('');
  };
  const enviarSolicitud = () => {
    setError('');
    if (
      !nombre.trim() ||
      !correo.trim() ||
      !telefono.trim() ||
      !mensaje.trim()
    ) {
      setError('Completa todos los campos obligatorios.');
      return;
    }
    const nuevaSolicitud = crearSolicitudAsistencia({
      tipo,
      nombre: nombre.trim(),
      correo: correo.trim(),
      pedido: pedido.trim(),
      telefono: telefono.trim(),
      mensaje: mensaje.trim(),
      estado: 'Pendiente',
      fecha: new Date().toISOString(),
      clienteId: isAuthenticated && authUser ? authUser.id : null,
      tipoCliente: isAuthenticated && authUser ? 'registrado' : 'guest',
    });

    limpiarFormulario();
    setEnviado(true);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('maxeta:solicitudes-asistencia-changed'));
    }
    return nuevaSolicitud;
  };

  return (
    <section className="space-y-10 sm:space-y-12">
      {/* ENCABEZADO */}
      <div className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-[0_14px_42px_rgba(0,0,0,0.05)] sm:p-8 lg:p-10">
        <p className="text-xs uppercase tracking-[0.28em] text-black/55">
          Atención personalizada
        </p>
        <h1 className="mt-3 text-3xl font-semibold uppercase tracking-[0.14em] text-black sm:text-4xl">
          Contacto y soporte
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-black/70 sm:text-base">
          Estamos aquí para ayudarte con tus pedidos, envíos,
          devoluciones, cambios y cualquier inconveniente relacionado
          con tu compra.
        </p>
      </div>
      {/* FAQ + ASISTENCIA */}
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-6">
        {/* FAQ */}
        <div className="rounded-[1.8rem] border border-black/10 bg-white p-5 shadow-[0_12px_34px_rgba(0,0,0,0.05)] sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold uppercase tracking-[0.16em] text-black sm:text-2xl">FAQ</h2>
            <span className="text-xs uppercase tracking-[0.22em] text-black/45">Respuestas rápidas</span>
          </div>
          <div className="mt-6 space-y-3 text-sm text-black/70">
            <div className="rounded-[1.1rem] border border-black/10 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-red-600/40 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)]">
              <p className="font-semibold text-black">¿Cuánto tarda el envío?</p>
              <p className="mt-2">El tiempo estimado suele ser de 2 a 5 días hábiles.</p>
            </div>
            <div className="rounded-[1.1rem] border border-black/10 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-red-600/40 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)]">
              <p className="font-semibold text-black">¿Puedo devolver una prenda?</p>
              <p className="mt-2">Sí, puedes solicitar devolución dentro de los 14 días posteriores a la entrega.</p>
            </div>
            <div className="rounded-[1.1rem] border border-black/10 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-red-600/40 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)]">
              <p className="font-semibold text-black">¿Ofrecen asesoría personalizada?</p>
              <p className="mt-2">Claro, nuestro equipo puede ayudarte con recomendaciones de estilo.</p>
            </div>
          </div>
        </div>
        {/* ASISTENCIA */}
        <div className="rounded-[1.8rem] border border-black/10 bg-white p-5 shadow-[0_12px_34px_rgba(0,0,0,0.05)] sm:p-7">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black text-white">
              <MessageSquare size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold uppercase tracking-[0.16em] text-black sm:text-2xl">Asistencia</h2>
              <p className="mt-1 text-sm text-black/60">¿Tienes algún problema? Déjanos tu solicitud.</p>
            </div>
          </div>

          {enviado ? (
            <div className="mt-6 rounded-[1.3rem] border border-green-600/20 bg-green-50 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">✓</div>
              <h3 className="mt-4 text-lg font-semibold text-green-800">Solicitud enviada correctamente</h3>
              <p className="mt-2 text-sm leading-relaxed text-green-700">
                Hemos recibido tu solicitud. Nuestro equipo la revisará
                y se pondrá en contacto contigo.
              </p>
              <button
                type="button"
                onClick={() => setEnviado(false)}
                className="mt-5 rounded-xl border border-green-700 bg-white px-5 py-3 text-sm font-semibold text-green-700 transition-colors hover:bg-green-700 hover:text-white"
              >Enviar otra solicitud</button>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {/* TIPO */}
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-black">
                  Motivo de la solicitud <b className="text-red-600">*</b>
                </span>
                <select
                  value={tipo}
                  onChange={(event) =>
                    setTipo(event.target.value as TipoSolicitud)
                  }
                  className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-red-600"
                >
                  <option value="Queja">Queja</option>
                  <option value="Problema con pedido">Problema con pedido</option>
                  <option value="Devolución">Devolución</option>
                  <option value="Cambio">Cambio</option>
                  <option value="Envío">Envío</option>
                  <option value="Otro">Otro</option>
                </select>
              </label>
              {/* NOMBRE + CORREO */}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-black">
                    Nombre <b className="text-red-600">*</b>
                  </span>
                  <input
                    value={nombre}
                    onChange={(event) =>
                      setNombre(event.target.value)
                    }
                    placeholder="Tu nombre completo"
                    className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-red-600"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-black">
                    Correo <b className="text-red-600">*</b>
                  </span>
                  <input
                    type="email"
                    value={correo}
                    onChange={(event) =>
                      setCorreo(event.target.value)
                    }
                    placeholder="ejemplo@mail.com"
                    className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-red-600"
                  />
                </label>
              </div>
              {/* PEDIDO + TELÉFONO */}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-black">
                    N.º de pedido
                  </span>

                  <input
                    value={pedido}
                    onChange={(event) =>
                      setPedido(event.target.value)
                    }
                    placeholder="Ej. PED-000123"
                    className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-red-600"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-black">
                    Teléfono <b className="text-red-600">*</b>
                  </span>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(event) =>
                      setTelefono(event.target.value)
                    }
                    placeholder="+51 9XXXXXXXX"
                    className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-red-600"
                  />
                </label>
              </div>
              {/* MENSAJE */}
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-black">
                  Describe tu problema o queja{' '}
                  <b className="text-red-600">*</b>
                </span>
                <textarea
                  value={mensaje}
                  onChange={(event) =>
                    setMensaje(event.target.value)
                  }
                  placeholder="Cuéntanos qué ocurrió..."
                  rows={5}
                  className="w-full resize-none rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-red-600"
                />
              </label>
              {error && (
                <p className="rounded-xl border border-red-600/20 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}
              <button
                type="button"
                onClick={enviarSolicitud}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-black bg-black px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-colors duration-200 hover:border-red-600 hover:bg-red-600"
              ><Send size={16} />Enviar solicitud
              </button>
              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                <a
                  href="tel:+51929370461"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/15 bg-white px-4 py-3 text-sm font-medium text-black transition-colors hover:border-red-600 hover:text-red-600"
                ><Phone size={16} />+51 929370461
                </a>
                <a
                  href="mailto:contacto@ezzeta.com"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/15 bg-white px-4 py-3 text-sm font-medium text-black transition-colors hover:border-red-600 hover:text-red-600"
                ><Mail size={16} />contacto@ezzeta.com
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EMPRENDE CON NOSOTROS */}
      <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
        {/* IMAGEN */}
        <div className="relative overflow-hidden rounded-[1.8rem] border border-black/10 bg-white shadow-[0_12px_34px_rgba(0,0,0,0.05)]">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTU1agQ0JWH1FRSXAzg8c0EJ0q-w1lNc4P3IQQRrLw5lj_lD3Zl020i5S7A&s=10"
            alt="Emprende con nosotros"
            className="h-64 w-full object-cover transition-transform duration-500 hover:scale-[1.03] sm:h-80 lg:h-full"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
        </div>

        {/* CONTENIDO */}
        <div className="rounded-[1.8rem] border border-black/10 bg-white p-5 shadow-[0_12px_34px_rgba(0,0,0,0.05)] sm:p-7">
          <p className="text-xs uppercase tracking-[0.25em] text-black/50">
            Emprende con nosotros</p>
          <h2 className="mt-3 text-xl font-semibold uppercase tracking-[0.16em] text-black sm:text-2xl">
            ¿Quieres ser como Pablo Ezzeta?</h2>
          <p className="mt-4 text-sm leading-relaxed text-black/70">
            Forma parte de una comunidad pensada para quienes quieren crecer,
            emprender y llevar su proyecto al siguiente nivel. Descubre nuevas
            oportunidades, aprende y conecta con personas que comparten tu misma
            visión.</p>
          <p className="mt-3 text-sm leading-relaxed text-black/70">
            Conoce el Club Pablo Ezzeta y descubre todo lo que tiene preparado
            para ti.</p>
          <a
            href="https://pabloezzeta.pe/club/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-black bg-black px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-colors duration-200 hover:border-red-600 hover:bg-red-600"
          >Conoce el Club</a>
        </div>
      </div>
    </section>
  );
};