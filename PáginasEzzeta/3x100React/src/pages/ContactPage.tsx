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
      {/* HERO */}
      <section className="relative overflow-hidden rounded-[2rem] bg-black">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-orange-500/10" />
        <div className="relative grid min-h-[390px] lg:grid-cols-[1fr_0.45fr]">
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/45">Atención personalizada</span>
            </div>
            <h1 className="mt-7 max-w-3xl text-5xl font-black uppercase leading-[0.82] tracking-[-0.05em] text-white sm:text-7xl lg:text-8xl">Contacto
              <span className="block text-orange-500">& soporte.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-7 text-white/50 sm:text-base">
              Estamos aquí para ayudarte con tus pedidos, envíos,
              devoluciones, cambios y cualquier inconveniente relacionado
              con tu compra.
            </p>
          </div>
          <div className="relative hidden items-center justify-center lg:flex">
            <div className="flex h-52 w-52 rotate-[-8deg] items-center justify-center border border-orange-500/30">
              <div className="flex h-40 w-40 rotate-[16deg] items-center justify-center border border-white/10">
                <MessageSquare
                  size={42}
                  strokeWidth={1}
                  className="text-orange-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* FAQ */}
      <section className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
        {/* TITULO */}
        <div className="rounded-[2rem] bg-orange-500 p-7 sm:p-10">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/50">Antes de contactarnos</span>
          <h2 className="mt-4 text-4xl font-black uppercase leading-[0.85] tracking-[-0.04em] text-black sm:text-5xl">Preguntas
            <span className="block">frecuentes.</span>
          </h2>
          <p className="mt-6 max-w-sm text-lg leading-6 text-black/60">
            Revisa nuestras respuestas rápidas antes de enviar
            una solicitud.
          </p>
          <div className="mt-10 flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
            <span className="text-lg font-black">?</span>
          </div>
        </div>
        {/* PREGUNTAS */}
        <div className="rounded-[2rem] border border-black/10 bg-white px-6 sm:px-8">
          <div className="divide-y divide-black/10">
            <div className="group py-7">
              <div className="flex gap-5">
                <span className="text-lg font-black text-orange-500">01</span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-5">
                    <h3 className="text-lg font-bold uppercase tracking-wide text-black">¿Cuánto tarda el envío?</h3>
                    <span className="text-xl font-light text-black/30 transition-colors group-hover:text-orange-500">+</span>
                  </div>
                  <p className="mt-3 max-w-xl text-lg leading-6 text-black/50">El tiempo estimado suele ser de 2 a 5 días hábiles.</p>
                </div>
              </div>
            </div>
            <div className="group py-7">
              <div className="flex gap-5">
                <span className="text-lg font-black text-orange-500">02</span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-5">
                    <h3 className="text-lg font-bold uppercase tracking-wide text-black">¿Puedo devolver una prenda?</h3>
                    <span className="text-xl font-light text-black/30 transition-colors group-hover:text-orange-500">+</span>
                  </div>
                  <p className="mt-3 max-w-xl text-lg leading-6 text-black/50">
                    Sí, puedes solicitar devolución dentro de los 14 días
                    posteriores a la entrega.
                  </p>
                </div>
              </div>
            </div>
            <div className="group py-7">
              <div className="flex gap-5">
                <span className="text-lg font-black text-orange-500">03</span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-5">
                    <h3 className="text-lg font-bold uppercase tracking-wide text-black">¿Ofrecen asesoría personalizada?</h3>
                    <span className="text-xl font-light text-black/30 transition-colors group-hover:text-orange-500">+</span>
                  </div>
                  <p className="mt-3 max-w-xl text-lg leading-6 text-black/50">
                    Claro, nuestro equipo puede ayudarte con recomendaciones
                    de estilo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ASISTENCIA */}
      <section className="overflow-hidden rounded-[2rem] border border-black/10 bg-white">
        <div className="grid lg:grid-cols-[0.7fr_1.3fr]">
          {/* PANEL INFORMACIÓN */}
          <div className="relative overflow-hidden bg-[#111111] p-7 text-white sm:p-10 lg:p-12">
            <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
            <div className="relative z-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-black"><MessageSquare size={21} /></div>
              <span className="mt-8 block text-[10px] font-bold uppercase tracking-[0.3em] text-white/35">Soporte</span>
              <h2 className="mt-3 text-4xl font-black uppercase leading-[0.85] tracking-[-0.04em] sm:text-5xl">Cuéntanos
                <span className="block text-orange-500">qué pasó.</span>
              </h2>
              <p className="mt-6 max-w-sm text-lg leading-6 text-white/45">
                Completa el formulario y nuestro equipo revisará
                tu solicitud.
              </p>
              <div className="mt-10 border-t border-white/10 pt-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30">Contacto directo</span>
                <div className="mt-5 space-y-4">
                  <a
                    href="tel:+51929370461"
                    className="flex items-center gap-3 text-lg text-white/65 transition-colors hover:text-orange-500"
                  ><Phone size={15} />+51 929 370 461
                  </a>
                  <a
                    href="mailto:contacto@ezzeta.com"
                    className="flex items-center gap-3 text-lg text-white/65 transition-colors hover:text-orange-500"
                  ><Mail size={15} />contacto@ezzeta.com
                  </a>
                </div>
              </div>
            </div>
          </div>
          {/* FORMULARIO */}
          <div className="bg-[#fafafa] p-7 sm:p-10 lg:p-12">
            {enviado ? (
              <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-500 text-2xl font-black text-black">✓</div>
                <span className="mt-7 text-[10px] font-bold uppercase tracking-[0.3em] text-orange-500">Solicitud recibida</span>
                <h3 className="mt-3 text-3xl font-black uppercase tracking-tight text-black">Todo listo.</h3>
                <p className="mt-4 max-w-md text-lg leading-6 text-black/50">
                  Hemos recibido tu solicitud. Nuestro equipo la revisará
                  y se pondrá en contacto contigo.
                </p>
                <button
                  type="button"
                  onClick={() => setEnviado(false)}
                  className="mt-8 rounded-xl bg-black px-7 py-4 text-lg font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-orange-500 hover:text-black"
                >Enviar otra solicitud
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="mb-8 border-b border-black/10 pb-6">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-500">Formulario de asistencia</span>
                  <h3 className="mt-2 text-2xl font-black uppercase tracking-tight text-black">Envíanos un mensaje</h3>
                </div>
                {/* MOTIVO */}
                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-black/45">Motivo
                    <b className="ml-1 text-orange-500">*</b>
                  </span>
                  <select
                    value={tipo}
                    onChange={(event) =>
                      setTipo(event.target.value as TipoSolicitud)
                    }
                    className="w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 text-lg font-medium text-black outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
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
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-black/45">
                      Nombre
                      <b className="ml-1 text-orange-500">*</b>
                    </span>
                    <input
                      value={nombre}
                      onChange={(event) =>
                        setNombre(event.target.value)
                      }
                      placeholder="Tu nombre completo"
                      className="w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 text-lg text-black placeholder:text-black/25 outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-black/45">
                      Correo
                      <b className="ml-1 text-orange-500">*</b>
                    </span>
                    <input
                      type="email"
                      value={correo}
                      onChange={(event) =>
                        setCorreo(event.target.value)
                      }
                      placeholder="ejemplo@mail.com"
                      className="w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 text-lg text-black placeholder:text-black/25 outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
                    />
                  </label>
                </div>
                {/* PEDIDO + TELÉFONO */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-black/45">N.º de pedido
                    </span>
                    <input
                      value={pedido}
                      onChange={(event) =>
                        setPedido(event.target.value)
                      }
                      placeholder="PED-000123"
                      className="w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 text-lg text-black placeholder:text-black/25 outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-black/45">Teléfono
                      <b className="ml-1 text-orange-500">*</b>
                    </span>
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(event) =>
                        setTelefono(event.target.value)
                      }
                      placeholder="+51 9XXXXXXXX"
                      className="w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 text-lg text-black placeholder:text-black/25 outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
                    />
                  </label>
                </div>
                {/* MENSAJE */}
                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-black/45">Describe tu problema o queja
                    <b className="ml-1 text-orange-500">*</b>
                  </span>
                  <textarea
                    value={mensaje}
                    onChange={(event) =>
                      setMensaje(event.target.value)
                    }
                    placeholder="Cuéntanos qué ocurrió..."
                    rows={5}
                    className="w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3.5 text-lg leading-6 text-black placeholder:text-black/25 outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
                  />
                </label>
                {/* ERROR */}
                {error && (
                  <div className="rounded-xl border border-orange-500/20 bg-orange-50 px-4 py-3 text-lg text-orange-700">
                    {error}
                  </div>
                )}
                {/* BOTÓN */}
                <button
                  type="button"
                  onClick={enviarSolicitud}
                  className="group flex w-full items-center justify-center gap-3 rounded-xl bg-black px-6 py-4 text-lg font-bold uppercase tracking-[0.18em] text-white transition-all hover:bg-orange-500 hover:text-black"
                >
                  <Send
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />Enviar solicitud
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
      {/* CLUB EZZETA */}
      <section className="overflow-hidden rounded-[2rem] bg-orange-500">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          {/* IMAGEN */}
          <div className="relative min-h-[330px] overflow-hidden lg:min-h-[460px]">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSLD4p6JsvnptTssw8sGuAllRLWUs5em7lVEnf1EtDHmrzq030NOzhEsA&s=10"
              alt="Emprende con nosotros"
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute bottom-8 left-8 sm:bottom-10 sm:left-10">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">Club Pablo Ezzeta</span>
              <h3 className="mt-3 text-4xl font-black uppercase leading-[0.85] tracking-[-0.04em] text-white sm:text-6xl">Crea.
                <span className="block text-orange-500">Crece.</span>
              </h3>
            </div>
          </div>
          {/* CONTENIDO */}
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/45">Emprende con nosotros</span>
            <h2 className="mt-4 max-w-lg text-3xl font-black uppercase leading-[0.88] tracking-[-0.04em] text-black sm:text-5xl">¿Quieres ser como
              <span className="block text-white">Pablo Ezzeta?</span>
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-7 text-black/65">
              Forma parte de una comunidad pensada para quienes quieren
              crecer, emprender y llevar su proyecto al siguiente nivel.
              Descubre nuevas oportunidades, aprende y conecta con personas
              que comparten tu misma visión.
            </p>
            <p className="mt-4 max-w-xl text-lg leading-7 text-black/65">
              Conoce el Club Pablo Ezzeta y descubre todo lo que tiene
              preparado para ti.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="https://pabloezzeta.pe/club/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-black px-7 py-4 text-lg font-bold uppercase tracking-[0.18em] text-white transition-all hover:bg-white hover:text-black"
              >Conoce el Club
              </a>
              <PermissionGate permission={PERMISSIONS.subscriptionCreate}>
                <button
                  type="button"
                  onClick={() => setIsMembershipModalOpen(true)}
                  className="inline-flex items-center justify-center rounded-xl border border-black/30 px-7 py-4 text-lg font-bold uppercase tracking-[0.18em] text-black transition-all bg-white hover:bg-red-500 hover:text-white"
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