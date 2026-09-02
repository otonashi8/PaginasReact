export const paginarLista = <T,>(items: T[], paginaActual: number, elementosPorPagina: number) => {
  const pagina = Math.max(1, Number.isFinite(paginaActual) ? paginaActual : 1);
  const limite = Math.max(1, Number.isFinite(elementosPorPagina) ? elementosPorPagina : 1);
  const inicio = (pagina - 1) * limite;
  return items.slice(inicio, inicio + limite);
};
