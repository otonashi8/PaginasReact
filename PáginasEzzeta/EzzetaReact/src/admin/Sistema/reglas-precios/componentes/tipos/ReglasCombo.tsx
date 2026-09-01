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
        <section className="space-y-8 rounded-none border border-zinc-200 p-4">
            <div>
                <h3 className="text-base font-semibold">Configuración del Combo</h3>
                <p className="text-sm text-zinc-500">Define los elementos que forman parte del combo.</p>
            </div>

            {/* Elementos del Combo */}
            <div className="space-y-4">
                <div>
                    <h4 className="text-base font-semibold">Elementos del Combo</h4>
                    <p className="text-sm text-zinc-500">Añade los productos, categorías o subcategorías que forman el combo.</p>
                </div>

                {elementos.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-500">
                        No hay elementos. Haz clic en "+ Agregar elemento" para comenzar.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {elementos.map((elemento, index) => (
                            <div
                                key={elemento.id}
                                className="rounded-lg border border-zinc-300 p-4 space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-zinc-600">Elemento {index + 1}</span>
                                    {elementos.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => eliminarElemento(elemento.id)}
                                            className="text-sm text-red-600 hover:text-red-700 transition"
                                        >
                                            Eliminar
                                        </button>
                                    )}
                                </div>

                                <div className="grid gap-3 lg:grid-cols-3">
                                    {/* Selector de Tipo */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">Tipo</label>
                                        <select
                                            value={elemento.tipo}
                                            onChange={(e) =>
                                                actualizarElemento(elemento.id, {
                                                    tipo: e.target.value as TipoComboElemento,
                                                    valor: "" 
                                                })
                                            }
                                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                                        >
                                            <option value="producto">Producto</option>
                                            <option value="categoria">Categoría</option>
                                            <option value="subcategoria">Subcategoría</option>
                                        </select>
                                    </div>

                                    {/* Selector de Valor */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            {elemento.tipo === "producto"
                                                ? "Producto"
                                                : elemento.tipo === "categoria"
                                                    ? "Categoría"
                                                    : "Subcategoría"}
                                        </label>
                                        <select
                                            value={elemento.valor}
                                            onChange={(e) =>
                                                actualizarElemento(elemento.id, { valor: e.target.value })
                                            }
                                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                                        >
                                            <option value="">
                                                Seleccionar {elemento.tipo === "producto" ? "producto" : elemento.tipo}...
                                            </option>
                                            {obtenerOpciones(elemento.tipo).map((opcion: { label: string; value: string }) => (
                                                <option key={opcion.value} value={opcion.value}>
                                                    {opcion.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Cantidad */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">Cantidad</label>
                                        <input
                                            type="number"
                                            min={1}
                                            value={elemento.cantidad}
                                            onChange={(e) =>
                                                actualizarElemento(elemento.id, {
                                                    cantidad: Math.max(1, Number(e.target.value))
                                                })
                                            }
                                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
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
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 transition"
                >
                    + Agregar elemento
                </button>
            </div>

            <hr className="border-zinc-200" />

            {/* Precio del Combo */}
            <div>
                <h4 className="text-base font-semibold mb-3">Precio del Combo</h4>
                <div>
                    <label className="mb-2 block font-medium">Precio final del combo (S/)</label>
                    <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={precioCombo}
                        onChange={(e) =>
                            actualizarConfiguracion("precioCombo", Number(e.target.value))
                        }
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                        placeholder="150.00"
                    />
                    <p className="mt-2 text-sm text-zinc-500">
                        El precio final que el cliente pagará por este combo.
                    </p>
                </div>
            </div>

            <hr className="border-zinc-200" />

            {/* Imagen representativa del Combo */}
            <div>
                <h4 className="text-base font-semibold mb-3">Imagen representativa</h4>
                <p className="text-sm text-zinc-500">Sube una imagen o pega una URL para representar el combo en la tienda.</p>
                <div className="mt-3 flex flex-col gap-3">
                    <input
                        type="text"
                        placeholder="URL de la imagen (http://... o data:...)"
                        value={String(imagenCombo)}
                        onChange={(e) => actualizarConfiguracion('imagenCombo', e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    />

                    <div>
                        <label className="mb-2 block text-sm font-medium">O subir archivo</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files && e.target.files[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = () => {
                                    const result = reader.result as string;
                                    actualizarConfiguracion('imagenCombo', result);
                                };
                                reader.readAsDataURL(file);
                            }}
                        />
                    </div>

                    {imagenCombo ? (
                        <div className="mt-2 w-48 rounded-lg border border-zinc-200 overflow-hidden">
                            <img src={String(imagenCombo)} alt="Preview combo" className="h-32 w-full object-cover" />
                        </div>
                    ) : null}
                </div>
            </div>
        </section>
    );
};
