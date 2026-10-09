export type EstadoComercial = "en_negociacion" | "en_proceso" | "finalizada";
export type ModalidadNegociacion = "financiada" | "contado";
export type EstadoObligacion = "pagada" | "pendiente" | "vencida" | "parcial";
export type EstadoEtapa = "completado" | "en_curso" | "pendiente";

export interface Obligacion {
  valor: number;
  valorPagado: number;
  fechaPrevista: string | null;
  fechaPago: string | null;
}

export interface CuotaRegistro extends Obligacion {
  numero: number;
}

/**
 * Una compra es una sola negociación.
 * La cotización y el pedido de esa negociación no se cuentan como compras distintas.
 */
export interface CompraRegistro {
  id: string;
  clienteId: string;
  referencia: string;
  proyectoId: string;
  loteId: string;
  estadoComercial: EstadoComercial;
  modalidad: ModalidadNegociacion;
  valorTotal: number;
  separacion: Obligacion;
  cuotaInicial: Obligacion | null;
  financiacion: {
    hitosGenerados: boolean;
    cuotas: CuotaRegistro[];
  } | null;
}

export interface ObligacionVista {
  valor: number;
  valorPagado: number;
  saldoPendiente: number;
  fechaPrevista: string | null;
  fechaPago: string | null;
  estado: EstadoObligacion;
}

export interface CuotaVista extends ObligacionVista {
  numero: number;
}

export interface EtapaProceso {
  clave: "separacion" | "cuota_inicial" | "plan_pagos" | "escrituracion";
  nombre: string;
  estado: EstadoEtapa;
}

export interface PlanPagosVista {
  hitosGenerados: true;
  totalCuotas: number;
  cuotasPagadas: number;
  cuotasPendientes: number;
  valorPagado: number;
  saldoPendiente: number;
  cuotas: CuotaVista[];
}

export type FinanciacionVista =
  | { tipo: "no_aplica" }
  | { tipo: "sin_hitos"; saldoComprometido: number }
  | { tipo: "con_hitos"; plan: PlanPagosVista };

export interface PagoRegistrado {
  id: string;
  concepto: string;
  valor: number;
  fecha: string | null;
}

export interface CompraEvaluada {
  pagosRealizados: number;
  saldoPendiente: number;
  separacion: ObligacionVista;
  cuotaInicial: ObligacionVista | null;
  financiacion: FinanciacionVista;
  etapas: EtapaProceso[];
  pagosRegistrados: PagoRegistrado[];
  cuotasPagadas: number;
  cuotasGeneradas: number;
}

export interface ResumenFinanciero {
  cantidadCompras: number;
  pagosRealizados: number;
  saldoPendiente: number;
  cuotasPagadas: number;
  cuotasGeneradas: number;
  tienePlanDePagos: boolean;
  moneda: "COP";
}

export type TonoNotificacion = "aviso" | "pendiente" | "confirmacion";

export interface Notificacion {
  id: string;
  titulo: string;
  detalle: string;
  fecha: string;
  href: string;
  tono: TonoNotificacion;
}

export interface ContextoNotificacion {
  compraId: string;
  lote: string;
  proyecto: string;
  evaluacion: CompraEvaluada;
}

export function valorReconocido(obligacion: Obligacion): number {
  const pagado = Number.isFinite(obligacion.valorPagado) ? obligacion.valorPagado : 0;
  const valor = Number.isFinite(obligacion.valor) ? obligacion.valor : 0;
  return Math.min(Math.max(0, pagado), Math.max(0, valor));
}

export function saldoObligacion(obligacion: Obligacion): number {
  return Math.max(0, Math.max(0, obligacion.valor) - valorReconocido(obligacion));
}

/**
 * Un abono parcial conserva el estado "parcial" aunque la fecha ya haya pasado.
 * Solo queda "vencida" cuando no existe ningún abono y la fecha prevista ya venció.
 * Una fecha prevista, por sí sola, no marca la obligación como pagada.
 */
export function estadoObligacion(obligacion: Obligacion, today: string): EstadoObligacion {
  const valor = Math.max(0, obligacion.valor);
  const pagado = valorReconocido(obligacion);
  if (valor > 0 && pagado >= valor) return "pagada";
  if (pagado > 0 && pagado < valor) return "parcial";
  if (obligacion.fechaPrevista && obligacion.fechaPrevista < today && pagado < valor) return "vencida";
  return "pendiente";
}

function vistaObligacion(obligacion: Obligacion, today: string): ObligacionVista {
  return {
    valor: Math.max(0, obligacion.valor),
    valorPagado: valorReconocido(obligacion),
    saldoPendiente: saldoObligacion(obligacion),
    fechaPrevista: obligacion.fechaPrevista,
    fechaPago: obligacion.fechaPago,
    estado: estadoObligacion(obligacion, today),
  };
}

function etapaDeObligacion(estado: EstadoObligacion): EstadoEtapa {
  if (estado === "pagada") return "completado";
  if (estado === "parcial") return "en_curso";
  return "pendiente";
}

function etapaDelPlan(cuotas: CuotaVista[], hitosGenerados: boolean): EstadoEtapa {
  if (!hitosGenerados || cuotas.length === 0) return "pendiente";
  if (cuotas.every((cuota) => cuota.estado === "pagada")) return "completado";
  if (cuotas.some((cuota) => cuota.estado !== "pendiente")) return "en_curso";
  return "pendiente";
}

function sumar(valores: number[]): number {
  return valores.reduce((total, valor) => total + valor, 0);
}

export function evaluarCompra(compra: CompraRegistro, today: string): CompraEvaluada {
  const separacion = vistaObligacion(compra.separacion, today);
  const cuotaInicial = compra.cuotaInicial ? vistaObligacion(compra.cuotaInicial, today) : null;

  let financiacion: FinanciacionVista;
  if (compra.modalidad === "contado" || !compra.financiacion) {
    financiacion = { tipo: "no_aplica" };
  } else if (!compra.financiacion.hitosGenerados) {
    const conocido = compra.separacion.valor + (compra.cuotaInicial?.valor ?? 0);
    financiacion = {
      tipo: "sin_hitos",
      saldoComprometido: Math.max(0, compra.valorTotal - conocido),
    };
  } else {
    const cuotas = [...compra.financiacion.cuotas]
      .sort((a, b) => a.numero - b.numero)
      .map((cuota) => ({ ...vistaObligacion(cuota, today), numero: cuota.numero }));
    const cuotasPagadas = cuotas.filter((cuota) => cuota.estado === "pagada").length;
    financiacion = {
      tipo: "con_hitos",
      plan: {
        hitosGenerados: true,
        totalCuotas: cuotas.length,
        cuotasPagadas,
        cuotasPendientes: cuotas.length - cuotasPagadas,
        valorPagado: sumar(cuotas.map((cuota) => cuota.valorPagado)),
        saldoPendiente: sumar(cuotas.map((cuota) => cuota.saldoPendiente)),
        cuotas,
      },
    };
  }

  const pagosDeCuotas = financiacion.tipo === "con_hitos" ? financiacion.plan.valorPagado : 0;
  const pagosRealizados = separacion.valorPagado + (cuotaInicial?.valorPagado ?? 0) + pagosDeCuotas;
  const saldoPendiente = Math.max(0, compra.valorTotal - pagosRealizados);

  const etapas: EtapaProceso[] = [
    { clave: "separacion", nombre: "Separación", estado: etapaDeObligacion(separacion.estado) },
  ];
  if (cuotaInicial) {
    etapas.push({
      clave: "cuota_inicial",
      nombre: "Cuota inicial",
      estado: etapaDeObligacion(cuotaInicial.estado),
    });
  }
  if (compra.modalidad === "financiada") {
    etapas.push({
      clave: "plan_pagos",
      nombre: "Plan de pagos",
      estado: etapaDelPlan(financiacion.tipo === "con_hitos" ? financiacion.plan.cuotas : [], financiacion.tipo === "con_hitos"),
    });
  }
  etapas.push({
    clave: "escrituracion",
    nombre: "Escrituración",
    estado: compra.estadoComercial === "finalizada" ? "completado" : "pendiente",
  });

  const pagosRegistrados: PagoRegistrado[] = [];
  if (separacion.valorPagado > 0) {
    pagosRegistrados.push({
      id: `${compra.id}:separacion`,
      concepto: "Pago de separación",
      valor: separacion.valorPagado,
      fecha: separacion.fechaPago,
    });
  }
  if (cuotaInicial && cuotaInicial.valorPagado > 0) {
    pagosRegistrados.push({
      id: `${compra.id}:cuota-inicial`,
      concepto: "Cuota inicial",
      valor: cuotaInicial.valorPagado,
      fecha: cuotaInicial.fechaPago,
    });
  }
  if (financiacion.tipo === "con_hitos") {
    for (const cuota of financiacion.plan.cuotas) {
      if (cuota.valorPagado > 0) {
        pagosRegistrados.push({
          id: `${compra.id}:cuota:${cuota.numero}`,
          concepto: `Cuota ${cuota.numero}`,
          valor: cuota.valorPagado,
          fecha: cuota.fechaPago,
        });
      }
    }
  }
  pagosRegistrados.sort((a, b) => (b.fecha ?? "").localeCompare(a.fecha ?? ""));

  return {
    pagosRealizados,
    saldoPendiente,
    separacion,
    cuotaInicial,
    financiacion,
    etapas,
    pagosRegistrados,
    cuotasPagadas: financiacion.tipo === "con_hitos" ? financiacion.plan.cuotasPagadas : 0,
    cuotasGeneradas: financiacion.tipo === "con_hitos" ? financiacion.plan.totalCuotas : 0,
  };
}

export function resumirCompras(compras: CompraRegistro[], today: string): ResumenFinanciero {
  const evaluaciones = compras.map((compra) => evaluarCompra(compra, today));
  return {
    cantidadCompras: compras.length,
    pagosRealizados: sumar(evaluaciones.map((item) => item.pagosRealizados)),
    saldoPendiente: sumar(evaluaciones.map((item) => item.saldoPendiente)),
    cuotasPagadas: sumar(evaluaciones.map((item) => item.cuotasPagadas)),
    cuotasGeneradas: sumar(evaluaciones.map((item) => item.cuotasGeneradas)),
    tienePlanDePagos: evaluaciones.some((item) => item.financiacion.tipo === "con_hitos"),
    moneda: "COP",
  };
}

function revisarObligacion(id: string, nombre: string, obligacion: Obligacion | null, errores: string[]) {
  if (!obligacion) return;
  if (!Number.isFinite(obligacion.valor) || obligacion.valor < 0) {
    errores.push(`${id}: ${nombre} tiene un valor inválido`);
  }
  if (!Number.isFinite(obligacion.valorPagado) || obligacion.valorPagado < 0) {
    errores.push(`${id}: ${nombre} tiene un pago inválido`);
  }
  if (obligacion.valorPagado > obligacion.valor) {
    errores.push(`${id}: ${nombre} tiene un pago mayor que el valor`);
  }
  if (obligacion.valorPagado === 0 && obligacion.fechaPago) {
    errores.push(`${id}: ${nombre} tiene fecha de pago sin abono`);
  }
}

export function erroresDeCompra(compra: CompraRegistro): string[] {
  const errores: string[] = [];
  if (!compra.id || !compra.clienteId) errores.push("La compra no tiene identificadores");
  if (!Number.isFinite(compra.valorTotal) || compra.valorTotal <= 0) {
    errores.push(`${compra.id}: el valor total debe ser positivo`);
  }
  revisarObligacion(compra.id, "separación", compra.separacion, errores);
  revisarObligacion(compra.id, "cuota inicial", compra.cuotaInicial, errores);

  const sumaConocida = Math.max(0, compra.separacion.valor) + Math.max(0, compra.cuotaInicial?.valor ?? 0);

  if (compra.modalidad === "contado") {
    if (compra.financiacion !== null) {
      errores.push(`${compra.id}: una compra de contado no lleva plan de financiación`);
    }
    if (sumaConocida !== compra.valorTotal) {
      errores.push(`${compra.id}: separación y cuota inicial no suman el valor de contado`);
    }
  } else if (!compra.financiacion) {
    errores.push(`${compra.id}: una compra financiada debe declarar su plan`);
  } else if (!compra.financiacion.hitosGenerados) {
    if (compra.financiacion.cuotas.length > 0) {
      errores.push(`${compra.id}: hay cuotas aunque los hitos no fueron generados`);
    }
    if (sumaConocida > compra.valorTotal) {
      errores.push(`${compra.id}: separación e inicial superan el valor de la compra`);
    }
  } else {
    if (compra.financiacion.cuotas.length === 0) {
      errores.push(`${compra.id}: los hitos generados no contienen cuotas`);
    }
    const numeros = compra.financiacion.cuotas.map((cuota) => cuota.numero);
    if (new Set(numeros).size !== numeros.length) {
      errores.push(`${compra.id}: hay números de cuota repetidos`);
    }
    let suma = sumaConocida;
    for (const cuota of compra.financiacion.cuotas) {
      revisarObligacion(compra.id, `cuota ${cuota.numero}`, cuota, errores);
      suma += Math.max(0, cuota.valor);
    }
    if (suma !== compra.valorTotal) {
      errores.push(`${compra.id}: los conceptos no suman el valor total (${suma} ≠ ${compra.valorTotal})`);
    }
  }

  return errores;
}

function diasEntre(desde: string, hasta: string): number {
  const inicio = Date.parse(`${desde}T00:00:00Z`);
  const fin = Date.parse(`${hasta}T00:00:00Z`);
  return Math.round((fin - inicio) / 86_400_000);
}

function fechaCorta(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

interface NotaInterna extends Notificacion {
  prioridad: number;
}

export function construirNotificaciones(
  items: ContextoNotificacion[],
  today: string,
  formatMoney: (value: number) => string,
): Notificacion[] {
  const notas: NotaInterna[] = [];

  const agregar = (nota: NotaInterna) => notas.push(nota);

  for (const item of items) {
    const href = `/mis-pagos/${item.compraId}`;
    const lugar = `${item.lote} · ${item.proyecto}`;
    const obligaciones: Array<{ id: string; nombre: string; obligacion: ObligacionVista }> = [
      { id: "separacion", nombre: "la separación", obligacion: item.evaluacion.separacion },
    ];
    if (item.evaluacion.cuotaInicial) {
      obligaciones.push({
        id: "cuota-inicial",
        nombre: "la cuota inicial",
        obligacion: item.evaluacion.cuotaInicial,
      });
    }
    if (item.evaluacion.financiacion.tipo === "con_hitos") {
      for (const cuota of item.evaluacion.financiacion.plan.cuotas) {
        obligaciones.push({
          id: `cuota-${cuota.numero}`,
          nombre: `la cuota ${cuota.numero}`,
          obligacion: cuota,
        });
      }
    }

    for (const concepto of obligaciones) {
      const { obligacion } = concepto;
      if (obligacion.estado === "vencida" && obligacion.fechaPrevista) {
        agregar({
          id: `${item.compraId}:vencida:${concepto.id}`,
          titulo: concepto.id.startsWith("cuota-") ? `Cuota ${concepto.id.replace("cuota-", "")} vencida` : "Pago vencido",
          detalle: `${lugar}. ${capitalizar(concepto.nombre)} venció el ${fechaCorta(obligacion.fechaPrevista)} y el saldo es ${formatMoney(obligacion.saldoPendiente)}.`,
          fecha: obligacion.fechaPrevista,
          href,
          tono: "aviso",
          prioridad: 1,
        });
      } else if (obligacion.estado === "parcial") {
        agregar({
          id: `${item.compraId}:parcial:${concepto.id}`,
          titulo: concepto.id.startsWith("cuota-") ? `Abono parcial en la cuota ${concepto.id.replace("cuota-", "")}` : "Abono parcial",
          detalle: `${lugar}. En ${concepto.nombre} se abonaron ${formatMoney(obligacion.valorPagado)} y el saldo es ${formatMoney(obligacion.saldoPendiente)}.`,
          fecha: obligacion.fechaPago ?? obligacion.fechaPrevista ?? today,
          href,
          tono: "aviso",
          prioridad: 2,
        });
      } else if (
        obligacion.estado === "pendiente" &&
        obligacion.fechaPrevista &&
        diasEntre(today, obligacion.fechaPrevista) >= 0 &&
        diasEntre(today, obligacion.fechaPrevista) <= 20
      ) {
        agregar({
          id: `${item.compraId}:proximo:${concepto.id}`,
          titulo: "Próximo vencimiento",
          detalle: `${capitalizar(concepto.nombre)} de ${item.lote} vence el ${fechaCorta(obligacion.fechaPrevista)} por ${formatMoney(obligacion.saldoPendiente)}.`,
          fecha: obligacion.fechaPrevista,
          href,
          tono: "pendiente",
          prioridad: 3,
        });
      }

      if (obligacion.valorPagado > 0 && obligacion.fechaPago && diasEntre(obligacion.fechaPago, today) >= 0 && diasEntre(obligacion.fechaPago, today) <= 45) {
        agregar({
          id: `${item.compraId}:pago:${concepto.id}`,
          titulo: "Pago registrado",
          detalle: `Se registró un pago de ${formatMoney(obligacion.valorPagado)} en ${concepto.nombre} de ${item.lote}, el ${fechaCorta(obligacion.fechaPago)}.`,
          fecha: obligacion.fechaPago,
          href,
          tono: "confirmacion",
          prioridad: 4,
        });
      }
    }
  }

  return notas
    .sort((a, b) => a.prioridad - b.prioridad || a.fecha.localeCompare(b.fecha) || a.id.localeCompare(b.id))
    .slice(0, 8)
    .map(({ id, titulo, detalle, fecha, href, tono }) => ({ id, titulo, detalle, fecha, href, tono }));
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toLocaleUpperCase("es-CO") + texto.slice(1);
}
