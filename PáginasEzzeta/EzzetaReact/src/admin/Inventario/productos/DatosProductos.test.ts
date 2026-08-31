import { describe, expect, it } from 'vitest';
import {
  agregarCategoria,
  agregarSubcategoria,
  agregarBeneficio,
  agregarTalla,
  obtenerClasificacionesProductos,
} from './DatosProductos';

describe('clasificaciones de inventario', () => {
  it('permite crear categorías, subcategorías, beneficios y tallas por tipo', () => {
    agregarCategoria('Bolsos');
    agregarSubcategoria('Bolsos', 'Urban');
    agregarBeneficio('Envío gratis');
    agregarTalla('M', 'letras');
    agregarTalla('34', 'numeros');

    const clasificaciones = obtenerClasificacionesProductos();

    expect(clasificaciones.categorias.Bolsos).toContain('Urban');
    expect(clasificaciones.beneficiosDisponibles).toContain('Envío gratis');
    expect(clasificaciones.tallasPorTipo.letras).toContain('M');
    expect(clasificaciones.tallasPorTipo.numeros).toContain('34');
    expect(clasificaciones.tallasDisponibles).toContain('M');
    expect(clasificaciones.tallasDisponibles).toContain('34');
  });
});
