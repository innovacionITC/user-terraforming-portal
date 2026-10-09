"use client";

import { X } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { botonSecundario } from "@/components/ui/estilos";
import { formatCOP } from "@/lib/format";

export function BotonPagoPse({
  concepto,
  referencia,
  saldoPendiente,
}: {
  concepto: string;
  referencia: string;
  saldoPendiente: number;
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

  if (saldoPendiente <= 0) return null;

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-lg bg-[#21145f] px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#1a104c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#21145f]"
        onClick={() => setAbierto(true)}
      >
        <span className="rounded bg-[#ffe14a] px-1 py-0.5 text-[10px] font-black tracking-wide text-[#21145f]">PSE</span>
        Pagar
      </button>
      {abierto ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4" role="presentation" onClick={() => setAbierto(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={tituloId}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#21145f]">PSE</p>
                <h2 id={tituloId} className="mt-1 text-xl font-extrabold text-ink">
                  Pagar con PSE
                </h2>
              </div>
              <button type="button" className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-canvas" onClick={() => setAbierto(false)} aria-label="Cerrar">
                <X className="h-4 w-4" />
              </button>
            </div>
            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Concepto</dt>
                <dd className="font-semibold text-ink">{concepto}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Referencia</dt>
                <dd className="font-semibold text-ink">{referencia}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Valor a pagar</dt>
                <dd className="text-lg font-extrabold text-ink">{formatCOP(saldoPendiente)}</dd>
              </div>
            </dl>
            <p className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
              El canal de pago PSE todavía no está conectado. Desde aquí no se debita dinero ni se modifica el saldo.
            </p>
            <button type="button" className={`${botonSecundario} mt-5 w-full`} onClick={() => setAbierto(false)}>
              Entendido
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
