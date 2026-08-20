import { Link } from 'react-router-dom'
import { canales } from '@/modules/contacto/data'
import { CATEGORIA_STYLES, type Categoria } from '@/modules/tienda/data'

const CATEGORIAS_FOOTER = Object.entries(CATEGORIA_STYLES) as [Categoria, (typeof CATEGORIA_STYLES)[Categoria]][]

interface FooterProps {
  onOpenFaq: () => void
}

function Footer({ onOpenFaq }: FooterProps) {
  return (
    <footer className="bg-tinta pt-17.5 pb-7.5 text-[#d8c3ca]">
      <div className="mx-auto w-[min(1180px,92%)]">
        <div className="mb-12.5 grid grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-10 max-[980px]:grid-cols-2 max-[720px]:grid-cols-1">
          <div>
            <span className="mb-3.5 block font-serif text-[1.5rem] font-normal text-crema italic">Vitaella</span>
            <p className="max-w-65 text-[0.85rem] leading-[1.6]">
              Belleza y bienestar desde la naturaleza. Colágeno y productos naturales pensados para ti.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href="https://instagram.com/vitaella.pe"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex size-9 items-center justify-center rounded-full bg-white/6 transition-colors duration-300 ease hover:bg-vino"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" className="size-4">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" />
                </svg>
              </a>
              <a
                href="https://facebook.com/vitaella.pe"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex size-9 items-center justify-center rounded-full bg-white/6 transition-colors duration-300 ease hover:bg-vino"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" className="size-4">
                  <path d="M14 9h3V5h-3a4 4 0 0 0-4 4v2H7v4h3v6h4v-6h3l1-4h-4V9a1 1 0 0 1 1-1z" />
                </svg>
              </a>
              <a
                href="https://tiktok.com/@vitaella.pe"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="flex size-9 items-center justify-center rounded-full bg-white/6 transition-colors duration-300 ease hover:bg-vino"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" className="size-4">
                  <path d="M9 12a4 4 0 1 0 4 4V4c1 2 3 3 5 3" />
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h5 className="mb-4.5 text-[0.95rem] text-crema">Empresa</h5>
            <ul>
              <li className="mb-2.5 text-[0.88rem]">
                <Link to="/nosotros" className="hover:text-dorado-suave">
                  Nosotros
                </Link>
              </li>
              <li className="mb-2.5 text-[0.88rem]">
                <Link to="/contacto" className="hover:text-dorado-suave">
                  Contacto
                </Link>
              </li>
              <li className="mb-2.5 text-[0.88rem]">
                <Link to="/#beneficios" className="hover:text-dorado-suave">
                  Beneficios
                </Link>
              </li>
              <li className="mb-2.5 text-[0.88rem]">
                <Link to="/#testimonios" className="hover:text-dorado-suave">
                  Testimonios
                </Link>
              </li>
              <li className="mb-2.5 text-[0.88rem]">
                <button
                  type="button"
                  className="cursor-pointer border-none bg-none p-0 text-inherit hover:text-dorado-suave"
                  onClick={onOpenFaq}
                >
                  Preguntas frecuentes
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="mb-4.5 text-[0.95rem] text-crema">Tienda</h5>
            <ul>
              <li className="mb-2.5 text-[0.88rem]">
                <Link to="/tienda" className="hover:text-dorado-suave">
                  Ver todo
                </Link>
              </li>
              {CATEGORIAS_FOOTER.map(([value, style]) => (
                <li key={value} className="mb-2.5 text-[0.88rem]">
                  <Link to={`/tienda?categoria=${value}`} className="hover:text-dorado-suave">
                    {style.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="mb-4.5 text-[0.95rem] text-crema">Contáctanos</h5>
            <ul className="mb-5">
              {canales.map((canal) => (
                <li key={canal.value} className="mb-2.5 text-[0.88rem]">
                  <a
                    href={canal.href}
                    target={canal.href.startsWith('http') ? '_blank' : undefined}
                    rel={canal.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="hover:text-dorado-suave"
                  >
                    {canal.value}
                  </a>
                </li>
              ))}
            </ul>
            <p className="text-[0.82rem] leading-[1.6]">
              Lunes a sábado
              <br />
              9:00 am – 7:00 pm
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3.5 border-t border-white/10 pt-6.5 text-[0.78rem] text-[#a38990] max-[720px]:justify-start max-[360px]:flex-col max-[360px]:items-start max-[360px]:gap-2.5">
          <span>© 2026 Vitaella. Todos los derechos reservados.</span>
          <span>Hecho con naturaleza, ciencia y cariño.</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
