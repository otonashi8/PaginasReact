import { useEffect, useState } from 'react'
import './App.css'
import ComprarModal from './componentes/ComprarModal'
import Faq from './componentes/Faq'
import TarjetaContacto from './componentes/TarjetaContacto'

const beneficios = [
  {
    title: 'Piel más firme y luminosa',
    description: 'Mejora la elasticidad e hidratación de la piel, reduciendo la apariencia de líneas finas.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21s-7-4.5-9.5-9C.5 8 3 4 7 4c2 0 4 1.5 5 3 1-1.5 3-3 5-3 4 0 6.5 4 4.5 8-2.5 4.5-9.5 9-9.5 9z" />
      </svg>
    ),
  },
  {
    title: 'Cabello y uñas más fuertes',
    description: 'Aporta los aminoácidos clave para un cabello con más brillo y uñas más resistentes.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 21c0-4 2-6 2-10a6 6 0 0 1 12 0c0 4 2 6 2 10" />
        <path d="M8 21c0-3 1-4 1-7" />
        <path d="M16 21c0-3-1-4-1-7" />
      </svg>
    ),
  },
  {
    title: 'Articulaciones flexibles',
    description: 'Favorece la salud de las articulaciones, ideal para quienes se mantienen activas.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
      </svg>
    ),
  },
  {
    title: 'Recuperación muscular',
    description: 'Apoya la reparación de tejidos, perfecto para complementar tu rutina de ejercicio.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2 3 14h7l-1 8 11-14h-7l1-6z" />
      </svg>
    ),
  },
  {
    title: 'Retrasa signos de la edad',
    description: 'Estimula la producción natural de colágeno para una piel visiblemente más joven.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v2M12 19v2M5 5l1.5 1.5M17.5 17.5 19 19M3 12h2M19 12h2M5 19l1.5-1.5M17.5 6.5 19 5" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  {
    title: '100% ingredientes naturales',
    description: 'Sin azúcar añadida, sin colorantes artificiales. Solo naturaleza en su forma más pura.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C9 6 6 9 6 13a6 6 0 0 0 12 0c0-4-3-7-6-11z" />
      </svg>
    ),
  },
]

const statsData = [
  { count: "+10000", label: 'Clientes felices' },
  { count: 98, label: '% notó mejoras en 30 días' },
  { count: 100, label: '% ingredientes naturales' },
  { count: 5, label: 'Estrellas en promedio' },
]

const testimonios = [
  {
    quote: '"Desde el primer mes noté mi piel más firme y mi cabello dejó de caerse tanto. Ya es parte de mi rutina."',
    name: 'Milagros R.',
    note: 'Cliente desde 2024',
    initial: 'M',
  },
  {
    quote: '"Me encanta que sea natural y sin sabor raro. Se disuelve fácil y ya veo diferencia en mis uñas."',
    name: 'Carla V.',
    note: 'Cliente frecuente',
    initial: 'C',
  },
  {
    quote: '"Practico running y el colágeno me ayudó muchísimo con las rodillas. Además llegó súper rápido."',
    name: 'Andrea S.',
    note: 'Cliente desde 2023',
    initial: 'A',
  },
]

const cintaItems = [
  'Piel radiante',
  'Cabello fuerte',
  'Articulaciones sanas',
  'Ingredientes naturales',
  'Sin azúcar añadida',
  'Resultados en 30 días',
]

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [headerScrolled, setHeaderScrolled] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)


  useEffect(() => {
    const handleScroll = () => setHeaderScrolled(window.scrollY > 30)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const reveals = Array.from(document.querySelectorAll<HTMLElement>('.reveal'))
    if (!reveals.length) return

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 },
    )

    reveals.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const stats = Array.from(document.querySelectorAll<HTMLElement>('.stat-num'))
    if (!stats.length) return

    const statsObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            const target = parseInt(el.getAttribute('data-count') ?? '0', 10)
            let current = 0
            const duration = 1400
            const steps = 50
            const increment = target / steps
            const stepTime = duration / steps
            const timer = window.setInterval(() => {
              current += increment
              if (current >= target) {
                el.textContent = target.toLocaleString('es-PE')
                window.clearInterval(timer)
              } else {
                el.textContent = Math.floor(current).toLocaleString('es-PE')
              }
            }, stepTime)
            obs.unobserve(el)
          }
        })
      },
      { threshold: 0.4 },
    )

    stats.forEach((el) => statsObserver.observe(el))
    return () => statsObserver.disconnect()
  }, [])

  const handleToggleMenu = () => setMenuOpen((current) => !current)
  const handleCloseMenu = () => setMenuOpen(false)
  const handleOpenPayment = () => setPaymentOpen(true)
  const handleOpenFaq = () => setFaqOpen(true)
  const handleOpenContact = () => setContactOpen(true)
  const handleClosePayment = () => setPaymentOpen(false)
  const handleCloseFaq = () => setFaqOpen(false)
  const handleCloseContact = () => setContactOpen(false)
  const handlePurchaseComplete = () => {
    setPurchaseSuccess(true)
    window.setTimeout(() => setPurchaseSuccess(false), 4200)
  }

  return (
    <>
      <header id="siteHeader" className={headerScrolled ? 'scrolled' : ''}>
        <div className="contenedor">
          <nav>
            <a href="#inicio" className="logo">
              <span className="punto" />Vitaella
            </a>
            <ul className={`nav-links${menuOpen ? ' open' : ''}`}>
              <li>
                <a href="#beneficios" onClick={handleCloseMenu}>
                  Beneficios
                </a>
              </li>
              <li>
                <a href="#producto" onClick={handleCloseMenu}>
                  Colágeno
                </a>
              </li>
              <li>
                <a href="#testimonios" onClick={handleCloseMenu}>
                  Opiniones
                </a>
              </li>
            </ul>
            <div className="nav-cta">
              <a href="#producto" className="btn btn-secundario">
                Ver producto
              </a>
              <button type="button" className="btn btn-primario" onClick={handleOpenPayment}>
                Comprar ahora
              </button>
            </div>
            <button
              className="menu-toggle"
              aria-label="Menú"
              aria-expanded={menuOpen}
              onClick={handleToggleMenu}
            >
              <span />
              <span />
              <span />
            </button>
          </nav>
        </div>
      </header>

      <div className={`success-toast${purchaseSuccess ? ' active' : ''}`}>
        Compra realizada con éxito
      </div>

      <main>
        <section className="hero" id="inicio">
          <div className="contenedor">
            <div>
              <span className="eyebrow">Belleza natural, resultados reales</span>
              <h1>
                Colágeno que se nota,
                <br />
                <em>
                  naturaleza que se siente
                  <svg viewBox="0 0 200 14" preserveAspectRatio="none">
                    <path
                      d="M2 10 Q 50 2, 100 8 T 198 6"
                      stroke="#C9A24B"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </em>
              </h1>
              <p className="lead">
                Vitaella combina colágeno hidrolizado con ingredientes 100% naturales para devolverle firmeza a tu piel, fuerza a tu cabello y energía a tu cuerpo, desde adentro hacia afuera.
              </p>
              <div className="hero-acciones">
                <a href="#producto" className="btn btn-primario">
                  Quiero mi colágeno
                </a>
                <a href="#beneficios" className="btn btn-secundario">
                  Ver beneficios
                </a>
              </div>
              <div className="hero-firma">
                <span className="estrellas">★★★★★</span>
                <small>+10,000 clientes ya notaron el cambio</small>
              </div>
            </div>

            <div className="hero-visual">
              <div className="blob blob-1" />
              <div className="blob blob-2" />
              <div className="blob blob-3" />
              <div className="chip-flotante uno">
                <span className="icono">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#4C1526" strokeWidth="2">
                    <path d="M12 2C9 6 6 9 6 13a6 6 0 0 0 12 0c0-4-3-7-6-11z" />
                  </svg>
                </span>
                Piel más firme
              </div>
              <div className="chip-flotante dos">
                <span className="icono">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#4C1526" strokeWidth="2">
                    <path d="M4 12h16M4 12l4-4M4 12l4 4" />
                  </svg>
                </span>
                100% natural
              </div>
              <div className="frasco-wrap">
                <img
                  src="https://ezzetacompany.com/wp-content/uploads/2026/07/Gemini_Generated_Image_xmo2xsxmo2xsxmo2.png"
                  alt="Colágeno Vitaella"
                  className="hero-frasco-img"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="cinta">
          <div className="cinta-track" id="cintaTrack">
            <span>
              {cintaItems.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </span>
            <span>
              {cintaItems.map((item) => (
                <span key={`${item}-duplicate`}>{item}</span>
              ))}
            </span>
          </div>
        </div>

        <section id="beneficios">
          <div className="contenedor">
            <div className="titulo-seccion reveal">
              <span className="eyebrow">Por qué tomar colágeno</span>
              <h2>Beneficios que se ven y se sienten</h2>
              <p>
                El colágeno es la proteína más abundante del cuerpo, pero su producción baja con los años. Vitaella ayuda a reponerlo de forma natural.
              </p>
            </div>

            <div className="beneficios-grid">
              {beneficios.map((beneficio) => (
                <div className="beneficio-card reveal" key={beneficio.title}>
                  <div className="beneficio-icono">{beneficio.icon}</div>
                  <h3>{beneficio.title}</h3>
                  <p>{beneficio.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="esencia">
          <div className="contenedor esencia-grid">
            <img
              src="https://ezzetacompany.com/wp-content/uploads/2026/07/Gemini_Generated_Image_9xkraj9xkraj9xkr.png"
              alt="Ingredientes naturales Vitaella"
              className="reveal esencia-img"
            />
            <div className="reveal">
              <span className="eyebrow">Nuestra esencia</span>
              <h2 className="esencia-title">Naturaleza pura, ciencia con propósito</h2>
              <p>
                En Vitaella seleccionamos cada ingrediente pensando en tu bienestar real. Trabajamos con proveedores que cultivan de forma responsable y procesos que conservan lo mejor de cada planta.
              </p>
              <p>
                Sin rellenos innecesarios, sin promesas vacías: solo fórmulas simples que funcionan.
              </p>
              <div className="hero-acciones">
                <a href="#producto" className="btn btn-primario">
                  Conoce el colágeno
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="producto">
          <div className="contenedor producto">
            <div className="contenedor producto-grid">
              <div className="producto-visual reveal">
                <div className="anillo" />
                <img
                  src="https://ezzetacompany.com/wp-content/uploads/2026/07/Gemini_Generated_Image_9xkraj9xkraj9xkr.png"
                  alt="Colágeno Hidrolizado Vitaella"
                  className="producto-img"
                />
              </div>

              <div className="reveal">
                <span className="badge-natural">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Joya de la Naturaleza
                </span>
                <h2>Colágeno Hidrolizado Vitaella</h2>
                <p className="producto-copy">
                  Fórmula en polvo de fácil disolución, potenciada con vitamina C, biotina y ácido hialurónico para resultados visibles desde la primera caja.
                </p>
                <ul className="lista-ingredientes">
                  <li>Colágeno tipo I y III</li>
                  <li>Vitamina C</li>
                  <li>Biotina</li>
                  <li>Ácido hialurónico</li>
                </ul>
                <div className="precio-box">
                  <span className="precio-actual">S/ 89.90</span>
                </div>
                <div className="hero-acciones">
                  <button type="button" className="btn btn-dorado" onClick={handleOpenPayment}>
                    Comprar ahora
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="stats">
          <div className="contenedor stats-grid">
            {statsData.map((stat) => (
              <div className="reveal" key={stat.label}>
                <div className="stat-num" data-count={stat.count}>
                  0
                </div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="testimonios">
          <div className="contenedor">
            <div className="titulo-seccion reveal">
              <span className="eyebrow">Lo que dicen de nosotras</span>
              <h2>Historias reales, resultados reales</h2>
            </div>
            <div className="testimonios-grid">
              {testimonios.map((item) => (
                <div className="testimonio-card reveal" key={item.name}>
                  <span className="estrellas">★★★★★</span>
                  <p>{item.quote}</p>
                  <div className="autor">
                    <div className="autor-avatar">{item.initial}</div>
                    <div>
                      <strong>{item.name}</strong>
                      <span>{item.note}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="contenedor">
            <div className="cta-final reveal">
              <h2>
                Tu piel, cabello y bienestar
                <br />
                se lo merecen
              </h2>
              <p>
                Únete a miles de personas que ya transformaron su rutina de belleza con Vitaella.
              </p>
              <div className="hero-acciones">
                <a href="#producto" className="btn btn-dorado">
                  Comprar mi colágeno
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <ComprarModal
        open={paymentOpen}
        onClose={handleClosePayment}
        onComplete={handlePurchaseComplete}
      />
      <Faq open={faqOpen} onClose={handleCloseFaq} />
      <TarjetaContacto open={contactOpen} onClose={handleCloseContact} />

      <footer>
        <div className="contenedor">
          <div className="footer-grid">
            <div>
              <span className="footer-logo">Vitaella</span>
              <p className="footer-copy">
                Belleza y bienestar desde la naturaleza. Colágeno y productos naturales pensados para ti.
              </p>
              {false && (
                <div className="redes" style={{ marginTop: 20 }}>
                  <a href="#" aria-label="Instagram">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="1" />
                    </svg>
                  </a>
                  <a href="#" aria-label="Facebook">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
                      <path d="M14 9h3V5h-3a4 4 0 0 0-4 4v2H7v4h3v6h4v-6h3l1-4h-4V9a1 1 0 0 1 1-1z" />
                    </svg>
                  </a>
                  <a href="#" aria-label="TikTok">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
                      <path d="M9 12a4 4 0 1 0 4 4V4c1 2 3 3 5 3" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
            <div>
              <h5>Empresa</h5>
              <ul>
                <li>
                  <a href="#beneficios">Beneficios</a>
                </li>
                <li>
                  <a href="#testimonios">Testimonios</a>
                </li>
                <li>
                  <button type="button" className="footer-link" onClick={handleOpenFaq}>
                    Preguntas frecuentes
                  </button>
                </li>
                <li>
                  <button type="button" className="footer-link" onClick={handleOpenContact}>
                    Contacto
                  </button>
                </li>
              </ul>
            </div>
            {false && (
              <div>
                <h5>Recibe novedades y descuentos</h5>
                <div className="newsletter">
                  <input type="email" placeholder="Tu correo electrónico" />
                  <button className="btn btn-dorado" type="button">
                    Enviar
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="footer-bottom">
            <span>© 2026 Vitaella. Todos los derechos reservados.</span>
            <span>Hecho con naturaleza, ciencia y cariño.</span>
          </div>
        </div>
      </footer>
    </>
  )
}

export default App
