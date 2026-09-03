import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import type { PermissionAccess } from '../../hooks/usePermissions';
import { PaginacionClientes } from '../../componentes/Paginacion';
import { TablaAcciones } from '../../componentes/TablaAcciones';
import { useClasificaciones } from '../productos/hooks/useClasificaciones';
import { getCategoriaVisual, saveCategoriaVisual } from './categoriasStorage';

type CategoriasCrudPanelProps = {
  access: PermissionAccess;
};

export const CategoriasCrudPanel = ({ access }: CategoriasCrudPanelProps) => {
  const { hasPermission } = useAuth();
  const { clasificaciones, agregarCategoria, eliminarCategoria } = useClasificaciones();
  const [cambios, setCambios] = useState<Record<string, { imagen: string; descripcion: string; activo: boolean }>>({});
  const [valor, setValor] = useState('');
  const [pagina, setPagina] = useState(1);
  const permisos = {
    ver: access.actions.view ? hasPermission(access.actions.view) : true,
    crear: access.actions.create ? hasPermission(access.actions.create) : false,
    eliminar: access.actions.delete ? hasPermission(access.actions.delete) : false,
  };
  const filas = Object.entries(clasificaciones.categorias);
  const porPagina = 8;
  const obtenerVisual = (categoria: string) => cambios[categoria] ?? getCategoriaVisual(categoria);
  const actualizarVisual = (categoria: string, campo: 'imagen' | 'descripcion', valor: string) => {
    const actual = obtenerVisual(categoria);
    setCambios((anteriores) => ({ ...anteriores, [categoria]: { ...actual, [campo]: valor } }));
  };
  const guardarVisual = (categoria: string) => {
    saveCategoriaVisual(categoria, obtenerVisual(categoria));
    setCambios((anteriores) => { const siguientes = { ...anteriores }; delete siguientes[categoria]; return siguientes; });
  };
  const alternarEstado = (categoria: string) => {
    const visual = obtenerVisual(categoria);
    const actualizado = saveCategoriaVisual(categoria, { activo: !visual.activo });
    setCambios((anteriores) => ({ ...anteriores, [categoria]: actualizado }));
  };

  useEffect(() => setPagina(1), [filas.length]);

  if (!permisos.ver) return <div className="rounded-none border border-red-200 bg-red-50 p-4 text-sm text-red-700">No tienes permiso para visualizar este módulo.</div>;

  return (
    <section className="mx-auto max-w-5xl space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-950">Categorías</h2>
        <p className="text-sm text-zinc-500">Administra las categorías disponibles para los productos.</p>
      </div>
      {permisos.crear ? 
      <form onSubmit={(event) => { event.preventDefault(); if (!valor.trim()) return; agregarCategoria(valor.trim()); setValor(''); }} className="flex gap-3 rounded-none border border-zinc-200 bg-white p-4">
        <input value={valor} onChange={(event) => setValor(event.target.value)} placeholder="Ej. Polos" className="min-w-0 flex-1 rounded-none border border-zinc-300 px-3 py-2 text-sm" />
        <button className="rounded-none bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">Agregar</button>
      </form> : null}
      <div className="overflow-x-auto rounded-none border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Imagen</th>
              <th className="px-4 py-3">Descripción</th>
              <th className="px-4 py-3">Subcategorías</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>{filas.slice((pagina - 1) * porPagina, pagina * porPagina).map(([categoria, subcategorias]) => 
            <tr key={categoria} className="border-b border-zinc-100">
              <td className="px-4 py-3 font-medium">{categoria}</td>
              <td className="min-w-64 px-4 py-3"><input value={obtenerVisual(categoria).imagen} onChange={(event) => actualizarVisual(categoria, 'imagen', event.target.value)} placeholder="URL de imagen" className="w-full border border-zinc-300 px-2 py-1.5 text-xs" /></td>
              <td className="min-w-56 px-4 py-3"><input value={obtenerVisual(categoria).descripcion} onChange={(event) => actualizarVisual(categoria, 'descripcion', event.target.value)} placeholder="Texto de la categoría" className="w-full border border-zinc-300 px-2 py-1.5 text-xs" /></td>
              <td className="px-4 py-3 text-zinc-500">{subcategorias.length}</td>
              <td className="px-4 py-3"><button type="button" onClick={() => alternarEstado(categoria)} aria-label={obtenerVisual(categoria).activo ? `Desactivar ${categoria}` : `Activar ${categoria}`} className={`inline-flex h-8 w-8 items-center justify-center border text-sm font-semibold transition ${obtenerVisual(categoria).activo ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'}`}>{obtenerVisual(categoria).activo ? '✓' : '✕'}</button></td>
              <td className="px-4 py-3 text-right">{permisos.eliminar ?
                <div className="flex justify-end gap-2"><button type="button" onClick={() => guardarVisual(categoria)} className="border border-zinc-300 px-3 py-2 text-xs font-medium hover:border-zinc-900">Guardar</button><TablaAcciones><button type="button" onClick={() => eliminarCategoria(categoria)} className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">Eliminar</button></TablaAcciones></div> : <button type="button" onClick={() => guardarVisual(categoria)} className="border border-zinc-300 px-3 py-2 text-xs font-medium hover:border-zinc-900">Guardar</button>}
              </td>
            </tr>)}{!filas.length ? 
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">No hay categorías disponibles.</td>
            </tr> : null}
          </tbody>
        </table>
      </div>
      <PaginacionClientes paginaActual={pagina} paginaTope={Math.max(1, Math.ceil(filas.length / porPagina))} onPaginaChange={setPagina} />
    </section>
  );
};

