import { useEffect, useState } from 'react';
import { Mail, Phone, Send, MessageSquare } from 'lucide-react';
import { MembershipModal } from '../components/MembershipModal';
import { PermissionGate } from '../components/PermissionGate';
import { PERMISSIONS } from '../utils/permissionCodes';
import { crearSolicitudAsistencia, type TipoSolicitudAsistencia } from '../admin/Clientes/Formularios/utils/solicitudesAsistencia';
import { useAuth } from '../context/AuthContext';

type TipoSolicitud = TipoSolicitudAsistencia;

export const ContactPage = () => {
  const { user: authUser, isAuthenticated } = useAuth();
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
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
    <section className="space-y-8 sm:space-y-10">

      {/* HEADER */}
      <div className="relative overflow-hidden rounded-[2rem] bg-black px-6 py-10 text-white sm:px-10 sm:py-14">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />

        <div className="relative z-10 max-w-4xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-red-600" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/55">
              Atención personalizada
            </span>
          </div>

          <h1 className="text-3xl font-black uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
            Contacto
            <span className="block text-red-600">& soporte</span>
          </h1>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
            Estamos aquí para ayudarte con tus pedidos, envíos,
            devoluciones, cambios y cualquier inconveniente relacionado
            con tu compra.
          </p>
        </div>

        <div className="absolute bottom-0 right-8 hidden text-[90px] font-black uppercase leading-none tracking-tighter text-white/[0.035] lg:block">
          HELP
        </div>
      </div>

      {/* FAQ + ASISTENCIA */}
      <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">

        {/* FAQ */}
        <div className="rounded-[2rem] border border-black/10 bg-white p-6 sm:p-8">
          <div className="flex items-end justify-between gap-4 border-b border-black/10 pb-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-600">
                Información
              </span>

              <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
                FAQ
              </h2>
            </div>

            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35 sm:block">
              Respuestas rápidas
            </span>
          </div>

          <div className="mt-5 divide-y divide-black/10">
            <div className="group py-5 first:pt-0">
              <div className="flex gap-4">
                <span className="pt-1 text-xs font-black text-red-600">01</span>

                <div>
                  <p className="font-semibold text-black">
                    ¿Cuánto tarda el envío?
                  </p>

                  <p className="mt-2 text-sm leading-6 text-black/55">
                    El tiempo estimado suele ser de 2 a 5 días hábiles.
                  </p>
                </div>
              </div>
            </div>

            <div className="group py-5">
              <div className="flex gap-4">
                <span className="pt-1 text-xs font-black text-red-600">02</span>

                <div>
                  <p className="font-semibold text-black">
                    ¿Puedo devolver una prenda?
                  </p>

                  <p className="mt-2 text-sm leading-6 text-black/55">
                    Sí, puedes solicitar devolución dentro de los 14 días
                    posteriores a la entrega.
                  </p>
                </div>
              </div>
            </div>

            <div className="group py-5 last:pb-0">
              <div className="flex gap-4">
                <span className="pt-1 text-xs font-black text-red-600">03</span>

                <div>
                  <p className="font-semibold text-black">
                    ¿Ofrecen asesoría personalizada?
                  </p>

                  <p className="mt-2 text-sm leading-6 text-black/55">
                    Claro, nuestro equipo puede ayudarte con recomendaciones
                    de estilo.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-7 rounded-2xl bg-[#f5f3ef] p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">
              ¿No encontraste lo que buscabas?
            </p>

            <p className="mt-2 text-sm font-medium text-black">
              Escríbenos y te ayudaremos personalmente.
            </p>
          </div>
        </div>

        {/* ASISTENCIA */}
        <div className="rounded-[2rem] bg-[#f5f3ef] p-6 sm:p-8">

          <div className="flex items-start justify-between gap-5 border-b border-black/10 pb-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black text-white">
                <MessageSquare size={19} strokeWidth={1.8} />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-red-600">
                  Soporte
                </span>

                <h2 className="mt-1 text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
                  Asistencia
                </h2>

                <p className="mt-1 text-sm text-black/50">
                  Déjanos tu solicitud y nos pondremos en contacto contigo.
                </p>
              </div>
            </div>

            <span className="hidden rounded-full border border-black/10 bg-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-black/40 sm:block">
              Soporte
            </span>
          </div>

          {enviado ? (
            <div className="mt-7 rounded-[1.5rem] bg-white p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-lg font-bold text-green-700">
                ✓
              </div>

              <h3 className="mt-5 text-xl font-black uppercase tracking-tight text-black">
                Solicitud enviada
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/55">
                Hemos recibido tu solicitud correctamente. Nuestro equipo
                la revisará y se pondrá en contacto contigo.
              </p>

              <button
                type="button"
                onClick={() => setEnviado(false)}
                className="mt-6 rounded-xl bg-black px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white transition-all hover:bg-red-600"
              >
                Enviar otra solicitud
              </button>
            </div>
          ) : (
            <div className="mt-7 space-y-5">

              {/* TIPO */}
              <label className="block">
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-black/70">
                  Motivo de la solicitud <b className="text-red-600">*</b>
                </span>

                <select
                  value={tipo}
                  onChange={(event) =>
                    setTipo(event.target.value as TipoSolicitud)
                  }
                  className="w-full appearance-none rounded-xl border border-black/10 bg-white px-4 py-3.5 text-sm text-black outline-none transition-all focus:border-red-600 focus:ring-2 focus:ring-red-600/10"
                >
                  <option value="Queja">Queja</option>
                  <option value="Problema con pedido">
                    Problema con pedido
                  </option>
                  <option value="Devolución">Devolución</option>
                  <option value="Cambio">Cambio</option>
                  <option value="Envío">Envío</option>
                  <option value="Otro">Otro</option>
                </select>
              </label>

              {/* NOMBRE + CORREO */}
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-black/70">
                    Nombre <b className="text-red-600">*</b>
                  </span>

                  <input
                    value={nombre}
                    onChange={(event) => setNombre(event.target.value)}
                    placeholder="Tu nombre completo"
                    className="w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 text-sm text-black placeholder:text-black/30 outline-none transition-all focus:border-red-600 focus:ring-2 focus:ring-red-600/10"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-black/70">
                    Correo <b className="text-red-600">*</b>
                  </span>

                  <input
                    type="email"
                    value={correo}
                    onChange={(event) => setCorreo(event.target.value)}
                    placeholder="ejemplo@mail.com"
                    className="w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 text-sm text-black placeholder:text-black/30 outline-none transition-all focus:border-red-600 focus:ring-2 focus:ring-red-600/10"
                  />
                </label>
              </div>

              {/* PEDIDO + TELÉFONO */}
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-black/70">
                    N.º de pedido
                  </span>

                  <input
                    value={pedido}
                    onChange={(event) => setPedido(event.target.value)}
                    placeholder="Ej. PED-000123"
                    className="w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 text-sm text-black placeholder:text-black/30 outline-none transition-all focus:border-red-600 focus:ring-2 focus:ring-red-600/10"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-black/70">
                    Teléfono <b className="text-red-600">*</b>
                  </span>

                  <input
                    type="tel"
                    value={telefono}
                    onChange={(event) => setTelefono(event.target.value)}
                    placeholder="+51 9XXXXXXXX"
                    className="w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 text-sm text-black placeholder:text-black/30 outline-none transition-all focus:border-red-600 focus:ring-2 focus:ring-red-600/10"
                  />
                </label>
              </div>

              {/* MENSAJE */}
              <label className="block">
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-black/70">
                  Describe tu problema o queja{' '}
                  <b className="text-red-600">*</b>
                </span>

                <textarea
                  value={mensaje}
                  onChange={(event) => setMensaje(event.target.value)}
                  placeholder="Cuéntanos qué ocurrió..."
                  rows={5}
                  className="w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3.5 text-sm leading-6 text-black placeholder:text-black/30 outline-none transition-all focus:border-red-600 focus:ring-2 focus:ring-red-600/10"
                />
              </label>

              {error && (
                <div className="flex items-center gap-3 rounded-xl border border-red-600/15 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold">
                    !
                  </span>
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={enviarSolicitud}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-white transition-all hover:bg-red-600"
              >
                <Send
                  size={15}
                  className="transition-transform group-hover:translate-x-0.5"
                />
                Enviar solicitud
              </button>

              {/* CONTACTO DIRECTO */}
              <div className="grid gap-3 border-t border-black/10 pt-5 sm:grid-cols-2">
                <a
                  href="tel:+51929370461"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3.5 text-xs font-semibold text-black transition-all hover:border-black hover:bg-black hover:text-white"
                >
                  <Phone
                    size={15}
                    className="text-red-600 group-hover:text-white"
                  />
                  +51 929 370 461
                </a>

                <a
                  href="mailto:contacto@ezzeta.com"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3.5 text-xs font-semibold text-black transition-all hover:border-black hover:bg-black hover:text-white"
                >
                  <Mail
                    size={15}
                    className="text-red-600 group-hover:text-white"
                  />
                  contacto@ezzeta.com
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EMPRENDE CON NOSOTROS */}
      <div className="grid overflow-hidden rounded-[2rem] bg-black lg:grid-cols-2">

        {/* IMAGEN */}
        <div className="relative min-h-[300px] overflow-hidden lg:min-h-[460px]">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTghOovU-tQBpJrKz3aw35HWcfswchhp2etwdOoAVAt9SEicrRSmQwIh2bc&s=10"
            alt="Emprende con nosotros"
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <div className="absolute bottom-7 left-7 right-7">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/55">
              Comunidad Ezzeta
            </span>

            <p className="mt-2 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
              Construye algo
              <span className="block text-red-600">extraordinario.</span>
            </p>
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-600">
            Emprende con nosotros
          </span>

          <h2 className="mt-4 max-w-lg text-3xl font-black uppercase leading-[1] tracking-tight text-white sm:text-4xl">
            ¿Quieres ser como
            <span className="block text-red-600">Pablo Ezzeta?</span>
          </h2>

          <p className="mt-6 max-w-xl text-sm leading-7 text-white/60">
            Forma parte de una comunidad pensada para quienes quieren crecer,
            emprender y llevar su proyecto al siguiente nivel. Descubre nuevas
            oportunidades, aprende y conecta con personas que comparten tu misma
            visión.
          </p>

          <p className="mt-4 max-w-xl text-sm leading-7 text-white/60">
            Conoce el Club Pablo Ezzeta y descubre todo lo que tiene preparado
            para ti.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="https://pabloezzeta.pe/club/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-black transition-all hover:bg-red-600 hover:text-white"
            >
              Conoce el Club
            </a>

            <PermissionGate permission={PERMISSIONS.subscriptionCreate}>
              <button
                type="button"
                onClick={() => setIsMembershipModalOpen(true)}
                className="inline-flex items-center justify-center rounded-xl border border-white/15 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-white transition-all hover:border-red-600 hover:bg-red-600"
              >
                Benefíciate
              </button>
            </PermissionGate>
          </div>
        </div>
      </div>

      <MembershipModal
        isOpen={isMembershipModalOpen}
        onClose={() => setIsMembershipModalOpen(false)}
      />
    </section>
  );

};