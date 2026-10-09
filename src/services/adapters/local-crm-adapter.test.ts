import { describe, expect, it } from "vitest";

import { localCrmAdapter } from "@/services/adapters/local-crm-adapter";

const TODAY = "2026-10-09";

function cliente(correo: string, contrasena: string) {
  const autenticado = localCrmAdapter.authenticate(correo, contrasena);
  if (!autenticado) throw new Error(`No autenticó ${correo}`);
  return autenticado;
}

describe("aislamiento por cliente", () => {
  const juan = cliente("juan.perez@correo.com", "Valle12.terra");
  const laura = cliente("laura.gomez@correo.com", "Sendero05.terra");
  const camila = cliente("camila.herrera@correo.com", "Altos08.terra");
  const andres = cliente("andres.molina@correo.com", "Reserva.terra");

  it("rechaza credenciales incorrectas y no expone la contraseña", () => {
    expect(localCrmAdapter.authenticate("juan.perez@correo.com", "incorrecta")).toBeNull();
    expect(localCrmAdapter.authenticate("vendedor@terra.com", "Valle12.terra")).toBeNull();
    expect(juan).not.toHaveProperty("contrasena");
    expect(juan.rol).toBe("cliente");
    expect(juan.iniciales).toBe("JP");
  });

  it("devuelve solo las compras del cliente autenticado", () => {
    expect(localCrmAdapter.getCompras(juan.id, TODAY).map((compra) => compra.id)).toEqual(["cmp-jc-mirador-12"]);
    expect(localCrmAdapter.getCompras(laura.id, TODAY).map((compra) => compra.id)).toEqual(["cmp-lg-senderos-05"]);
    expect(localCrmAdapter.getCompras(camila.id, TODAY)).toHaveLength(3);
    expect(localCrmAdapter.getCompras(andres.id, TODAY)).toEqual([]);

    const ids = [juan, laura, camila, andres].flatMap((persona) => localCrmAdapter.getCompras(persona.id, TODAY).map((compra) => compra.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("impide consultar el estado de cuenta de otro cliente", () => {
    expect(localCrmAdapter.getCompra(laura.id, "cmp-jc-mirador-12", TODAY)).toBeNull();
    expect(localCrmAdapter.getEstadoCuenta(juan.id, "cmp-lg-senderos-05", TODAY)).toBeNull();
    expect(localCrmAdapter.getEstadoCuenta(andres.id, "cmp-ch-altos-08", TODAY)).toBeNull();
    expect(localCrmAdapter.getCliente("cli-inexistente")).toBeNull();
  });

  it("usa el mismo identificador para la compra y su estado de cuenta", () => {
    for (const persona of [juan, laura, camila, andres]) {
      const compras = localCrmAdapter.getCompras(persona.id, TODAY);
      const pedidos = localCrmAdapter.getPedidos(persona.id, TODAY);
      expect(pedidos.map((pedido) => pedido.id)).toEqual(compras.map((compra) => compra.id));
    }
  });
});

describe("reglas financieras de los perfiles", () => {
  const juan = cliente("juan.perez@correo.com", "Valle12.terra");
  const laura = cliente("laura.gomez@correo.com", "Sendero05.terra");
  const camila = cliente("camila.herrera@correo.com", "Altos08.terra");
  const andres = cliente("andres.molina@correo.com", "Reserva.terra");

  it("calcula el resumen de la compra financiada con hitos y un abono parcial", () => {
    const resumen = localCrmAdapter.getResumen(juan.id, TODAY);
    const estado = localCrmAdapter.getEstadoCuenta(juan.id, "cmp-jc-mirador-12", TODAY);
    expect(resumen).toMatchObject({
      cantidadCompras: 1,
      pagosRealizados: 87_000_000,
      saldoPendiente: 63_000_000,
      cuotasPagadas: 11,
      cuotasGeneradas: 24,
      tienePlanDePagos: true,
      moneda: "COP",
    });
    expect(estado?.financiacion.tipo).toBe("con_hitos");
    if (estado?.financiacion.tipo !== "con_hitos") return;
    const parcial = estado.financiacion.plan.cuotas.find((cuota) => cuota.numero === 12);
    expect(parcial).toMatchObject({ valor: 5_000_000, valorPagado: 2_000_000, saldoPendiente: 3_000_000, estado: "parcial" });
    expect(estado.financiacion.plan.cuotas.find((cuota) => cuota.numero === 13)?.estado).toBe("vencida");
    expect(estado.financiacion.plan.cuotas.find((cuota) => cuota.numero === 17)?.estado).toBe("pendiente");
    expect(estado.separacion.estado).toBe("pagada");
    expect(estado.cuotaInicial?.estado).toBe("pagada");
    expect(estado.compra.saldoPendiente).toBe(estado.financiacion.plan.saldoPendiente);
  });

  it("no muestra cuotas financiadas en la compra de contado", () => {
    const estado = localCrmAdapter.getEstadoCuenta(laura.id, "cmp-lg-senderos-05", TODAY);
    expect(estado?.financiacion).toEqual({ tipo: "no_aplica" });
    expect(estado?.cuotaInicial).toMatchObject({ valorPagado: 40_000_000, saldoPendiente: 72_000_000, estado: "parcial" });
    expect(localCrmAdapter.getResumen(laura.id, TODAY)).toMatchObject({
      pagosRealizados: 48_000_000,
      saldoPendiente: 72_000_000,
      cuotasGeneradas: 0,
      tienePlanDePagos: false,
    });
  });

  it("separa la compra con hitos de la compra financiada que aún no los tiene", () => {
    const conHitos = localCrmAdapter.getEstadoCuenta(camila.id, "cmp-ch-altos-08", TODAY);
    const sinHitos = localCrmAdapter.getEstadoCuenta(camila.id, "cmp-ch-reserva-03", TODAY);
    const contado = localCrmAdapter.getEstadoCuenta(camila.id, "cmp-ch-mirador-21", TODAY);

    expect(conHitos?.financiacion.tipo).toBe("con_hitos");
    expect(sinHitos?.financiacion).toEqual({ tipo: "sin_hitos", saldoComprometido: 160_000_000 });
    expect(sinHitos?.separacion.estado).toBe("pendiente");
    expect(contado?.financiacion.tipo).toBe("no_aplica");
    expect(contado?.etapas.find((etapa) => etapa.clave === "escrituracion")?.estado).toBe("completado");
    expect(contado?.compra.saldoPendiente).toBe(0);

    if (conHitos?.financiacion.tipo !== "con_hitos") return;
    expect(conHitos.financiacion.plan.cuotas).toHaveLength(12);
    expect(conHitos.pagosRegistrados.reduce((total, pago) => total + pago.valor, 0)).toBe(conHitos.compra.pagosRealizados);

    const resumen = localCrmAdapter.getResumen(camila.id, TODAY);
    const compras = localCrmAdapter.getCompras(camila.id, TODAY);
    expect(resumen.pagosRealizados).toBe(compras.reduce((total, compra) => total + compra.pagosRealizados, 0));
    expect(resumen.saldoPendiente).toBe(compras.reduce((total, compra) => total + compra.saldoPendiente, 0));
    expect(resumen).toMatchObject({
      cantidadCompras: 3,
      pagosRealizados: 213_000_000,
      saldoPendiente: 310_000_000,
      cuotasPagadas: 4,
      cuotasGeneradas: 12,
    });
  });

  it("responde vacío cuando el cliente no tiene compras", () => {
    expect(localCrmAdapter.getResumen(andres.id, TODAY)).toMatchObject({
      cantidadCompras: 0,
      pagosRealizados: 0,
      saldoPendiente: 0,
      cuotasPagadas: 0,
      cuotasGeneradas: 0,
      tienePlanDePagos: false,
    });
    expect(localCrmAdapter.getPedidos(andres.id, TODAY)).toEqual([]);
    expect(localCrmAdapter.getNotificaciones(andres.id, TODAY)).toEqual([]);
  });

  it("no mezcla los pagos al cambiar de compra", () => {
    const altos = localCrmAdapter.getEstadoCuenta(camila.id, "cmp-ch-altos-08", TODAY);
    const reserva = localCrmAdapter.getEstadoCuenta(camila.id, "cmp-ch-reserva-03", TODAY);
    expect(altos?.compra.pagosRealizados).toBe(85_000_000);
    expect(reserva?.compra.pagosRealizados).toBe(0);
    expect(reserva?.pagosRegistrados).toEqual([]);
    expect(altos?.compra.proyecto).toBe("Altos de La Sabana");
    expect(reserva?.compra.proyecto).toBe("Reserva del Bosque");
  });
});
