"use client";

import { ImageIcon, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { formatCOP, formatFecha } from "@/lib/format";

export function BotonVerRecibo({
  concepto,
  referencia,
  proyecto,
  lote,
  valorPagado,
  fechaPago,
}: {
  concepto: string;
  referencia: string;
  proyecto: string;
  lote: string;
  valorPagado: number;
  fechaPago: string | null;
}) {
  const [abierto, setAbierto] = useState(false);
  const tituloId = useId();

  useEffect(() => {
    if (!abierto) return;
    const tecla = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAbierto(false);
    };
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  }, [abierto]);

  if (valorPagado <= 0) return null;

  const numero = `${referencia}-${concepto.replace(/\s+/g, "-")}`.toUpperCase();

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-ink transition hover:border-terra-600 hover:text-terra-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terra-700"
        onClick={() => setAbierto(true)}
      >
        <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
        Ver recibo
      </button>
      {abierto ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 p-4" role="presentation" onClick={() => setAbierto(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={tituloId}
            className="relative w-full max-w-md"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="absolute -right-2 -top-2 grid h-9 w-9 place-items-center rounded-full bg-white text-ink shadow"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar recibo"
            >
              <X className="h-4 w-4" />
            </button>
            <article className="overflow-hidden rounded-sm bg-[#f7f1e6] px-6 py-7 text-[#2b241c] shadow-2xl">
              <header className="border-b border-dashed border-[#c8bba6] pb-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1f7a45]">Terra</p>
                <h2 id={tituloId} className="mt-1 text-lg font-extrabold">
                Recibo de pago
              </h2>
                <p className="mt-1 text-xs text-[#6d6256]">Gestión Inmobiliaria</p>
              </header>
              <p className="mt-4 text-center text-3xl font-extrabold tracking-tight">{formatCOP(valorPagado)}</p>
              <p className="text-center text-xs text-[#6d6256]">{formatFecha(fechaPago) ?? "Fecha no disponible"}</p>
              <dl className="mt-5 space-y-2 border-t border-dashed border-[#c8bba6] pt-4 text-sm">
                <Fila etiqueta="Concepto" valor={concepto} />
                <Fila etiqueta="Referencia" valor={referencia} />
                <Fila etiqueta="Proyecto" valor={proyecto} />
                <Fila etiqueta="Lote" valor={lote} />
                <Fila etiqueta="Comprobante" valor={numero} />
              </dl>
              <p className="mt-6 text-center text-[11px] uppercase tracking-[0.18em] text-[#1f7a45]">Pago registrado</p>
            </article>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-[#6d6256]">{etiqueta}</dt>
      <dd className="text-right font-semibold">{valor}</dd>
    </div>
  );
}
