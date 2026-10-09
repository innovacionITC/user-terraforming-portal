import "server-only";

import { timingSafeEqual } from "node:crypto";

import { clientes, compras, lotes, proyectos } from "@/data/fixtures/crm";
import { construirNotificaciones, erroresDeCompra, evaluarCompra, resumirCompras } from "@/domain/finanzas";
import { formatCOP, inicialesDe } from "@/lib/format";
import type { ClientePublico, CompraDetalle, CompraListado, CrmDataSource, EstadoCuenta, PedidoSelector } from "@/services/contracts";

const erroresDeModelo = compras.flatMap((compra) => erroresDeCompra(compra));
if (erroresDeModelo.length > 0) {
  throw new Error(`Los registros locales tienen inconsistencias: ${erroresDeModelo.join("; ")}`);
}

function publico(cliente: (typeof clientes)[number]): ClientePublico {
  return {
    id: cliente.id,
    nombre: cliente.nombre,
    apellidos: cliente.apellidos,
    nombreCompleto: cliente.nombreCompleto,
    correo: cliente.correo,
    rol: cliente.rol,
    iniciales: inicialesDe(cliente.nombre, cliente.apellidos),
  };
}

function mismaContrasena(ingresada: string, almacenada: string): boolean {
  const actual = Buffer.from(ingresada);
  const esperada = Buffer.from(almacenada);
  if (actual.length !== esperada.length) {
    timingSafeEqual(esperada, esperada);
    return false;
  }
  return timingSafeEqual(actual, esperada);
}

function comprasDelCliente(clienteId: string) {
  return compras.filter((compra) => compra.clienteId === clienteId);
}

function describir(compraId: string, clienteId: string, today: string): { listado: CompraListado; detalle: CompraDetalle } | null {
  const compra = compras.find((item) => item.id === compraId && item.clienteId === clienteId);
  if (!compra) return null;
  const proyecto = proyectos.find((item) => item.id === compra.proyectoId);
  const lote = lotes.find((item) => item.id === compra.loteId && item.proyectoId === compra.proyectoId);
  if (!proyecto || !lote) return null;

  const evaluacion = evaluarCompra(compra, today);
  const listado: CompraListado = {
    id: compra.id,
    referencia: compra.referencia,
    proyecto: proyecto.nombre,
    etapa: proyecto.etapa,
    ubicacion: proyecto.ubicacion,
    descripcion: proyecto.descripcion,
    lote: lote.nombre,
    areaM2: lote.areaM2,
    imagen: proyecto.imagen,
    valorTotal: compra.valorTotal,
    estadoComercial: compra.estadoComercial,
    modalidad: compra.modalidad,
    pagosRealizados: evaluacion.pagosRealizados,
    saldoPendiente: evaluacion.saldoPendiente,
  };

  return {
    listado,
    detalle: {
      ...listado,
      separacion: evaluacion.separacion,
      cuotaInicial: evaluacion.cuotaInicial,
      financiacion: evaluacion.financiacion,
      etapas: evaluacion.etapas,
      cuotasPagadas: evaluacion.cuotasPagadas,
      cuotasGeneradas: evaluacion.cuotasGeneradas,
    },
  };
}

export const localCrmAdapter: CrmDataSource = {
  authenticate(correo, contrasena) {
    const cliente = clientes.find((item) => item.correo.toLowerCase() === correo.trim().toLowerCase());
    if (!cliente || cliente.rol !== "cliente" || !mismaContrasena(contrasena, cliente.contrasena)) return null;
    return publico(cliente);
  },

  getCliente(clienteId) {
    const cliente = clientes.find((item) => item.id === clienteId && item.rol === "cliente");
    return cliente ? publico(cliente) : null;
  },

  getResumen(clienteId, today) {
    return resumirCompras(comprasDelCliente(clienteId), today);
  },

  getCompras(clienteId, today) {
    return comprasDelCliente(clienteId)
      .map((compra) => describir(compra.id, clienteId, today)?.listado)
      .filter((compra): compra is CompraListado => Boolean(compra));
  },

  getCompra(clienteId, compraId, today) {
    return describir(compraId, clienteId, today)?.detalle ?? null;
  },

  getPedidos(clienteId, today) {
    return this.getCompras(clienteId, today).map(
      (compra): PedidoSelector => ({
        id: compra.id,
        referencia: compra.referencia,
        proyecto: compra.proyecto,
        etapa: compra.etapa,
        lote: compra.lote,
        imagen: compra.imagen,
        estadoComercial: compra.estadoComercial,
        modalidad: compra.modalidad,
      }),
    );
  },

  getEstadoCuenta(clienteId, compraId, today): EstadoCuenta | null {
    const descrito = describir(compraId, clienteId, today);
    if (!descrito) return null;
    const compra = compras.find((item) => item.id === compraId && item.clienteId === clienteId);
    if (!compra) return null;
    const evaluacion = evaluarCompra(compra, today);
    return {
      compra: descrito.listado,
      separacion: evaluacion.separacion,
      cuotaInicial: evaluacion.cuotaInicial,
      financiacion: evaluacion.financiacion,
      etapas: evaluacion.etapas,
      pagosRegistrados: evaluacion.pagosRegistrados,
    };
  },

  getNotificaciones(clienteId, today) {
    const contextos = comprasDelCliente(clienteId).flatMap((compra) => {
      const proyecto = proyectos.find((item) => item.id === compra.proyectoId);
      const lote = lotes.find((item) => item.id === compra.loteId);
      if (!proyecto || !lote) return [];
      return [
        {
          compraId: compra.id,
          lote: lote.nombre,
          proyecto: proyecto.nombre,
          evaluacion: evaluarCompra(compra, today),
        },
      ];
    });
    return construirNotificaciones(contextos, today, formatCOP);
  },
};
