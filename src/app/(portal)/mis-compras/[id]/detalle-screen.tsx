"use client";

import { ArrowLeft, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ProgresoComercial } from "@/components/pagos/progreso-comercial";
import { Esqueleto, EstadoConsulta } from "@/components/ui/estado-consulta";
import { EstadoBadge } from "@/components/ui/estado-badge";
import { botonPrimario, botonSecundario, tarjeta } from "@/components/ui/estilos";
import { etiquetaModalidad } from "@/domain/etiquetas";
import { useApi } from "@/hooks/use-api";
import { formatArea, formatCOP } from "@/lib/format";
import type { CompraDetalle } from "@/services/contracts";

export function DetalleScreen({ compraId }: { compraId: string }) {
  const consulta = useApi<CompraDetalle>(`/api/cliente/compras/${compraId}`);

  return (
    <EstadoConsulta
      loading={consulta.loading}
      error={consulta.error}
      onRetry={consulta.reload}
      skeleton={<Esqueleto className="h-96 border border-line" />}
    >
      {consulta.data ? <Detalle compra={consulta.data} /> : null}
    </EstadoConsulta>
  );
}

function Detalle({ compra }: { compra: CompraDetalle }) {
  return (
    <div>
      <Link href="/mis-compras" className={`${botonSecundario} mb-4`}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a mis compras
      </Link>
      <article className={`${tarjeta} overflow-hidden`}>
        <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="relative min-h-64">
            <Image src={compra.imagen} alt={`Proyecto ${compra.proyecto}`} fill className="object-cover" sizes="(min-width: 1024px) 40vw, 100vw" />
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <EstadoBadge valor={compra.estadoComercial} />
              <span className="rounded-full bg-canvas px-2.5 py-1 text-xs font-semibold text-ink">{etiquetaModalidad[compra.modalidad]}</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink">{compra.proyecto}</h1>
            <p className="mt-1 text-sm text-muted">{compra.referencia}</p>
            <p className="mt-4 text-sm leading-relaxed text-muted">{compra.descripcion}</p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {compra.ubicacion}
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <Dato etiqueta="Lote" valor={compra.lote} />
              <Dato etiqueta="Área" valor={formatArea(compra.areaM2)} />
              <Dato etiqueta="Etapa" valor={compra.etapa} />
              <Dato etiqueta="Valor total" valor={formatCOP(compra.valorTotal)} />
              <Dato etiqueta="Pagos realizados" valor={formatCOP(compra.pagosRealizados)} />
              <Dato etiqueta="Saldo pendiente" valor={formatCOP(compra.saldoPendiente)} />
            </dl>
            <Link href={`/mis-pagos/${compra.id}`} className={`${botonPrimario} mt-6`}>
              Ver estado de cuenta
            </Link>
          </div>
        </div>
        <div className="border-t border-line p-6 sm:p-8">
          <h2 className="text-lg font-bold text-ink">Progreso comercial</h2>
          <div className="mt-4">
            <ProgresoComercial etapas={compra.etapas} />
          </div>
        </div>
      </article>
    </div>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <dt className="text-muted">{etiqueta}</dt>
      <dd className="mt-1 font-bold text-ink">{valor}</dd>
    </div>
  );
}
