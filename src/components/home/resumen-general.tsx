import { BadgeCheck, CircleDollarSign, Home, Tag } from "lucide-react";

import { tarjeta } from "@/components/ui/estilos";
import type { ResumenFinanciero } from "@/domain/finanzas";
import { formatCOP } from "@/lib/format";
import { textoCantidad } from "@/lib/lista";

export function ResumenGeneral({ resumen }: { resumen: ResumenFinanciero }) {
  const tarjetas = [
    {
      titulo: "Mis compras",
      valor: String(resumen.cantidadCompras),
      detalle: resumen.cantidadCompras === 1 ? "oportunidad" : "oportunidades",
      icono: Home,
      fondo: "bg-emerald-50 text-emerald-700",
    },
    {
      titulo: "Pagos realizados",
      valor: formatCOP(resumen.pagosRealizados),
      detalle: "en total",
      icono: CircleDollarSign,
      fondo: "bg-sky-50 text-sky-700",
    },
    {
      titulo: "Saldo pendiente",
      valor: formatCOP(resumen.saldoPendiente),
      detalle: "por pagar",
      icono: Tag,
      fondo: "bg-orange-50 text-orange-700",
    },
    {
      titulo: "Cuotas pagadas",
      valor: resumen.tienePlanDePagos ? `${resumen.cuotasPagadas} de ${resumen.cuotasGeneradas}` : "—",
      detalle: resumen.tienePlanDePagos ? "cuotas del plan de pagos" : "Sin plan de pagos",
      icono: BadgeCheck,
      fondo: "bg-violet-50 text-violet-700",
    },
  ];

  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-ink">Resumen general</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tarjetas.map((item) => {
          const Icono = item.icono;
          return (
            <article key={item.titulo} className={`${tarjeta} p-5`}>
              <span className={`grid h-11 w-11 place-items-center rounded-full ${item.fondo}`}>
                <Icono className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-sm font-medium text-muted">{item.titulo}</h3>
              <p className="mt-1 text-2xl font-extrabold tracking-tight text-ink">{item.valor}</p>
              <p className="mt-1 text-xs text-muted">{item.detalle}</p>
            </article>
          );
        })}
      </div>
      <p className="sr-only">{textoCantidad(resumen.cantidadCompras, "compra", "compras")}</p>
    </section>
  );
}
