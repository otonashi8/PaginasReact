import { useMemo, useState } from 'react';
import { PoliticasCrudPanel } from './PoliticaPrivacidad/PoliticasCrudPanel';
import { TerminosCrudPanel } from './TerminosCondiciones/TerminosCrudPanel';
import { VisibilidadCrudPanel } from './Visibilidad/VisibilidadCrudPanel';

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const PaginasCrudPanel = ({ access }: { access?: { label?: string; path?: string | null } }) => {
  const label = (access?.label ?? '').trim();
  const accessPath = (access?.path ?? '').toLowerCase();

  const initialTab = useMemo(() => {
    if (accessPath.includes('terminos') || normalize(label).includes('terminos')) return 'terms';
    if (accessPath.includes('visibilidad') || normalize(label).includes('visibilidad')) return 'visibility';
    return 'privacy';
  }, [accessPath, label]);

  const [currentTab] = useState<'privacy' | 'terms' | 'visibility'>(initialTab as 'privacy' | 'terms' | 'visibility');


  const renderPanel = () => {
    if (currentTab === 'terms') return <TerminosCrudPanel />;
    if (currentTab === 'visibility') return <VisibilidadCrudPanel />;
    return <PoliticasCrudPanel />;
  };

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Páginas</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">Contenido legal y visibilidad</h1>
      </div>
      {renderPanel()}
    </section>
  );
};

export default PaginasCrudPanel;
