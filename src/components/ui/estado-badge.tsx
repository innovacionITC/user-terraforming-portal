import { etiquetaEstadoComercial, etiquetaEtapa, etiquetaObligacion } from "@/domain/etiquetas";
import type { EstadoComercial, EstadoEtapa, EstadoObligacion } from "@/domain/finanzas";

const estilos: Record<string, string> = {
  en_negociacion: "bg-emerald-50 text-emerald-700",
  en_proceso: "bg-amber-50 text-amber-700",
  finalizada: "bg-slate-100 text-slate-600",
  pagada: "bg-emerald-50 text-emerald-700",
  pendiente: "bg-amber-50 text-amber-800",
  vencida: "bg-orange-50 text-orange-700",
  parcial: "bg-sky-50 text-sky-700",
  completado: "bg-emerald-50 text-emerald-700",
  en_curso: "bg-emerald-50 text-emerald-700",
};

const puntos: Record<string, string> = {
  en_negociacion: "bg-emerald-500",
  en_proceso: "bg-amber-500",
  finalizada: "bg-slate-400",
  pagada: "bg-emerald-500",
  pendiente: "bg-amber-500",
  vencida: "bg-orange-500",
  parcial: "bg-sky-500",
  completado: "bg-emerald-500",
  en_curso: "bg-emerald-500",
};

export function EstadoBadge({
  valor,
  etiqueta,
}: {
  valor: EstadoComercial | EstadoObligacion | EstadoEtapa | string;
  etiqueta?: string;
}) {
  const texto =
    etiqueta ??
    (valor in etiquetaEstadoComercial
      ? etiquetaEstadoComercial[valor as EstadoComercial]
      : valor in etiquetaObligacion
        ? etiquetaObligacion[valor as EstadoObligacion]
        : valor in etiquetaEtapa
          ? etiquetaEtapa[valor as EstadoEtapa]
          : valor);

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${estilos[valor] ?? "bg-slate-100 text-slate-600"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${puntos[valor] ?? "bg-slate-400"}`} aria-hidden="true" />
      {texto}
    </span>
  );
}
