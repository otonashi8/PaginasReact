import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import type { PermissionAccess } from '../../hooks/usePermissions';
import { PaginacionClientes } from '../../componentes/Paginacion';
import { TablaAcciones } from '../../componentes/TablaAcciones';
import { useClasificaciones } from '../productos/hooks/useClasificaciones';

type BeneficiosCrudPanelProps = {
  access: PermissionAccess;
};

export const BeneficiosCrudPanel = ({ access }: BeneficiosCrudPanelProps) => {
  const { hasPermission } = useAuth();
  const { clasificaciones, agregarBeneficio, eliminarBeneficio } = useClasificaciones();
  const [valor, setValor] = useState('');
  const [pagina, setPagina] = useState(1);
  const permisos = { ver: access.actions.view ? hasPermission(access.actions.view) : true, crear: access.actions.create ? hasPermission(access.actions.create) : false, eliminar: access.actions.delete ? hasPermission(access.actions.delete) : false };
  const porPagina = 8;
  useEffect(() => setPagina(1), [clasificaciones.beneficiosDisponibles.length]);
  if (!permisos.ver) return <div className="rounded-none border border-red-200 bg-red-50 p-4 text-sm text-red-700">No tienes permiso para visualizar este módulo.</div>;
  return (
    <section className="mx-auto max-w-5xl space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-950">Beneficios</h2>
        <p className="text-sm text-zinc-500">Administra los beneficios que pueden mostrarse en los productos.</p>
      </div>
      {permisos.crear ? 
      <form onSubmit={(event) => { event.preventDefault(); if (!valor.trim()) return; agregarBeneficio(valor.trim()); setValor(''); }} className="flex gap-3 rounded-none border border-zinc-200 bg-white p-4">
        <input value={valor} onChange={(event) => setValor(event.target.value)} placeholder="Ej. Envío gratis" className="min-w-0 flex-1 rounded-none border border-zinc-300 px-3 py-2 text-sm" />
        <button className="rounded-none bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">Agregar</button>
      </form> 
      : null}
      <div className="overflow-x-auto rounded-none border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Beneficio</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>{clasificaciones.beneficiosDisponibles.slice((pagina - 1) * porPagina, pagina * porPagina).map((beneficio) => 
            <tr key={beneficio} className="border-b border-zinc-100">
              <td className="px-4 py-3 font-medium">{beneficio}</td>
              <td className="px-4 py-3 text-right">{permisos.eliminar ?
                <TablaAcciones><button type="button" onClick={() => eliminarBeneficio(beneficio)} className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">Eliminar</button></TablaAcciones>
                : null}
              </td>
            </tr>)}
          </tbody>
        </table>
      </div>
      <PaginacionClientes paginaActual={pagina} paginaTope={Math.max(1, Math.ceil(clasificaciones.beneficiosDisponibles.length / porPagina))} onPaginaChange={setPagina} />
    </section>
  );
};

