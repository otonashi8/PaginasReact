import { useMemo } from "react";
import type { ReglaPrecio, ElementoCombo, TipoComboElemento, ConfiguracionRegla } from "../../TiposReglas";
import type { Product } from "../../../../../types";
import { getProducts } from "../../../../../services/contentService";

// DatosProductos categorias
const categorias: Record<string, string[]> = {
    Polos: ['Luxury', 'Caffarena', 'Supremo', 'Prime', 'Monarca', 'Barrido'],
    Casacas: ['Básica'],
    Poleras: ['Básica', 'CR', 'Canguro', 'Drip'],
    Jean: ['Clásico', 'Flared', 'Baggy', 'Ballom', 'Mom'],
};

type Props = {
    regla: ReglaPrecio;
    establecerRegla: React.Dispatch<
        React.SetStateAction<ReglaPrecio>
    >;
};

const generarIdUnico = () => Math.random().toString(36).substr(2, 9);

export const ReglasCombo = ({
    regla,
    establecerRegla
}: Props) => {
    const configuracion = regla.configuracion ?? {};
    const elementos = (configuracion.elementos ?? []) as ElementoCombo[];
    const precioCombo = configuracion.precioCombo ?? 0;
    const imagenCombo = configuracion.imagenCombo ?? '';

    const productos = useMemo(() => getProducts(), []);
    const subcategorias = useMemo(() => {
        const subs = new Set<string>();
        const catValues = Object.values(categorias) as unknown as string[][];
        catValues.forEach((subcats: string[]) => {
            subcats.forEach((sub: string) => subs.add(sub));
        });
        return Array.from(subs).sort();
    }, []);

    const actualizarConfiguracion = <K extends keyof ConfiguracionRegla>(
        campo: K,
        valor: ConfiguracionRegla[K]
    ) => {
        establecerRegla(prev => ({
            ...prev,
            configuracion: {
                ...prev.configuracion,
                [campo]: valor
            }
        }));
    };

    const agregarElemento = () => {
        const nuevoElemento: ElementoCombo = {
            id: generarIdUnico(),
            tipo: "producto",
            valor: "",
            cantidad: 1
        };
        actualizarConfiguracion("elementos", [...elementos, nuevoElemento]);
    };

    const eliminarElemento = (id: string) => {
        actualizarConfiguracion(
            "elementos",
            elementos.filter(el => el.id !== id)
        );
    };

    const actualizarElemento = (id: string, cambios: Partial<ElementoCombo>) => {
        const elementosActualizados = elementos.map(el =>
            el.id === id ? { ...el, ...cambios } : el
        );
        actualizarConfiguracion("elementos", elementosActualizados);
    };

    const obtenerOpciones = (tipo: TipoComboElemento) => {
        if (tipo === "producto") {
            return productos.map((p: Product) => ({ label: p.name, value: String(p.id) }));
        } else if (tipo === "categoria") {
            return Object.keys(categorias).map(cat => ({ label: cat, value: cat }));
        } else {
            return subcategorias.map(sub => ({ label: sub, value: sub }));
        }
    };

    return (
        <section className="space-y-6 border border-zinc-200 bg-white p-4">
            <div>
                <h3 className="text-sm font-semibold text-zinc-900">Configuración del Combo</h3>
                <p className="mt-0.5 text-xs text-zinc-500">Define los elementos que forman parte del combo.</p>
            </div>
            <div className="space-y-3">
                <div>
                    <h4 className="text-sm font-semibold text-zinc-900">Elementos del Combo</h4>
                    <p className="mt-0.5 text-xs text-zinc-500">Añade los productos, categorías o subcategorías que forman el combo.</p>
                </div>
                {elementos.length === 0 ? (
                    <div className="border border-dashed border-zinc-300 px-4 py-6 text-center text-xs text-zinc-400">No hay elementos. Haz clic en "+ Agregar elemento" para comenzar.</div>
                ) : (
                    <div className="space-y-2">
                        {elementos.map((elemento, index) => (
                            <div
                                key={elemento.id}
                                className="border border-zinc-200 bg-zinc-50/40 p-3"
                            >
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="text-xs font-semibold text-zinc-700">Elemento {index + 1}</span>
                                    {elementos.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => eliminarElemento(elemento.id)}
                                            className="text-[11px] font-medium text-red-500 transition hover:text-red-600"
                                        >Eliminar
                                        </button>
                                    )}
                                </div>
                                <div className="grid gap-3 lg:grid-cols-3">
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-medium text-zinc-600">Tipo</label>
                                        <select
                                            value={elemento.tipo}
                                            onChange={(e) =>
                                                actualizarElemento(elemento.id, {
                                                    tipo: e.target.value as TipoComboElemento,
                                                    valor: "",
                                                })
                                            }
                                            className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs text-zinc-700 outline-none transition focus:border-zinc-500"
                                        >
                                            <option value="producto">Producto</option>
                                            <option value="categoria">Categoría</option>
                                            <option value="subcategoria">Subcategoría</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-medium text-zinc-600">
                                            {elemento.tipo === "producto"
                                                ? "Producto"
                                                : elemento.tipo === "categoria"
                                                    ? "Categoría"
                                                    : "Subcategoría"}
                                        </label>

                                        <select
                                            value={elemento.valor}
                                            onChange={(e) =>
                                                actualizarElemento(elemento.id, {
                                                    valor: e.target.value,
                                                })
                                            }
                                            className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs text-zinc-700 outline-none transition focus:border-zinc-500"
                                        >
                                            <option value="">
                                                Seleccionar{" "}
                                                {elemento.tipo === "producto"
                                                    ? "producto"
                                                    : elemento.tipo}
                                                ...
                                            </option>
                                            {obtenerOpciones(elemento.tipo).map(
                                                (opcion: {
                                                    label: string;
                                                    value: string;
                                                }) => (
                                                    <option
                                                        key={opcion.value}
                                                        value={opcion.value}
                                                    >
                                                        {opcion.label}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-medium text-zinc-600">Cantidad</label>
                                        <input
                                            type="number"
                                            min={1}
                                            value={elemento.cantidad}
                                            onChange={(e) =>
                                                actualizarElemento(elemento.id, {
                                                    cantidad: Math.max(
                                                        1,
                                                        Number(e.target.value)
                                                    ),
                                                })
                                            }
                                            className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs text-zinc-700 outline-none transition focus:border-zinc-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    type="button"
                    onClick={agregarElemento}
                    className="inline-flex h-9 items-center gap-1.5 border border-zinc-300 bg-white px-3 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-900"
                ><span className="text-sm">+</span>
                    Agregar elemento
                </button>
            </div>
            <div className="border-t border-zinc-200" />
            <div className="space-y-3">
                <div>
                    <h4 className="text-sm font-semibold text-zinc-900">Precio del Combo</h4>
                </div>
                <div>
                    <label className="mb-1.5 block text-[11px] font-medium text-zinc-600">Precio final del combo (S/)</label>
                    <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={precioCombo}
                        onChange={(e) =>
                            actualizarConfiguracion(
                                "precioCombo",
                                Number(e.target.value)
                            )
                        }
                        className="h-9 w-full border border-zinc-300 px-2.5 text-xs text-zinc-700 outline-none transition focus:border-zinc-500"
                        placeholder="150.00"
                    />
                    <p className="mt-1.5 text-[11px] text-zinc-400">El precio final que el cliente pagará por este combo.</p>
                </div>
            </div>
            <div className="border-t border-zinc-200" />
            <div className="space-y-3">
                <div>
                    <h4 className="text-sm font-semibold text-zinc-900">Imagen representativa</h4>
                    <p className="mt-0.5 text-xs text-zinc-500">Sube una imagen o pega una URL para representar el combo en la tienda.</p>
                </div>
                <div className="space-y-3">
                    <div>
                        <label className="mb-1.5 block text-[11px] font-medium text-zinc-600">URL de imagen</label>
                        <input
                            type="text"
                            placeholder="https://... o data:..."
                            value={String(imagenCombo)}
                            onChange={(e) =>
                                actualizarConfiguracion(
                                    "imagenCombo",
                                    e.target.value
                                )
                            }className="h-9 w-full border border-zinc-300 px-2.5 text-xs text-zinc-700 outline-none transition focus:border-zinc-500"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-[11px] font-medium text-zinc-600">Subir archivo</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = () => {
                                    const result = reader.result as string;
                                    actualizarConfiguracion(
                                        "imagenCombo",
                                        result
                                    );
                                };
                                reader.readAsDataURL(file);
                            }}
                            className="block w-full text-xs text-zinc-500 file:mr-3 file:border file:border-zinc-300 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-zinc-700 file:transition hover:file:bg-zinc-50"
                        />
                    </div>
                    {imagenCombo ? (
                        <div className="w-40 overflow-hidden border border-zinc-200 bg-zinc-50">
                            <img
                                src={String(imagenCombo)}
                                alt="Preview combo"
                                className="h-28 w-full object-cover"
                            />
                        </div>
                    ) : null}
                </div>
            </div>
        </section>
    );
};
