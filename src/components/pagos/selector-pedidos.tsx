"use client";

import { Search } from "lucide-react";
import Image from "next/image";

import { EstadoBadge } from "@/components/ui/estado-badge";
import { campo } from "@/components/ui/estilos";
import type { PedidoSelector } from "@/services/contracts";

export function SelectorPedidos({
  pedidos,
  seleccionado,
  busqueda,
  onBusqueda,
  onSeleccionar,
}: {
  pedidos: PedidoSelector[];
  seleccionado: string | null;
  busqueda: string;
  onBusqueda: (valor: string) => void;
  onSeleccionar: (id: string) => void;
}) {
  return (
    <div>
      <h2 className="text-sm font-bold text-ink">Mis pedidos y cotizaciones</h2>
      <label className="relative mt-3 block">
        <span className="sr-only">Buscar pedido o cotización</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input className={`${campo} pl-9`} placeholder="Buscar..." value={busqueda} onChange={(event) => onBusqueda(event.target.value)} />
      </label>
      {pedidos.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No hay pedidos que coincidan con la búsqueda.</p>
      ) : (
        <ul className="mt-3 flex gap-3 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible">
          {pedidos.map((pedido) => {
            const activo = pedido.id === seleccionado;
            return (
              <li key={pedido.id} className="min-w-[230px] lg:min-w-0">
                <button
                  type="button"
                  onClick={() => onSeleccionar(pedido.id)}
                  aria-pressed={activo}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition ${
                    activo ? "border-terra-600 bg-terra-50" : "border-line bg-white hover:border-terra-100"
                  }`}
                >
                  <span className="relative h-14 w-16 shrink-0 overflow-hidden rounded-xl">
                    <Image src={pedido.imagen} alt="" fill className="object-cover" sizes="64px" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-ink">
                      {pedido.lote} · {pedido.etapa}
                    </span>
                    <span className="block truncate text-xs text-muted">{pedido.referencia}</span>
                    <span className="mt-1 block">
                      <EstadoBadge valor={pedido.estadoComercial} />
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
