import { motion } from "framer-motion";

export const AboutPage = () => {

  return (
      <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.08 }}
          variants={{
              hidden: {},
              visible: {
                  transition: {staggerChildren: 0.08,},
              },
          }}
          className="space-y-4"
      >
          <motion.div
              variants={{
                  hidden: { opacity: 0, y: 18 },
                  visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.6, ease: "easeOut" },
                  },
              }}
              className="group relative overflow-hidden border border-zinc-200 bg-black"
          >
              <img
                  src="https://ezzetacompany.com/wp-content/uploads/2025/10/Pablo-Ezzeta-almacen.png"
                  alt="Banner Nosotros"
                  className="h-[20rem] w-full object-cover transition duration-700 group-hover:scale-[1.02] sm:h-[26rem] lg:h-[34rem]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 lg:max-w-2xl">
                  <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/70">Ezzeta Company</span>
                  <h1 className="mt-2 text-2xl font-semibold uppercase leading-tight tracking-[0.08em] text-white sm:text-4xl">Estilo que se mueve contigo</h1>
                  <p className="mt-3 max-w-xl text-xs leading-5 text-white/75 sm:text-sm">Diseño, calidad y operación integrada para construir una experiencia de moda constante.</p>
              </div>
          </motion.div>
          <motion.div
              variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1 },
              }}
              className="overflow-hidden border-y border-zinc-200 bg-white py-2.5"
          >
              <div className="marquee-track flex w-max gap-5 px-2 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500 sm:text-xs">
                  {Array.from({ length: 8 }).map((_, index) => (
                      <span key={index} className="whitespace-nowrap">EZZETA STYLE · CALIDAD · IDENTIDAD · LOGÍSTICA · INNOVACIÓN</span>
                  ))}
              </div>
          </motion.div>
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <motion.div
                  variants={{
                      hidden: { opacity: 0, x: -18 },
                      visible: {
                          opacity: 1,
                          x: 0,
                          transition: { duration: 0.5, ease: "easeOut" },
                      },
                  }}
                  className="overflow-hidden border border-zinc-200 bg-white p-1.5"
              >
                  <div className="aspect-video w-full overflow-hidden bg-zinc-100">
                      <iframe
                          src="https://www.youtube.com/embed/A-hXHl8iGF0?si=YbLiNpZ0OWvCgbvu"
                          title="Ezzeta Company"
                          className="h-full w-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                      />
                  </div>
              </motion.div>
              <motion.div
                  variants={{
                      hidden: { opacity: 0, x: 18 },
                      visible: {
                          opacity: 1,
                          x: 0,
                          transition: { duration: 0.5, ease: "easeOut" },
                      },
                  }}
                  className="flex flex-col justify-center border border-zinc-200 bg-white p-5 sm:p-7"
              >
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Ezzeta</span>
                  <h2 className="mt-2 text-xl font-semibold uppercase tracking-[0.08em] text-zinc-950 sm:text-2xl">Identidad de marca</h2>
                  <div className="mt-4 space-y-3 text-sm leading-6 text-zinc-600">
                      <p>Diseñamos cada colección para ofrecer siluetas atemporales con energía urbana, materiales resistentes y acabados que elevan el uso diario.</p>
                      <p>Nuestra operación conecta diseño, abastecimiento y distribución para responder con velocidad sin perder precisión en cada detalle.</p>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-2 border-t border-zinc-100 pt-4">
                      <div>
                          <p className="text-lg font-semibold text-zinc-950">01</p>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-zinc-500">Diseño</p>
                      </div>
                      <div>
                          <p className="text-lg font-semibold text-zinc-950">02</p>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-zinc-500">Distribución</p>
                      </div>
                  </div>
              </motion.div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                  {
                      title: "Calidad garantizada",
                      description:"Control de acabados y materiales en cada etapa para mantener estándares consistentes en toda la colección.",
                  },
                  {
                      title: "Eficiencia logística",
                      description:"Procesos coordinados para reducir tiempos de preparación, despacho y respuesta postventa.",
                  },
                  {
                      title: "Innovación continua",
                      description:"Evolucionamos diseños, rutas operativas y experiencia de compra con mejoras constantes.",
                  },
              ].map((item, index) => (
                  <motion.article
                      key={item.title}
                      variants={{
                          hidden: { opacity: 0, y: 14 },
                          visible: {
                              opacity: 1,
                              y: 0,
                              transition: { duration: 0.4, ease: "easeOut" },
                          },
                      }}
                      whileHover={{ y: -4 }}
                      className="group border border-zinc-200 bg-white p-4 transition-colors duration-300 hover:border-zinc-400 sm:p-5"
                  >
                      <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold tracking-[0.15em] text-red-600">0{index + 1}</span>
                          <span className="h-px w-8 bg-zinc-200 transition-all duration-300 group-hover:w-14 group-hover:bg-red-600" />
                      </div>
                      <h3 className="mt-4 text-sm font-semibold uppercase tracking-[0.08em] text-zinc-950">{item.title}</h3>
                      <p className="mt-2 text-xs leading-5 text-zinc-600">{item.description}</p>
                  </motion.article>
              ))}
          </div>
          <motion.div
              variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5, ease: "easeOut" },
                  },
              }}
              className="border border-zinc-200 bg-white p-4 sm:p-5"
          >
              <div className="flex flex-col gap-3 border-b border-zinc-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                      <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">Disponibilidad continua</span>
                      <h2 className="mt-1 text-sm font-semibold uppercase tracking-[0.08em] text-zinc-950 sm:text-base">Stock permanente</h2>
                  </div>
                  <p className="max-w-2xl text-xs leading-5 text-zinc-600 sm:text-right">Mantenemos disponibilidad continua en líneas clave para responder de forma inmediata a campañas, reposiciones y picos de demanda.</p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                      {
                          title: "Almacén de prendas",
                          description:"Inventario organizado por categorías y tallas para preparación rápida y sin quiebres.",
                      },
                      {
                          title: "Despacho de pedidos",
                          description:"Flujo de picking y packing optimizado para asegurar entregas constantes y verificadas.",
                      },
                  ].map((item, index) => (
                      <motion.article
                          key={item.title}
                          variants={{
                              hidden: { opacity: 0, y: 10 },
                              visible: {
                                  opacity: 1,
                                  y: 0,
                                  transition: {
                                      duration: 0.35,
                                      delay: index * 0.08,
                                  },
                              },
                          }}
                          whileHover={{ y: -3 }}
                          className="group border border-zinc-200 bg-zinc-50/50 p-3.5 transition-colors duration-300 hover:border-zinc-400 hover:bg-white"
                      >
                          <div className="flex items-center justify-between">
                              <span className="text-[10px] font-semibold tracking-[0.15em] text-zinc-400">0{index + 1}</span>
                              <span className="h-px w-6 bg-zinc-200 transition-all duration-300 group-hover:w-10 group-hover:bg-red-600" />
                          </div>
                          <h3 className="mt-4 text-sm font-semibold uppercase tracking-[0.08em] text-zinc-950">{item.title}</h3>
                          <p className="mt-1.5 text-xs leading-5 text-zinc-600">{item.description}</p>
                      </motion.article>
                  ))}
              </div>
          </motion.div>
          <motion.div
              variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5, ease: "easeOut" },
                  },
              }}
              className="border border-zinc-200 bg-zinc-950 p-5 text-white sm:p-7"
          >
              <div className="flex flex-col gap-3 border-b border-white/10 pb-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                      <span className="text-[15px] font-medium uppercase tracking-[0.18em] text-white/70">Operación integrada</span>
                      <h2 className="mt-1 text-xl font-semibold uppercase tracking-[0.08em] sm:text-2xl">Logística de alto rendimiento</h2>
                  </div>
                  <p className="max-w-xl text-[14px] leading-5 text-white/60">Integración de infraestructura, operación continua y monitoreo digital para sostener velocidad y trazabilidad en cada pedido.</p>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                      {
                          title: "Centro de distribución",
                          description:"Consolidación de inventario para salidas eficientes hacia múltiples zonas.",
                      },
                      {
                          title: "Servicio 24/7",
                          description:"Canales operativos activos para coordinación constante y respuesta oportuna.",
                      },
                      {
                          title: "Tecnología integrada",
                          description:"Herramientas de seguimiento en tiempo real para mejorar control y exactitud.",
                      },
                  ].map((item, index) => (
                      <motion.article
                          key={item.title}
                          variants={{
                              hidden: { opacity: 0, y: 10 },
                              visible: {
                                  opacity: 1,
                                  y: 0,
                                  transition: {
                                      duration: 0.35,
                                      delay: index * 0.08,
                                  },
                              },
                          }}
                          whileHover={{ y: -3 }}
                          className="border border-white/10 bg-white/[0.04] p-4 transition-colors duration-300 hover:border-white/30 hover:bg-white/[0.08]"
                      >
                          <span className="text-[15px] font-semibold tracking-[0.15em] text-red-400">0{index + 1}</span>
                          <h3 className="mt-3 text-md font-semibold uppercase tracking-[0.08em] text-white">{item.title}</h3>
                          <p className="mt-2 text-[14px] leading-5 text-white/60">{item.description}</p>
                      </motion.article>
                  ))}
              </div>
          </motion.div>
          <motion.div
              variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5, ease: "easeOut" },
                  },
              }}
              className="border border-zinc-200 bg-white p-4 sm:p-5"
          >
              <div className="flex items-end justify-between gap-3 border-b border-zinc-100 pb-4">
                  <div>
                      <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">Nuestra operación</span>
                      <h2 className="mt-1 text-sm font-semibold uppercase tracking-[0.08em] text-zinc-950 sm:text-base">Nuestras instalaciones</h2>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">03 espacios</span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                      {
                          src: "https://ezzetacompany.com/wp-content/uploads/2025/10/despacho.png",
                          alt: "Despacho de pedidos",
                      },
                      {
                          src: "https://ezzetacompany.com/wp-content/uploads/2025/10/Almacen-Ezzeta.jpg",
                          alt: "Almacén Ezzeta",
                      },
                      {
                          src: "https://ezzetacompany.com/wp-content/uploads/2025/10/Envios-ezzeta.png",
                          alt: "Envíos Ezzeta",
                      },
                  ].map((image, index) => (
                      <motion.div
                          key={image.src}
                          variants={{
                              hidden: { opacity: 0, scale: 0.97 },
                              visible: {
                                  opacity: 1,
                                  scale: 1,
                                  transition: {
                                      duration: 0.45,
                                      delay: index * 0.08,
                                  },
                              },
                          }}
                          className="group relative overflow-hidden border border-zinc-200 bg-zinc-100"
                      >
                          <img
                              src={image.src}
                              alt={image.alt}
                              className="h-60 w-full object-cover transition duration-700 group-hover:scale-[1.05] sm:h-72"
                          />
                          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-10 transition duration-300 group-hover:translate-y-0">
                              <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-white">{image.alt}</p>
                          </div>
                      </motion.div>
                  ))}
              </div>
          </motion.div>
          <motion.div
              variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5, ease: "easeOut" },
                  },
              }}
              className="border border-zinc-200 bg-white p-4 sm:p-5"
          >
              <div className="flex flex-col gap-4 border-b border-zinc-100 pb-4 sm:flex-row sm:items-center">
                  <img
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRM3ygVIBF88SV9OENA5YjyOpGUnbqDqqrPZ3TRANXXEdR1l-vtlFUJRXto&s=10"
                      alt="Pablo Ezzeta"
                      className="h-20 w-20 shrink-0 rounded-full object-cover grayscale transition duration-500 hover:grayscale-0 sm:h-24 sm:w-24"
                  />
                  <div>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Conoce a Pablo Ezzeta</span>
                      <h2 className="mt-1 text-xl font-semibold uppercase tracking-[0.08em] text-zinc-950 sm:text-2xl">Pablo Ezzeta</h2>
                      <p className="mt-2 max-w-2xl text-xs leading-5 text-zinc-600 sm:text-sm">Un referente de estilo que impulsa una visión clara y cercana del dressing masculino.</p>
                  </div>
              </div>
              <div className="mt-4 overflow-hidden border border-zinc-200 bg-white p-1.5">
                  <div className="aspect-video w-full overflow-hidden bg-zinc-100">
                      <iframe
                          src="https://www.youtube.com/embed/rzjMb3FN0Xs?rel=0&modestbranding=1"
                          title="¿Cómo Convertir 30 polos en un Imperio Textil?"
                          className="h-full w-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                      />
                  </div>
                  <p className="mt-2 text-center text-[10px] uppercase tracking-[0.15em] text-zinc-500 sm:text-left">Fuente: YouTube</p>
              </div>
          </motion.div>
          <style>
              {`
                  @keyframes marqueeLeft {
                      from {transform: translateX(0);}
                      to {transform: translateX(-50%);}
                  }
                  .marquee-track {animation: marqueeLeft 26s linear infinite;}
                  @media (prefers-reduced-motion: reduce) {
                      .marquee-track {animation: none;}
                  }
              `}
          </style>
      </motion.section>
  );
};
