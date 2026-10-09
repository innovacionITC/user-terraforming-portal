"use client";

import { AccesosRapidos } from "@/components/home/accesos-rapidos";
import { BannerBienvenida } from "@/components/home/banner-bienvenida";
import { ResumenCompras } from "@/components/home/resumen-compras";
import { ResumenGeneral } from "@/components/home/resumen-general";
import { useClienteActual } from "@/components/layout/portal-shell";
import { Esqueleto, EstadoConsulta } from "@/components/ui/estado-consulta";
import { useApi } from "@/hooks/use-api";
import type { ResumenFinanciero } from "@/domain/finanzas";
import type { CompraListado } from "@/services/contracts";

export function InicioScreen() {
  const cliente = useClienteActual();
  const resumen = useApi<ResumenFinanciero>("/api/cliente/resumen");
  const compras = useApi<{ items: CompraListado[] }>("/api/cliente/compras");
  const error = resumen.error ?? compras.error;

  return (
    <div>
      {cliente ? <BannerBienvenida nombre={cliente.nombre} /> : <Esqueleto className="h-56" />}
      <AccesosRapidos />
      <EstadoConsulta
        loading={resumen.loading || compras.loading}
        error={error}
        onRetry={() => {
          resumen.reload();
          compras.reload();
        }}
        skeleton={
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Esqueleto key={index} className="h-40 border border-line" />
            ))}
          </div>
        }
      >
        {resumen.data && compras.data ? (
          <>
            <ResumenGeneral resumen={resumen.data} />
            <ResumenCompras compras={compras.data.items} />
          </>
        ) : null}
      </EstadoConsulta>
    </div>
  );
}
