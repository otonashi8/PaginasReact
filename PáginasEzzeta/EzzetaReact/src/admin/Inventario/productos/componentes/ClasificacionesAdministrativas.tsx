import { useEffect, useState } from 'react';
import { storageManager, StorageKeys } from '../../../../storage';
import type { ClasificacionesProductos } from '../DatosProductos';

type Props = {
    clasificaciones: ClasificacionesProductos;
    agregarCategoria: (categoria: string) => void;
    agregarSubcategoria: (categoria: string, subcategoria: string) => void;
    agregarGenero: (genero: string) => void;
    agregarBeneficio: (beneficio: string) => void;
    agregarTalla: (talla: string, tipo?: 'letras' | 'numeros') => void;
    eliminarCategoria: (categoria: string) => void;
    eliminarSubcategoria: (categoria: string, subcategoria: string) => void;
    eliminarGenero: (genero: string) => void;
    eliminarBeneficio: (beneficio: string) => void;
    eliminarTalla: (talla: string) => void;
};

export const ClasificacionesAdministrativas = ({
    clasificaciones,
    agregarCategoria,
    agregarSubcategoria,
    agregarGenero,
    agregarBeneficio,
    agregarTalla,
    eliminarCategoria,
    eliminarSubcategoria,
    eliminarGenero,
    eliminarBeneficio,
    eliminarTalla,
}: Props) => {
    const [expandido, setExpandido] = useState(false);
    const [categoriasExpandido, setCategoriasExpandido] = useState(true);
    const [subcategoriasExpandido, setSubcategoriasExpandido] = useState(true);
    const [generosExpandido, setGenerosExpandido] = useState(true);
    const [beneficiosExpandido, setBeneficiosExpandido] = useState(true);
    const [tallasExpandido, setTallasExpandido] = useState(true);
    const [categoriaNueva, setCategoriaNueva] = useState('');
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
    const [subcategoriaNueva, setSubcategoriaNueva] = useState('');
    const [generoNuevo, setGeneroNuevo] = useState('');
    const [beneficioNuevo, setBeneficioNuevo] = useState('');
    const [tallaNueva, setTallaNueva] = useState('');
    const [tipoTallaNueva, setTipoTallaNueva] = useState<'letras' | 'numeros'>('letras');

    useEffect(() => {
        if (!categoriaSeleccionada) {
            setCategoriaSeleccionada(Object.keys(clasificaciones.categorias)[0] ?? '');
        }
    }, [clasificaciones.categorias, categoriaSeleccionada]);

    useEffect(() => {
        try {
            const valor = storageManager.get(StorageKeys.CLASIFICACIONES_EXPANDIDO);
            setExpandido(String(valor) === 'true');

            const categoriasValor = storageManager.get(StorageKeys.CLASIFICACIONES_CATEGORIAS_EXPANDIDO);
            const subcategoriasValor = storageManager.get(StorageKeys.CLASIFICACIONES_SUBCATEGORIAS_EXPANDIDO);
            const generosValor = storageManager.get(StorageKeys.CLASIFICACIONES_GENEROS_EXPANDIDO);
            const tallasValor = storageManager.get(StorageKeys.CLASIFICACIONES_TALLAS_EXPANDIDO);

            if (categoriasValor !== null && categoriasValor !== undefined) {
                setCategoriasExpandido(String(categoriasValor) === 'true');
            }
            if (subcategoriasValor !== null && subcategoriasValor !== undefined) {
                setSubcategoriasExpandido(String(subcategoriasValor) === 'true');
            }
            if (generosValor !== null && generosValor !== undefined) {
                setGenerosExpandido(String(generosValor) === 'true');
            }
            if (tallasValor !== null && tallasValor !== undefined) {
                setTallasExpandido(String(tallasValor) === 'true');
            }
        } catch {
        }
    }, []);

    const toggleExpandido = () => {
        const siguiente = !expandido;
        setExpandido(siguiente);

        try { storageManager.set(StorageKeys.CLASIFICACIONES_EXPANDIDO, String(siguiente)); } catch {}
    };

    const toggleCategoriasExpandido = () => {
        const siguiente = !categoriasExpandido;
        setCategoriasExpandido(siguiente);
        try { storageManager.set(StorageKeys.CLASIFICACIONES_CATEGORIAS_EXPANDIDO, String(siguiente)); } catch {}
    };

    const toggleSubcategoriasExpandido = () => {
        const siguiente = !subcategoriasExpandido;
        setSubcategoriasExpandido(siguiente);
        try { storageManager.set(StorageKeys.CLASIFICACIONES_SUBCATEGORIAS_EXPANDIDO, String(siguiente)); } catch {}
    };

    const toggleGenerosExpandido = () => {
        const siguiente = !generosExpandido;
        setGenerosExpandido(siguiente);
        try { storageManager.set(StorageKeys.CLASIFICACIONES_GENEROS_EXPANDIDO, String(siguiente)); } catch {}
    };

    const toggleTallasExpandido = () => {
        const siguiente = !tallasExpandido;
        setTallasExpandido(siguiente);
        try { storageManager.set(StorageKeys.CLASIFICACIONES_TALLAS_EXPANDIDO, String(siguiente)); } catch {}
    };

    const handleAgregarCategoria = () => {
        if (!categoriaNueva.trim()) {
            return;
        }
        agregarCategoria(categoriaNueva.trim());
        setCategoriaNueva('');
    };

    const handleAgregarSubcategoria = () => {
        if (!categoriaSeleccionada || !subcategoriaNueva.trim()) {
            return;
        }
        agregarSubcategoria(categoriaSeleccionada, subcategoriaNueva.trim());
        setSubcategoriaNueva('');
    };

    const handleAgregarGenero = () => {
        if (!generoNuevo.trim()) {
            return;
        }
        agregarGenero(generoNuevo.trim());
        setGeneroNuevo('');
    };

    const handleAgregarBeneficio = () => {
        if (!beneficioNuevo.trim()) {
            return;
        }
        agregarBeneficio(beneficioNuevo.trim());
        setBeneficioNuevo('');
    };

    const handleAgregarTalla = () => {
        if (!tallaNueva.trim()) {
            return;
        }
        agregarTalla(tallaNueva.trim(), tipoTallaNueva);
        setTallaNueva('');
    };

    return (
        <section className="rounded-none border border-zinc-200 bg-white shadow-sm">
            {/* CABECERA */}
            <div className="flex flex-col gap-3 border-b border-zinc-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-red-600">Configuración</p>
                    <h3 className="mt-1 text-base font-semibold text-zinc-950">Clasificaciones de inventario</h3>
                    <p className="mt-1 max-w-3xl text-sm text-zinc-500">
                        Administra categorías, subcategorías, géneros, beneficios y
                        tallas disponibles para tus productos.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={toggleExpandido}
                    aria-label={
                        expandido
                            ? 'Ocultar clasificaciones'
                            : 'Mostrar clasificaciones'
                    }
                    className="flex size-9 shrink-0 items-center justify-center rounded-none border border-zinc-300 bg-white text-lg font-medium text-zinc-800 transition hover:border-red-600 hover:text-red-600"
                >{expandido ? '−' : '+'}
                </button>
            </div>
            {expandido ? (
                <div className="grid gap-4 p-4 xl:grid-cols-2">
                    <div className="min-w-0 space-y-4">
                        <div className="rounded-none border border-zinc-200 bg-zinc-50">
                            <div className="flex items-start justify-between gap-3 p-4">
                                <div className="min-w-0">
                                    <h4 className="font-semibold text-zinc-950">Categorías</h4>
                                    <p className="mt-1 text-xs leading-5 text-zinc-500">Categorías principales del catálogo.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={toggleCategoriasExpandido}
                                    className="shrink-0 rounded-none border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 transition hover:border-red-600 hover:text-red-600"
                                >{categoriasExpandido ? 'Ocultar' : 'Mostrar'}
                                </button>
                            </div>
                            {categoriasExpandido ? (
                                <div className="border-t border-zinc-200 p-4">
                                    {/* CREAR CATEGORÍA */}
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <input
                                            type="text"
                                            value={categoriaNueva}
                                            onChange={(event) =>
                                                setCategoriaNueva(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Nueva categoría"
                                            className="min-w-0 flex-1 rounded-none border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAgregarCategoria}
                                            className="rounded-none bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 sm:shrink-0"
                                        >Agregar
                                        </button>
                                    </div>
                                    {/* LISTA */}
                                    <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
                                        {Object.entries(
                                            clasificaciones.categorias
                                        ).map(
                                            ([
                                                categoria,
                                                subcategorias,
                                            ]) => (
                                                <div
                                                    key={categoria}
                                                    className="border border-zinc-200 bg-white p-3"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <p className="min-w-0 break-words text-sm font-semibold text-zinc-900">{categoria}</p>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                eliminarCategoria(
                                                                    categoria
                                                                )
                                                            }
                                                            className="shrink-0 border border-red-200 bg-red-50 px-2 py-1 text-[0.65rem] font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
                                                        >Eliminar
                                                        </button>
                                                    </div>
                                                    {subcategorias.length > 0 ? (
                                                        <div className="mt-2 space-y-1.5 border-t border-zinc-100 pt-2">
                                                            {subcategorias.map(
                                                                (
                                                                    subcategoria
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            subcategoria
                                                                        }
                                                                        className="flex items-center justify-between gap-3 bg-zinc-50 px-3 py-2 text-xs text-zinc-700"
                                                                    >
                                                                        <span className="min-w-0 break-words">
                                                                            {
                                                                                subcategoria
                                                                            }
                                                                        </span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                eliminarSubcategoria(
                                                                                    categoria,
                                                                                    subcategoria
                                                                                )
                                                                            }
                                                                            className="shrink-0 text-[0.65rem] font-medium text-red-600 transition hover:text-red-800"
                                                                        >Eliminar
                                                                        </button>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p className="mt-2 text-xs text-zinc-400">Sin subcategorías.</p>
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                        <div className="rounded-none border border-zinc-200 bg-zinc-50">
                            <div className="flex items-start justify-between gap-3 p-4">
                                <div>
                                    <h4 className="font-semibold text-zinc-950">Subcategorías</h4>
                                    <p className="mt-1 text-xs leading-5 text-zinc-500">Asocia nuevas subcategorías a una categoría.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={toggleSubcategoriasExpandido}
                                    className="shrink-0 rounded-none border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 transition hover:border-red-600 hover:text-red-600"
                                >
                                    {subcategoriasExpandido
                                        ? 'Ocultar'
                                        : 'Mostrar'}
                                </button>
                            </div>
                            {subcategoriasExpandido ? (
                                <div className="border-t border-zinc-200 p-4">
                                    <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                                        <label className="block text-sm text-zinc-700">
                                            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-600">Categoría</span>
                                            <select
                                                value={categoriaSeleccionada}
                                                onChange={(event) =>
                                                    setCategoriaSeleccionada(
                                                        event.target.value
                                                    )
                                                }
                                                className="w-full rounded-none border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
                                            >
                                                {Object.keys(
                                                    clasificaciones.categorias
                                                ).map((categoria) => (
                                                    <option
                                                        key={categoria}
                                                        value={categoria}
                                                    >
                                                        {categoria}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleAgregarSubcategoria}
                                            className="self-end rounded-none bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
                                        >Agregar
                                        </button>
                                    </div>
                                    <label className="mt-3 block text-sm text-zinc-700">
                                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-600">Subcategoría</span>
                                        <input
                                            type="text"
                                            value={subcategoriaNueva}
                                            onChange={(event) =>
                                                setSubcategoriaNueva(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Nueva subcategoría"
                                            className="w-full rounded-none border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
                                        />
                                    </label>
                                </div>
                            ) : null}
                        </div>
                    </div>
                    <div className="min-w-0 space-y-4">
                        <div className="rounded-none border border-zinc-200 bg-zinc-50">
                            <div className="flex items-start justify-between gap-3 p-4">
                                <div>
                                    <h4 className="font-semibold text-zinc-950">Géneros</h4>
                                    <p className="mt-1 text-xs leading-5 text-zinc-500">Define los géneros disponibles para elcatálogo.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={toggleGenerosExpandido}
                                    className="shrink-0 rounded-none border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 transition hover:border-red-600 hover:text-red-600"
                                >{generosExpandido ? 'Ocultar' : 'Mostrar'}
                                </button>
                            </div>
                            {generosExpandido ? (
                                <div className="border-t border-zinc-200 p-4">
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <input
                                            type="text"
                                            value={generoNuevo}
                                            onChange={(event) =>
                                                setGeneroNuevo(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Nuevo género"
                                            className="min-w-0 flex-1 rounded-none border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAgregarGenero}
                                            className="rounded-none bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
                                        >Agregar
                                        </button>
                                    </div>
                                    <div className="mt-4 flex max-h-48 flex-wrap gap-2 overflow-y-auto pr-1">
                                        {clasificaciones.generosDisponibles.map(
                                            (genero) => (
                                                <div
                                                    key={genero}
                                                    className="flex items-center gap-2 border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-700"
                                                >
                                                    <span>{genero}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            eliminarGenero(
                                                                genero
                                                            )
                                                        }
                                                        className="font-bold text-red-600 transition hover:text-red-800"
                                                    >×
                                                    </button>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                        <div className="rounded-none border border-zinc-200 bg-zinc-50">
                            <div className="flex items-start justify-between gap-3 p-4">
                                <div>
                                    <h4 className="font-semibold text-zinc-950">Beneficios</h4>
                                    <p className="mt-1 text-xs leading-5 text-zinc-500">Beneficios que pueden asignarse a los productos.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setBeneficiosExpandido(
                                            (prev) => !prev
                                        )
                                    }
                                    className="shrink-0 rounded-none border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 transition hover:border-red-600 hover:text-red-600"
                                >
                                    {beneficiosExpandido
                                        ? 'Ocultar'
                                        : 'Mostrar'}
                                </button>
                            </div>
                            {beneficiosExpandido ? (
                                <div className="border-t border-zinc-200 p-4">
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <input
                                            type="text"
                                            value={beneficioNuevo}
                                            onChange={(event) =>
                                                setBeneficioNuevo(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Nuevo beneficio"
                                            className="min-w-0 flex-1 rounded-none border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAgregarBeneficio}
                                            className="rounded-none bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
                                        >Agregar
                                        </button>
                                    </div>
                                    <div className="mt-4 flex max-h-48 flex-wrap gap-2 overflow-y-auto pr-1">
                                        {clasificaciones.beneficiosDisponibles.map(
                                            (beneficio) => (
                                                <div
                                                    key={beneficio}
                                                    className="flex items-center gap-2 border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-700"
                                                >
                                                    <span>{beneficio}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            eliminarBeneficio(
                                                                beneficio
                                                            )
                                                        }
                                                        className="font-bold text-red-600 transition hover:text-red-800"
                                                    >×
                                                    </button>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                        <div className="rounded-none border border-zinc-200 bg-zinc-50">
                            <div className="flex items-start justify-between gap-3 p-4">
                                <div className="min-w-0">
                                    <h4 className="font-semibold text-zinc-950">Tallas</h4>
                                    <p className="mt-1 text-xs leading-5 text-zinc-500">Administra tallas por letras y números para asignación y control de stock.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={toggleTallasExpandido}
                                    className="shrink-0 rounded-none border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 transition hover:border-red-600 hover:text-red-600"
                                >{tallasExpandido ? 'Ocultar' : 'Mostrar'}
                                </button>
                            </div>
                            {tallasExpandido ? (
                                <div className="border-t border-zinc-200 p-4">
                                    {/* CREAR TALLA */}
                                    <div className="grid gap-2 sm:grid-cols-[1fr_150px_auto]">
                                        <input
                                            type="text"
                                            value={tallaNueva}
                                            onChange={(event) =>
                                                setTallaNueva(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Nueva talla"
                                            className="w-full rounded-none border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
                                        />
                                        <select
                                            value={tipoTallaNueva}
                                            onChange={(event) =>
                                                setTipoTallaNueva(
                                                    event.target.value as
                                                        | 'letras'
                                                        | 'numeros'
                                                )
                                            }
                                            className="rounded-none border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
                                        >
                                            <option value="letras">Letras</option>
                                            <option value="numeros">Números</option>
                                        </select>
                                        <button
                                            type="button"
                                            onClick={handleAgregarTalla}
                                            className="rounded-none bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
                                        >Agregar
                                        </button>
                                    </div>
                                    {/* TALLAS */}
                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                        {(
                                            ['letras', 'numeros'] as const
                                        ).map((tipo) => (
                                            <div
                                                key={tipo}
                                                className="border border-zinc-200 bg-white p-3"
                                            >
                                                <div className="mb-3 flex items-center justify-between border-b border-zinc-100 pb-2">
                                                    <h5 className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-700">
                                                        {tipo === 'letras'
                                                            ? 'Letras'
                                                            : 'Números'}
                                                    </h5>
                                                    <span className="text-[0.65rem] text-zinc-400">
                                                        {
                                                            (
                                                                clasificaciones
                                                                    .tallasPorTipo?.[
                                                                    tipo
                                                                ] ?? []
                                                            ).length
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto pr-1">
                                                    {(
                                                        clasificaciones
                                                            .tallasPorTipo?.[
                                                            tipo
                                                        ] ?? []
                                                    ).map((talla) => (
                                                        <div
                                                            key={talla}
                                                            className="flex items-center gap-2 border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-700"
                                                        >
                                                            <span>{talla}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    eliminarTalla(
                                                                        talla
                                                                    )
                                                                }
                                                                className="font-bold text-red-600 transition hover:text-red-800"
                                                            >×
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {(
                                                        clasificaciones
                                                            .tallasPorTipo?.[
                                                            tipo
                                                        ] ?? []
                                                    ).length === 0 ? (
                                                        <span className="text-xs text-zinc-400">Sin tallas registradas.</span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            ) : null}
        </section>
    );
};
