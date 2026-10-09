import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { EstadoBadge } from "@/components/ui/estado-badge";
import { botonSecundario, tarjeta } from "@/components/ui/estilos";
import { etiquetaModalidad } from "@/domain/etiquetas";
import type { CompraListado } from "@/services/contracts";
import { formatArea, formatCOP } from "@/lib/format";

export function TablaCompras({
  compras,
  mostrarModalidad = false,
  mostrarEstadoCuenta = false,
}: {
  compras: CompraListado[];
  mostrarModalidad?: boolean;
  mostrarEstadoCuenta?: boolean;
}) {
  if (compras.length === 0) {
    return (
      <div className={`${tarjeta} px-6 py-12 text-center`}>
        <p className="text-base font-semibold text-ink">No tienes compras registradas actualmente</p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <caption className="sr-only">Compras del cliente</caption>
            <thead className="bg-[#f8fafc] text-xs font-semibold uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Proyecto</th>
                <th scope="col" className="px-4 py-3 font-semibold">Lote</th>
                <th scope="col" className="px-4 py-3 font-semibold">Área</th>
                <th scope="col" className="px-4 py-3 font-semibold">Valor total</th>
                <th scope="col" className="px-4 py-3 font-semibold">Estado</th>
                {mostrarModalidad ? <th scope="col" className="px-4 py-3 font-semibold">Modalidad</th> : null}
                <th scope="col" className="px-4 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {compras.map((compra) => (
                <tr key={compra.id} className="border-t border-line">
                  <td className="px-4 py-4 font-semibold text-ink">{compra.proyecto}</td>
                  <td className="px-4 py-4">{compra.lote}</td>
                  <td className="px-4 py-4">{formatArea(compra.areaM2)}</td>
                  <td className="px-4 py-4 font-semibold">{formatCOP(compra.valorTotal)}</td>
                  <td className="px-4 py-4">
                    <EstadoBadge valor={compra.estadoComercial} />
                  </td>
                  {mostrarModalidad ? <td className="px-4 py-4">{etiquetaModalidad[compra.modalidad]}</td> : null}
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/mis-compras/${compra.id}`} className={botonSecundario}>
                        Ver detalle <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                      {mostrarEstadoCuenta ? (
                        <Link href={`/mis-pagos/${compra.id}`} className={botonSecundario}>
                          Estado de cuenta
                        </Link>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ul className="space-y-3 md:hidden">
        {compras.map((compra) => (
          <li key={compra.id} className="rounded-2xl border border-line p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-ink">{compra.proyecto}</p>
                <p className="text-sm text-muted">{compra.lote}</p>
              </div>
              <EstadoBadge valor={compra.estadoComercial} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-muted">Área</dt>
                <dd className="font-semibold">{formatArea(compra.areaM2)}</dd>
              </div>
              <div>
                <dt className="text-muted">Valor total</dt>
                <dd className="font-semibold">{formatCOP(compra.valorTotal)}</dd>
              </div>
              {mostrarModalidad ? (
                <div>
                  <dt className="text-muted">Modalidad</dt>
                  <dd className="font-semibold">{etiquetaModalidad[compra.modalidad]}</dd>
                </div>
              ) : null}
            </dl>
            <div className="mt-4 flex flex-col gap-2">
              <Link href={`/mis-compras/${compra.id}`} className={botonSecundario}>
                Ver detalle
              </Link>
              {mostrarEstadoCuenta ? (
                <Link href={`/mis-pagos/${compra.id}`} className={botonSecundario}>
                  Estado de cuenta
                </Link>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
