import { useEffect, useMemo, useState } from 'react';
import { useProductos } from './hooks/useProductos';
import { TablaProductos } from './componentes/TablaProductos';
import { ModalProducto } from './ModalProducto';
import type { PermissionAccess } from '../../hooks/usePermissions';
import { PaginacionClientes } from '../../componentes/Paginacion';

type ProductosCrudPanelProps = {
    access: PermissionAccess;
};

export const ProductosCrudPanel = ({ access }: ProductosCrudPanelProps) => {
    const [paginaActual, setPaginaActual] = useState(1);
    const elementosPorPagina = 10;
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [filtroSubcategoria, setFiltroSubcategoria] = useState('');
    const [filtroDestacado, setFiltroDestacado] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const {
        productos,
        productosFiltrados,
        busqueda,
        setBusqueda,
        productoActual,
        setProductoActual,
        modalAbierto,
        modoEdicion,
        abrirNuevoProducto,
        abrirEdicion,
        cerrarModal,
        guardarProducto,
        cambiarEstadoProducto,
        borrarProducto
    } = useProductos();

    const categorias = useMemo(
        () => Array.from(new Set(productos.map((producto) => producto.categoria).filter(Boolean))).sort(),
        [productos],
    );

    const subcategorias = useMemo(
        () => Array.from(new Set(
            productos
                .filter((producto) => !filtroCategoria || producto.categoria === filtroCategoria)
                .map((producto) => producto.subcategoria)
                .filter(Boolean),
        )).sort(),
        [productos, filtroCategoria],
    );

    const productosConFiltros = useMemo(() => productosFiltrados.filter((producto) => {
        const coincideCategoria = !filtroCategoria || producto.categoria === filtroCategoria;
        const coincideSubcategoria = !filtroSubcategoria || producto.subcategoria === filtroSubcategoria;
        const coincideDestacado = !filtroDestacado
            || (filtroDestacado === 'si' ? producto.destacado : !producto.destacado);
        const coincideEstado = !filtroEstado
            || (filtroEstado === 'activo' ? producto.activo : !producto.activo);

        return coincideCategoria && coincideSubcategoria && coincideDestacado && coincideEstado;
    }), [productosFiltrados, filtroCategoria, filtroSubcategoria, filtroDestacado, filtroEstado]);

    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda, productosConFiltros.length, filtroCategoria, filtroSubcategoria, filtroDestacado, filtroEstado]);

    const paginaProductos = useMemo(() => {
        const inicio = (paginaActual - 1) * elementosPorPagina;
        return productosConFiltros.slice(inicio, inicio + elementosPorPagina);
    }, [paginaActual, productosConFiltros]);

    const paginaTope = Math.max(1, Math.ceil(productosConFiltros.length / elementosPorPagina));

    const limpiarFiltros = () => {
        setFiltroCategoria('');
        setFiltroSubcategoria('');
        setFiltroDestacado('');
        setFiltroEstado('');
    };

    return (
        <section className="mx-auto max-w-7xl space-y-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">{access.label}</h2>
                    <p className="text-sm text-zinc-500">Gestion completa del catalogo para usar como plantilla del resto de modulos.</p>
                </div>
                <button
                    onClick={abrirNuevoProducto}
                    className="rounded-none bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-600"
                >Nuevo producto
                </button>
            </div>

            <div className="rounded-none border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="rounded-none border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900 xl:col-span-2"
                    />
                    <select value={filtroCategoria} onChange={(event) => { setFiltroCategoria(event.target.value); setFiltroSubcategoria(''); }} className="rounded-none border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900">
                        <option value="">Todas las categorías</option>
                        {categorias.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}
                    </select>
                    <select value={filtroSubcategoria} onChange={(event) => setFiltroSubcategoria(event.target.value)} className="rounded-none border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900">
                        <option value="">Todas las subcategorías</option>
                        {subcategorias.map((subcategoria) => <option key={subcategoria} value={subcategoria}>{subcategoria}</option>)}
                    </select>
                    <select value={filtroDestacado} onChange={(event) => setFiltroDestacado(event.target.value)} className="rounded-none border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900">
                        <option value="">Destacados: todos</option>
                        <option value="si">Solo destacados</option>
                        <option value="no">No destacados</option>
                    </select>
                    <select value={filtroEstado} onChange={(event) => setFiltroEstado(event.target.value)} className="rounded-none border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900">
                        <option value="">Estado: todos</option>
                        <option value="activo">Activos</option>
                        <option value="inactivo">Inactivos</option>
                    </select>
                </div>
                {(filtroCategoria || filtroSubcategoria || filtroDestacado || filtroEstado) && (
                    <button type="button" onClick={limpiarFiltros} className="mt-3 text-sm font-medium text-red-600 hover:text-red-800">Limpiar filtros</button>
                )}
            </div>

            <TablaProductos
                productosTotales={productos}
                productos={paginaProductos}
                editar={abrirEdicion}
                cambiarEstado={cambiarEstadoProducto}
                eliminar={borrarProducto}
            />

            <PaginacionClientes
                paginaActual={paginaActual}
                paginaTope={paginaTope}
                onPaginaChange={setPaginaActual}
            />

            {
                modalAbierto &&
                <ModalProducto
                    modoEdicion={modoEdicion}
                    producto={productoActual}
                    setProducto={setProductoActual}
                    productosExistentes={productos}
                    guardar={guardarProducto}
                    cerrar={cerrarModal}
                />
            }
        </section>
    );
};