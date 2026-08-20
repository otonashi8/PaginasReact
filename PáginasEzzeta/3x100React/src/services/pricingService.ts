import { useSyncExternalStore } from 'react';
import type { Product } from '../types';
import { obtenerReglas } from '../admin/Sistema/reglas-precios/DatosReglas';
import { StorageKeys } from '../storage';
import { aplicarReglas } from '../admin/Sistema/reglas-precios/motor/aplicarReglas';
import { aplicarCarrito } from '../admin/Sistema/reglas-precios/motor/aplicarCarrito';
import { detectarCombo } from '../admin/Sistema/reglas-precios/motor/aplicarCombo';
import type { ReglaPrecio } from '../admin/Sistema/reglas-precios/TiposReglas';

export const PRICING_RULES_EVENT = 'maxeta:pricing-rules-changed';
let pricingRulesVersion = 0;
let pricingRulesSnapshot = obtenerReglas();
let pricingRulesListeners = new Set<() => void>();
let pricingRulesListenersInstalled = false;

const notifyPricingRulesListeners = () => {
  pricingRulesSnapshot = obtenerReglas();
  pricingRulesVersion += 1;
  pricingRulesListeners.forEach((listener) => listener());
};

const installPricingRulesListeners = () => {
  if (typeof window === 'undefined' || pricingRulesListenersInstalled) {
    return;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === StorageKeys.REGLAS_PRECIOS) {
      notifyPricingRulesListeners();
    }
  };

  const handleRulesChange = () => {
    notifyPricingRulesListeners();
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(PRICING_RULES_EVENT, handleRulesChange);
  pricingRulesListenersInstalled = true;
};

export const notifyPricingRulesChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(PRICING_RULES_EVENT));
  }
  notifyPricingRulesListeners();
};

export const subscribeToPricingRulesChanges = (listener: () => void) => {
  pricingRulesListeners.add(listener);
  installPricingRulesListeners();

  return () => {
    pricingRulesListeners.delete(listener);
  };
};

export const usePricingRules = () => useSyncExternalStore(
  subscribeToPricingRulesChanges,
  () => pricingRulesSnapshot,
  () => pricingRulesSnapshot,
);

export type ProductPriceSummary = {
  precioOriginal: number;
  precioFinal: number;
  descuentoAplicado: number;
  etiquetaDescuento: string | null;
  reglaAplicada: ReturnType<typeof aplicarReglas>['reglaAplicada'];
};

type CartCouponResolution = {
  rule?: ReturnType<typeof aplicarCarrito>['reglaAplicada'];
  freeShipping: boolean;
};

export type ComboApplied = {
  regla: ReglaPrecio;
  instancias: number;
  descuentoTotal: number;
  elementosFaltantes: Array<{ tipo: string; valor: string; cantidad: number }>;
  mensajeOportunidad: string;
};

export type CartComboInfo = {
  combosAplicados: ComboApplied[];
  descuentoTotalCombos: number;
  combosIncompletos: ComboApplied[];
};

export const resolveCartCoupon = (
  subtotal: number,
  codigoCupon: string,
  reglas: ReturnType<typeof obtenerReglas>,
): CartCouponResolution => {
  const resultado = aplicarCarrito({ subtotal, reglas, codigoCupon });

  return {
    rule: resultado.reglaAplicada,
    freeShipping: resultado.aplicado && Boolean(resultado.reglaAplicada?.configuracion?.envioGratis),
  };
};

const buildProductMotorInput = (product: Product) => ({
  id: product.id,
  slug: product.slug,
  nombre: product.name,
  descripcion: product.description,
  categoria: product.category,
  subcategoria: product.subcategory,
  genero: 'Unisex',
  precio: product.price,
  precioAnterior: product.previousPrice ?? 0,
  imagen: product.image,
  miniImagenes: [product.image, product.image, product.image],
  stock: 1,
  tallas: [],
  destacado: Boolean(product.featured),
  relacionados: product.relatedIds ?? [],
  extras: product.extras ?? [],
  activo: true,
  fechaCreacion: '',
  fechaActualizacion: '',
});

export const resolveProductPrice = (product: Product, contexto: Record<string, unknown> = {}, reglas = obtenerReglas()): ProductPriceSummary => {
  const resultado = aplicarReglas(buildProductMotorInput(product) as never, {
    ...contexto,
    reglas,
  });

  const precioOriginal = Number.isFinite(resultado.precioOriginal) ? resultado.precioOriginal : product.price;
  const precioFinal = Number.isFinite(resultado.precioFinal) ? resultado.precioFinal : product.price;
  const descuentoInfo = resultado.reglaAplicada?.configuracion;
  const valor = Number(descuentoInfo?.valor ?? 0);

  let etiquetaDescuento: string | null = null;

  if (descuentoInfo?.tipoDescuento === 'porcentaje' && valor > 0) {
    etiquetaDescuento = `${valor}% OFF`;
  } else if (descuentoInfo?.tipoDescuento === 'fijo' && valor > 0) {
    etiquetaDescuento = `S/${valor.toFixed(2)} OFF`;
  }

  return {
    precioOriginal,
    precioFinal,
    descuentoAplicado: resultado.descuentoAplicado,
    etiquetaDescuento,
    reglaAplicada: resultado.reglaAplicada,
  };
};

export type CartItem = {
  productId: number;
  quantity: number;
  size: string;
};

export const detectarCombosEnCarrito = (
  cartItems: CartItem[],
  products: Product[],
  reglas: ReglaPrecio[] = obtenerReglas()
): CartComboInfo => {
  const productMap = new Map(products.map(p => [p.id, p]));
  const comboRules = reglas.filter(r => r.tipo === 'combo' && r.estado);

  const combosAplicados: ComboApplied[] = [];
  const combosIncompletos: ComboApplied[] = [];
  let descuentoTotalCombos = 0;

  for (const regla of comboRules) {
    const deteccion = detectarCombo(cartItems, regla);

    if (!deteccion) continue;

    const elementosFaltantes = deteccion.elementosFaltantes.map(el => ({
      tipo: el.tipo,
      valor: el.valor,
      cantidad: el.cantidad
    }));

    const comboInfo: ComboApplied = {
      regla,
      instancias: deteccion.instancias,
      descuentoTotal: 0,
      elementosFaltantes,
      mensajeOportunidad: deteccion.mensajeOportunidad
    };

    if (deteccion.instancias > 0) {
      // Calcular el descuento
      const precioCombo = Number(regla.configuracion?.precioCombo ?? 0);
      const elementos = regla.configuracion?.elementos ?? [];

      let precioNormalTotal = 0;
      for (const elemento of elementos) {
        for (const item of cartItems) {
          const producto = productMap.get(item.productId);
          if (!producto) continue;

          if (elemento.tipo === 'producto' && String(producto.id) === elemento.valor) {
            const cantidadAUsar = Math.min(item.quantity, elemento.cantidad);
            precioNormalTotal += producto.price * cantidadAUsar;
            break;
          } else if (elemento.tipo === 'categoria' && producto.category === elemento.valor) {
            const cantidadAUsar = Math.min(item.quantity, elemento.cantidad);
            precioNormalTotal += producto.price * cantidadAUsar;
            break;
          } else if (elemento.tipo === 'subcategoria' && producto.subcategory === elemento.valor) {
            const cantidadAUsar = Math.min(item.quantity, elemento.cantidad);
            precioNormalTotal += producto.price * cantidadAUsar;
            break;
          }
        }
      }

      const descuentoPorInstancia = Math.max(0, precioNormalTotal - precioCombo);
      comboInfo.descuentoTotal = descuentoPorInstancia * deteccion.instancias;
      descuentoTotalCombos += comboInfo.descuentoTotal;

      combosAplicados.push(comboInfo);
    } else if (deteccion.elementosFaltantes.length > 0) {
      combosIncompletos.push(comboInfo);
    }
  }

  return {
    combosAplicados,
    descuentoTotalCombos,
    combosIncompletos
  };
};