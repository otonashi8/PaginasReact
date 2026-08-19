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
    <section className="space-y-16 sm:space-y-20">
      {/* HEADER */}
      <header className="relative border-b border-black/10 pb-10 sm:pb-14">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-red-600" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/45">Atención personalizada</span>
            </div>
            <h1 className="max-w-3xl text-4xl font-black uppercase leading-[0.9] tracking-[-0.04em] text-black sm:text-6xl lg:text-7xl">
              Contacto
              <span className="ml-2 text-red-600">& soporte.</span>
            </h1>
          </div>
          <p className="max-w-md text-lg leading-6 text-black/55 lg:pb-1">
            Estamos aquí para ayudarte con tus pedidos, envíos,
            devoluciones, cambios y cualquier inconveniente relacionado
            con tu compra.
          </p>
        </div>
      </header>
      {/* FAQ */}
      <section>
        <div className="mb-7 flex items-end justify-between border-b border-black pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-600">Preguntas frecuentes</span>
            <h2 className="mt-2 text-2xl font-black uppercase tracking-tight sm:text-3xl">FAQ</h2>
          </div>
          <span className="hidden text-[10px] uppercase tracking-[0.2em] text-black/35 sm:block">03 preguntas</span>
        </div>
        <div className="divide-y divide-black/10 border-b border-black/10">
          <div className="group grid gap-5 py-6 sm:grid-cols-[70px_1fr] sm:py-8">
            <span className="text-lg font-black text-red-600">01</span>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
              <p className="font-bold uppercase tracking-wide text-black">¿Cuánto tarda el envío?</p>
              <p className="max-w-xl text-lg leading-6 text-black/50">El tiempo estimado suele ser de 2 a 5 días hábiles.</p>
            </div>
          </div>
          <div className="group grid gap-5 py-6 sm:grid-cols-[70px_1fr] sm:py-8">
            <span className="text-lg font-black text-red-600">02</span>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
              <p className="font-bold uppercase tracking-wide text-black">¿Puedo devolver una prenda?</p>
              <p className="max-w-xl text-lg leading-6 text-black/50">Sí, puedes solicitar devolución dentro de los 14 días posteriores a la entrega.</p>
            </div>
          </div>
          <div className="group grid gap-5 py-6 sm:grid-cols-[70px_1fr] sm:py-8">
            <span className="text-lg font-black text-red-600">03</span>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
              <p className="font-bold uppercase tracking-wide text-black">¿Ofrecen asesoría personalizada?</p>
              <p className="max-w-xl text-lg leading-6 text-black/50">Claro, nuestro equipo puede ayudarte con recomendaciones de estilo.</p>
            </div>
          </div>
        </div>
      </section>
      {/* ASISTENCIA */}
      <section className="grid gap-10 lg:grid-cols-[0.55fr_1.45fr]">
        {/* INTRO */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
            <MessageSquare size={19} />
          </div>
          <span className="mt-6 block text-[10px] font-bold uppercase tracking-[0.28em] text-red-600">Atención al cliente</span>
          <h2 className="mt-3 text-3xl font-black uppercase leading-[0.95] tracking-tight text-black sm:text-4xl">
            ¿Necesitas
            <span className="block">ayuda?</span>
          </h2>
          <p className="mt-5 max-w-sm text-lg leading-6 text-black/50">Completa el formulario y nuestro equipo revisará tu solicitud lo antes posible.</p>
          <div className="mt-8 border-t border-black/10 pt-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/35">Contacto directo</p>
            <div className="mt-4 space-y-3">
              <a
                href="tel:+51929370461"
                className="group flex items-center gap-3 text-lg font-medium text-black transition-colors hover:text-red-600"
              ><Phone size={15} />+51 929 370 461
              </a>
              <a
                href="mailto:contacto@ezzeta.com"
                className="group flex items-center gap-3 text-lg font-medium text-black transition-colors hover:text-red-600"
              ><Mail size={15} />contacto@ezzeta.com
              </a>
            </div>
          </div>
        </div>
        {/* FORMULARIO */}
        <div className="border-t border-black pt-7 sm:pt-8">
          {enviado ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center border-b border-black/10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-xl text-white">✓</div>
              <h3 className="mt-6 text-2xl font-black uppercase tracking-tight">Solicitud enviada</h3>
              <p className="mt-3 max-w-md text-lg leading-6 text-black/50">
                Hemos recibido tu solicitud correctamente. Nuestro equipo
                la revisará y se pondrá en contacto contigo.
              </p>
              <button
                type="button"
                onClick={() => setEnviado(false)}
                className="mt-7 border-b-2 border-black pb-1 text-lg font-bold uppercase tracking-[0.18em] text-black transition-colors hover:border-red-600 hover:text-red-600"
              >
                Enviar otra solicitud
              </button>
            </div>
          ) : (
            <div className="space-y-7">
              {/* TIPO */}
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-black/50">
                  Motivo de la solicitud
                  <b className="ml-1 text-red-600">*</b>
                </span>
                <select
                  value={tipo}
                  onChange={(event) =>
                    setTipo(event.target.value as TipoSolicitud)
                  }
                  className="w-full border-0 border-b border-black/20 bg-transparent px-0 py-3 text-lg font-medium text-black outline-none transition-colors focus:border-red-600 focus:ring-0"
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
              <div className="grid gap-7 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-black/50">
                    Nombre
                    <b className="ml-1 text-red-600">*</b>
                  </span>
                  <input
                    value={nombre}
                    onChange={(event) =>
                      setNombre(event.target.value)
                    }
                    placeholder="Tu nombre completo"
                    className="w-full border-0 border-b border-black/20 bg-transparent px-0 py-3 text-lg text-black placeholder:text-black/25 outline-none transition-colors focus:border-red-600 focus:ring-0"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-black/50">
                    Correo
                    <b className="ml-1 text-red-600">*</b>
                  </span>
                  <input
                    type="email"
                    value={correo}
                    onChange={(event) =>
                      setCorreo(event.target.value)
                    }
                    placeholder="ejemplo@mail.com"
                    className="w-full border-0 border-b border-black/20 bg-transparent px-0 py-3 text-lg text-black placeholder:text-black/25 outline-none transition-colors focus:border-red-600 focus:ring-0"
                  />
                </label>
              </div>
              {/* PEDIDO + TELEFONO */}
              <div className="grid gap-7 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-black/50">N.º de pedido</span>
                  <input
                    value={pedido}
                    onChange={(event) =>
                      setPedido(event.target.value)
                    }
                    placeholder="PED-000123"
                    className="w-full border-0 border-b border-black/20 bg-transparent px-0 py-3 text-lg text-black placeholder:text-black/25 outline-none transition-colors focus:border-red-600 focus:ring-0"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-black/50">
                    Teléfono
                    <b className="ml-1 text-red-600">*</b>
                  </span>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(event) =>
                      setTelefono(event.target.value)
                    }
                    placeholder="+51 9XXXXXXXX"
                    className="w-full border-0 border-b border-black/20 bg-transparent px-0 py-3 text-lg text-black placeholder:text-black/25 outline-none transition-colors focus:border-red-600 focus:ring-0"
                  />
                </label>
              </div>
              {/* MENSAJE */}
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-black/50">
                  Describe tu problema o queja
                  <b className="ml-1 text-red-600">*</b>
                </span>
                <textarea
                  value={mensaje}
                  onChange={(event) =>
                    setMensaje(event.target.value)
                  }
                  placeholder="Cuéntanos qué ocurrió..."
                  rows={5}
                  className="w-full resize-none border-0 border-b border-black/20 bg-transparent px-0 py-3 text-lg leading-6 text-black placeholder:text-black/25 outline-none transition-colors focus:border-red-600 focus:ring-0"
                />
              </label>
              {error && (
                <div className="border-l-2 border-red-600 bg-red-50 px-4 py-3 text-lg text-red-700">
                  {error}
                </div>
              )}
              {/* BOTON */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={enviarSolicitud}
                  className="group inline-flex w-full items-center justify-center gap-3 bg-black px-7 py-4 text-lg font-bold uppercase tracking-[0.18em] text-white transition-all hover:bg-red-600 sm:w-auto"
                >Enviar solicitud
                  <Send
                    size={15}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
      {/* EMPRENDE CON NOSOTROS */}
      <section className="relative overflow-hidden bg-black">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          {/* IMAGEN */}
          <div className="relative min-h-[320px] overflow-hidden sm:min-h-[430px]">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHle0SgIyxenqvV50xLhtsRNbcYWTdMVzucJTLqXsV15Z2X8uQ1Khv4IFJ&s=10"
              alt="Emprende con nosotros"
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-7 left-7 sm:bottom-10 sm:left-10">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">Pablo Ezzeta</span>
              <p className="mt-2 text-3xl font-black uppercase leading-none tracking-tight text-white sm:text-5xl">
                Inspira.
                <span className="block text-red-600">Emprende.</span>
              </p>
            </div>
          </div>
          {/* CONTENIDO */}
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-600">Emprende con nosotros</span>
            <h2 className="mt-4 text-3xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-4xl">
              ¿Quieres ser como
              <span className="block text-red-600">Pablo Ezzeta?</span>
            </h2>
            <p className="mt-6 text-lg leading-7 text-white/55">
              Forma parte de una comunidad pensada para quienes quieren
              crecer, emprender y llevar su proyecto al siguiente nivel.
              Descubre nuevas oportunidades, aprende y conecta con personas
              que comparten tu misma visión.
            </p>
            <p className="mt-4 text-lg leading-7 text-white/55">
              Conoce el Club Pablo Ezzeta y descubre todo lo que tiene
              preparado para ti.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="https://pabloezzeta.pe/club/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-white px-6 py-4 text-lg font-bold uppercase tracking-[0.18em] text-black transition-colors hover:bg-red-600 hover:text-white"
              >Conoce el Club
              </a>
              <PermissionGate permission={PERMISSIONS.subscriptionCreate}>
                <button
                  type="button"
                  onClick={() => setIsMembershipModalOpen(true)}
                  className="inline-flex items-center justify-center border border-white/20 px-6 py-4 text-lg font-bold uppercase tracking-[0.18em] text-white transition-colors hover:border-red-600 hover:bg-red-600"
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