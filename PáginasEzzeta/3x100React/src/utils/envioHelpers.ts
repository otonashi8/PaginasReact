import type { ConfiguracionEnvio, TarifaEnvio } from '../admin/Sistema/envio/TiposEnvio';
import { obtenerConfiguracionEnvio } from '../admin/Sistema/envio/DatosEnvio';

export type ShippingCalculationResult = {
  shippingAmount: number | null;
  shippingLabel: string;
  shippingCalculable: boolean;
  shippingNotConfigured: boolean;
  montoMinimoEnvioGratis: number;
};

export const obtenerConfiguracionEnvioActual = (): ConfiguracionEnvio => {
  return obtenerConfiguracionEnvio();
};

export const obtenerTarifaPorDepartamento = (
  departamento: string,
  configuracion: ConfiguracionEnvio,
): TarifaEnvio | undefined => {
  const departamentoNormalizado = departamento.trim().toLowerCase();
  if (!departamentoNormalizado) return undefined;

  return configuracion.tarifas.find((tarifa) => tarifa.ubicacion.trim().toLowerCase() === departamentoNormalizado);
};

export const calcularCostoEnvio = (params: {
  subtotal: number;
  departamento: string;
  configuracion: ConfiguracionEnvio;
  freeShippingCoupon: boolean;
}): ShippingCalculationResult => {
  const { subtotal, departamento, configuracion, freeShippingCoupon } = params;
  const montoMinimoEnvioGratis = Number.isFinite(configuracion.montoMinimoEnvioGratis)
    ? configuracion.montoMinimoEnvioGratis
    : 0;
  const departamentoTrim = departamento.trim();
  const tarifaDepartamento = obtenerTarifaPorDepartamento(departamentoTrim, configuracion);
  const tarifaGeneral = Number.isFinite(configuracion.tarifaGeneral ?? NaN)
    ? configuracion.tarifaGeneral!
    : null;
  const tarifaAplicable = tarifaDepartamento?.costo ?? tarifaGeneral;

  if (freeShippingCoupon || subtotal >= montoMinimoEnvioGratis) {
    return {
      shippingAmount: 0,
      shippingLabel: 'GRATIS',
      shippingCalculable: true,
      shippingNotConfigured: false,
      montoMinimoEnvioGratis,
    };
  }

  if (!departamentoTrim) {
    return {
      shippingAmount: null,
      shippingLabel: 'Seleccione Departamento de Envío',
      shippingCalculable: false,
      shippingNotConfigured: false,
      montoMinimoEnvioGratis,
    };
  }

  if (tarifaAplicable !== null) {
    return {
      shippingAmount: tarifaAplicable,
      shippingLabel: `S/${tarifaAplicable.toFixed(2)}`,
      shippingCalculable: true,
      shippingNotConfigured: false,
      montoMinimoEnvioGratis,
    };
  }

  return {
    shippingAmount: null,
    shippingLabel: 'Seleccione Departamento de Envío',
    shippingCalculable: false,
    shippingNotConfigured: true,
    montoMinimoEnvioGratis,
  };
};
