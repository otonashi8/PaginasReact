export type TipoReglaPrecio =
    | "producto"
    | "carrito"
    | "combo";

export type TipoDescuento =
    | "porcentaje"
    | "fijo"
    | "precio_fijo";

export type AplicarA =
    | "producto"
    | "categoria"
    | "subcategoria"
    | "marca";

export type TipoPerfil =
    | "Bronce"
    | "Plata"
    | "Oro";

export type TipoBOGO =
    | "gratis"
    | "descuento";

export type TipoComboElemento = "producto" | "categoria" | "subcategoria";

export interface ElementoCombo {
    id: string;
    tipo: TipoComboElemento;
    valor: string;
    cantidad: number;
}

export type EstadoRegla =
    | "activa"
    | "inactiva";

export interface ConfiguracionRegla {
    tipoDescuento?: TipoDescuento;
    valor?: number;
    aplicarA?: AplicarA;
    ids?: string[];
    [clave: string]: unknown;
    comprarIds?: string[];
    comprarCantidad?: number;
    regaloIds?: string[];
    cantidadGratis?: number;
    agregarAutomaticamente?: boolean;
    productoDescuentoIds?: string[];
    productosIds?: string[];
    cantidadMinima?: number;
    escalonCantidad?: number;
    escalonValor?: number;
    rol?: string;
    subtotalMinimo?: number;
    envioGratis?: boolean;
    cupon?: string;
    compraMinima?: number;
    compraMaxima?: number;
    maximoUsos?: number;
    maximoPorCliente?: number;
    acumulable?: boolean;
    elementos?: ElementoCombo[];
    precioCombo?: number;
    imagenCombo?: string; // URL o data URI representativa del combo
}

export interface ReglaPrecio {
    id: number;
    nombre: string;
    descripcion: string;
    tipo: TipoReglaPrecio;
    estado: boolean;
    prioridad: number;
    fechaInicio: string;
    fechaFin: string;
    requiereCupon: boolean;
    configuracion: ConfiguracionRegla;
    fechaCreacion: string;
    fechaActualizacion: string;
}

export const tiposRegla: {
    valor: TipoReglaPrecio;
    etiqueta: string;
}[] = [
    {valor: "producto",
        etiqueta: "Descuento de producto"},
    {valor: "carrito",
        etiqueta: "Descuento en carrito"},
    {valor: "combo",
        etiqueta: "Combo"}
];

export const tiposDescuento: {
    valor: TipoDescuento;
    etiqueta: string;
}[] = [
    {valor: "porcentaje",
        etiqueta: "Porcentaje"},
    {valor: "fijo",
        etiqueta: "Monto fijo"},
    {valor: "precio_fijo",
        etiqueta: "Precio fijo"}
];

export const reglaVacia: ReglaPrecio = {
    id: 0,
    nombre: "",
    descripcion: "",
    tipo: "producto",
    estado: true,
    prioridad: 1,
    fechaInicio: "",
    fechaFin: "",
    requiereCupon: false,
    configuracion: {},
    fechaCreacion: "",
    fechaActualizacion: ""
};