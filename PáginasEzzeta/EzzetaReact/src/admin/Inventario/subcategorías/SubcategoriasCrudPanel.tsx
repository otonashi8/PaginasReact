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
    const [precio, setPrecio] = useState('');
    const [preciosTabla, setPreciosTabla] = useState<Record<string, string>>({});
        const [nuevaColumna, setNuevaColumna] = useState('');
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
    setPrecio(metadata.precio !== undefined ? String(metadata.precio) : '');
  };
  const guardar = () => {
    if (!editando) return;
    const precioNumerico = Number(precio);
    guardarMetadataSubcategoria(editando.categoria, editando.nombre, { precio: Number.isFinite(precioNumerico) && precioNumerico > 0 ? precioNumerico : 0, guiaLavado: lavado, guiaTallas: tallas, nivelesMayoristas: niveles.filter((nivel) => nivel.cantidad > 0 && nivel.precio >= 0).sort((a, b) => a.cantidad - b.cantidad) });
    setEditando(null);
  };
    const actualizarColumna = (indice: number, valor: string) => {
        setTallas((actual) => {
            const columnaAnterior = actual.columnas[indice];
            const columnas = actual.columnas.map((columna, columnaIndice) => columnaIndice === indice ? valor : columna);
            const filas = actual.filas.map((fila) => {
                const valores = { ...fila.valores };
                if (columnaAnterior !== valor) {
                    valores[valor] = valores[columnaAnterior] ?? '';
                    delete valores[columnaAnterior];
                }
                return { ...fila, valores };
            });
            return { ...actual, columnas, filas };
        });
    };
    const agregarColumna = () => {
        const nombre = nuevaColumna.trim();
        if (!nombre || tallas.columnas.some((columna) => columna.toLowerCase() === nombre.toLowerCase())) return;
        setTallas((actual) => ({
            ...actual,
            columnas: [...actual.columnas, nombre],
            filas: actual.filas.map((fila) => ({ ...fila, valores: { ...fila.valores, [nombre]: '' } })),
        }));
        setNuevaColumna('');
    };
    const eliminarColumna = (indice: number) => {
        if (tallas.columnas.length <= 1) return;
        setTallas((actual) => {
            const columna = actual.columnas[indice];
            return {
                ...actual,
                columnas: actual.columnas.filter((_, columnaIndice) => columnaIndice !== indice),
                filas: actual.filas.map((fila) => {
                    const valores = { ...fila.valores };
                    delete valores[columna];
                    return { ...fila, valores };
                }),
            };
        });
    };
    const actualizarFila = (filaIndice: number, cambios: Partial<{ etiqueta: string; valores: Record<string, string> }>) => {
        setTallas((actual) => ({
            ...actual,
            filas: actual.filas.map((fila, indice) => indice === filaIndice ? { ...fila, ...cambios } : fila),
        }));
    };
    const agregarFila = () => {
        setTallas((actual) => ({
            ...actual,
            filas: [...actual.filas, { etiqueta: '', valores: Object.fromEntries(actual.columnas.map((columna) => [columna, ''])) }],
        }));
    };
    const eliminarFila = (filaIndice: number) => {
        if (tallas.filas.length <= 1) return;
        setTallas((actual) => ({ ...actual, filas: actual.filas.filter((_, indice) => indice !== filaIndice) }));
    };
    const guardarPrecioTabla = (fila: Fila) => {
        const clave = `${fila.categoria}::${fila.nombre}`;
        const valor = Number(preciosTabla[clave]);
        if (!Number.isFinite(valor) || valor <= 0) return;
        guardarMetadataSubcategoria(fila.categoria, fila.nombre, { precio: valor });
        setPreciosTabla((actual) => ({ ...actual, [clave]: '' }));
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
                    <th className="px-4 py-3">Precio base</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
            </thead>
            <tbody>{filas.slice((pagina - 1) * porPagina, pagina * porPagina).map((fila) => 
                <tr key={`${fila.categoria}-${fila.nombre}`} className="border-t border-zinc-100">
                    <td className="px-4 py-3 font-medium">{fila.nombre}</td>
                    <td className="px-4 py-3 text-zinc-500">{fila.categoria}</td>
                    <td className="min-w-52 px-4 py-3"><div className="flex gap-2"><input type="number" min="0.01" step="0.01" value={preciosTabla[`${fila.categoria}::${fila.nombre}`] ?? (obtenerMetadataSubcategoria(fila.categoria, fila.nombre).precio ?? '')} onChange={(event) => setPreciosTabla((actual) => ({ ...actual, [`${fila.categoria}::${fila.nombre}`]: event.target.value }))} className="w-28 border border-zinc-300 px-2 py-1.5 text-sm" /><button type="button" onClick={() => guardarPrecioTabla(fila)} className="border border-zinc-300 px-2 py-1.5 text-xs font-medium hover:border-zinc-900">Guardar</button></div></td>
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
        <div className="my-4 w-full max-w-5xl bg-white shadow-2xl">
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
                        <label className="mt-3 block text-xs font-medium text-zinc-600">PDF de la guía</label>
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = () => setLavado((actual) => ({ ...actual, url: String(reader.result ?? ''), nombre: file.name }));
                                reader.readAsDataURL(file);
                            }}
                            className="mt-1 w-full text-sm"
                        />
                        {lavado.url ? <a href={lavado.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-red-600">Ver PDF actual</a> : null}
                    </div>
                    <div className="border border-zinc-200 bg-zinc-50 p-4">
                        <h4 className="font-semibold">Precio del producto</h4>
                        <p className="text-xs text-zinc-500">Se aplicará a todos los productos de esta subcategoría al guardar.</p>
                        <input type="number" min="0.01" step="0.01" value={precio} onChange={(event) => setPrecio(event.target.value)} className="mt-3 w-full border px-2 py-2 text-sm" placeholder="Precio base" />
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
                        <label className="mt-3 block text-xs font-medium text-zinc-600">URL de imagen</label>
                        <input
                            type="url"
                            value={tallas.imagenUrl ?? ''}
                            onChange={(event) => setTallas((actual) => ({ ...actual, imagenUrl: event.target.value }))}
                            placeholder="https://.../guia-tallas.jpg"
                            className="mt-1 w-full border border-zinc-300 px-2 py-2 text-sm"
                        />
                        <label className="mt-3 block text-xs font-medium text-zinc-600">Imagen desde tu PC</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = () => setTallas((actual) => ({ ...actual, imagenUrl: String(reader.result ?? '') }));
                                reader.readAsDataURL(file);
                            }}
                            className="mt-1 w-full text-sm"
                        />
                        {tallas.imagenUrl ? <img src={tallas.imagenUrl} alt="Vista previa de la guía de tallas" className="mt-3 max-h-40 w-full object-contain bg-white" /> : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                        <input value={nuevaColumna} onChange={(event) => setNuevaColumna(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); agregarColumna(); } }} placeholder="Nueva columna" className="min-w-40 flex-1 border px-2 py-1.5 text-sm" />
                        <button type="button" onClick={agregarColumna} className="border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium hover:border-zinc-900">Agregar columna</button>
                        <button type="button" onClick={agregarFila} className="border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium hover:border-zinc-900">Agregar fila</button>
                    </div>
                    <div className="mt-3 overflow-x-auto">
                        <table className="min-w-[520px] bg-white text-sm">
                            <thead>
                                <tr>
                                    <th className="border px-2 py-2">Medida</th>
                                    {tallas.columnas.map((columna, indice) => 
                                    <th key={`${columna}-${indice}`} className="border px-2 py-2">
                                        <div className="flex min-w-24 items-center gap-1">
                                            <input value={columna} onChange={(event) => actualizarColumna(indice, event.target.value)} className="w-full border px-1 py-1 text-xs" aria-label={`Nombre de columna ${indice + 1}`} />
                                            <button type="button" onClick={() => eliminarColumna(indice)} disabled={tallas.columnas.length <= 1} className="text-red-600 disabled:cursor-not-allowed disabled:opacity-30" aria-label={`Eliminar columna ${columna}`} title="Eliminar columna">×</button>
                                        </div>
                                    </th>
                                    )}
                                    <th className="border px-2 py-2">Acción</th>
                                </tr>
                            </thead>
                            <tbody>{tallas.filas.map((fila, filaIndice) => 
                                <tr key={filaIndice}>
                                    <td className="border px-2 py-2"><input value={fila.etiqueta} onChange={(event) => actualizarFila(filaIndice, { etiqueta: event.target.value })} className="w-20 border px-1 py-1 text-xs" aria-label={`Etiqueta de fila ${filaIndice + 1}`} /></td>{tallas.columnas.map((columna) => 
                                    <td key={columna} className="border px-2 py-2"><input value={fila.valores[columna] ?? ''} onChange={(event) => actualizarFila(filaIndice, { valores: { ...fila.valores, [columna]: event.target.value } })} className="w-24 border px-1 py-1 text-xs" aria-label={`${columna}, fila ${filaIndice + 1}`} /></td>)}
                                    <td className="border px-2 py-2 text-center"><button type="button" onClick={() => eliminarFila(filaIndice)} disabled={tallas.filas.length <= 1} className="text-xs text-red-600 disabled:cursor-not-allowed disabled:opacity-30">Eliminar</button></td>
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
