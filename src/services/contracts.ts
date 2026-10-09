import type { CompraEvaluada, EstadoComercial, ModalidadNegociacion, Notificacion, ResumenFinanciero } from "@/domain/finanzas";

export interface ClientePublico {
  id: string;
  nombre: string;
  apellidos: string;
  nombreCompleto: string;
  correo: string;
  rol: "cliente";
  iniciales: string;
}

export interface CompraListado {
  id: string;
  referencia: string;
  proyecto: string;
  etapa: string;
  ubicacion: string;
  descripcion: string;
  lote: string;
  areaM2: number;
  imagen: string;
  valorTotal: number;
  estadoComercial: EstadoComercial;
  modalidad: ModalidadNegociacion;
  pagosRealizados: number;
  saldoPendiente: number;
}

export interface CompraDetalle extends CompraListado {
  separacion: CompraEvaluada["separacion"];
  cuotaInicial: CompraEvaluada["cuotaInicial"];
  financiacion: CompraEvaluada["financiacion"];
  etapas: CompraEvaluada["etapas"];
  cuotasPagadas: number;
  cuotasGeneradas: number;
}

export interface PedidoSelector {
  id: string;
  referencia: string;
  proyecto: string;
  etapa: string;
  lote: string;
  imagen: string;
  estadoComercial: EstadoComercial;
  modalidad: ModalidadNegociacion;
}

export interface EstadoCuenta {
  compra: CompraListado;
  separacion: CompraEvaluada["separacion"];
  cuotaInicial: CompraEvaluada["cuotaInicial"];
  financiacion: CompraEvaluada["financiacion"];
  etapas: CompraEvaluada["etapas"];
  pagosRegistrados: CompraEvaluada["pagosRegistrados"];
}

/**
 * Contrato estable entre las rutas del portal y el origen de información.
 * Una integración posterior debe implementar esta interfaz en el servidor.
 */
export interface CrmDataSource {
  authenticate(correo: string, contrasena: string): ClientePublico | null;
  getCliente(clienteId: string): ClientePublico | null;
  getResumen(clienteId: string, today: string): ResumenFinanciero;
  getCompras(clienteId: string, today: string): CompraListado[];
  getCompra(clienteId: string, compraId: string, today: string): CompraDetalle | null;
  getPedidos(clienteId: string, today: string): PedidoSelector[];
  getEstadoCuenta(clienteId: string, compraId: string, today: string): EstadoCuenta | null;
  getNotificaciones(clienteId: string, today: string): Notificacion[];
}
