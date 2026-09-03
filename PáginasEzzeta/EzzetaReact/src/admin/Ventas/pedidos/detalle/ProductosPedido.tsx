import { getProducts } from "../../../../services/contentService";
import type { Pedido } from "../TiposPedidos";
import { calcularTotales } from "../utils/calcularTotales";

type Props = {
    pedido: Pedido;
    establecerPedido: React.Dispatch<
        React.SetStateAction<Pedido>
    >;
};

export const ProductosPedido = ({
    pedido,
    establecerPedido
}: Props) => {
    const productosCatalogo = getProducts();

    function actualizarProducto(
        index: number,
        campo: string,
        valor: unknown
    ) {
        establecerPedido(prev => {
            const productos = [...prev.productos];
            productos[index] = {
                ...productos[index],
                [campo]: valor
            };
            return calcularTotales({
                ...prev,
                productos
            });
        });
    }

    function aplicarProductoCatalogo(
        index: number,
        productoId: number
    ) {
        const producto = productosCatalogo.find(
            item => item.id === productoId
        );

        if (!producto) {
            return;
        }

        establecerPedido(prev => {
            const productos = [...prev.productos];
            const talla = producto.sizes[0] ?? "";

            productos[index] = {
                ...productos[index],
                productoId: producto.id,
                slug: producto.slug,
                nombre: producto.name,
                imagen: producto.image,
                categoria: producto.category,
                subcategoria: producto.subcategory,
                talla,
                precioUnitario: producto.price,
                subtotal: Number((producto.price * productos[index].cantidad).toFixed(2))
            };

            return calcularTotales({
                ...prev,
                productos
            });
        });
    }

    function agregarProducto() {
        establecerPedido(prev =>
            calcularTotales({
                ...prev,
                productos: [
                    ...prev.productos,
                    {
                        productoId: 0,
                        slug: "",
                        nombre: "",
                        imagen: "",
                        categoria: "",
                        subcategoria: "",
                        talla: "",
                        cantidad: 1,
                        precioUnitario: 0,
                        subtotal: 0
                    }
                ]
            })
        );
    }

    function eliminarProducto(
        index: number
    ) {
        establecerPedido(prev =>
            calcularTotales({
                ...prev,
                productos: prev.productos.filter(
                    (_, i) => i !== index
                )
            })
        );
    }

    return (
        <section className="space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div>
                    <h3 className="text-sm font-semibold text-zinc-900">Productos</h3>
                    <p className="mt-0.5 text-xs text-zinc-500">Resumen compacto del pedido.</p>
                </div>
                <button
                    type="button"
                    onClick={agregarProducto}
                    className="h-9 bg-zinc-950 px-3 text-xs font-medium text-white transition hover:bg-zinc-800"
                >Agregar producto
                </button>
            </div>
            {pedido.productos.length === 0 && (
                <div className="border border-dashed border-zinc-300 px-4 py-8 text-center text-xs text-zinc-500">No existen productos agregados.</div>
            )}
            <div className="space-y-3">
                {pedido.productos.map((producto, index) => {
                    const productoCatalogo = productosCatalogo.find(
                        (item) => item.id === producto.productoId
                    );
                    return (
                        <div
                            key={index}
                            className="border border-zinc-200 bg-white p-3"
                        >
                            <div className="grid gap-3 lg:grid-cols-[72px_minmax(180px,1.5fr)_minmax(100px,0.8fr)_72px_100px_100px_72px]">
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-semibold text-zinc-600">Imagen</label>
                                    <div className="flex h-16 items-center justify-center border border-zinc-200 bg-zinc-50">
                                        {producto.imagen ? (
                                            <img
                                                src={producto.imagen}
                                                alt={producto.nombre}
                                                className="h-full w-full object-contain"
                                            />
                                        ) : (
                                            <span className="text-[10px] text-zinc-400">Sin imagen</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-semibold text-zinc-600">Nombre</label>
                                    {producto.productoId && producto.nombre ? (
                                        <div className="flex min-h-9 items-center border border-zinc-200 bg-zinc-50 px-2.5 text-xs font-medium text-zinc-700">{producto.nombre}</div>
                                    ) : (
                                        <div className="space-y-1">
                                            <select
                                                value={producto.productoId || ""}
                                                onChange={(e) =>
                                                    aplicarProductoCatalogo(
                                                        index,
                                                        Number(e.target.value)
                                                    )
                                                }
                                                className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 outline-none transition focus:border-zinc-500"
                                            >
                                                <option value="">Selecciona un producto</option>
                                                {productosCatalogo.map((item) => (
                                                    <option
                                                        key={item.id}
                                                        value={item.id}
                                                    >{item.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <span className="block text-[10px] text-zinc-400">Se muestra al elegir un producto.</span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-semibold text-zinc-600">Talla</label>
                                    {productoCatalogo?.sizes.length ? (
                                        <select
                                            value={producto.talla}
                                            onChange={(e) =>
                                                actualizarProducto(
                                                    index,
                                                    "talla",
                                                    e.target.value
                                                )
                                            }
                                            className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 outline-none transition focus:border-zinc-500"
                                        >
                                            {productoCatalogo.sizes.map((talla) => (
                                                <option
                                                    key={talla}
                                                    value={talla}
                                                >{talla}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            value={producto.talla}
                                            onChange={(e) =>
                                                actualizarProducto(
                                                    index,
                                                    "talla",
                                                    e.target.value
                                                )
                                            }
                                            className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 outline-none transition focus:border-zinc-500"
                                        />
                                    )}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-semibold text-zinc-600">Cant.</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={producto.cantidad}
                                        onChange={(e) => {
                                            const cantidad = Number(
                                                e.target.value
                                            );
                                            establecerPedido((prev) => {
                                                const productos = [
                                                    ...prev.productos,
                                                ];

                                                productos[index] = {
                                                    ...productos[index],
                                                    cantidad,
                                                    subtotal:
                                                        cantidad *
                                                        producto.precioUnitario,
                                                };
                                                return calcularTotales({
                                                    ...prev,
                                                    productos,
                                                });
                                            });
                                        }}
                                        className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 outline-none transition focus:border-zinc-500"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-semibold text-zinc-600">Precio unit.</label>
                                    <input
                                        type="number"
                                        value={producto.precioUnitario}
                                        onChange={(e) => {
                                            const precio = Number(
                                                e.target.value
                                            );
                                            establecerPedido((prev) => {
                                                const productos = [
                                                    ...prev.productos,
                                                ];
                                                productos[index] = {
                                                    ...productos[index],
                                                    precioUnitario: precio,
                                                    subtotal:
                                                        precio * producto.cantidad,
                                                };
                                                return calcularTotales({
                                                    ...prev,
                                                    productos,
                                                });
                                            });
                                        }}
                                        className="h-9 w-full border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 outline-none transition focus:border-zinc-500"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-semibold text-zinc-600">Subtotal</label>
                                    <div className="flex h-9 items-center border border-zinc-200 bg-zinc-50 px-2.5 text-xs font-semibold text-zinc-700">S/ {producto.subtotal.toFixed(2)}</div>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        type="button"
                                        onClick={() => eliminarProducto(index)}
                                        className="h-9 w-full border border-red-200 px-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
                                    >Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};