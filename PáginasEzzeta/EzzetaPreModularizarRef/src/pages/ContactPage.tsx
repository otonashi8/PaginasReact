import { useEffect, useState } from 'react';
import { Mail, Phone, Send, MessageSquare } from 'lucide-react';
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
    <div className="mx-auto w-full max-w-7xl">
      <section className="space-y-6 sm:space-y-8">
        {/* HEADER */}
        <div className="border-b border-zinc-200 pb-6 sm:pb-8">
            <div className="max-w-3xl">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-500">Atención personalizada</p>
                <h1 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-950 sm:text-3xl lg:text-4xl">Contacto y soporte</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-[15px]">
                    Estamos aquí para ayudarte con tus pedidos, envíos,
                    devoluciones, cambios y cualquier inconveniente relacionado
                    con tu compra.
                </p>
            </div>
        </div>

      {/* FAQ + ASISTENCIA */}
      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          {/* FAQ */}
          <div className="border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 px-5 py-4 sm:px-6">
                  <div className="flex items-center justify-between gap-4">
                      <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Soporte</p>
                          <h2 className="mt-1 text-lg font-semibold tracking-tight text-zinc-950">Preguntas frecuentes</h2>
                      </div>
                      <span className="hidden text-[10px] uppercase tracking-[0.18em] text-zinc-400 sm:block">FAQ</span>
                  </div>
              </div>

              <div className="divide-y divide-zinc-100">
                  <div className="px-5 py-5 transition-colors hover:bg-zinc-50 sm:px-6">
                      <div className="flex gap-4">
                          <span className="text-xs font-semibold text-zinc-300">01</span>
                          <div>
                              <p className="text-sm font-semibold text-zinc-950">¿Cuánto tarda el envío?</p>
                              <p className="mt-1.5 text-sm leading-5 text-zinc-500">El tiempo estimado suele ser de 2 a 5 días hábiles.</p>
                          </div>
                      </div>
                  </div>

                  <div className="px-5 py-5 transition-colors hover:bg-zinc-50 sm:px-6">
                      <div className="flex gap-4">
                          <span className="text-xs font-semibold text-zinc-300">02</span>
                          <div>
                              <p className="text-sm font-semibold text-zinc-950">¿Puedo devolver una prenda?</p>
                              <p className="mt-1.5 text-sm leading-5 text-zinc-500">Sí, puedes solicitar devolución dentro de los 14 días posteriores a la entrega.</p>
                          </div>
                      </div>
                  </div>
                  <div className="px-5 py-5 transition-colors hover:bg-zinc-50 sm:px-6">
                      <div className="flex gap-4">
                          <span className="text-xs font-semibold text-zinc-300">03</span>
                          <div>
                              <p className="text-sm font-semibold text-zinc-950">¿Ofrecen asesoría personalizada?</p>
                              <p className="mt-1.5 text-sm leading-5 text-zinc-500">Claro, nuestro equipo puede ayudarte con recomendaciones de estilo.</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          {/* ASISTENCIA */}
          <div className="border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center bg-zinc-950 text-white"><MessageSquare size={17} strokeWidth={1.8} /></div>
                      <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Atención directa</p>
                          <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-zinc-950">Asistencia</h2>
                      </div>
                  </div>
              </div>
              {enviado ? (
                  <div className="flex min-h-[420px] items-center justify-center px-5 py-10 sm:px-8">
                      <div className="max-w-md text-center">
                          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">✓</div>
                          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-600">Solicitud registrada</p>
                          <h3 className="mt-2 text-xl font-semibold tracking-tight text-zinc-950">Solicitud enviada correctamente</h3>
                          <p className="mt-3 text-sm leading-6 text-zinc-500">Hemos recibido tu solicitud. Nuestro equipo la revisará y se pondrá en contacto contigo.</p>
                          <button
                              type="button"
                              onClick={() => setEnviado(false)}
                              className="mt-6 border border-zinc-900 bg-zinc-950 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-red-600 hover:border-red-600"
                          >Enviar otra solicitud
                          </button>
                      </div>
                  </div>
              ) : (
                  <div className="space-y-4 p-5 sm:p-6">
                      <label className="block">
                          <span className="mb-1.5 block text-xs font-semibold text-zinc-800">
                              Motivo de la solicitud
                              <b className="ml-1 text-red-600">*</b>
                          </span>

                          <select
                              value={tipo}
                              onChange={(event) =>
                                  setTipo(event.target.value as TipoSolicitud)
                              }
                              className="h-10 w-full border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-900"
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
                              <span className="mb-1.5 block text-xs font-semibold text-zinc-800">
                                  Nombre
                                  <b className="ml-1 text-red-600">*</b>
                              </span>
                              <input
                                  value={nombre}
                                  onChange={(event) =>
                                      setNombre(event.target.value)
                                  }
                                  placeholder="Tu nombre completo"
                                  className="h-10 w-full border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 transition focus:border-zinc-900"
                              />
                          </label>
                          <label className="block">
                              <span className="mb-1.5 block text-xs font-semibold text-zinc-800">
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
                                  className="h-10 w-full border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 transition focus:border-zinc-900"
                              />
                          </label>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                          <label className="block">
                              <span className="mb-1.5 block text-xs font-semibold text-zinc-800">N.º de pedido</span>
                              <input
                                  value={pedido}
                                  onChange={(event) =>
                                      setPedido(event.target.value)
                                  }
                                  placeholder="Ej. PED-000123"
                                  className="h-10 w-full border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 transition focus:border-zinc-900"
                              />
                          </label>
                          <label className="block">
                              <span className="mb-1.5 block text-xs font-semibold text-zinc-800">
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
                                  className="h-10 w-full border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 transition focus:border-zinc-900"
                              />
                          </label>
                      </div>
                      <label className="block">
                          <span className="mb-1.5 block text-xs font-semibold text-zinc-800">
                              Describe tu problema o queja
                              <b className="ml-1 text-red-600">*</b>
                          </span>
                          <textarea
                              value={mensaje}
                              onChange={(event) =>
                                  setMensaje(event.target.value)
                              }
                              placeholder="Cuéntanos qué ocurrió..."
                              rows={4}
                              className="w-full resize-none border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 transition focus:border-zinc-900"
                          />
                      </label>
                      {error && (
                          <div className="border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
                              {error}
                          </div>
                      )}
                      <button
                          type="button"
                          onClick={enviarSolicitud}
                          className="inline-flex h-10 w-full items-center justify-center gap-2 border border-zinc-950 bg-zinc-950 px-5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:border-red-600 hover:bg-red-600"
                      ><Send size={15} />Enviar solicitud
                      </button>
                      <div className="grid gap-2 pt-1 sm:grid-cols-2">
                          <a
                              href={`tel:${contacto.telefono.replace(/\D/g, '')}`}
                              className="inline-flex h-10 items-center justify-center gap-2 border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-950"
                          ><Phone size={15} />{contacto.telefono}
                          </a>
                          <a
                              href={`mailto:${contacto.email}`}
                              className="inline-flex h-10 items-center justify-center gap-2 border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-950"
                          ><Mail size={15} />{contacto.email}
                          </a>
                      </div>
                  </div>
              )}
          </div>
      </div>
      <div className="grid overflow-hidden border border-zinc-200 bg-white lg:grid-cols-2">
          <div className="relative min-h-[280px] overflow-hidden bg-zinc-100 lg:min-h-[360px]">
              <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTU1agQ0JWH1FRSXAzg8c0EJ0q-w1lNc4P3IQQRrLw5lj_lD3Zl020i5S7A&s=10"
                  alt="Emprende con nosotros"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-5 left-5 sm:bottom-7 sm:left-7">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/70">Comunidad</p>
                  <p className="mt-1 text-xl font-semibold tracking-tight text-white">Crece con nosotros.</p>
              </div>
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-400">Emprende con nosotros</p>
              <h2 className="mt-3 max-w-lg text-2xl font-semibold tracking-[-0.03em] text-zinc-950 sm:text-3xl">¿Quieres ser como Pablo Ezzeta?</h2>
              <div className="mt-4 max-w-xl space-y-3 text-sm leading-6 text-zinc-500">
                  <p>Forma parte de una comunidad pensada para quienes quieren crecer, emprender y llevar su proyecto al siguiente nivel.</p>
                  <p>Conoce el Club Pablo Ezzeta y descubre nuevas oportunidades, aprende y conecta con personas que comparten tu misma visión.</p>
              </div>
              <a
                  href="https://pabloezzeta.pe/club/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex h-10 w-full items-center justify-center border border-zinc-950 bg-zinc-950 px-5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:border-red-600 hover:bg-red-600 sm:w-fit"
              >Conoce el Club
              </a>
          </div>
      </div>
      </section>
    </div>
  );
};