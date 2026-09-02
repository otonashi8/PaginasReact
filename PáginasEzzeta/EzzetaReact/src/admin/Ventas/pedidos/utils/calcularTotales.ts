import type { Pedido } from "../TiposPedidos";

export function calcularTotales(
    pedido: Pedido
): Pedido {
    const subtotal = pedido.productos.reduce(
        (acumulado, producto) =>
            acumulado + producto.subtotal,
        0
    );

    const descuentoTotal = Math.min(subtotal, Math.max(0, pedido.descuentoTotal));
    const costoEnvio = Math.max(0, pedido.costoEnvio);
    const total = Math.max(0, subtotal - descuentoTotal) + costoEnvio;
    return {
        ...pedido,
        subtotal,
        descuentoTotal,
        total
    };

}