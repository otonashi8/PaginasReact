import { useEffect, useState } from 'react';
import { Mail, Phone, Send, MessageSquare } from 'lucide-react';
import { crearSolicitudAsistencia, type TipoSolicitudAsistencia } from '../admin/Clientes/Formularios/utils/solicitudesAsistencia';
import { useAuth } from '../context/AuthContext';
import { useContacto } from '../admin/Sistema/contacto/contactoService';

type TipoSolicitud = TipoSolicitudAsistencia;

export const RecommendationsPage = () => {
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
      {/* HERO LEGAL */}
      <section className="relative overflow-hidden bg-zinc-950">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-red-600/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="flex items-end justify-between gap-8">
            <div className="max-w-3xl">
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-9 bg-red-500" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-red-500">Atención y transparencia</p>
              </div>
              <h1 className="text-3xl font-semibold uppercase leading-tight tracking-[0.06em] text-white sm:text-5xl">Libro de reclamaciones virtual</h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/50 sm:text-[15px]">Tu opinión es importante. Registra una queja, reclamo o solicitud y nuestro equipo se encargará de revisarla.</p>
            </div>
            <div className="hidden border-l border-white/10 pl-6 text-right lg:block">
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/30">Documento</p>
              <p className="mt-2 text-sm font-medium text-white">Atención al cliente</p>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-9xl px-5 py-8 sm:px-8 lg:py-12">
        {/* INFORMACIÓN DE EMPRESA */}
        <div className="border border-zinc-200 bg-white">
          <div className="grid gap-0 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="border-b border-zinc-200 bg-zinc-950 p-6 lg:border-b-0 lg:border-r">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-red-500">Información legal</p>
              <h2 className="mt-3 text-xl font-semibold uppercase tracking-[0.08em] text-white">Datos de la empresa</h2>
              <p className="mt-4 max-w-sm text-sm leading-6 text-white/65">Información oficial de la empresa responsable de la atención de tu solicitud.</p>
            </div>
            <div className="grid gap-x-8 gap-y-5 p-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-400">Razón social</p>
                <p className="mt-1 text-sm font-semibold text-zinc-950">EZZETA S.A.C.</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-400">RUC</p>
                <p className="mt-1 text-sm font-semibold text-zinc-950">20601234567</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-400">Sitio web</p>
                <p className="mt-1 text-sm font-semibold text-zinc-950">www.ezzeta.com</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-400">Teléfono</p>
                <a
                  href={`https://wa.me/${contacto.telefono.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-sm font-semibold text-zinc-950 transition-colors hover:text-red-600"
                >{contacto.telefono}
                </a>
              </div>
              <div className="sm:col-span-2">
                <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-400">Correo electrónico</p>
                <a
                  href={`mailto:${contacto.email}`}
                  className="mt-1 block truncate text-sm font-semibold text-zinc-950 transition-colors hover:text-red-600"
                >{contacto.email}
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* FORMULARIO PRINCIPAL */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          {/* COLUMNA INFORMATIVA */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-red-600">Presenta tu solicitud</p>            
            <h2 className="mt-3 text-2xl font-semibold uppercase leading-tight tracking-[0.04em] text-zinc-950 sm:text-3xl">Queremos escucharte</h2>
            <p className="mt-4 text-sm leading-7 text-zinc-500">Completa el formulario con la información necesaria para que podamos atender tu caso de manera adecuada.</p>
            <div className="mt-8 space-y-4 border-t border-zinc-200 pt-6">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-zinc-950 text-sm text-white">01</div>
                <div>
                  <p className="text-sm font-semibold text-zinc-950">Selecciona el motivo</p>
                  <p className="mt-1 text-sm leading-5 text-zinc-500">Indica qué tipo de solicitud deseas registrar.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-zinc-950 text-sm text-white">02</div>
                <div>
                  <p className="text-sm font-semibold text-zinc-950">Completa tus datos</p>
                  <p className="mt-1 text-sm leading-5 text-zinc-500">Déjanos tus datos para poder contactarte.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-zinc-950 text-sm text-white">03</div>
                <div>
                  <p className="text-sm font-semibold text-zinc-950">Describe lo ocurrido</p>
                  <p className="mt-1 text-sm leading-5 text-zinc-500">Explica el problema con el mayor detalle posible.</p>
                </div>
              </div>
            </div>
          </aside>
          {/* FORMULARIO */}
          <div className="border border-zinc-200 bg-white">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-zinc-950 text-white"><MessageSquare size={18} strokeWidth={1.8} /></div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-red-600">Formulario</p>
                  <h2 className="mt-1 text-lg font-semibold text-zinc-950 sm:text-xl">Registrar solicitud</h2>
                </div>
              </div>
              <span className="hidden text-[10px] uppercase tracking-[0.2em] text-zinc-400 sm:block">Campos requeridos *</span>
            </div>
            {enviado ? (
              <div className="flex min-h-[500px] items-center justify-center px-6 py-12">
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
              <div className="space-y-6 p-5 sm:p-7">
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-[10px] font-semibold text-red-600">01</span>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-950">Motivo de la solicitud</p>
                  </div>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-zinc-800">Selecciona una opción
                      <b className="ml-1 text-red-600">*</b>
                    </span>
                    <select
                      value={tipo}
                      onChange={(event) =>
                        setTipo(event.target.value as TipoSolicitud)
                      }className="h-11 w-full border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-950"
                    >
                      <option value="Queja">Queja</option>
                      <option value="Problema con pedido">Problema con pedido</option>
                      <option value="Devolución">Devolución</option>
                      <option value="Cambio">Cambio</option>
                      <option value="Envío">Envío</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </label>
                </div>
                <div className="border-t border-zinc-100 pt-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-[10px] font-semibold text-red-600">02</span>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-950">Datos de contacto</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-zinc-800">Nombre
                        <b className="ml-1 text-red-600">*</b>
                      </span>
                      <input
                        value={nombre}
                        onChange={(event) => setNombre(event.target.value)}
                        placeholder="Tu nombre completo"
                        className="h-11 w-full border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
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
                        className="h-11 w-full border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-zinc-800">N.º de pedido</span>
                      <input
                        value={pedido}
                        onChange={(event) => setPedido(event.target.value)}
                        placeholder="Ej. PED-000123"
                        className="h-11 w-full border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
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
                        className="h-11 w-full border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
                      />
                    </label>
                  </div>
                </div>
                <div className="border-t border-zinc-100 pt-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-[10px] font-semibold text-red-600">03</span>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-950">Detalle de la solicitud</p>
                  </div>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-zinc-800">Describe tu problema o queja
                      <b className="ml-1 text-red-600">*</b>
                    </span>
                    <textarea
                      value={mensaje}
                      onChange={(event) => setMensaje(event.target.value)}
                      placeholder="Cuéntanos qué ocurrió..."
                      rows={5}
                      className="w-full resize-none border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
                    />
                  </label>
                </div>
                {error && (
                  <div className="flex items-start gap-2 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
                <div className="grid gap-3 border-t border-zinc-100 pt-5 sm:grid-cols-2">
                  <a
                    href={`https://wa.me/${contacto.telefono.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 border border-zinc-200 px-4 py-3 transition hover:border-red-600"
                  ><Phone size={17} className="text-zinc-500 transition-colors group-hover:text-red-600"/>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-400">WhatsApp</p>
                      <p className="truncate text-sm font-medium text-zinc-800">{contacto.telefono}</p>
                    </div>
                  </a>
                  <a
                    href={`mailto:${contacto.email}`}
                    className="group flex items-center gap-3 border border-zinc-200 px-4 py-3 transition hover:border-red-600"
                  >
                    <Mail size={17} className="text-zinc-500 transition-colors group-hover:text-red-600"/>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-400">Correo electrónico</p>
                      <p className="truncate text-sm font-medium text-zinc-800">{contacto.email}</p>
                    </div>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
