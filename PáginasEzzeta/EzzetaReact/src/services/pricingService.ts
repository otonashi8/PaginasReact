import { useSyncExternalStore } from 'react';
import type { Product } from '../types';
import { StorageKeys, storageManager } from '../storage';
import { aplicarReglas } from '../admin/Sistema/reglas-precios/motor/aplicarReglas';
import { aplicarCarrito } from '../admin/Sistema/reglas-precios/motor/aplicarCarrito';
import { detectarCombo } from '../admin/Sistema/reglas-precios/motor/aplicarCombo';
import type { ReglaPrecio } from '../admin/Sistema/reglas-precios/TiposReglas';

const readStoredPricingRules = (): ReglaPrecio[] => {
  const stored = storageManager.get<unknown>(StorageKeys.REGLAS_PRECIOS);

  if (Array.isArray(stored)) {
    return stored as ReglaPrecio[];
  }

  if (typeof stored === 'string') {
    try {
      const parsed = JSON.parse(stored) as unknown;
      return Array.isArray(parsed) ? (parsed as ReglaPrecio[]) : [];
    } catch {
      return [];
    }
  }

  if (stored && typeof stored === 'object' && Array.isArray((stored as { items?: unknown[] }).items)) {
    return (stored as { items: ReglaPrecio[] }).items;
  }

  return [];
};

export const PRICING_RULES_EVENT = 'maxeta:pricing-rules-changed';
let pricingRulesVersion = 0;
let pricingRulesSnapshot = readStoredPricingRules();
let pricingRulesListeners = new Set<() => void>();
let pricingRulesListenersInstalled = false;

const notifyPricingRulesListeners = () => {
  pricingRulesSnapshot = readStoredPricingRules();
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

export const resolveProductPrice = (product: Product, contexto: Record<string, unknown> = {}, reglas = readStoredPricingRules()): ProductPriceSummary => {
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

export const getCheckoutLinePricing = (
  product: Product,
  quantity: number,
  contexto: Record<string, unknown> = {},
  reglas: ReglaPrecio[] = readStoredPricingRules(),
) => {
  const pricing = resolveProductPrice(product, { ...contexto, cantidad: quantity }, reglas);
  const unitPrice = Number.isFinite(pricing.precioFinal) ? Number(pricing.precioFinal) : Number(product.price ?? 0);
  const originalUnitPrice = Number.isFinite(pricing.precioOriginal) ? Number(pricing.precioOriginal) : Number(product.price ?? 0);
  const subtotal = Number((unitPrice * quantity).toFixed(2));
  const originalSubtotal = Number((originalUnitPrice * quantity).toFixed(2));

  return {
    unitPrice,
    originalUnitPrice,
    subtotal,
    originalSubtotal,
    discount: Number(Math.max(0, originalSubtotal - subtotal).toFixed(2)),
    rule: pricing.reglaAplicada,
  };
};

export type CartItem = {
  productId: number;
  quantity: number;
  size: string;
};

/**
 * Detects combos in a cart and calculates discounts
 */
export const detectarCombosEnCarrito = (
  cartItems: CartItem[],
  products: Product[],
  reglas: ReglaPrecio[] = readStoredPricingRules()
): CartComboInfo => {
  // Create a map of products for quick lookup
  const productMap = new Map(products.map(p => [p.id, p]));

  // Get all combo rules
  const comboRules = reglas.filter(r => r.tipo === 'combo' && r.estado);

  const combosAplicados: ComboApplied[] = [];
  const combosIncompletos: ComboApplied[] = [];
  let descuentoTotalCombos = 0;

  for (const regla of comboRules) {
    const deteccion = detectarCombo(cartItems, regla, products);

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

          const coincide = (
            elemento.tipo === 'producto' && String(producto.id) === elemento.valor
          ) || (
            elemento.tipo === 'categoria' && producto.category === elemento.valor
          ) || (
            elemento.tipo === 'subcategoria' && producto.subcategory === elemento.valor
          );

          if (coincide) {
            const cantidadAUsar = Math.min(item.quantity, elemento.cantidad);
            precioNormalTotal += producto.price * cantidadAUsar;
          }
        }
      }

      const descuentoPorInstancia = Math.max(0, precioNormalTotal - precioCombo);
      comboInfo.descuentoTotal = descuentoPorInstancia * deteccion.instancias;
      descuentoTotalCombos += comboInfo.descuentoTotal;

      combosAplicados.push(comboInfo);
    } else if (deteccion.elementosFaltantes.length > 0) {
      // Combo incomplete
      combosIncompletos.push(comboInfo);
    }
  }

  return {
    combosAplicados,
    descuentoTotalCombos,
    combosIncompletos
  };
};