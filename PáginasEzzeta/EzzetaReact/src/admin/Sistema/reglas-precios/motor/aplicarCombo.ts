import type { ReglaPrecio, ElementoCombo } from '../TiposReglas';
import type { Product } from '../../../../types';
import type { TipoMotorResultado } from './TiposMotor';
import { esReglaVigente } from './UtilidadesMotor';
import { getProducts } from '../../../../services/contentService';

interface CartItem {
  productId: number;
  quantity: number;
  size: string;
}

interface ComboDetection {
  regla: ReglaPrecio;
  instancias: number;
  elementosFaltantes: ElementoCombo[];
  mensajeOportunidad: string;
}

const normalizeText = (value: string) => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]/g, '')
  .trim();

/**
 * Verifica si un producto coincide con un elemento del combo
 */
const productoCoincideConElemento = (
  producto: Product,
  elemento: ElementoCombo
): boolean => {
  const tipo = elemento.tipo;
  const valor = elemento.valor;

  if (tipo === 'producto') {
    return String(producto.id) === valor;
  } else if (tipo === 'categoria') {
    return normalizeText(producto.category) === normalizeText(valor);
  } else if (tipo === 'subcategoria') {
    return normalizeText(producto.subcategory) === normalizeText(valor);
  }

  return false;
};

/**
 * Obtiene el nombre legible de un elemento del combo
 */
const obtenerNombreElemento = (elemento: ElementoCombo): string => {
  if (elemento.tipo === 'producto') {
    const producto = getProducts().find((p: Product) => String(p.id) === elemento.valor);
    return producto?.name ?? `Producto ${elemento.valor}`;
  }
  return elemento.valor;
};

/**
 * Genera un mensaje comercial para combos incompletos
 */
const generarMensajeOportunidad = (
  elementos: ElementoCombo[],
  faltantes: ElementoCombo[]
): string => {
  if (faltantes.length === 0) return '';

  const tienenSuficiente = elementos.filter(el => !faltantes.includes(el));
  const faltantesNombres = faltantes.map(obtenerNombreElemento).join(' + ');

  if (tienenSuficiente.length > 0) {
    const tienenNombres = tienenSuficiente.map(obtenerNombreElemento).join(' + ');
    return `Con la compra de ${faltantesNombres} completas tu combo ${tienenNombres} por S/.`;
  }

  return `Completa tu combo con ${faltantesNombres}`;
};

/**
 * Calcula cuántas instancias del combo pueden formarse y qué elementos faltan
 */
export const detectarCombo = (
  cartItems: CartItem[],
  regla: ReglaPrecio,
  productosOverride?: Product[]
): ComboDetection | null => {
  if (!esReglaVigente(regla) || regla.tipo !== 'combo') {
    return null;
  }

  const configuracion = regla.configuracion ?? {};
  const elementos = (configuracion.elementos ?? []) as ElementoCombo[];
  const precioCombo = Number(configuracion.precioCombo ?? 0);

  if (elementos.length === 0 || precioCombo <= 0) {
    return null;
  }

  const productos = productosOverride ?? getProducts();

  // Mapear items del carrito a productos
  const productosEnCarrito: Array<{ producto: Product; cantidad: number }> = cartItems
    .map(item => {
      const producto = productos.find((p: Product) => p.id === item.productId);
      return producto ? { producto, cantidad: item.quantity } : null;
    })
    .filter((item): item is { producto: Product; cantidad: number } => item !== null);

  if (productosEnCarrito.length === 0) {
    return {
      regla,
      instancias: 0,
      elementosFaltantes: elementos,
      mensajeOportunidad: generarMensajeOportunidad(elementos, elementos)
    };
  }

  // Rastrear cuántos de cada elemento tenemos disponibles
  const cantidadDisponiblePorElemento: Record<number, number> = {};

  for (let i = 0; i < elementos.length; i++) {
    const elemento = elementos[i];
    let cantidadTotalDisponible = 0;

    for (const { producto, cantidad } of productosEnCarrito) {
      if (productoCoincideConElemento(producto, elemento)) {
        cantidadTotalDisponible += cantidad;
      }
    }

    cantidadDisponiblePorElemento[i] = cantidadTotalDisponible;
  }

  // Calcular cuántas instancias del combo pueden formarse
  let instanciasCombo = Infinity;

  for (let i = 0; i < elementos.length; i++) {
    const elemento = elementos[i];
    const cantidadDisponible = cantidadDisponiblePorElemento[i] ?? 0;
    const cantidadRequerida = elemento.cantidad;

    const instanciasDeEsteElemento = Math.floor(cantidadDisponible / cantidadRequerida);
    instanciasCombo = Math.min(instanciasCombo, instanciasDeEsteElemento);
  }

  if (instanciasCombo === Infinity) {
    instanciasCombo = 0;
  }

  // Determinar qué elementos están faltando
  const elementosFaltantes: ElementoCombo[] = [];
  for (let i = 0; i < elementos.length; i++) {
    const elemento = elementos[i];
    const cantidadDisponible = cantidadDisponiblePorElemento[i] ?? 0;
    const cantidadRequerida = elemento.cantidad;

    if (cantidadDisponible < cantidadRequerida) {
      elementosFaltantes.push(elemento);
    }
  }

  return {
    regla,
    instancias: Math.max(0, instanciasCombo),
    elementosFaltantes,
    mensajeOportunidad: elementosFaltantes.length > 0
      ? generarMensajeOportunidad(elementos, elementosFaltantes)
      : ''
  };
};

/**
 * Detecta todos los combos aplicables en un carrito
 */
export const detectarTodosLosCombos = (
  cartItems: CartItem[],
  reglas: ReglaPrecio[],
  productosOverride?: Product[]
): ComboDetection[] => {
  const comboRules = reglas.filter(r => r.tipo === 'combo');
  const combosDetectados: ComboDetection[] = [];

  for (const regla of comboRules) {
    const deteccion = detectarCombo(cartItems, regla, productosOverride);
    if (deteccion && deteccion.instancias > 0) {
      combosDetectados.push(deteccion);
    }
  }

  return combosDetectados;
};

/**
 * Aplica combos al carrito y retorna el descuento total
 */
export const aplicarCombos = (
  cartItems: CartItem[],
  reglas: ReglaPrecio[],
  productosMap: Map<number, Product>
): TipoMotorResultado & { combosAplicados: ComboDetection[] } => {
  const combos = detectarTodosLosCombos(cartItems, reglas, Array.from(productosMap.values()));

  if (combos.length === 0) {
    return {
      aplicado: false,
      totalDescuento: 0,
      detalle: [],
      combosAplicados: []
    };
  }

  let totalDescuento = 0;
  const detalle: string[] = [];
  const combosAplicados: ComboDetection[] = [];

  for (const combo of combos) {
    if (combo.instancias > 0) {
      const configuracion = combo.regla.configuracion ?? {};
      const precioCombo = Number(configuracion.precioCombo ?? 0);

      // Calcular el precio normal de los elementos del combo
      const elementos = (configuracion.elementos ?? []) as ElementoCombo[];
      let precioNormal = 0;

      for (const elemento of elementos) {
        let cantidadPendiente = elemento.cantidad;
        for (const item of cartItems) {
          const producto = productosMap.get(item.productId);
          if (!producto) continue;

          if (productoCoincideConElemento(producto, elemento)) {
            const cantidadAUsar = Math.min(item.quantity, cantidadPendiente);
            precioNormal += producto.price * cantidadAUsar;
            cantidadPendiente -= cantidadAUsar;
            if (cantidadPendiente <= 0) {
              break;
            }
          }
        }
      }

      const descuentoPorInstancia = Math.max(0, precioNormal - precioCombo);
      const descuentoTotal = descuentoPorInstancia * combo.instancias;

      totalDescuento += descuentoTotal;
      detalle.push(
        `Combo "${combo.regla.nombre}": ${combo.instancias} x (S/${precioCombo.toFixed(2)}) = -S/${descuentoTotal.toFixed(2)}`
      );
      combosAplicados.push(combo);
    }
  }

  return {
    aplicado: totalDescuento > 0,
    totalDescuento: Number(totalDescuento.toFixed(2)),
    detalle,
    combosAplicados
  };
};
