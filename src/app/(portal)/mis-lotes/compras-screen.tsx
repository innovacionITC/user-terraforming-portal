"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { TablaCompras } from "@/components/compras/tabla-compras";
import { Esqueleto, EstadoConsulta } from "@/components/ui/estado-consulta";
import { Paginacion } from "@/components/ui/paginacion";
import { campo, tarjeta } from "@/components/ui/estilos";
import { etiquetaEstadoComercial } from "@/domain/etiquetas";
import { useApi } from "@/hooks/use-api";
import { paginar, textoCantidad } from "@/lib/lista";
import type { EstadoComercial } from "@/domain/finanzas";
import type { CompraListado } from "@/services/contracts";

const TAMANO = 6;

export function ComprasScreen() {
  const consulta = useApi<{ items: CompraListado[] }>("/api/cliente/compras");
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState<"" | EstadoComercial>("");
  const [pagina, setPagina] = useState(1);

  const filtradas = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase("es-CO");
    return (consulta.data?.items ?? []).filter((compra) => {
      const coincideEstado = estado === "" || compra.estadoComercial === estado;
      const texto = `${compra.proyecto} ${compra.lote} ${compra.referencia}`.toLocaleLowerCase("es-CO");
      return coincideEstado && (termino === "" || texto.includes(termino));
    });
  }, [busqueda, consulta.data?.items, estado]);

  const paginaActual = paginar(filtradas, pagina, TAMANO);
  const vacio = (consulta.data?.items.length ?? 0) === 0;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">Mis lotes</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">Consulta los lotes asociados a tu cuenta y abre el detalle de cada negociación.</p>
        </div>
        {consulta.data ? (
          <p className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-terra-800 ring-1 ring-line">
            {textoCantidad(consulta.data.items.length, "lote", "lotes")}
          </p>
        ) : null}
      </div>

      <EstadoConsulta
        loading={consulta.loading}
        error={consulta.error}
        onRetry={consulta.reload}
        skeleton={<Esqueleto className="mt-6 h-72 border border-line" />}
      >
        {vacio ? (
          <div className={`${tarjeta} mt-6 px-6 py-14 text-center`}>
            <p className="text-base font-semibold text-ink">No tienes lotes registrados actualmente</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">Cuando exista un lote asociado a tu cuenta, aparecerá en este listado.</p>
          </div>
        ) : (
          <div className={`${tarjeta} mt-6`}>
            <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row">
              <label className="relative min-w-0 flex-1">
                <span className="sr-only">Buscar por proyecto o lote</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  className={`${campo} pl-9`}
                  placeholder="Buscar por proyecto o lote"
                  value={busqueda}
                  onChange={(event) => {
                    setBusqueda(event.target.value);
                    setPagina(1);
                  }}
                />
              </label>
              <label className="sm:w-56">
                <span className="sr-only">Filtrar por estado</span>
                <select
                  className={campo}
                  value={estado}
                  onChange={(event) => {
                    setEstado(event.target.value as "" | EstadoComercial);
                    setPagina(1);
                  }}
                >
                  <option value="">Todos los estados</option>
                  {Object.entries(etiquetaEstadoComercial).map(([valor, etiqueta]) => (
                    <option key={valor} value={valor}>
                      {etiqueta}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {filtradas.length === 0 ? (
              <p className="px-6 py-12 text-center text-sm font-medium text-ink">No hay lotes que coincidan con tu búsqueda.</p>
            ) : (
              <>
                <div className="p-4 md:p-0">
                  <TablaCompras compras={paginaActual.items} mostrarModalidad mostrarEstadoCuenta />
                </div>
                <Paginacion
                  pagina={paginaActual.pagina}
                  totalPaginas={paginaActual.totalPaginas}
                  desde={paginaActual.desde}
                  hasta={paginaActual.hasta}
                  total={paginaActual.total}
                  onChange={setPagina}
                  etiqueta="Paginación de compras"
                />
              </>
            )}
          </div>
        )}
      </EstadoConsulta>
    </div>
  );
}
