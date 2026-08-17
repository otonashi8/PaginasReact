import type { ReglaPrecio, ElementoCombo } from "../TiposReglas";
import type { Product } from "../../../../types";
import { getProducts } from "../../../../services/contentService";

// DatosProductos categorias imported in validarCombo function scope
const categorias: Record<string, string[]> = {
    Polos: ['Luxury', 'Caffarena', 'Supremo', 'Prime', 'Monarca', 'Barrido'],
    Casacas: ['Básica'],
    Poleras: ['Básica', 'CR', 'Canguro', 'Drip'],
    Jean: ['Clásico', 'Flared', 'Baggy', 'Ballom', 'Mom'],
};

export function validarRegla(
    regla: ReglaPrecio
): string[] {

    const errores: string[] = [];
    if (!regla.nombre.trim()) {
        errores.push("Debe ingresar un nombre.");}
    if (!regla.descripcion.trim()) {
        errores.push("Debe ingresar una descripción.");}
    if (regla.prioridad < 1) {
        errores.push("La prioridad debe ser mayor que cero.");}
    if (
        regla.fechaInicio &&
        regla.fechaFin &&
        regla.fechaInicio > regla.fechaFin
    ) {
        errores.push(
            "La fecha de inicio no puede ser mayor que la fecha fin.");
    }

    // Validaciones específicas por tipo de regla
    if (regla.tipo === "combo") {
        errores.push(...validarCombo(regla));
    }

    return errores;

}

function validarCombo(regla: ReglaPrecio): string[] {
    const errores: string[] = [];
    const configuracion = regla.configuracion ?? {};
    const elementos = (configuracion.elementos ?? []) as ElementoCombo[];
    const precioCombo = Number(configuracion.precioCombo ?? 0);

    // Validar que exista al menos un elemento
    if (elementos.length === 0) {
        errores.push("El combo debe tener al menos un elemento.");
        return errores;
    }

    const productos = getProducts();
    const allSubcategorias = Array.from(new Set(
        Object.values(categorias).flat()
    ));

    // Validar cada elemento
    elementos.forEach((elemento, index) => {
        if (!elemento.tipo) {
            errores.push(`Elemento ${index + 1}: Debe seleccionar un tipo.`);
        }

        if (!elemento.valor) {
            errores.push(`Elemento ${index + 1}: Debe seleccionar un valor.`);
        }

        if (!elemento.cantidad || elemento.cantidad < 1) {
            errores.push(`Elemento ${index + 1}: La cantidad debe ser mayor que cero.`);
        }

        // Validar que el valor exista según el tipo
        if (elemento.valor) {
            if (elemento.tipo === "producto") {
                const productoExiste = productos.some((p: Product) => String(p.id) === elemento.valor);
                if (!productoExiste) {
                    errores.push(`Elemento ${index + 1}: El producto no existe.`);
                }
            } else if (elemento.tipo === "categoria") {
                const categoriaExiste = Object.keys(categorias).includes(elemento.valor);
                if (!categoriaExiste) {
                    errores.push(`Elemento ${index + 1}: La categoría no existe.`);
                }
            } else if (elemento.tipo === "subcategoria") {
                const subcategoriaExiste = allSubcategorias.includes(elemento.valor);
                if (!subcategoriaExiste) {
                    errores.push(`Elemento ${index + 1}: La subcategoría no existe.`);
                }
            }
        }
    });

    // Validar precio del combo
    if (!precioCombo || precioCombo <= 0) {
        errores.push("El precio del combo debe ser mayor que cero.");
    }

    return errores;
}