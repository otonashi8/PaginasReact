import { useState } from 'react';
import { TypewriterTitle } from '../components/TypewriterTitle';
import { ClipboardCheck, ShoppingCart, Truck, RefreshCcw, ShieldCheck, FileText } from 'lucide-react';

const sections = [
  {
    id: 'requisitos-compra',
    label: 'Requisitos',
    title: '1. Requisitos para comprar',
    icon: ClipboardCheck,
    content:
      'Para realizar compras, el cliente debe ser mayor de edad o contar con autorización de su representante. La información registrada en la orden debe ser veraz, completa y actualizada.',
  },
  {
    id: 'compra-comprobantes',
    label: 'Compra',
    title: '2. Compra y comprobantes',
    icon: ShoppingCart,
    content:
      'Toda compra está sujeta a validación de stock y confirmación de pago. La emisión de boleta o factura se realiza con base en los datos declarados por el cliente durante el proceso de checkout.',
  },
  {
    id: 'envios',
    label: 'Envios',
    title: '3. Envios',
    icon: Truck,
    content:
      'Los plazos de entrega son referenciales y pueden variar por zona, temporada o contingencias operativas. El cliente es responsable de brindar una dirección de entrega válida y datos de contacto disponibles.',
  },
  {
    id: 'cambios-devoluciones',
    label: 'Cambios',
    title: '4. Cambios y devoluciones',
    icon: RefreshCcw,
    content:
      'Los cambios o devoluciones aplican según condiciones de estado del producto, plazos vigentes y presentación de comprobante. No aplican para productos personalizados o en liquidación final.',
  },
  {
    id: 'proteccion-datos',
    label: 'Protección',
    title: '5. Proteccion de datos',
    icon: ShieldCheck,
    content:
      'El tratamiento de datos personales se rige por nuestra Política de Privacidad y la normativa peruana aplicable. Los datos se usan para gestionar pedidos, soporte, mejora de servicio y cumplimiento legal.',
  },
  {
    id: 'libro-reclamaciones',
    label: 'Reclamaciones',
    title: '6. Libro de reclamaciones',
    icon: FileText,
    content:
      'El cliente tiene derecho a registrar quejas o reclamos a través del Libro de Reclamaciones Virtual, disponible en este sitio para la atención y seguimiento correspondiente.',
  },
];

export const TermsPage = () => {
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const activeItem = sections.find((section) => section.id === activeSection) ?? sections[0];

  return (
    <section className="mx-auto max-w-6xl space-y-8 rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm sm:p-8">
      <header className="space-y-3 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-500/60">Legal</p>
        <TypewriterTitle as="h1" text="Términos y Condiciones" className="text-3xl text-center font-semibold uppercase tracking-[0.2em] text-orange-500" />
        <p className="mx-auto max-w-3xl text-sm leading-relaxed text-black/70 sm:text-base">
          Estos términos son aplicables a las marcas EZZETA, MAXETA, CREPANTE, 3x100 y UOMO CATTIVO,
          y regulan la relación entre el cliente y la tienda en compras, envíos y atención postventa.
        </p>
      </header>

      <nav className="overflow-hidden rounded-[1.5rem] p-4 shadow-sm text-center" aria-label="Indice de terminos y condiciones">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {sections.map((item) => {
            const isActive = item.id === activeSection;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`rounded-2xl border px-4 py-4 text-sm text-center font-semibold transition ${
                  isActive
                    ? 'border-orange-600 bg-white text-orange-700 shadow-sm'
                    : 'border-black bg-transparent text-black/70 hover:bg-white/80 hover:text-black'
                }`}
              >
                <Icon className="mb-2 h-5 w-5 text-current" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <article className="rounded-[1.5rem] border border-black/10 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-orange-500">{activeItem.title}</h2>
        <p className="mt-4 text-sm leading-relaxed text-black/75">{activeItem.content}</p>
      </article>
    </section>
  );
};

