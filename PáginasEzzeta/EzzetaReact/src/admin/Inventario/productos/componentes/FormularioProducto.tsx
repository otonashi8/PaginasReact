import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import type { Producto } from '../TiposProductos';
import { estaTallaAgotada, generosDisponibles, inferirTipoTalla, obtenerSubcategoriaMetadata } from '../DatosProductos';
import { crearSlugProducto } from '../utils/productoMapper';
import { ExtrasProducto } from './ExtrasProducto';
import { SelectorCategorias } from './SelectorCategorias';
import { SelectorRelacionados } from './SelectorRelacionados';
import { SelectorTallas } from './SelectorTallas';
import { ImagenPrincipal } from './ImagenPrincipal';
import { CarruselMiniImagenes } from './CarruselMiniImagenes';
import ColorEditor from './ColorEditor';

type PropiedadesFormularioProducto = {
    producto: Producto;
    setProducto: Dispatch<SetStateAction<Producto>>;
    productosExistentes: Producto[];
    guardar: () => void;
    cerrar: () => void;
    modoEdicion: boolean;
};

export const FormularioProducto = ({
    producto,
    setProducto,
    productosExistentes,
    guardar,
    cerrar,
    modoEdicion,
}: PropiedadesFormularioProducto) => {
    const [tiposVisibles, setTiposVisibles] = useState<Record<'letras' | 'numeros', boolean>>({
        letras: true,
        numeros: true,
    });

    const alternarTipoVisible = (tipo: 'letras' | 'numeros') => {
        setTiposVisibles((actual) => ({
            ...actual,
            [tipo]: !actual[tipo],
        }));
    };

    const debeMostrarTalla = (talla: string) => {
        const tipo = inferirTipoTalla(talla);
        return tiposVisibles[tipo];
    };

    const tallasVisibles = producto.tallas.filter((talla) => debeMostrarTalla(talla));
    const precioSubcategoria = producto.categoria && producto.subcategoria
        ? obtenerSubcategoriaMetadata(producto.categoria, producto.subcategoria).precio
        : undefined;

    const actualizarCampo = <Campo extends keyof Producto>(
        campo: Campo,
        valor: Producto[Campo],
    ) => {
        setProducto((productoAnterior) => ({
            ...productoAnterior,
            [campo]: valor,
        }));
    };

    const actualizarTallas = (tallas: Producto['tallas']) => {
        setProducto((productoAnterior) => {
            const tallasStockActual = { ...(productoAnterior.tallasStock ?? {}) };
            const nuevoTallasStock: Producto['tallasStock'] = {};

            tallas.forEach((talla) => {
                nuevoTallasStock[talla] = Number.isFinite(Number(tallasStockActual[talla]))
                    ? Math.max(0, Math.trunc(Number(tallasStockActual[talla])))
                    : 0;
            });

            return {
                ...productoAnterior,
                tallas,
                tallasStock: nuevoTallasStock,
            };
        });
    };

    const actualizarStockPorTalla = (talla: Producto['tallas'][number], cantidad: number) => {
        setProducto((productoAnterior) => ({
            ...productoAnterior,
            tallasStock: {
                ...(productoAnterior.tallasStock ?? {}),
                [talla]: Math.max(0, Math.trunc(cantidad)),
            },
        }));
    };

    const stockTotal = producto.tallas.reduce((total, talla) => {
        const valor = producto.tallasStock?.[talla];
        return total + (Number.isFinite(Number(valor)) ? Math.max(0, Math.trunc(Number(valor))) : 0);
    }, 0);

    const actualizarNombre = (nombre: string) => {
        setProducto((productoAnterior) => {
            const slugAnteriorGenerado = crearSlugProducto(productoAnterior.nombre);
            const debeActualizarSlug = !productoAnterior.slug.trim() || productoAnterior.slug === slugAnteriorGenerado;

            return {
                ...productoAnterior,
                nombre,
                slug: debeActualizarSlug ? crearSlugProducto(nombre) : productoAnterior.slug,
            };
        });
    };

    return (
        <div className="space-y-3">
            {/* INFORMACIÓN GENERAL + RESUMEN */}
            <section className="grid gap-3 xl:grid-cols-[1.5fr_0.7fr]">
                <div className="rounded-none border border-zinc-200 bg-white p-3 shadow-sm">
                    <div className="mb-3 border-b border-zinc-100 pb-3">
                        <h3 className="text-sm font-semibold text-zinc-950">Información general</h3>
                        <p className="mt-1 text-xs text-zinc-500">Datos base del producto para el catálogo administrativo.</p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <label className="block text-sm text-zinc-700">
                            <span className="mb-1.5 block text-xs font-semibold text-zinc-800">
                                Nombre
                            </span>
                            <input
                                type="text"
                                value={producto.nombre}
                                onChange={(event) =>
                                    actualizarNombre(event.target.value)
                                }
                                placeholder="Ej. Polo Luxury Verde"
                                className="w-full rounded-none border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600/20"
                            />
                        </label>

                        <label className="block text-sm text-zinc-700">
                            <span className="mb-1.5 block text-xs font-semibold text-zinc-800">
                                Slug
                            </span>
                            <input
                                type="text"
                                value={producto.slug}
                                onChange={(event) =>
                                    actualizarCampo("slug", event.target.value)
                                }
                                placeholder="polo-luxury-verde"
                                className="w-full rounded-none border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600/20"
                            />
                        </label>

                        <label className="block md:col-span-2">
                            <span className="mb-1.5 block text-xs font-semibold text-zinc-800">
                                Descripción
                            </span>
                            <textarea
                                rows={3}
                                value={producto.descripcion}
                                onChange={(event) =>
                                    actualizarCampo(
                                        "descripcion",
                                        event.target.value
                                    )
                                }
                                placeholder="Describe el producto, materiales, caída, acabado y propuesta de valor."
                                className="w-full resize-none rounded-none border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600/20"
                            />
                        </label>

                        <label className="block md:col-span-2">
                            <span className="mb-2 block text-xs font-semibold text-zinc-800">
                                Colores
                            </span>

                            <div className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                    {(producto.colores ?? []).map((c, idx) => {
                                        const parts = c.split("|");

                                        const label =
                                            parts.length > 1
                                                ? parts[0].trim()
                                                : undefined;

                                        const value =
                                            parts.length > 1
                                                ? parts.slice(1).join("|").trim()
                                                : parts[0].trim();

                                        return (
                                            <div
                                                key={idx}
                                                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs"
                                                title={label ?? value}
                                            >
                                                <span
                                                    className="h-4 w-4 shrink-0 rounded-full border border-zinc-300"
                                                    style={{
                                                        backgroundColor: value,
                                                    }}
                                                />

                                                <span className="font-medium text-zinc-800">
                                                    {label ?? value}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        actualizarCampo(
                                                            "colores",
                                                            (
                                                                producto.colores ??
                                                                []
                                                            ).filter(
                                                                (_, i) =>
                                                                    i !== idx
                                                            )
                                                        )
                                                    }
                                                    className="ml-1 text-zinc-500 transition hover:text-red-600"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>

                                <ColorEditor
                                    producto={producto}
                                    actualizarCampo={actualizarCampo}
                                />
                            </div>
                        </label>
                    </div>
                </div>

                {/* RESUMEN */}
                <div className="rounded-none border border-zinc-200 bg-zinc-50 p-3 shadow-sm">
                    <div className="mb-3 border-b border-zinc-200 pb-3">
                        <h3 className="text-sm font-semibold text-zinc-950">
                            Resumen comercial
                        </h3>
                        <p className="mt-1 text-xs text-zinc-500">
                            Vista rápida del producto.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="border border-zinc-200 bg-white p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">ID</p>
                            <p className="mt-1 text-sm font-semibold text-zinc-950">{producto.id || "Sin ID"}</p>
                        </div>

                        <div className="border border-zinc-200 bg-white p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Precio actual</p>
                            <p className="mt-1 text-sm font-semibold text-zinc-950">S/ {producto.precio.toFixed(2)}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="border border-zinc-200 bg-white p-3">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Stock</p>

                                <p
                                    className={`mt-1 text-sm font-semibold ${
                                        stockTotal <= 0
                                            ? "text-red-600"
                                            : stockTotal <= 5
                                            ? "text-orange-600"
                                            : stockTotal <= 15
                                                ? "text-yellow-600"
                                                : "text-emerald-600"
                                    }`}
                                >{stockTotal}
                                </p>
                            </div>
                            <div className="border border-zinc-200 bg-white p-3">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Estado</p>

                                <p
                                    className={`mt-1 text-sm font-semibold ${
                                        producto.activo
                                            ? "text-emerald-600"
                                            : "text-red-600"
                                    }`}
                                >{producto.activo ? "Activo" : "Inactivo"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* CLASIFICACIÓN */}
            <section className="rounded-none border border-zinc-200 bg-white p-3 shadow-sm">
                <div className="mb-3 border-b border-zinc-100 pb-3">
                    <h3 className="text-sm font-semibold text-zinc-950">Clasificación</h3>
                    <p className="mt-1 text-xs text-zinc-500">Organiza el producto dentro del inventario.</p>
                </div>

                <div className="space-y-3">
                    <label className="block max-w-sm">
                        <span className="mb-1.5 block text-xs font-semibold text-zinc-800">Género</span>
                        <select
                            value={producto.genero}
                            onChange={(event) =>
                                actualizarCampo(
                                    "genero",
                                    event.target.value as Producto["genero"]
                                )
                            }
                            className="w-full rounded-none border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600/20"
                        >
                            {generosDisponibles.map((generoDisponible) => (
                                <option
                                    key={generoDisponible}
                                    value={generoDisponible}
                                >{generoDisponible}
                                </option>
                            ))}
                        </select>
                    </label>

                    <SelectorCategorias
                        categoria={producto.categoria}
                        subcategoria={producto.subcategoria}
                        actualizarCategoria={(categoria) =>
                            actualizarCampo("categoria", categoria)
                        }
                        actualizarSubcategoria={(subcategoria) =>
                            setProducto((productoAnterior) => {
                                const precio = obtenerSubcategoriaMetadata(productoAnterior.categoria, subcategoria).precio;
                                return {
                                    ...productoAnterior,
                                    subcategoria,
                                    ...(precio !== undefined ? { precio } : {}),
                                };
                            })
                        }
                    />

                    <div className="grid gap-2 md:grid-cols-2">
                        <label className="flex items-center gap-3 border border-zinc-200 px-3 py-2.5 text-sm transition hover:border-zinc-300">
                            <input
                                type="checkbox"
                                checked={producto.destacado}
                                onChange={(event) =>
                                    actualizarCampo(
                                        "destacado",
                                        event.target.checked
                                    )
                                }
                                className="h-4 w-4 rounded border-zinc-300 accent-red-600"
                            />
                            <div>
                                <p className="text-sm font-medium text-zinc-950">Producto destacado</p>
                                <p className="text-xs text-zinc-500">Mostrar en secciones destacadas.</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 border border-zinc-200 px-3 py-2.5 text-sm transition hover:border-zinc-300">
                            <input
                                type="checkbox"
                                checked={producto.activo}
                                onChange={(event) =>
                                    actualizarCampo(
                                        "activo",
                                        event.target.checked
                                    )
                                }
                                className="h-4 w-4 rounded border-zinc-300 accent-red-600"
                            />
                            <div>
                                <p className="text-sm font-medium text-zinc-950">Producto activo</p>
                                <p className="text-xs text-zinc-500">Disponible en el catálogo.</p>
                            </div>
                        </label>
                    </div>
                </div>
            </section>
            {/* PRECIOS E INVENTARIO */}
            <section className="rounded-none border border-zinc-200 bg-white p-3 shadow-sm">
                <div className="mb-3 border-b border-zinc-100 pb-3">
                    <h3 className="text-sm font-semibold text-zinc-950">Precios e inventario</h3>
                    <p className="mt-1 text-xs text-zinc-500">Configura el valor comercial y disponibilidad.</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                    <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold text-zinc-800">Precio actual</span>
                        <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={producto.precio}
                            onChange={(event) =>
                                actualizarCampo(
                                    "precio",
                                    Number(event.target.value)
                                )
                            }
                            className="w-full rounded-none border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600/20"
                        />
                        {precioSubcategoria !== undefined ? <span className="mt-1 block text-xs text-zinc-500">Precio de subcategoría: S/ {precioSubcategoria.toFixed(2)}. Puedes editarlo.</span> : null}
                    </label>
                    <div className="border border-zinc-200 bg-zinc-50 px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Stock total</p>
                        <p
                            className={`mt-1 text-sm font-semibold ${
                                stockTotal <= 0
                                    ? "text-red-600"
                                    : stockTotal <= 5
                                    ? "text-orange-600"
                                    : stockTotal <= 15
                                        ? "text-yellow-600"
                                        : "text-emerald-600"
                            }`}
                        >{stockTotal} unidades
                        </p>
                    </div>
                </div>
            </section>
            <ImagenPrincipal
                nombreProducto={producto.nombre}
                imagen={producto.imagen}
                actualizarImagen={(imagen) =>
                    actualizarCampo("imagen", imagen)
                }
            />
            <CarruselMiniImagenes
                miniImagenes={producto.miniImagenes}
                actualizarMiniImagenes={(miniImagenes) =>
                    actualizarCampo("miniImagenes", miniImagenes)
                }
            />
            <section className="rounded-none border border-zinc-200 bg-white p-3 shadow-sm">
                <div className="mb-3 border-b border-zinc-100 pb-3">
                    <h3 className="text-sm font-semibold text-zinc-950">Stock por talla</h3>
                    <p className="mt-1 text-xs text-zinc-500">Actualiza las unidades disponibles por talla.</p>
                </div>

                <div className="mb-3 flex flex-wrap gap-2">
                    {(["letras", "numeros"] as const).map((tipo) => (
                        <label
                            key={tipo}
                            className="inline-flex items-center gap-2 border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700"
                        >
                            <input
                                type="checkbox"
                                checked={tiposVisibles[tipo]}
                                onChange={() => alternarTipoVisible(tipo)}
                                className="h-4 w-4 rounded border-zinc-300 accent-red-600"
                            />
                            <span>{tipo === "letras" ? "Letras" : "Números"}</span>
                        </label>
                    ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                    {tallasVisibles.map((talla) => {
                        const cantidad = Number.isFinite(
                            Number(producto.tallasStock?.[talla])
                        )
                            ? Math.max(
                                0,
                                Math.trunc(
                                    Number(producto.tallasStock?.[talla])
                                )
                            )
                            : 0;

                        const agotada = estaTallaAgotada(
                            talla,
                            producto.tallasStock ?? {}
                        );

                        return (
                            <label
                                key={talla}
                                className={`block ${
                                    agotada
                                        ? "text-red-600"
                                        : "text-zinc-700"
                                }`}
                            >
                                <span
                                    className={`mb-1.5 block text-xs font-semibold ${
                                        agotada ? "line-through" : ""
                                    }`}
                                >{talla}
                                </span>
                                <input
                                    type="number"
                                    min={0}
                                    value={cantidad}
                                    onChange={(event) =>
                                        actualizarStockPorTalla(
                                            talla,
                                            Number(event.target.value)
                                        )
                                    }
                                    className={`w-full rounded-none border px-3 py-2 text-sm outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600/20 ${
                                        agotada
                                            ? "border-red-300 bg-red-50 text-red-700"
                                            : "border-zinc-300 bg-white text-zinc-700"
                                    }`}
                                />
                            </label>
                        );
                    })}
                </div>
            </section>
            <section className="rounded-none border border-zinc-200 bg-white p-3 shadow-sm">
                <SelectorTallas
                    tallasSeleccionadas={producto.tallas}
                    actualizarTallas={actualizarTallas}
                />
            </section>
            <SelectorRelacionados
                productoActualId={producto.id}
                relacionados={producto.relacionados}
                productosExistentes={productosExistentes}
                actualizarRelacionados={(relacionados) =>
                    actualizarCampo("relacionados", relacionados)
                }
            />
            <ExtrasProducto
                extras={producto.extras}
                actualizarExtras={(extras) =>
                    actualizarCampo("extras", extras)
                }
            />
            <div className="flex flex-col gap-2 border-t border-zinc-200 pt-4 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={cerrar}
                    className="w-full rounded-none border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-500 hover:bg-zinc-50 sm:w-auto"
                >Cancelar
                </button>
                <button
                    type="button"
                    onClick={guardar}
                    className="w-full rounded-none bg-zinc-950 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 sm:w-auto"
                >{modoEdicion ? "Guardar cambios" : "Crear producto"}
                </button>
            </div>
        </div>
    );
};