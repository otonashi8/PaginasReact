import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from "framer-motion";
import { useRedes } from '../admin/Sistema/redes/redesService';

const aboutLinks = [
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Contáctanos', href: '/contacto' },
];

const companyLinks = [
  { label: 'Políticas', href: '/politicas' },
  { label: 'Términos', href: '/terminos' },
  { label: 'Libro de reclamaciones', href: '/reclamaciones' },
  { label: 'Trabaja con nosotros', href: '/trabajos' },
];

export const Footer = () => {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const redes = useRedes();

  const toggleSection = (section: string) => {
    setOpenSection((current) => (current === section ? null : section));
  };

  const socialLinks = (
    <>
      {redes
        .filter((red) => red.activo && red.url)
        .map((red) => {
          const paletteByName: Record<string, string> = {
            tiktok: 'bg-zinc-700',
            instagram: 'bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af]',
            facebook: 'bg-[#1877F2]',
            youtube: 'bg-[#FF0000]',
            x: 'bg-black',
            linkedin: 'bg-[#0A66C2]',
          };

          const label = red.nombre.toLowerCase();
          const className = paletteByName[label] ?? 'bg-zinc-700';

          return (
            <a
              key={red.id ?? red.nombre}
              href={red.url}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 ${className}`}
            >
              {red.iconUrl ? (
                <img src={red.iconUrl} alt={red.nombre} className="h-4 w-4 rounded-full object-cover" />
              ) : (
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px] font-semibold">
                  {red.nombre.charAt(0).toUpperCase()}
                </span>
              )}
              {red.nombre}
            </a>
          );
        })}
    </>
  );

  return (
    <footer className="border-t border-zinc-200 bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr_0.8fr_0.8fr]">

          {/* Logo */}
          <div className="text-center lg:text-left">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">
              EZZETA
            </p>

            <h2 className="mt-3 text-2xl font-semibold">
              Diseño moderno, piezas claras y estilo para todos los días.
            </h2>

            <p className="mt-3 text-sm text-white/70">
              Una propuesta urbana, accesible y versátil que combina comodidad, identidad y actitud.
            </p>

            <div className="mt-6 flex justify-center lg:block">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRtR0xkrj_2RuK9RzeXNqdSDl2boknRmgrjLLUMccTPnX6Z0K7mXfQJkg&s=10"
                alt="Logo"
                className="h-40 w-75 rounded-xl"
              />
            </div>

            {/* Mobile Accordion */}
            <div className="mt-10 space-y-5 lg:hidden">

              {/* Acerca de Nosotros */}

              <div className="border-t border-white/10 pt-4">

                <button
                  onClick={() => toggleSection('empresa')}
                  className="flex w-full items-center justify-between text-sm uppercase tracking-[0.2em]"
                >
                  <span>ACERCA DE NOSOTROS</span>
                  <span>{openSection === 'empresa' ? '△' : '▽'}</span>
                </button>

                <AnimatePresence initial={false}>
                  {openSection === "empresa" && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: "easeInOut",
                      }}
                      className="overflow-hidden mt-4 space-y-3 text-left text-sm text-white/80"
                    >
                      {aboutLinks.map((link) => (
                        <li key={link.href}>
                          <Link
                            to={link.href}
                            className="block rounded-lg px-2 py-2 transition hover:bg-white/10"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>

              </div>

              {/* La Empresa */}

              <div className="border-t border-white/10 pt-4">

                <button
                  onClick={() => toggleSection('empresa-info')}
                  className="flex w-full items-center justify-between text-sm uppercase tracking-[0.2em]"
                >
                  <span>LA EMPRESA</span>
                  <span>{openSection === 'empresa-info' ? '△' : '▽'}</span>
                </button>

                <AnimatePresence initial={false}>
                  {openSection === "empresa-info" && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: "easeInOut",
                      }}
                      className="overflow-hidden mt-4 space-y-3 text-left text-sm text-white/80"
                    >
                      {companyLinks.map((link) => (
                        <li key={link.href}>
                          <Link
                            to={link.href}
                            className="block rounded-lg px-2 py-2 transition hover:bg-white/10"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>

              </div>

              {/* Redes */}

              <div className="border-t border-white/10 pt-4">

                <button
                  onClick={() => toggleSection('redes')}
                  className="flex w-full items-center justify-between text-sm uppercase tracking-[0.2em]"
                >
                  <span>REDES</span>
                  <span>{openSection === 'redes' ? '△' : '▽'}</span>
                </button>

                <AnimatePresence initial={false}>
                  {openSection === "redes" && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: "easeInOut",
                      }}
                      className="overflow-hidden mt-4 space-y-3 text-left text-sm text-white/80"
                    >
                      {redes
                        .filter((red) => red.activo && red.url)
                        .map((red) => (
                          <li key={red.id ?? red.nombre}>
                            <a href={red.url} target="_blank" rel="noreferrer" className="block rounded-lg px-2 py-2 transition hover:bg-white/10">
                              {red.nombre}
                            </a>
                          </li>
                        ))}
                    </motion.ul>
                  )}
                </AnimatePresence>

              </div>

            </div>

          </div>

          {/* Escritorio */}

          <div className="hidden lg:block">
            <h3 className="text-sm uppercase tracking-[0.2em] text-white/60">
              Acerca de Nosotros
            </h3>

            <ul className="mt-3 space-y-2 text-sm text-white/80">
              {aboutLinks.map(link=>(
                <li key={link.href}>
                  <Link to={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden lg:block">
            <h3 className="text-sm uppercase tracking-[0.2em] text-white/60">
              La Empresa
            </h3>

            <ul className="mt-3 space-y-2 text-sm text-white/80">
              {companyLinks.map(link=>(
                <li key={link.href}>
                  <Link to={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden lg:flex flex-col items-end">
            <h3 className="text-sm uppercase tracking-[0.2em] text-white/60">
              Redes
            </h3>

            <div className="mt-3 flex flex-col gap-3 w-full">
              {socialLinks}
            </div>
          </div>

        </div>
      </div>

      <div className="border-t border-white/10 bg-black/90 pb-40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-4 text-sm text-white/60 sm:flex-row lg:px-8">
          <p>© 2026 EZZETA. Todos los derechos reservados.</p>
          <Link to="/tienda" className="inline-flex items-center gap-2 text-white/80 hover:text-white">
            Ver colección<ArrowRight size={16}/>
          </Link>

        </div>
      </div>
    </footer>
  );
};