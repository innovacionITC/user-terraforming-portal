export function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatArea(metros: number): string {
  return `${new Intl.NumberFormat("es-CO").format(metros)} m²`;
}

export function formatFecha(iso: string | null): string | null {
  if (!iso) return null;
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function inicialesDe(nombre: string, apellidos: string): string {
  const primera = nombre.trim().split(/\s+/)[0]?.[0] ?? "";
  const apellido = apellidos.trim().split(/\s+/)[0]?.[0] ?? "";
  return `${primera}${apellido}`.toLocaleUpperCase("es-CO");
}
