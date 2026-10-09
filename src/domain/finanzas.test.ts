import { describe, expect, it } from "vitest";

import {
  construirNotificaciones,
  erroresDeCompra,
  estadoObligacion,
  evaluarCompra,
  resumirCompras,
  saldoObligacion,
  type CompraRegistro,
} from "@/domain/finanzas";

const TODAY = "2026-10-09";

function compraBase(parcial: Partial<CompraRegistro> = {}): CompraRegistro {
  return {
    id: "cmp-base",
    clienteId: "cli-base",
    referencia: "OP-1",
    proyectoId: "prj",
    loteId: "lot",
    estadoComercial: "en_proceso",
    modalidad: "contado",
    valorTotal: 100,
    separacion: { valor: 20, valorPagado: 20, fechaPrevista: "2026-01-01", fechaPago: "2026-01-02" },
    cuotaInicial: { valor: 80, valorPagado: 0, fechaPrevista: "2026-12-01", fechaPago: null },
    financiacion: null,
    ...parcial,
  };
}

describe("obligaciones", () => {
  it("no marca una obligación como pagada solo porque tiene fecha prevista", () => {
    const estado = estadoObligacion(
      { valor: 1_000, valorPagado: 0, fechaPrevista: "2026-12-01", fechaPago: null },
      TODAY,
    );
    expect(estado).toBe("pendiente");
  });

  it("distingue pagada, parcial, vencida y pendiente", () => {
    expect(estadoObligacion({ valor: 100, valorPagado: 100, fechaPrevista: "2026-01-01", fechaPago: "2026-01-02" }, TODAY)).toBe("pagada");
    expect(estadoObligacion({ valor: 100, valorPagado: 40, fechaPrevista: "2026-01-01", fechaPago: "2026-02-01" }, TODAY)).toBe("parcial");
    expect(estadoObligacion({ valor: 100, valorPagado: 0, fechaPrevista: "2026-09-01", fechaPago: null }, TODAY)).toBe("vencida");
    expect(estadoObligacion({ valor: 100, valorPagado: 0, fechaPrevista: null, fechaPago: null }, TODAY)).toBe("pendiente");
  });

  it("mantiene el saldo en cero cuando el abono supera el valor", () => {
    expect(saldoObligacion({ valor: 100, valorPagado: 150, fechaPrevista: null, fechaPago: null })).toBe(0);
  });

  it("conserva el saldo de un pago parcial", () => {
    const evaluacion = evaluarCompra(
      compraBase({
        cuotaInicial: { valor: 2_000_000, valorPagado: 800_000, fechaPrevista: "2026-11-01", fechaPago: "2026-10-01" },
        separacion: { valor: 0, valorPagado: 0, fechaPrevista: null, fechaPago: null },
        valorTotal: 2_000_000,
      }),
      TODAY,
    );
    expect(evaluacion.cuotaInicial).toMatchObject({ valorPagado: 800_000, saldoPendiente: 1_200_000, estado: "parcial" });
  });
});

describe("escenarios de compra", () => {
  it("no incluye cuotas en una compra de contado", () => {
    const evaluacion = evaluarCompra(compraBase(), TODAY);
    expect(evaluacion.financiacion.tipo).toBe("no_aplica");
    expect(evaluacion.cuotasGeneradas).toBe(0);
    expect(evaluacion.etapas.map((etapa) => etapa.clave)).not.toContain("plan_pagos");
  });

  it("oculta las cuotas cuando la financiación todavía no tiene hitos", () => {
    const evaluacion = evaluarCompra(
      compraBase({
        modalidad: "financiada",
        valorTotal: 300,
        separacion: { valor: 50, valorPagado: 0, fechaPrevista: "2026-10-20", fechaPago: null },
        cuotaInicial: { valor: 50, valorPagado: 0, fechaPrevista: null, fechaPago: null },
        financiacion: { hitosGenerados: false, cuotas: [] },
      }),
      TODAY,
    );
    expect(evaluacion.financiacion).toEqual({ tipo: "sin_hitos", saldoComprometido: 200 });
    expect(evaluacion.cuotasGeneradas).toBe(0);
    expect(evaluacion.saldoPendiente).toBe(300);
    expect(evaluacion.etapas.find((etapa) => etapa.clave === "plan_pagos")?.estado).toBe("pendiente");
  });

  it("calcula cuotas pagadas, parciales y vencidas después de generar el plan", () => {
    const evaluacion = evaluarCompra(
      compraBase({
        modalidad: "financiada",
        valorTotal: 400,
        separacion: { valor: 100, valorPagado: 100, fechaPrevista: "2026-01-01", fechaPago: "2026-01-01" },
        cuotaInicial: null,
        financiacion: {
          hitosGenerados: true,
          cuotas: [
            { numero: 1, valor: 100, valorPagado: 100, fechaPrevista: "2026-05-01", fechaPago: "2026-05-01" },
            { numero: 2, valor: 100, valorPagado: 40, fechaPrevista: "2026-06-01", fechaPago: "2026-06-02" },
            { numero: 3, valor: 100, valorPagado: 0, fechaPrevista: "2026-07-01", fechaPago: null },
          ],
        },
      }),
      TODAY,
    );
    expect(evaluacion.financiacion.tipo).toBe("con_hitos");
    if (evaluacion.financiacion.tipo !== "con_hitos") return;
    expect(evaluacion.financiacion.plan.cuotas.map((cuota) => cuota.estado)).toEqual(["pagada", "parcial", "vencida"]);
    expect(evaluacion.pagosRealizados).toBe(240);
    expect(evaluacion.saldoPendiente).toBe(160);
    expect(evaluacion.cuotasPagadas).toBe(1);
    expect(evaluacion.cuotasGeneradas).toBe(3);
    expect(evaluacion.financiacion.plan.saldoPendiente).toBe(160);
  });

  it("no deja saldos negativos en el resumen", () => {
    const resumen = resumirCompras(
      [
        compraBase({
          id: "a",
          separacion: { valor: 100, valorPagado: 180, fechaPrevista: null, fechaPago: "2026-01-01" },
          cuotaInicial: null,
          valorTotal: 100,
        }),
      ],
      TODAY,
    );
    expect(resumen.pagosRealizados).toBe(100);
    expect(resumen.saldoPendiente).toBe(0);
  });

  it("reporta una compra sin fechas como registro incompleto, sin inventar importes", () => {
    const evaluacion = evaluarCompra(
      compraBase({
        separacion: { valor: 10, valorPagado: 10, fechaPrevista: null, fechaPago: null },
        cuotaInicial: { valor: 90, valorPagado: 0, fechaPrevista: null, fechaPago: null },
      }),
      TODAY,
    );
    expect(evaluacion.separacion.fechaPago).toBeNull();
    expect(evaluacion.separacion.estado).toBe("pagada");
    expect(evaluacion.cuotaInicial?.estado).toBe("pendiente");
    expect(evaluacion.pagosRealizados).toBe(10);
  });

  it("resume varias compras sin duplicar sus pagos", () => {
    const resumen = resumirCompras(
      [
        compraBase({ id: "contado", valorTotal: 100, separacion: { valor: 100, valorPagado: 40, fechaPrevista: null, fechaPago: "2026-02-01" }, cuotaInicial: null }),
        compraBase({
          id: "financiada",
          modalidad: "financiada",
          valorTotal: 200,
          separacion: { valor: 50, valorPagado: 50, fechaPrevista: null, fechaPago: "2026-01-01" },
          cuotaInicial: null,
          financiacion: {
            hitosGenerados: true,
            cuotas: [{ numero: 1, valor: 150, valorPagado: 150, fechaPrevista: "2026-03-01", fechaPago: "2026-03-01" }],
          },
        }),
      ],
      TODAY,
    );
    expect(resumen).toMatchObject({
      cantidadCompras: 2,
      pagosRealizados: 240,
      saldoPendiente: 60,
      cuotasPagadas: 1,
      cuotasGeneradas: 1,
      tienePlanDePagos: true,
    });
  });
});

describe("notificaciones", () => {
  it("deriva avisos del propio registro y omite cuotas de otras compras", () => {
    const propia = evaluarCompra(
      compraBase({
        id: "propia",
        modalidad: "financiada",
        valorTotal: 300,
        separacion: { valor: 100, valorPagado: 100, fechaPrevista: "2026-01-01", fechaPago: "2026-09-01" },
        cuotaInicial: null,
        financiacion: {
          hitosGenerados: true,
          cuotas: [
            { numero: 1, valor: 100, valorPagado: 0, fechaPrevista: "2026-09-01", fechaPago: null },
            { numero: 2, valor: 100, valorPagado: 0, fechaPrevista: "2026-10-15", fechaPago: null },
          ],
        },
      }),
      TODAY,
    );
    const notas = construirNotificaciones(
      [{ compraId: "propia", lote: "Lote 12", proyecto: "Mirador del Valle", evaluacion: propia }],
      TODAY,
      (value) => `$${value}`,
    );
    expect(notas.some((nota) => nota.titulo === "Cuota 1 vencida")).toBe(true);
    expect(notas.some((nota) => nota.detalle.includes("Lote 99"))).toBe(false);
    expect(notas.some((nota) => nota.titulo === "Próximo vencimiento" && nota.detalle.includes("cuota 2"))).toBe(true);
    expect(notas.every((nota) => nota.href === "/mis-pagos/propia")).toBe(true);
  });
});

describe("consistencia", () => {
  it("rechaza cuotas inventadas en una financiación sin hitos", () => {
    const errores = erroresDeCompra(
      compraBase({
        modalidad: "financiada",
        financiacion: {
          hitosGenerados: false,
          cuotas: [{ numero: 1, valor: 10, valorPagado: 0, fechaPrevista: null, fechaPago: null }],
        },
      }),
    );
    expect(errores.length).toBeGreaterThan(0);
  });
});
