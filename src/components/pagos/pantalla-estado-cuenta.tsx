"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { EstadoCuentaPanel } from "@/components/pagos/estado-cuenta-panel";
import { SelectorPedidos } from "@/components/pagos/selector-pedidos";
import { Esqueleto, EstadoConsulta } from "@/components/ui/estado-consulta";
import { tarjeta } from "@/components/ui/estilos";
import { useApi } from "@/hooks/use-api";
import type { EstadoCuenta, PedidoSelector } from "@/services/contracts";

export function PantallaEstadoCuenta({ compraId }: { compraId?: string }) {
  const router = useRouter();
  const pedidos = useApi<{ items: PedidoSelector[] }>("/api/cliente/pedidos");
  const [busqueda, setBusqueda] = useState("");
  const lista = useMemo(() => pedidos.data?.items ?? [], [pedidos.data]);
  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase("es-CO");
    if (!termino) return lista;
    return lista.filter((pedido) => `${pedido.proyecto} ${pedido.lote} ${pedido.referencia} ${pedido.etapa}`.toLocaleLowerCase("es-CO").includes(termino));
  }, [busqueda, lista]);

  const seleccionado = compraId && lista.some((pedido) => pedido.id === compraId) ? compraId : lista[0]?.id;
  const visible = Boolean(seleccionado && filtrados.some((pedido) => pedido.id === seleccionado));
  const noPertenece = Boolean(compraId && pedidos.data && !lista.some((pedido) => pedido.id === compraId));
  const estado = useApi<EstadoCuenta>(visible && seleccionado && !noPertenece ? `/api/cliente/pedidos/${seleccionado}/estado-cuenta` : null);

  useEffect(() => {
    if (!compraId && lista[0]) router.replace(`/mis-pagos/${lista[0].id}`);
  }, [compraId, lista, router]);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Estado de cuenta</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">Consulta el detalle de tus pagos y el estado actual de cada pedido o cotización.</p>
      </div>

      <EstadoConsulta
        loading={pedidos.loading}
        error={pedidos.error}
        onRetry={pedidos.reload}
        skeleton={<Esqueleto className="h-96 border border-line" />}
      >
        {lista.length === 0 ? (
          <div className={`${tarjeta} px-6 py-16 text-center`}>
            <p className="text-base font-semibold text-ink">No tienes compras registradas actualmente</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">Cuando exista un proceso asociado a tu cuenta, podrás consultar aquí su estado de cuenta.</p>
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-20">
              <SelectorPedidos
                pedidos={filtrados}
                seleccionado={seleccionado ?? null}
                busqueda={busqueda}
                onBusqueda={setBusqueda}
                onSeleccionar={(id) => router.push(`/mis-pagos/${id}`)}
              />
            </aside>
            <div>
              {noPertenece ? (
                <div role="alert" className={`${tarjeta} px-6 py-10 text-center`}>
                  <p className="font-semibold text-ink">No encontramos esta compra asociada a tu cuenta.</p>
                </div>
              ) : !visible ? (
                <div className={`${tarjeta} px-6 py-10 text-center`}>
                  <p className="font-semibold text-ink">Selecciona un pedido para ver su estado de cuenta.</p>
                </div>
              ) : (
                <EstadoConsulta
                  loading={estado.loading}
                  error={estado.error}
                  onRetry={estado.reload}
                  skeleton={<Esqueleto className="h-96 border border-line" />}
                >
                  {estado.data ? <EstadoCuentaPanel estado={estado.data} /> : null}
                </EstadoConsulta>
              )}
            </div>
          </div>
        )}
      </EstadoConsulta>
    </div>
  );
}
