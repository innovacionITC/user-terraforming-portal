import type { EstadoComercial, EstadoEtapa, EstadoObligacion, ModalidadNegociacion } from "@/domain/finanzas";

export const etiquetaEstadoComercial: Record<EstadoComercial, string> = {
  en_negociacion: "En negociación",
  en_proceso: "En proceso",
  finalizada: "Finalizada",
};

export const etiquetaModalidad: Record<ModalidadNegociacion, string> = {
  financiada: "Financiada",
  contado: "Contado",
};

export const etiquetaObligacion: Record<EstadoObligacion, string> = {
  pagada: "Pagada",
  pendiente: "Pendiente",
  vencida: "Vencida",
  parcial: "Parcial",
};

export const etiquetaEtapa: Record<EstadoEtapa, string> = {
  completado: "Completado",
  en_curso: "En curso",
  pendiente: "Pendiente",
};
