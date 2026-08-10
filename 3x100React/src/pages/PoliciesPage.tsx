import { useState } from 'react';
import { TypewriterTitle } from '../components/TypewriterTitle';
import { Info, Database, Share2, ShieldCheck, Mail } from 'lucide-react';

const policyTabs = [
  {
    id: 'introduccion',
    label: 'Introducción',
    title: 'Introducción',
    icon: Info,
    content:
      'Bienvenido a 3×100.pe. Esta Política de Privacidad explica cómo recopilamos, utilizamos y protegemos tu información personal cuando realizas compras en línea de productos de moda con nosotros.',
  },
  {
    id: 'datos-recopilados',
    label: 'Datos recopilados y su uso',
    title: 'Datos recopilados y su uso',
    icon: Database,
    content:
      'Recopilamos datos de identificación, contacto y compra para gestionar pedidos, coordinar entregas, emitir comprobantes, brindar soporte y mejorar la experiencia de compra. También utilizamos información de navegación para personalizar ofertas y mejorar el sitio.',
  },
  {
    id: 'compartir-informacion',
    label: 'Compartir información',
    title: 'Compartir información',
    icon: Share2,
    content:
      'Compartimos datos con proveedores logísticos, plataformas de pago y servicios de análisis, siempre que sea necesario para procesar pedidos, proteger contra fraudes y cumplir con obligaciones legales. No vendemos información personal a terceros con fines comerciales.',
  },
  {
    id: 'cookies-seguridad',
    label: 'Cookies y seguridad',
    title: 'Cookies y seguridad',
    icon: ShieldCheck,
    content:
      'Utilizamos cookies técnicas y de analítica para recordar preferencias, mantener sesiones activas y medir el rendimiento del sitio. Además, aplicamos medidas de seguridad razonables para prevenir accesos no autorizados, alteración, pérdida o divulgación indebida.',
  },
  {
    id: 'terceros-contacto',
    label: 'Terceros y contacto',
    title: 'Terceros y contacto',
    icon: Mail,
    content:
      'Para consultas sobre privacidad y protección de datos, escríbenos a privacidad@ezzeta.com o comunícate al +51 929 370 461. También puedes gestionar tus derechos de acceso, rectificación, oposición y eliminación de datos.',
  },
];

export const PoliciesPage = () => {
  const [activeTab, setActiveTab] = useState(policyTabs[0].id);
  const activeItem = policyTabs.find((tab) => tab.id === activeTab) ?? policyTabs[0];

  return (
    <section className="mx-auto max-w-6xl space-y-8 rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm sm:p-8">
      <header className="space-y-3 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-500/60">Legal</p>
        <TypewriterTitle as="h1" text="Políticas de Privacidad" className="text-3xl font-semibold uppercase tracking-[0.2em] text-orange-500" />
        <p className="mx-auto max-w-3xl text-sm leading-relaxed text-black/70 sm:text-base">
          En EZZETA nos comprometemos a proteger la información personal de nuestros clientes y visitantes.
          Esta política describe cómo recopilamos, usamos, almacenamos y protegemos sus datos personales.
        </p>
      </header>

      <div className="rounded-[1.5rem] p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {policyTabs.map((tab) => {
            const isActive = tab.id === activeTab;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-2xl border px-4 py-4 text-center text-sm transition ${
                  isActive
                    ? 'border-orange-600 bg-white text-orange-700 shadow-sm'
                    : 'border-black bg-transparent text-black/70 hover:bg-white/80 hover:text-black'
                }`}
              >
                <Icon className="mb-2 h-5 w-5 text-current" />
                <span className="block font-semibold uppercase tracking-[0.18em]">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <article className="rounded-[1.5rem] border border-black/10 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold uppercase tracking-[0.12em] text-orange-500">{activeItem.title}</h2>
        <p className="mt-4 text-sm leading-relaxed text-black/75">{activeItem.content}</p>
      </article>

      <p className="text-xs uppercase tracking-[0.15em] text-black/50">
        Última actualización: 29 de julio de 2026.
      </p>
    </section>
  );
};
