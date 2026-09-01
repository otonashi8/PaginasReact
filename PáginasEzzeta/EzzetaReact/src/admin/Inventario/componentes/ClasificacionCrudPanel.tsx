import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useClasificaciones } from '../productos/hooks/useClasificaciones';
import type { PermissionAccess } from '../../hooks/usePermissions';
import { PaginacionClientes } from '../../componentes/Paginacion';
import {
  crearGuiaTallasBase,
  type GuiaLavadoSubcategoria,
  type GuiaTallasSubcategoria,
  type TallaTipo,
} from '../productos/DatosProductos';

type ClasificacionTipo = 'categorias' | 'subcategorias' | 'beneficios' | 'tallas';

type ClasificacionCrudPanelProps = {
  access: PermissionAccess;
  tipo: ClasificacionTipo;
};

type FilaClasificacion = {
  item: string;
  detalle: string;
  categoria?: string;
};

const configuracion: Record<ClasificacionTipo, { titulo: string; descripcion: string; placeholder: string }> = {
  categorias: {
    titulo: 'Categorías',
    descripcion: 'Administra las categorías disponibles para los productos.',
    placeholder: 'Ej. Polos',
  },
  subcategorias: {
    titulo: 'Subcategorías',
    descripcion: 'Administra las subcategorías asociadas a cada categoría.',
    placeholder: 'Ej. Premium',
  },
  beneficios: {
    titulo: 'Beneficios',
    descripcion: 'Administra los beneficios que pueden mostrarse en los productos.',
    placeholder: 'Ej. Envío gratis',
  },
  tallas: {
    titulo: 'Tallas',
    descripcion: 'Administra tallas de letras y números para asignarlas a los productos.',
    placeholder: 'Ej. XXL o 38',
  },
};

export const ClasificacionCrudPanel = ({ access, tipo }: ClasificacionCrudPanelProps) => {
  const { hasPermission } = useAuth();
  const {
    clasificaciones,
    agregarCategoria,
    agregarSubcategoria,
    agregarBeneficio,
    agregarTalla,
    eliminarCategoria,
    eliminarSubcategoria,
    eliminarBeneficio,
    eliminarTalla,
    obtenerMetadataSubcategoria,
    guardarGuiaLavadoSubcategoria,
    guardarGuiaTallasSubcategoria,
  } = useClasificaciones();
  const [valor, setValor] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [categoria, setCategoria] = useState(Object.keys(clasificaciones.categorias)[0] ?? '');
  const [tipoTalla, setTipoTalla] = useState<TallaTipo>('letras');
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [metadataModalAbierto, setMetadataModalAbierto] = useState(false);
  const [guiaLavado, setGuiaLavado] = useState<GuiaLavadoSubcategoria>({ url: '', nombre: '' });
  const [guiaTallas, setGuiaTallas] = useState<GuiaTallasSubcategoria>(crearGuiaTallasBase());
  const permisos = {
    ver: access.actions.view ? hasPermission(access.actions.view) : true,
    crear: access.actions.create ? hasPermission(access.actions.create) : false,
    editar: access.actions.update ? hasPermission(access.actions.update) : false,
    eliminar: access.actions.delete ? hasPermission(access.actions.delete) : false,
  };
  const contenido = configuracion[tipo];

  const subcategoriasDisponibles = useMemo(
    () => Object.entries(clasificaciones.categorias).flatMap(([categoriaActual, subcategorias]) =>
      subcategorias.map((item) => ({ categoria: categoriaActual, item }))),
    [clasificaciones.categorias],
  );

  useEffect(() => {
    if (!subcategoriasDisponibles.length) {
      setCategoriaSeleccionada('');
      setSubcategoriaSeleccionada('');
      setGuiaLavado({ url: '', nombre: '' });
      setGuiaTallas(crearGuiaTallasBase());
      return;
    }

    const primeraSubcategoria = subcategoriasDisponibles[0];
    setCategoriaSeleccionada((current) => current || primeraSubcategoria.categoria);
    setSubcategoriaSeleccionada((current) => current || primeraSubcategoria.item);
  }, [subcategoriasDisponibles]);

  useEffect(() => {
    if (!categoriaSeleccionada || !subcategoriaSeleccionada) {
      return;
    }

    const metadata = obtenerMetadataSubcategoria(categoriaSeleccionada, subcategoriaSeleccionada);
    setGuiaLavado((actual) => {
      const siguiente = metadata.guiaLavado ?? { url: '', nombre: '' };
      return actual.url === siguiente.url && actual.nombre === siguiente.nombre ? actual : siguiente;
    });
    setGuiaTallas((actual) => {
      const siguiente = metadata.guiaTallas ?? crearGuiaTallasBase();
      return JSON.stringify(actual) === JSON.stringify(siguiente) ? actual : siguiente;
    });
  }, [categoriaSeleccionada, subcategoriaSeleccionada, clasificaciones.subcategoriasMetadata]);

  const agregar = () => {
    const valorNormalizado = valor.trim();
    if (!valorNormalizado || !permisos.crear) return;

    if (tipo === 'categorias') agregarCategoria(valorNormalizado);
    if (tipo === 'subcategorias') agregarSubcategoria(categoria, valorNormalizado);
    if (tipo === 'beneficios') agregarBeneficio(valorNormalizado);
    if (tipo === 'tallas') agregarTalla(valorNormalizado, tipoTalla);
    setValor('');
  };

  const eliminar = (valorAEliminar: string, categoriaDeSubcategoria?: string) => {
    if (!permisos.eliminar) return;
    if (tipo === 'categorias') eliminarCategoria(valorAEliminar);
    if (tipo === 'subcategorias' && categoriaDeSubcategoria) eliminarSubcategoria(categoriaDeSubcategoria, valorAEliminar);
    if (tipo === 'beneficios') eliminarBeneficio(valorAEliminar);
    if (tipo === 'tallas') eliminarTalla(valorAEliminar);
  };

  if (!permisos.ver) {
    return <div className="rounded-none border border-red-200 bg-red-50 p-4 text-sm text-red-700">No tienes permiso para visualizar este modulo.</div>;
  }

  const filas: FilaClasificacion[] = tipo === 'categorias'
    ? Object.keys(clasificaciones.categorias).map((item) => ({ item, detalle: `${clasificaciones.categorias[item]?.length ?? 0} subcategorías` }))
    : tipo === 'subcategorias'
      ? Object.entries(clasificaciones.categorias).flatMap(([categoriaActual, subcategorias]) => subcategorias.map((item) => ({ item, detalle: categoriaActual, categoria: categoriaActual })))
      : tipo === 'beneficios'
        ? clasificaciones.beneficiosDisponibles.map((item) => ({ item, detalle: 'Beneficio de producto' }))
        : (['letras', 'numeros'] as TallaTipo[]).flatMap((tipoActual) => clasificaciones.tallasPorTipo[tipoActual].map((item) => ({ item, detalle: tipoActual === 'letras' ? 'Letras' : 'Números' })));

  useEffect(() => {
    setPaginaActual(1);
  }, [tipo, filas.length]);

  const elementosPorPagina = 8;
  const paginaTope = Math.max(1, Math.ceil(filas.length / elementosPorPagina));
  const filasPagina = filas.slice((paginaActual - 1) * elementosPorPagina, paginaActual * elementosPorPagina);

  const actualizarFilaGuiaTallas = (indiceFila: number, campo: 'etiqueta' | 'valores', valorNuevo: string | Record<string, string>) => {
    setGuiaTallas((actual) => {
      const filasActualizadas = actual.filas.map((fila, indice) => {
        if (indice !== indiceFila) {
          return fila;
        }

        if (campo === 'etiqueta') {
          return { ...fila, etiqueta: String(valorNuevo) };
        }

        return { ...fila, valores: valorNuevo as Record<string, string> };
      });

      return { ...actual, filas: filasActualizadas };
    });
  };

  const guardarMetadataSubcategoria = () => {
    if (!categoriaSeleccionada || !subcategoriaSeleccionada) {
      return;
    }

    guardarGuiaLavadoSubcategoria(categoriaSeleccionada, subcategoriaSeleccionada, guiaLavado);
    guardarGuiaTallasSubcategoria(categoriaSeleccionada, subcategoriaSeleccionada, guiaTallas);
  };

  const abrirModalMetadataSubcategoria = (categoria: string, subcategoria: string) => {
    setCategoriaSeleccionada(categoria);
    setSubcategoriaSeleccionada(subcategoria);
    setMetadataModalAbierto(true);
  };

  const cerrarModalMetadataSubcategoria = () => {
    setMetadataModalAbierto(false);
  };

  return (
    <section className="mx-auto max-w-5xl space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-950">{contenido.titulo}</h2>
        <p className="text-sm text-zinc-500">{contenido.descripcion}</p>
      </div>

      {permisos.crear ? (
        <div className="grid gap-3 rounded-none border border-zinc-200 bg-white p-4 md:grid-cols-[1fr_auto_auto]">
          {tipo === 'subcategorias' ? (
            <select value={categoria} onChange={(event) => setCategoria(event.target.value)} className="rounded-none border border-zinc-300 px-3 py-2 text-sm">
              {Object.keys(clasificaciones.categorias).map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          ) : null}
          <input value={valor} onChange={(event) => setValor(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') agregar(); }} placeholder={contenido.placeholder} className="rounded-none border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900" />
          {tipo === 'tallas' ? (
            <select value={tipoTalla} onChange={(event) => setTipoTalla(event.target.value as TallaTipo)} className="rounded-none border border-zinc-300 px-3 py-2 text-sm">
              <option value="letras">Letras</option>
              <option value="numeros">Números</option>
            </select>
          ) : null}
          <button type="button" onClick={agregar} className="rounded-none bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">Agregar</button>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-none border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500"><tr><th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Detalle</th><th className="px-4 py-3 text-right">Acciones</th></tr></thead>
          <tbody>
            {filasPagina.map(({ item, detalle, categoria: categoriaFila }) => (
              <tr key={`${categoriaFila ?? ''}-${item}`} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3 font-medium text-zinc-900">{item}</td>
                <td className="px-4 py-3 text-zinc-500">{detalle}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {tipo === 'subcategorias' && permisos.editar && categoriaFila ? (
                      <button type="button" onClick={() => abrirModalMetadataSubcategoria(categoriaFila, item)} className="text-sm font-medium text-zinc-700 hover:text-zinc-950">Editar</button>
                    ) : null}
                    {permisos.eliminar ? (
                      <button type="button" onClick={() => eliminar(item, categoriaFila)} className="text-sm font-medium text-red-600 hover:text-red-800">Eliminar</button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {filas.length === 0 ? <tr><td colSpan={3} className="px-4 py-8 text-center text-zinc-500">No hay registros disponibles.</td></tr> : null}
          </tbody>
        </table>
      </div>

      <PaginacionClientes
        paginaActual={paginaActual}
        paginaTope={paginaTope}
        onPaginaChange={setPaginaActual}
      />

      {tipo === 'subcategorias' && metadataModalAbierto && categoriaSeleccionada && subcategoriaSeleccionada ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-none border border-zinc-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">Metadatos de {categoriaSeleccionada} / {subcategoriaSeleccionada}</h3>
                <p className="text-sm text-zinc-500">Asigna la guía de lavado y la guía de tallas para esta subcategoría.</p>
              </div>
              <button type="button" onClick={cerrarModalMetadataSubcategoria} className="rounded-none border border-zinc-300 px-3 py-2 text-sm text-zinc-600 hover:border-zinc-500 hover:text-zinc-900">Cerrar</button>
            </div>

            <div className="space-y-4 p-5">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-none border border-zinc-200 bg-zinc-50 p-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-700">Guía de lavado</h3>
                  <div className="mt-3 space-y-3">
                    <label className="block text-sm text-zinc-700">
                      <span className="mb-1 block font-medium">Archivo PDF</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;

                          const reader = new FileReader();
                          reader.onload = () => {
                            const result = String(reader.result ?? '');
                            setGuiaLavado({ url: result, nombre: file.name });
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="w-full rounded-none border border-zinc-300 bg-white px-3 py-2 text-sm"
                      />
                    </label>

                    {guiaLavado.url ? (
                      <a href={guiaLavado.url} target="_blank" rel="noreferrer" className="inline-flex text-sm font-medium text-red-600 hover:text-red-800">
                        Ver PDF actual: {guiaLavado.nombre || 'Guía de lavado'}
                      </a>
                    ) : (
                      <p className="text-sm text-zinc-500">Aún no hay una guía de lavado asociada.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-none border border-zinc-200 bg-zinc-50 p-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-700">Guía de tallas</h3>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-[420px] border border-zinc-200 bg-white text-left text-sm">
                      <thead>
                        <tr>
                          <th className="border-b border-zinc-200 px-2 py-2">Medida</th>
                          {guiaTallas.columnas.map((columna, indice) => (
                            <th key={`col-${indice}`} className="border-b border-zinc-200 px-2 py-2">
                              <input
                                value={columna}
                                onChange={(event) => {
                                  const nextColumns = [...guiaTallas.columnas];
                                  nextColumns[indice] = event.target.value || `Col ${indice + 1}`;
                                  setGuiaTallas((actual) => ({ ...actual, columnas: nextColumns }));
                                }}
                                className="w-full border-none bg-transparent px-1 py-1 text-center font-medium outline-none"
                              />
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {guiaTallas.filas.map((fila, filaIndex) => (
                          <tr key={`fila-${filaIndex}`}>
                            <td className="border-b border-zinc-200 px-2 py-2">
                              <input
                                value={fila.etiqueta}
                                onChange={(event) => actualizarFilaGuiaTallas(filaIndex, 'etiqueta', event.target.value)}
                                className="w-full border border-zinc-200 px-2 py-1 outline-none focus:border-zinc-800"
                              />
                            </td>
                            {guiaTallas.columnas.map((columna, columnaIndex) => (
                              <td key={`celda-${filaIndex}-${columnaIndex}`} className="border-b border-zinc-200 px-2 py-2">
                                <input
                                  value={fila.valores[columna] ?? ''}
                                  onChange={(event) => {
                                    const nextRows = guiaTallas.filas.map((filaActual, filaIndice) => {
                                      if (filaIndice !== filaIndex) return filaActual;
                                      return {
                                        ...filaActual,
                                        valores: {
                                          ...filaActual.valores,
                                          [columna]: event.target.value,
                                        },
                                      };
                                    });
                                    setGuiaTallas((actual) => ({ ...actual, filas: nextRows }));
                                  }}
                                  className="w-full border border-zinc-200 px-2 py-1 outline-none focus:border-zinc-800"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => setGuiaTallas((actual) => ({ ...actual, filas: [...actual.filas, { etiqueta: `Fila ${actual.filas.length + 1}`, valores: Object.fromEntries(actual.columnas.map((columna) => [columna, ''])) }] }))} className="rounded-none border border-zinc-300 px-3 py-2 text-sm hover:border-zinc-600">Agregar fila</button>
                    <button type="button" onClick={() => setGuiaTallas((actual) => ({ ...actual, columnas: [...actual.columnas, `Col ${actual.columnas.length + 1}`], filas: actual.filas.map((fila) => ({ ...fila, valores: { ...fila.valores, [`Col ${actual.columnas.length + 1}`]: '' } })) }))} className="rounded-none border border-zinc-300 px-3 py-2 text-sm hover:border-zinc-600">Agregar columna</button>
                  </div>

                  <label className="mt-4 block text-sm text-zinc-700">
                    <span className="mb-1 block font-medium">Mensaje secundario</span>
                    <textarea
                      value={guiaTallas.mensajeSecundario}
                      onChange={(event) => setGuiaTallas((actual) => ({ ...actual, mensajeSecundario: event.target.value }))}
                      className="min-h-[90px] w-full rounded-none border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-800"
                      placeholder="Ej. La medida corresponde al cuerpo sin zapatos."
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-zinc-200 px-5 py-4">
              <button type="button" onClick={cerrarModalMetadataSubcategoria} className="rounded-none border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-500 hover:text-zinc-900">Cancelar</button>
              <button type="button" onClick={() => { guardarMetadataSubcategoria(); cerrarModalMetadataSubcategoria(); }} className="rounded-none bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">Guardar metadatos</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};
