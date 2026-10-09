export function paginar<T>(items: T[], pagina: number, tamano: number) {
  const totalPaginas = Math.max(1, Math.ceil(items.length / tamano) || 1);
  const actual = Math.min(Math.max(pagina, 1), totalPaginas);
  const inicio = (actual - 1) * tamano;
  return {
    items: items.slice(inicio, inicio + tamano),
    pagina: actual,
    totalPaginas,
    total: items.length,
    desde: items.length === 0 ? 0 : inicio + 1,
    hasta: Math.min(inicio + tamano, items.length),
  };
}

export function textoCantidad(cantidad: number, singular: string, plural: string) {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`;
}
