import Image from "next/image";

import { ProgresoComercial } from "@/components/pagos/progreso-comercial";
import { TablaCuotas } from "@/components/pagos/tabla-cuotas";
import { TarjetasPago } from "@/components/pagos/tarjetas-pago";
import { BotonVerRecibo } from "@/components/pagos/visor-recibo";
import { EstadoBadge } from "@/components/ui/estado-badge";
import { tarjeta } from "@/components/ui/estilos";
import { etiquetaModalidad } from "@/domain/etiquetas";
import type { EstadoCuenta } from "@/services/contracts";
import { formatArea, formatCOP, formatFecha } from "@/lib/format";

export function EstadoCuentaPanel({ estado }: { estado: EstadoCuenta }) {
  const descripcion =
    estado.financiacion.tipo === "con_hitos"
      ? "Se han generado los hitos de pago."
      : estado.financiacion.tipo === "sin_hitos"
        ? "Los hitos de pago todavía no se han generado."
        : "Negociación de contado.";

  return (
    <div>
      <article className={`${tarjeta} p-5 sm:p-6`}>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex gap-4">
            <div className="relative hidden h-24 w-36 shrink-0 overflow-hidden rounded-xl sm:block">
              <Image src={estado.compra.imagen} alt="" fill className="object-cover" sizes="144px" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-ink">
                {estado.compra.lote} · {estado.compra.etapa}
              </h2>
              <p className="text-sm text-muted">{estado.compra.referencia}</p>
              <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <div>
                  <dt className="text-muted">Proyecto</dt>
                  <dd className="font-semibold text-ink">{estado.compra.proyecto}</dd>
                </div>
                <div>
                  <dt className="text-muted">Área</dt>
                  <dd className="font-semibold text-ink">{formatArea(estado.compra.areaM2)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Valor de compra</dt>
                  <dd className="font-semibold text-ink">{formatCOP(estado.compra.valorTotal)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Modalidad</dt>
                  <dd className="font-semibold text-ink">{etiquetaModalidad[estado.compra.modalidad]}</dd>
                </div>
              </dl>
            </div>
          </div>
          <div className="rounded-2xl bg-terra-50 px-4 py-3 xl:max-w-xs">
            <p className="text-xs font-medium text-muted">Estado del proceso</p>
            <div className="mt-1">
              <EstadoBadge valor={estado.compra.estadoComercial} />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted">{descripcion}</p>
          </div>
        </div>
        <div className="mt-6 border-t border-line pt-5">
          <ProgresoComercial etapas={estado.etapas} />
        </div>
      </article>

      <h3 className="mb-3 mt-6 text-lg font-bold text-ink">Resumen de pagos</h3>
      <TarjetasPago estado={estado} />

      {estado.financiacion.tipo === "con_hitos" ? (
        <TablaCuotas
          key={estado.compra.id}
          cuotas={estado.financiacion.plan.cuotas}
          referencia={estado.compra.referencia}
          proyecto={estado.compra.proyecto}
          lote={estado.compra.lote}
        />
      ) : null}

      <section className={`${tarjeta} mt-6 p-5`}>
        <h3 className="text-lg font-bold text-ink">Pagos registrados</h3>
        {estado.pagosRegistrados.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Todavía no hay pagos registrados en esta compra.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {estado.pagosRegistrados.map((pago) => (
              <li key={pago.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <span className="font-semibold text-ink">{pago.concepto}</span>
                <span className="text-muted">{formatFecha(pago.fecha) ?? "Fecha no disponible"}</span>
                <span className="font-bold text-ink">{formatCOP(pago.valor)}</span>
                <BotonVerRecibo
                  concepto={pago.concepto}
                  referencia={estado.compra.referencia}
                  proyecto={estado.compra.proyecto}
                  lote={estado.compra.lote}
                  valorPagado={pago.valor}
                  fechaPago={pago.fecha}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
