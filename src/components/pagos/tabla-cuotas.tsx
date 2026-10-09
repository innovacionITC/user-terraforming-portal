"use client";

import { useState } from "react";

import { EstadoBadge } from "@/components/ui/estado-badge";
import { Paginacion } from "@/components/ui/paginacion";
import { tarjeta } from "@/components/ui/estilos";
import type { CuotaVista } from "@/domain/finanzas";
import { formatCOP, formatFecha } from "@/lib/format";
import { paginar } from "@/lib/lista";

const TAMANO = 8;

export function TablaCuotas({ cuotas }: { cuotas: CuotaVista[] }) {
  const [pagina, setPagina] = useState(1);
  const vista = paginar(cuotas, pagina, TAMANO);

  return (
    <section className={`${tarjeta} mt-6 overflow-hidden`}>
      <div className="px-5 py-4">
        <h3 className="text-lg font-bold text-ink">Detalle plan de pagos</h3>
        <p className="text-sm text-muted">Aquí puedes consultar el detalle de cada cuota de tu plan de pagos.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full text-left text-sm">
          <caption className="sr-only">Cuotas del plan de pagos</caption>
          <thead className="bg-[#f8fafc] text-xs font-semibold uppercase tracking-wide text-muted">
            <tr>
              <th scope="col" className="px-4 py-3">#</th>
              <th scope="col" className="px-4 py-3">Valor de la cuota</th>
              <th scope="col" className="px-4 py-3">Fecha de vencimiento</th>
              <th scope="col" className="px-4 py-3">Estado</th>
              <th scope="col" className="px-4 py-3">Valor pagado</th>
              <th scope="col" className="px-4 py-3">Saldo pendiente</th>
            </tr>
          </thead>
          <tbody>
            {vista.items.map((cuota) => (
              <tr key={cuota.numero} className="border-t border-line">
                <td className="px-4 py-3 font-semibold">{cuota.numero}</td>
                <td className="px-4 py-3">{formatCOP(cuota.valor)}</td>
                <td className="px-4 py-3">{formatFecha(cuota.fechaPrevista) ?? "Fecha no disponible"}</td>
                <td className="px-4 py-3">
                  <EstadoBadge valor={cuota.estado} />
                </td>
                <td className="px-4 py-3">{formatCOP(cuota.valorPagado)}</td>
                <td className="px-4 py-3">{formatCOP(cuota.saldoPendiente)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Paginacion
        pagina={vista.pagina}
        totalPaginas={vista.totalPaginas}
        desde={vista.desde}
        hasta={vista.hasta}
        total={vista.total}
        onChange={setPagina}
        etiqueta="Paginación de cuotas"
      />
    </section>
  );
}
