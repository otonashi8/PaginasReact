import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import type { PermissionAccess } from '../../hooks/usePermissions';
import { PaginacionClientes } from '../../componentes/Paginacion';
import { useClasificaciones } from '../productos/hooks/useClasificaciones';

type TallasCrudPanelProps = {
  access: PermissionAccess;
};

export const TallasCrudPanel = ({ access }: TallasCrudPanelProps) => {
  const { hasPermission } = useAuth();
  const { clasificaciones, agregarTalla, eliminarTalla } = useClasificaciones();
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<'letras' | 'numeros'>('letras');
  const [pagina, setPagina] = useState(1);
  const permisos = { ver: access.actions.view ? hasPermission(access.actions.view) : true, crear: access.actions.create ? hasPermission(access.actions.create) : false, eliminar: access.actions.delete ? hasPermission(access.actions.delete) : false };
  const tallas = clasificaciones.tallasPorTipo[tipo];
  const porPagina = 8;
  useEffect(() => setPagina(1), [tipo, tallas.length]);
  if (!permisos.ver) return <div className="rounded-none border border-red-200 bg-red-50 p-4 text-sm text-red-700">No tienes permiso para visualizar este módulo.</div>;
    return ( 
    <section className="mx-auto max-w-5xl space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-950">Tallas</h2>
        <p className="text-sm text-zinc-500">Administra tallas de letras y números para asignarlas a los productos.</p>
      </div>
      {permisos.crear ? 
      <form onSubmit={(event) => { event.preventDefault(); if (!valor.trim()) return; agregarTalla(valor.trim(), tipo); setValor(''); }} 
        className="grid gap-3 rounded-none border border-zinc-200 bg-white p-4 md:grid-cols-[1fr_auto_auto]">
          <input value={valor} onChange={(event) => setValor(event.target.value)} placeholder="Ej. XXL o 38" className="rounded-none border border-zinc-300 px-3 py-2 text-sm" />
            <select value={tipo} onChange={(event) => setTipo(event.target.value as 'letras' | 'numeros')} className="rounded-none border border-zinc-300 px-3 py-2 text-sm">
              <option value="letras">Letras</option>
              <option value="numeros">Números</option>
            </select>
            <button className="rounded-none bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">Agregar</button>
      </form> : null}
        <div className="overflow-x-auto rounded-none border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Talla</th><th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
            </thead>
            <tbody>{tallas.slice((pagina - 1) * porPagina, pagina * porPagina).map((talla) => 
            <tr key={talla} className="border-b border-zinc-100">
              <td className="px-4 py-3 font-medium">{talla}</td>
              <td className="px-4 py-3 text-zinc-500">{tipo === 'letras' ? 'Letras' : 'Números'}</td>
              <td className="px-4 py-3 text-right">{permisos.eliminar ? 
                <button type="button" onClick={() => eliminarTalla(talla)} className="text-red-600 hover:text-red-800">Eliminar</button> : null}
              </td>
            </tr>)}
            </tbody>
          </table>
        </div>
      <PaginacionClientes paginaActual={pagina} paginaTope={Math.max(1, Math.ceil(tallas.length / porPagina))} onPaginaChange={setPagina} />
    </section>
  );
};

