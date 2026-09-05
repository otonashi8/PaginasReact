import { useEffect, useState } from 'react';
import { Mail, Phone, Send, MessageSquare, ArrowUpRight } from 'lucide-react';
import { crearSolicitudAsistencia, type TipoSolicitudAsistencia } from '../admin/Clientes/Formularios/utils/solicitudesAsistencia';
import { useAuth } from '../context/AuthContext';
import { useContacto } from '../admin/Sistema/contacto/contactoService';

type TipoSolicitud = TipoSolicitudAsistencia;

export const ContactPage = () => {
  const { user: authUser, isAuthenticated } = useAuth();
    const contacto = useContacto();
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
    <div className="w-full bg-zinc-50">
        {/* HERO */}
        <section className="relative overflow-hidden bg-zinc-950">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-red-600/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-red-600/5 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
            <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
            <div className="max-w-3xl">
                <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-9 bg-red-500" />
                <p className="text-[15px] font-semibold uppercase tracking-[0.3em] text-red-500">Atención personalizada</p>
                </div>
                <h1 className="max-w-2xl text-3xl font-semibold uppercase leading-[1.08] tracking-[0.04em] text-white sm:text-5xl">Estamos aquí para ayudarte</h1>
                <p className="mt-5 max-w-xl text-md leading-7 text-white/80 sm:text-[15px]">Resolvemos tus dudas sobre pedidos, envíos, cambios, devoluciones y cualquier inconveniente relacionado con tu compra.</p>
            </div>

            <div className="grid grid-cols-2 border border-white/40 bg-white/[0.04] sm:min-w-[320px]">
                <a
                href={`https://wa.me/${contacto.telefono.replace(/\D/g, '')}?text=${encodeURIComponent('Hola, necesito ayuda desde Ezzeta.')}`}
                className="group border-r border-white/40 p-4 transition-colors hover:bg-red-600"
                >
                <Phone size={18} className="text-red-500 transition-colors group-hover:text-white"/>
                <p className="mt-5 text-md font-semibold uppercase tracking-[0.15em] text-white/70 group-hover:text-white/70">Llámanos</p>
                <p className="mt-1 text-sm text-white">Atención directa</p>
                </a>
                <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contacto.email)}`}
                className="group p-4 transition-colors hover:bg-red-600"
                >
                <Mail size={18} className="text-red-500 transition-colors group-hover:text-white"/>
                <p className="mt-5 text-md font-semibold uppercase tracking-[0.15em] text-white/70 group-hover:text-white/70">Escríbenos</p>
                <p className="mt-1 truncate text-sm text-white">Responderemos pronto</p>
                </a>
            </div>
            </div>
        </div>
        </section>
        {/* CONTENIDO PRINCIPAL */}
        <section className="mx-auto max-w-9xl px-5 py-8 sm:px-8 lg:py-12">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            {/* FAQ */}
            <div className="border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 px-5 py-5 sm:px-6">
                <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-red-600">Respuestas rápidas</p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-950">Preguntas frecuentes</h2>
                </div>
                <span className="text-[10px] font-semibold tracking-[0.2em] text-zinc-300">FAQ</span>
                </div>
            </div>
            <div className="divide-y divide-zinc-100">
                <div className="group px-5 py-5 transition-colors hover:bg-zinc-950 sm:px-6">
                <div className="flex gap-4">
                    <span className="text-[11px] font-semibold text-red-500">01</span>
                    <div>
                    <p className="text-sm font-semibold text-zinc-950 transition-colors group-hover:text-white">¿Cuánto tarda el envío?</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-500 transition-colors group-hover:text-white/70">El tiempo estimado suele ser de 2 a 5 días hábiles.</p>
                    </div>
                </div>
                </div>
                <div className="group px-5 py-5 transition-colors hover:bg-zinc-950 sm:px-6">
                <div className="flex gap-4">
                    <span className="text-[11px] font-semibold text-red-500">02</span>
                    <div>
                    <p className="text-sm font-semibold text-zinc-950 transition-colors group-hover:text-white">¿Puedo devolver una prenda?</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-500 transition-colors group-hover:text-white/70">Sí, puedes solicitar devolución dentro de los 14 días posteriores a la entrega.</p>
                    </div>
                </div>
                </div>
                <div className="group px-5 py-5 transition-colors hover:bg-zinc-950 sm:px-6">
                <div className="flex gap-4">
                    <span className="text-[11px] font-semibold text-red-500">03</span>
                    <div>
                    <p className="text-sm font-semibold text-zinc-950 transition-colors group-hover:text-white">¿Ofrecen asesoría personalizada?</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-500 transition-colors group-hover:text-white/70">Claro, nuestro equipo puede ayudarte con recomendaciones de estilo.</p>
                    </div>
                </div>
                </div>
            </div>
            <div className="border-t border-zinc-200 bg-zinc-50 px-5 py-4 sm:px-6">
                <p className="text-sm leading-5 text-zinc-500">¿No encuentras lo que buscas? Envíanos tu consulta y te ayudaremos personalmente.</p>
            </div>
            </div>
            {/* FORMULARIO */}
            <div className="border border-zinc-200 bg-white">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-zinc-950 text-white"><MessageSquare size={18} strokeWidth={1.8} /></div>
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-red-600">Atención directa</p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-950">Envíanos tu solicitud</h2>
                </div>
                </div>
                <span className="hidden text-[10px] uppercase tracking-[0.2em] text-zinc-400 sm:block">Soporte</span>
            </div>
            {enviado ? (
                <div className="flex min-h-[460px] items-center justify-center px-6 py-12">
                <div className="max-w-md text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center border border-emerald-200 bg-emerald-50 text-2xl text-emerald-600">✓</div>
                    <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-600">Solicitud registrada</p>
                    <h3 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">Solicitud enviada correctamente</h3>
                    <p className="mt-4 text-sm leading-6 text-zinc-500">Hemos recibido tu solicitud. Nuestro equipo la revisará y se pondrá en contacto contigo.</p>
                    <button
                    type="button"
                    onClick={() => setEnviado(false)}
                    className="mt-7 inline-flex h-10 items-center justify-center border border-zinc-950 bg-zinc-950 px-6 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:border-red-600 hover:bg-red-600"
                    >Enviar otra solicitud
                    </button>
                </div>
                </div>
            ) : (
                <div className="space-y-5 p-5 sm:p-6">
                {/* MOTIVO */}
                <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-zinc-800">Motivo de la solicitud
                    <b className="ml-1 text-red-600">*</b>
                    </span>
                    <select
                    value={tipo}
                    onChange={(event) =>
                        setTipo(event.target.value as TipoSolicitud)
                    }className="h-10 w-full border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-950"
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
                    <span className="mb-2 block text-sm font-semibold text-zinc-800">Nombre
                        <b className="ml-1 text-red-600">*</b>
                    </span>
                    <input
                        value={nombre}
                        onChange={(event) => setNombre(event.target.value)}
                        placeholder="Tu nombre completo"
                        className="h-10 w-full border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
                    />
                    </label>
                    <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-zinc-800">Correo
                        <b className="ml-1 text-red-600">*</b>
                    </span>
                    <input
                        type="email"
                        value={correo}
                        onChange={(event) => setCorreo(event.target.value)}
                        placeholder="ejemplo@mail.com"
                        className="h-10 w-full border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
                    />
                    </label>
                </div>
                {/* PEDIDO + TELÉFONO */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-zinc-800">N.º de pedido</span>
                    <input
                        value={pedido}
                        onChange={(event) => setPedido(event.target.value)}
                        placeholder="Ej. PED-000123"
                        className="h-10 w-full border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
                    />
                    </label>
                    <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-zinc-800">Teléfono
                        <b className="ml-1 text-red-600">*</b>
                    </span>
                    <input
                        type="tel"
                        value={telefono}
                        onChange={(event) => setTelefono(event.target.value)}
                        placeholder="+51 9XXXXXXXX"
                        className="h-10 w-full border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
                    />
                    </label>
                </div>
                {/* MENSAJE */}
                <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-zinc-800">Describe tu problema o queja
                    <b className="ml-1 text-red-600">*</b>
                    </span>
                    <textarea
                    value={mensaje}
                    onChange={(event) => setMensaje(event.target.value)}
                    placeholder="Cuéntanos qué ocurrió..."
                    rows={4}
                    className="w-full resize-none border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
                    />
                </label>
                {error && (
                    <div className="flex items-start gap-2 border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                    <span className="font-bold">!</span>
                    <span>{error}</span>
                    </div>
                )}
                <button
                    type="button"
                    onClick={enviarSolicitud}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 border border-zinc-950 bg-zinc-950 px-5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:border-red-600 hover:bg-red-600"
                ><Send size={15} />Enviar solicitud
                </button>

                <div className="grid gap-2 border-t border-zinc-100 pt-4 sm:grid-cols-2">
                    <a
                    href={`https://wa.me/${contacto.telefono.replace(/\D/g, '')}?text=${encodeURIComponent('Hola, necesito ayuda desde Ezzeta.')}`}
                    className="inline-flex h-10 items-center justify-center gap-2 border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950"
                    ><Phone size={15} />{contacto.telefono}
                    </a>
                    <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contacto.email)}`}
                    className="inline-flex h-10 items-center justify-center gap-2 border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950"
                    ><Mail size={15} />{contacto.email}
                    </a>
                </div>
                </div>
            )}
            </div>
        </div>
        </section>
        {/* BANNER COMUNIDAD */}
        <section className="mx-auto max-w-9xl px-5 pb-10 sm:px-8 lg:pb-14">
        <div className="grid overflow-hidden border border-zinc-200 bg-white lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative min-h-[300px] overflow-hidden bg-zinc-900 lg:min-h-[380px]">
            <img
                src="src/assets/crecenosotros.png"
                alt="Emprende con nosotros"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-black/50" />
            <div className="absolute left-6 top-6 flex items-center gap-3">
                <span className="h-px w-8 bg-red-500" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/70">Comunidad Ezzeta</p>
            </div>
            <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8">
                <p className="max-w-sm text-2xl font-semibold uppercase leading-tight tracking-[0.04em] text-white sm:text-3xl">Crece con nosotros</p>
                <p className="mt-3 text-sm uppercase tracking-[0.15em] text-white/50">Conecta · Aprende · Emprende</p>
            </div>
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-red-600">Emprende con nosotros</p>
            <h2 className="mt-3 max-w-lg text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">¿Quieres ser como Pablo Ezzeta?</h2>
            <div className="mt-5 max-w-xl space-y-3 text-sm leading-6 text-zinc-500">
                <p>Forma parte de una comunidad pensada para quienes quieren crecer, emprender y llevar su proyecto al siguiente nivel.</p>
                <p>Conoce el Club Pablo Ezzeta, descubre nuevas oportunidades, aprende y conecta con personas que comparten tu misma visión.</p>
            </div>
            <a
                href="https://pabloezzeta.pe/club/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex h-11 w-full items-center justify-center gap-2 border border-zinc-950 bg-zinc-950 px-5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:border-red-600 hover:bg-red-600 sm:w-fit"
            >Conoce el Club<ArrowUpRight size={15} />
            </a>
            </div>
        </div>
        </section>
    </div>
    );
};