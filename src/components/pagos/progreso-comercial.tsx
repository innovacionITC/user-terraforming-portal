import { Check } from "lucide-react";

import { etiquetaEtapa } from "@/domain/etiquetas";
import type { EtapaProceso } from "@/domain/finanzas";

export function ProgresoComercial({ etapas }: { etapas: EtapaProceso[] }) {
  return (
    <ol className="flex min-w-[36rem] items-start gap-0 overflow-x-auto pb-1 sm:min-w-0">
      {etapas.map((etapa, index) => {
        const completada = etapa.estado === "completado";
        const enCurso = etapa.estado === "en_curso";
        const activa = completada || enCurso;
        return (
          <li key={etapa.clave} className="relative flex min-w-[7.5rem] flex-1 flex-col items-center text-center">
            {index < etapas.length - 1 ? (
              <span
                className={`absolute left-1/2 top-4 h-0.5 w-full ${completada ? "bg-terra-600" : "bg-slate-200"}`}
                aria-hidden="true"
              />
            ) : null}
            <span
              className={`relative z-10 grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${
                activa ? "bg-terra-600 text-white" : "bg-slate-200 text-slate-500"
              }`}
            >
              {completada ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
            </span>
            <span className="mt-2 text-sm font-semibold text-ink">{etapa.nombre}</span>
            <span className={`text-xs ${activa ? "text-terra-700" : "text-muted"}`}>{etiquetaEtapa[etapa.estado]}</span>
          </li>
        );
      })}
    </ol>
  );
}
