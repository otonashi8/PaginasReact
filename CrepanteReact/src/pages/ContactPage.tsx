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
    <section className="space-y-8 sm:space-y-12">
      {/* HERO CONTACTO */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-[#111111] text-white">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-red-600/20 blur-3xl" />
        <div className="relative z-10 grid min-h-[420px] lg:grid-cols-[1.3fr_0.7fr]">
          <div className="flex flex-col justify-between p-7 sm:p-10 lg:p-14">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-8 bg-red-600" />
                <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/50">Servicio al cliente</span>
              </div>
              <h1 className="mt-8 max-w-3xl text-5xl font-black uppercase leading-[0.82] tracking-[-0.05em] sm:text-7xl lg:text-8xl">Estamos
                <span className="block text-red-600">aquí.</span>
              </h1>
            </div>
            <p className="mt-10 max-w-lg text-md leading-7 text-white/55 sm:text-base">
              ¿Tienes alguna duda, problema con tu pedido o necesitas
              asistencia? Escríbenos y nuestro equipo te ayudará.
            </p>
          </div>
          <div className="relative hidden items-end justify-end p-10 lg:flex">
            <div className="rotate-90 text-[100px] font-black uppercase leading-none tracking-[-0.08em] text-white/[0.035]">CONTACT</div>
          </div>
        </div>
      </section>
      {/* FAQ*/}
      <section className="rounded-[2.5rem] bg-[#f3f1ed] p-6 sm:p-10 lg:p-14">
        <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-600">Antes de escribirnos</span>
            <h2 className="mt-3 text-4xl font-black uppercase leading-[0.9] tracking-[-0.04em] text-black sm:text-5xl">Preguntas
              <span className="block">frecuentes.</span>
            </h2>
            <p className="mt-5 max-w-sm text-md leading-6 text-black/50">Quizá podamos resolver tu consulta de inmediato.</p>
          </div>
          <div className="border-t border-black">
            <div className="group border-b border-black/15 py-6 sm:py-7">
              <div className="flex items-start justify-between gap-5">
                <div className="flex gap-5">
                  <span className="text-[10px] font-bold text-red-600">01</span>
                  <div>
                    <h3 className="text-md font-bold uppercase tracking-wide text-black">¿Cuánto tarda el envío?</h3>
                    <p className="mt-3 max-w-xl text-md leading-6 text-black/50">
                      El tiempo estimado suele ser de 2 a 5 días hábiles.
                    </p>
                  </div>
                </div>
                <span className="text-xl font-light text-black/30">+</span>
              </div>
            </div>
            <div className="group border-b border-black/15 py-6 sm:py-7">
              <div className="flex items-start justify-between gap-5">
                <div className="flex gap-5">
                  <span className="text-[10px] font-bold text-red-600">02</span>
                  <div>
                    <h3 className="text-md font-bold uppercase tracking-wide text-black">¿Puedo devolver una prenda?</h3>
                    <p className="mt-3 max-w-xl text-md leading-6 text-black/50">
                      Sí, puedes solicitar devolución dentro de los 14 días
                      posteriores a la entrega.
                    </p>
                  </div>
                </div>
                <span className="text-xl font-light text-black/30">+</span>
              </div>
            </div>
            <div className="border-b border-black/15 py-6 sm:py-7">
              <div className="flex items-start justify-between gap-5">
                <div className="flex gap-5">
                  <span className="text-[10px] font-bold text-red-600">03</span>
                  <div>
                    <h3 className="text-md font-bold uppercase tracking-wide text-black">¿Ofrecen asesoría personalizada?</h3>
                    <p className="mt-3 max-w-xl text-md leading-6 text-black/50">Claro, nuestro equipo puede ayudarte con recomendaciones de estilo.</p>
                  </div>
                </div>
                <span className="text-xl font-light text-black/30">+</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ASISTENCIA */}
      <section className="overflow-hidden rounded-[2.5rem] bg-black">
        <div className="grid lg:grid-cols-[0.7fr_1.3fr]">
          {/* INFORMACIÓN */}
          <div className="flex flex-col justify-between p-7 text-white sm:p-10 lg:p-14">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600"><MessageSquare size={21} /></div>
              <span className="mt-8 block text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Atención personalizada</span>
              <h2 className="mt-3 text-4xl font-black uppercase leading-[0.9] tracking-[-0.04em] sm:text-5xl">Cuéntanos
                <span className="block text-red-600">qué pasó.</span>
              </h2>
              <p className="mt-6 max-w-sm text-md leading-6 text-white/45">Completa el formulario y nuestro equipo revisará tu solicitud.</p>
            </div>
            <div className="mt-10 border-t border-white/10 pt-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30">Contacto directo</p>
              <div className="mt-4 space-y-3">
                <a
                  href="tel:+51929370461"
                  className="flex items-center gap-3 text-md text-white/70 transition-colors hover:text-red-600"
                ><Phone size={15} />+51 929 370 461
                </a>
                <a
                  href="mailto:contacto@ezzeta.com"
                  className="flex items-center gap-3 text-md text-white/70 transition-colors hover:text-red-600"
                ><Mail size={15} />contacto@ezzeta.com
                </a>
              </div>
            </div>
          </div>
          {/* FORMULARIO */}
          <div className="bg-white p-7 sm:p-10 lg:p-14">
            {enviado ? (
              <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black text-2xl text-white">✓</div>
                <span className="mt-7 text-[10px] font-bold uppercase tracking-[0.3em] text-red-600">Todo listo</span>
                <h3 className="mt-3 text-3xl font-black uppercase tracking-tight text-black">Solicitud enviada</h3>
                <p className="mt-4 max-w-md text-md leading-6 text-black/50">
                  Hemos recibido tu solicitud. Nuestro equipo la revisará
                  y se pondrá en contacto contigo.
                </p>
                <button
                  type="button"
                  onClick={() => setEnviado(false)}
                  className="mt-8 bg-black px-7 py-4 text-md font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-red-600"
                >Nueva solicitud
                </button>
              </div>
            ) : (
              <div className="space-y-7">
                {/* TIPO */}
                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">Motivo
                    <b className="ml-1 text-red-600">*</b>
                  </span>
                  <select
                    value={tipo}
                    onChange={(event) =>
                      setTipo(event.target.value as TipoSolicitud)
                    }
                    className="w-full rounded-xl border border-black/10 bg-[#f7f7f7] px-4 py-4 text-md font-medium text-black outline-none transition-all focus:border-red-600 focus:ring-2 focus:ring-red-600/10"
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
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">Nombre
                      <b className="ml-1 text-red-600">*</b>
                    </span>
                    <input
                      value={nombre}
                      onChange={(event) =>
                        setNombre(event.target.value)
                      }
                      placeholder="Tu nombre completo"
                      className="w-full rounded-xl border border-black/10 bg-[#f7f7f7] px-4 py-4 text-md text-black placeholder:text-black/25 outline-none transition-all focus:border-red-600 focus:ring-2 focus:ring-red-600/10"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">Correo
                      <b className="ml-1 text-red-600">*</b>
                    </span>
                    <input
                      type="email"
                      value={correo}
                      onChange={(event) =>
                        setCorreo(event.target.value)
                      }
                      placeholder="ejemplo@mail.com"
                      className="w-full rounded-xl border border-black/10 bg-[#f7f7f7] px-4 py-4 text-md text-black placeholder:text-black/25 outline-none transition-all focus:border-red-600 focus:ring-2 focus:ring-red-600/10"
                    />
                  </label>
                </div>
                {/* PEDIDO + TELÉFONO */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">N.º de pedido</span>
                    <input
                      value={pedido}
                      onChange={(event) =>
                        setPedido(event.target.value)
                      }
                      placeholder="PED-000123"
                      className="w-full rounded-xl border border-black/10 bg-[#f7f7f7] px-4 py-4 text-md text-black placeholder:text-black/25 outline-none transition-all focus:border-red-600 focus:ring-2 focus:ring-red-600/10"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">Teléfono
                      <b className="ml-1 text-red-600">*</b>
                    </span>
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(event) =>
                        setTelefono(event.target.value)
                      }
                      placeholder="+51 9XXXXXXXX"
                      className="w-full rounded-xl border border-black/10 bg-[#f7f7f7] px-4 py-4 text-md text-black placeholder:text-black/25 outline-none transition-all focus:border-red-600 focus:ring-2 focus:ring-red-600/10"
                    />
                  </label>
                </div>
                {/* MENSAJE */}
                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">Describe tu problema o queja
                    <b className="ml-1 text-red-600">*</b>
                  </span>
                  <textarea
                    value={mensaje}
                    onChange={(event) =>
                      setMensaje(event.target.value)
                    }
                    placeholder="Cuéntanos qué ocurrió..."
                    rows={6}
                    className="w-full resize-none rounded-xl border border-black/10 bg-[#f7f7f7] px-4 py-4 text-md leading-6 text-black placeholder:text-black/25 outline-none transition-all focus:border-red-600 focus:ring-2 focus:ring-red-600/10"
                  />
                </label>
                {/* ERROR */}
                {error && (
                  <div className="flex items-center gap-3 rounded-xl border border-red-600/15 bg-red-50 px-4 py-3 text-md text-red-700">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">!</span>
                    {error}
                  </div>
                )}
                {/* ENVIAR */}
                <button
                  type="button"
                  onClick={enviarSolicitud}
                  className="group flex w-full items-center justify-center gap-3 rounded-xl bg-black px-6 py-4 text-md font-bold uppercase tracking-[0.18em] text-white transition-all hover:bg-red-600"
                >Enviar solicitud
                  <Send
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
      {/* CLUB EZZETA */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-red-600 text-white">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-black/10 blur-3xl" />
        <div className="relative grid lg:grid-cols-[1fr_0.8fr]">
          {/* IMAGEN */}
          <div className="relative min-h-[350px] overflow-hidden lg:min-h-[450px]">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTU1agQ0JWH1FRSXAzg8c0EJ0q-w1lNc4P3IQQRrLw5lj_lD3Zl020i5S7A&s=10"
              alt="Emprende con nosotros"
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute bottom-8 left-8 sm:bottom-10 sm:left-10">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">Club Pablo Ezzeta</span>

              <p className="mt-3 text-4xl font-black uppercase leading-[0.85] tracking-[-0.04em] sm:text-6xl">Hazlo
                <span className="block text-red-600">posible.</span>
              </p>
            </div>
          </div>
          {/* TEXTO */}
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">Emprende con nosotros</span>
            <h2 className="mt-4 text-3xl font-black uppercase leading-[0.9] tracking-tight sm:text-5xl">
              ¿Quieres ser como
              <span className="block text-black">Pablo Ezzeta?</span>
            </h2>
            <p className="mt-6 text-md leading-7 text-white/80">
              Forma parte de una comunidad pensada para quienes quieren
              crecer, emprender y llevar su proyecto al siguiente nivel.
              Descubre nuevas oportunidades, aprende y conecta con personas
              que comparten tu misma visión.
            </p>
            <p className="mt-4 text-md leading-7 text-white/80">
              Conoce el Club Pablo Ezzeta y descubre todo lo que tiene
              preparado para ti.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="https://pabloezzeta.pe/club/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-black px-7 py-4 text-md font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white hover:text-black"
              >Conoce el Club
              </a>
              <PermissionGate permission={PERMISSIONS.subscriptionCreate}>
                <button
                  type="button"
                  onClick={() => setIsMembershipModalOpen(true)}
                  className="inline-flex items-center justify-center rounded-xl border border-black/30 px-7 py-4 text-md font-bold uppercase tracking-[0.18em] text-black transition-colors hover:bg-black hover:text-white"
                >Benefíciate
                </button>
              </PermissionGate>
            </div>
          </div>
        </div>
      </section>
      <MembershipModal
        isOpen={isMembershipModalOpen}
        onClose={() => setIsMembershipModalOpen(false)}
      />
    </section>
  );
};