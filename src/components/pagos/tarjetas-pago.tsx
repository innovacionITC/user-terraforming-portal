import { FileText, HandCoins, Layers } from "lucide-react";

import { BotonPagoPse } from "@/components/pagos/pago-pse";
import { BotonVerRecibo } from "@/components/pagos/visor-recibo";
import { EstadoBadge } from "@/components/ui/estado-badge";
import { tarjeta } from "@/components/ui/estilos";
import type { EstadoCuenta } from "@/services/contracts";
import type { ObligacionVista, PlanPagosVista } from "@/domain/finanzas";
import { formatCOP, formatFecha } from "@/lib/format";

export function TarjetasPago({ estado }: { estado: EstadoCuenta }) {
  const conPlan = estado.financiacion.tipo === "con_hitos";
  const contexto = {
    referencia: estado.compra.referencia,
    proyecto: estado.compra.proyecto,
    lote: estado.compra.lote,
  };
  return (
    <div className={`grid gap-4 md:grid-cols-2 ${conPlan || estado.financiacion.tipo === "sin_hitos" ? "xl:grid-cols-3" : ""}`}>
      <TarjetaConcepto titulo="Pago de separación" icono={<HandCoins className="h-5 w-5" />} obligacion={estado.separacion} {...contexto} />
      {estado.cuotaInicial ? (
        <TarjetaConcepto titulo="Cuota inicial" icono={<Layers className="h-5 w-5" />} obligacion={estado.cuotaInicial} {...contexto} />
      ) : null}
      {estado.financiacion.tipo === "con_hitos" ? <TarjetaPlan plan={estado.financiacion.plan} /> : null}
      {estado.financiacion.tipo === "sin_hitos" ? <TarjetaSinHitos saldo={estado.financiacion.saldoComprometido} /> : null}
    </div>
  );
}

function TarjetaConcepto({
  titulo,
  icono,
  obligacion,
  referencia,
  proyecto,
  lote,
}: {
  titulo: string;
  icono: React.ReactNode;
  obligacion: ObligacionVista;
  referencia: string;
  proyecto: string;
  lote: string;
}) {
  const fechaPago = formatFecha(obligacion.fechaPago);
  const fechaPrevista = formatFecha(obligacion.fechaPrevista);
  return (
    <article className={`${tarjeta} p-5`}>
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-terra-50 text-terra-700">{icono}</span>
        <EstadoBadge valor={obligacion.estado} />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-muted">{titulo}</h3>
      <p className="mt-1 text-xs text-muted">Valor</p>
      <p className="text-2xl font-extrabold tracking-tight text-ink">{formatCOP(obligacion.valor)}</p>
      <dl className="mt-3 space-y-1 text-sm text-muted">
        <div className="flex justify-between gap-3">
          <dt>Valor pagado</dt>
          <dd className="font-semibold text-ink">{formatCOP(obligacion.valorPagado)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Saldo pendiente</dt>
          <dd className="font-semibold text-ink">{formatCOP(obligacion.saldoPendiente)}</dd>
        </div>
        <div>
          <dt className="sr-only">Fecha prevista</dt>
          <dd>{fechaPrevista ? `Fecha prevista ${fechaPrevista}` : "Fecha prevista no disponible"}</dd>
        </div>
        {obligacion.valorPagado > 0 ? (
          <div>
            <dt className="sr-only">Fecha de pago</dt>
            <dd>{fechaPago ? `Fecha de pago ${fechaPago}` : "Fecha de pago no disponible"}</dd>
          </div>
        ) : null}
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        <BotonPagoPse concepto={titulo} referencia={referencia} saldoPendiente={obligacion.saldoPendiente} />
        <BotonVerRecibo
          concepto={titulo}
          referencia={referencia}
          proyecto={proyecto}
          lote={lote}
          valorPagado={obligacion.valorPagado}
          fechaPago={obligacion.fechaPago}
        />
      </div>
    </article>
  );
}

function TarjetaPlan({ plan }: { plan: PlanPagosVista }) {
  const indicadores = [
    ["Total cuotas", String(plan.totalCuotas)],
    ["Cuotas pagadas", String(plan.cuotasPagadas)],
    ["Cuotas pendientes", String(plan.cuotasPendientes)],
    ["Valor pagado", formatCOP(plan.valorPagado)],
    ["Saldo pendiente", formatCOP(plan.saldoPendiente)],
  ];
  return (
    <article className={`${tarjeta} p-5 md:col-span-2 xl:col-span-1`}>
      <span className="grid h-10 w-10 place-items-center rounded-full bg-terra-50 text-terra-700">
        <FileText className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-muted">Plan de pagos (financiado)</h3>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        {indicadores.map(([etiqueta, valor]) => (
          <div key={etiqueta}>
            <dt className="text-xs text-muted">{etiqueta}</dt>
            <dd className="font-bold text-ink">{valor}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function TarjetaSinHitos({ saldo }: { saldo: number }) {
  return (
    <article className={`${tarjeta} p-5 md:col-span-2 xl:col-span-1`}>
      <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-600">
        <FileText className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-ink">Plan de pagos</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">Las cuotas de esta financiación todavía no han sido generadas.</p>
      <p className="mt-4 text-xs text-muted">Valor pendiente de programar</p>
      <p className="text-xl font-extrabold text-ink">{formatCOP(saldo)}</p>
    </article>
  );
}
