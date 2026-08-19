import type { Producto } from '../../../Inventario/productos/TiposProductos';
import type { ReglaPrecio } from '../TiposReglas';
import { aplicarProducto } from './aplicarProducto';
import type { TipoMotorResultado } from './TiposMotor';
import { obtenerReglasVigentes } from './UtilidadesMotor';

type ContextoMotorReglas = {
  reglas?: ReglaPrecio[];
  codigoCupon?: string;
  [clave: string]: unknown;
};

type ResultadoAplicacionReglas = TipoMotorResultado & {
  precioOriginal: number;
  precioFinal: number;
  descuentoAplicado: number;
  reglaAplicada?: ReglaPrecio;
  mensajes: string[];
};

type EvaluadorTipoRegla = (
  producto: Producto,
  contexto: ContextoMotorReglas,
  regla: ReglaPrecio,
) => ResultadoAplicacionReglas | undefined;

const crearResultadoBase = (
  producto: Producto,
  mensajes: string[] = [],
): ResultadoAplicacionReglas => ({
  aplicado: false,
  totalDescuento: 0,
  detalle: [],
  precioOriginal: Number(producto.precio ?? 0),
  precioFinal: Number(producto.precio ?? 0),
  descuentoAplicado: 0,
  reglaAplicada: undefined,
  mensajes,
});

const evaluadoresPorTipo: Record<string, EvaluadorTipoRegla> = {
  producto: (producto, _contexto, regla) => {
    const resultadoProducto = aplicarProducto(producto, [regla]);

    if (!resultadoProducto.reglaAplicada) {
      return undefined;
    }

    return {
      aplicado: true,
      totalDescuento: resultadoProducto.descuentoAplicado,
      detalle: ['Regla de producto aplicada'],
      precioOriginal: resultadoProducto.precioOriginal,
      precioFinal: resultadoProducto.precioFinal,
      descuentoAplicado: resultadoProducto.descuentoAplicado,
      reglaAplicada: resultadoProducto.reglaAplicada,
      mensajes: [],
    };
  },
  volumen: () => undefined,
  bogo_gratis: () => undefined,
  bogo_descuento: () => undefined,
  perfil: () => undefined,
  carrito: () => undefined,
  combo: () => undefined,
};

export const aplicarReglas = (
  producto: Producto,
  contexto: ContextoMotorReglas = {},
): ResultadoAplicacionReglas => {
  const reglas = Array.isArray(contexto.reglas) ? contexto.reglas : [];
  const reglasVigentes = obtenerReglasVigentes(reglas);

  const codigoCupon = String(contexto.codigoCupon ?? '').trim();

  for (const regla of reglasVigentes) {
    if (regla.requiereCupon && !codigoCupon) {
      continue;
    }

    const evaluador = evaluadoresPorTipo[regla.tipo];

    if (!evaluador) {
      continue;
    }

    const resultado = evaluador(producto, contexto, regla);

    if (resultado?.aplicado) {
      return resultado;
    }
  }

  return crearResultadoBase(producto);
};
