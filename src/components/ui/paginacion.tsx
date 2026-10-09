"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export function Paginacion({
  pagina,
  totalPaginas,
  desde,
  hasta,
  total,
  onChange,
  etiqueta,
}: {
  pagina: number;
  totalPaginas: number;
  desde: number;
  hasta: number;
  total: number;
  onChange: (pagina: number) => void;
  etiqueta: string;
}) {
  if (total === 0) return null;
  const paginas = Array.from({ length: totalPaginas }, (_, index) => index + 1);

  return (
    <nav className="flex flex-col gap-3 border-t border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between" aria-label={etiqueta}>
      <p className="text-xs text-muted">
        Mostrando {desde}–{hasta} de {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink disabled:opacity-40"
          onClick={() => onChange(pagina - 1)}
          disabled={pagina <= 1}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {paginas.map((numero) => (
          <button
            key={numero}
            type="button"
            aria-current={numero === pagina ? "page" : undefined}
            className={`h-8 min-w-8 rounded-lg px-2 text-sm font-semibold ${numero === pagina ? "bg-terra-600 text-white" : "text-ink hover:bg-canvas"}`}
            onClick={() => onChange(numero)}
          >
            {numero}
          </button>
        ))}
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink disabled:opacity-40"
          onClick={() => onChange(pagina + 1)}
          disabled={pagina >= totalPaginas}
          aria-label="Página siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
