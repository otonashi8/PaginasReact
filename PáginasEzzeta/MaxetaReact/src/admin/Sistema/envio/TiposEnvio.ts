export interface TarifaEnvio {
  id: number;
  ubicacion: string;
  costo: number;
}

export interface ConfiguracionEnvio {
  montoMinimoEnvioGratis: number;
  tarifaGeneral: number | null;
  tarifas: TarifaEnvio[];
}

export const envioConfigInicial: ConfiguracionEnvio = {
  montoMinimoEnvioGratis: 0,
  tarifaGeneral: null,
  tarifas: [],
};
