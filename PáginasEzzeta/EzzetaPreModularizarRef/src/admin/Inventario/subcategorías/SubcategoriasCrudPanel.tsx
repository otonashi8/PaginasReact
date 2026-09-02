import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import type { PermissionAccess } from '../../hooks/usePermissions';
import { PaginacionClientes } from '../../componentes/Paginacion';
import { TablaAcciones } from '../../componentes/TablaAcciones';
import { crearGuiaTallasBase, type GuiaLavadoSubcategoria, type GuiaTallasSubcategoria, type NivelMayoristaSubcategoria } from '../productos/DatosProductos';
import { useClasificaciones } from '../productos/hooks/useClasificaciones';

type Props = { access: PermissionAccess };
type Fila = { categoria: string; nombre: string };

export const SubcategoriasCrudPanel = ({ access }: Props) => {
  const { hasPermission } = useAuth();
  const { clasificaciones, agregarSubcategoria, eliminarSubcategoria, obtenerMetadataSubcategoria, guardarMetadataSubcategoria } = useClasificaciones();
  const [categoria, setCategoria] = useState(Object.keys(clasificaciones.categorias)[0] ?? '');
  const [valor, setValor] = useState('');
  const [pagina, setPagina] = useState(1);
  const [editando, setEditando] = useState<Fila | null>(null);
  const [lavado, setLavado] = useState<GuiaLavadoSubcategoria>({ url: '', nombre: '' });
  const [tallas, setTallas] = useState<GuiaTallasSubcategoria>(crearGuiaTallasBase());
  const [niveles, setNiveles] = useState<NivelMayoristaSubcategoria[]>([]);
  const categorias = Object.keys(clasificaciones.categorias);
  const filas = Object.entries(clasificaciones.categorias).flatMap(([categoriaFila, subcategorias]) => subcategorias.map((nombre) => ({ categoria: categoriaFila, nombre })));
  const permisos = { ver: access.actions.view ? hasPermission(access.actions.view) : true, crear: access.actions.create ? hasPermission(access.actions.create) : false, editar: access.actions.update ? hasPermission(access.actions.update) : false, eliminar: access.actions.delete ? hasPermission(access.actions.delete) : false };
  const porPagina = 8;

  const abrirEdicion = (fila: Fila) => {
    const metadata = obtenerMetadataSubcategoria(fila.categoria, fila.nombre);
    setEditando(fila);
    setLavado(metadata.guiaLavado ?? { url: '', nombre: '' });
    setTallas(metadata.guiaTallas ?? crearGuiaTallasBase());
    setNiveles(metadata.nivelesMayoristas ?? []);
  };
  const guardar = () => {
    if (!editando) return;
    guardarMetadataSubcategoria(editando.categoria, editando.nombre, { guiaLavado: lavado, guiaTallas: tallas, nivelesMayoristas: niveles.filter((nivel) => nivel.cantidad > 0 && nivel.precio >= 0).sort((a, b) => a.cantidad - b.cantidad) });
    setEditando(null);
  };

  if (!permisos.ver) return <div className="rounded-none border border-red-200 bg-red-50 p-4 text-sm text-red-700">No tienes permiso para visualizar este módulo.</div>;
  return (
  <section className="mx-auto max-w-5xl space-y-4">
    <div>
        <h2 className="text-2xl font-semibold">Subcategorías</h2>
        <p className="text-sm text-zinc-500">Administra subcategorías, guías y precios mayoristas.</p>
    </div>
    {permisos.crear ? 
    <form onSubmit={(event) => { event.preventDefault(); if (categoria && valor.trim()) { agregarSubcategoria(categoria, valor.trim()); setValor(''); } }} className="grid gap-3 border border-zinc-200 bg-white p-4 md:grid-cols-[auto_1fr_auto]"><select value={categoria} onChange={(event) => setCategoria(event.target.value)} className="border border-zinc-300 px-3 py-2 text-sm">{categorias.map((item) => <option key={item}>{item}</option>)}</select><input value={valor} onChange={(event) => setValor(event.target.value)} placeholder="Nueva subcategoría" className="border border-zinc-300 px-3 py-2 text-sm" /><button className="bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">Agregar</button></form> : null}
    <div className="overflow-x-auto border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                <tr>
                    <th className="px-4 py-3">Subcategoría</th>
                    <th className="px-4 py-3">Categoría</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
            </thead>
            <tbody>{filas.slice((pagina - 1) * porPagina, pagina * porPagina).map((fila) => 
                <tr key={`${fila.categoria}-${fila.nombre}`} className="border-t border-zinc-100">
                    <td className="px-4 py-3 font-medium">{fila.nombre}</td>
                    <td className="px-4 py-3 text-zinc-500">{fila.categoria}</td>
                    <td className="px-4 py-3 text-right">
                        <div className="flex justify-end">
                            {permisos.editar || permisos.eliminar ? <TablaAcciones>
                                {permisos.editar ? <button type="button" onClick={() => abrirEdicion(fila)} className="block w-full px-3 py-2 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-100">Editar</button> : null}
                                {permisos.eliminar ? <button type="button" onClick={() => eliminarSubcategoria(fila.categoria, fila.nombre)} className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">Eliminar</button> : null}
                            </TablaAcciones> : null}
                        </div>
                    </td>
                </tr>
            )}
            </tbody>
        </table>
    </div>
    <PaginacionClientes paginaActual={pagina} paginaTope={Math.max(1, Math.ceil(filas.length / porPagina))} onPaginaChange={setPagina} />
    {editando ? 
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/45 p-4">
        <div className="my-4 w-full max-w-4xl bg-white shadow-2xl">
            <header className="flex justify-between border-b border-zinc-200 p-5">
                <div>
                    <h3 className="text-lg font-semibold">Editar {editando.nombre}</h3>
                    <p className="text-sm text-zinc-500">Guías y precio mayorista por subcategoría.</p>
                </div>
                <button type="button" onClick={() => setEditando(null)} className="border border-zinc-300 px-3 py-2 text-sm">Cerrar</button>
            </header>
            <div className="grid gap-4 p-5 lg:grid-cols-2">
                <div className="space-y-4">
                    <div className="border border-zinc-200 bg-zinc-50 p-4">
                        <h4 className="font-semibold">Guía de lavado</h4>
                        <input 
                        type="file" 
                        accept="application/pdf" 
                        onChange={(event) => { const file = event.target.files?.[0]; 
                        if (!file) return; const reader = new FileReader(); 
                        reader.onload = () => setLavado({ url: String(reader.result ?? ''), nombre: file.name });
                        reader.readAsDataURL(file); }} className="mt-3 w-full text-sm" />{lavado.url ? 
                        <a href={lavado.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-red-600">Ver PDF actual</a> 
                        : null}
                    </div>
                    <div className="border border-zinc-200 bg-zinc-50 p-4">
                        <h4 className="font-semibold">Venta al por mayor</h4>
                        <p className="text-xs text-zinc-500">La cantidad se suma entre tallas y colores de esta subcategoría.</p>
                        {niveles.map((nivel, indice) => 
                        <div key={indice} className="mt-2 grid grid-cols-3 gap-2">
                            <input 
                            type="number" 
                            min="1" value={nivel.cantidad} 
                            onChange={(event) => setNiveles((actual) => actual.map((item, index) => index === indice ? { ...item, cantidad: Number(event.target.value) } : item))} 
                            className="border px-2 py-1 text-sm" placeholder="Cantidad" />
                            <input 
                            type="number" 
                            min="0" step="0.01" value={nivel.precio} 
                            onChange={(event) => setNiveles((actual) => actual.map((item, index) => index === indice ? { ...item, precio: Number(event.target.value) } : item))} 
                            className="border px-2 py-1 text-sm" placeholder="Precio" />
                            <button type="button" onClick={() => setNiveles((actual) => actual.filter((_, index) => index !== indice))} className="text-red-600">Eliminar</button>
                        </div>)}
                        <button type="button" onClick={() => setNiveles((actual) => [...actual, { cantidad: 1, precio: 0 }])} className="mt-3 border px-3 py-2 text-sm">Agregar fila</button>
                    </div>
                </div>
                <div className="border border-zinc-200 bg-zinc-50 p-4">
                    <h4 className="font-semibold">Guía de tallas</h4>
                    <div className="mt-3 overflow-x-auto">
                        <table className="min-w-[520px] bg-white text-sm">
                            <thead>
                                <tr>
                                    <th className="border px-2 py-2">Medida</th>
                                    {tallas.columnas.map((columna, indice) => 
                                    <th key={`${columna}-${indice}`} className="border px-2 py-2">{columna}</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>{tallas.filas.map((fila, filaIndice) => 
                                <tr key={filaIndice}>
                                    <td className="border px-2 py-2">{fila.etiqueta}</td>{tallas.columnas.map((columna) => 
                                    <td key={columna} className="border px-2 py-2">{fila.valores[columna] ?? ''}</td>)}
                                </tr>)}
                            </tbody>
                        </table>
                    </div>
                    <textarea value={tallas.mensajeSecundario} onChange={(event) => setTallas((actual) => ({ ...actual, mensajeSecundario: event.target.value }))} placeholder="Mensaje secundario" className="mt-3 min-h-20 w-full border p-2 text-sm" />
                </div>
            </div>
            <footer className="flex justify-end gap-3 border-t p-5">
                <button type="button" onClick={() => setEditando(null)} className="border px-4 py-2 text-sm">Cancelar</button>
                <button type="button" onClick={guardar} className="bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">Guardar cambios</button>
            </footer>
        </div>
    </div> : null}
  </section>
  );
};
