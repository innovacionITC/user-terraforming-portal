import "server-only";

import type { CompraRegistro, CuotaRegistro } from "@/domain/finanzas";

/**
 * Registros locales que imitan la forma de un CRM comercial.
 * No son una conexión con Microsoft Dynamics 365 ni información real de compradores.
 * Las pantallas consumen estos registros solo a través del adaptador y las rutas internas.
 */

export interface ClienteRegistro {
  id: string;
  nombre: string;
  apellidos: string;
  nombreCompleto: string;
  correo: string;
  contrasena: string;
  rol: "cliente";
}

export interface ProyectoRegistro {
  id: string;
  nombre: string;
  etapa: string;
  ubicacion: string;
  descripcion: string;
  imagen: string;
}

export interface LoteRegistro {
  id: string;
  proyectoId: string;
  nombre: string;
  areaM2: number;
}

function sumarMeses(iso: string, meses: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + meses, day));
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function crearCuotas(opciones: {
  valor: number;
  inicio: string;
  cantidad: number;
  pagadasCompletas: number;
  parcial?: { numero: number; valorPagado: number; fechaPago: string };
}): CuotaRegistro[] {
  return Array.from({ length: opciones.cantidad }, (_, index) => {
    const numero = index + 1;
    const fechaPrevista = sumarMeses(opciones.inicio, index);
    if (numero <= opciones.pagadasCompletas) {
      return {
        numero,
        valor: opciones.valor,
        valorPagado: opciones.valor,
        fechaPrevista,
        fechaPago: fechaPrevista,
      };
    }
    if (opciones.parcial?.numero === numero) {
      return {
        numero,
        valor: opciones.valor,
        valorPagado: opciones.parcial.valorPagado,
        fechaPrevista,
        fechaPago: opciones.parcial.fechaPago,
      };
    }
    return {
      numero,
      valor: opciones.valor,
      valorPagado: 0,
      fechaPrevista,
      fechaPago: null,
    };
  });
}

export const clientes: ClienteRegistro[] = [
  {
    id: "cli-juan-perez",
    nombre: "Juan Carlos",
    apellidos: "Pérez",
    nombreCompleto: "Juan Carlos Pérez",
    correo: "juan.perez@correo.com",
    contrasena: "Valle12.terra",
    rol: "cliente",
  },
  {
    id: "cli-laura-gomez",
    nombre: "Laura",
    apellidos: "Gómez Arango",
    nombreCompleto: "Laura Gómez Arango",
    correo: "laura.gomez@correo.com",
    contrasena: "Sendero05.terra",
    rol: "cliente",
  },
  {
    id: "cli-camila-herrera",
    nombre: "Camila",
    apellidos: "Herrera Duque",
    nombreCompleto: "Camila Herrera Duque",
    correo: "camila.herrera@correo.com",
    contrasena: "Altos08.terra",
    rol: "cliente",
  },
  {
    id: "cli-andres-molina",
    nombre: "Andrés Felipe",
    apellidos: "Molina",
    nombreCompleto: "Andrés Felipe Molina",
    correo: "andres.molina@correo.com",
    contrasena: "Reserva.terra",
    rol: "cliente",
  },
];

export const proyectos: ProyectoRegistro[] = [
  {
    id: "prj-mirador",
    nombre: "Mirador del Valle",
    etapa: "Etapa 1",
    ubicacion: "Rionegro, Antioquia",
    descripcion: "Lotes sobre la ladera oriental, con vista al valle y vías internas pavimentadas.",
    imagen: "/images/mirador-del-valle.jpg",
  },
  {
    id: "prj-senderos",
    nombre: "Senderos Campestres",
    etapa: "Etapa 2",
    ubicacion: "La Ceja, Antioquia",
    descripcion: "Lotes campestres entre senderos peatonales y vegetación nativa.",
    imagen: "/images/senderos-campestres.jpg",
  },
  {
    id: "prj-altos",
    nombre: "Altos de La Sabana",
    etapa: "Etapa 1",
    ubicacion: "Sopó, Cundinamarca",
    descripcion: "Terrenos de topografía suave en el corredor de la sabana.",
    imagen: "/images/altos-de-la-sabana.jpg",
  },
  {
    id: "prj-reserva",
    nombre: "Reserva del Bosque",
    etapa: "Etapa 3",
    ubicacion: "Envigado, Antioquia",
    descripcion: "Lotes en el borde de una reserva forestal, con retiros de conservación.",
    imagen: "/images/reserva-del-bosque.jpg",
  },
];

export const lotes: LoteRegistro[] = [
  { id: "lot-mv-12", proyectoId: "prj-mirador", nombre: "Lote 12", areaM2: 200 },
  { id: "lot-mv-21", proyectoId: "prj-mirador", nombre: "Lote 21", areaM2: 160 },
  { id: "lot-sc-05", proyectoId: "prj-senderos", nombre: "Lote 05", areaM2: 180 },
  { id: "lot-as-08", proyectoId: "prj-altos", nombre: "Lote 08", areaM2: 250 },
  { id: "lot-rb-03", proyectoId: "prj-reserva", nombre: "Lote 03", areaM2: 320 },
];

export const compras: CompraRegistro[] = [
  {
    id: "cmp-jc-mirador-12",
    clienteId: "cli-juan-perez",
    referencia: "OP-000123",
    proyectoId: "prj-mirador",
    loteId: "lot-mv-12",
    estadoComercial: "en_negociacion",
    modalidad: "financiada",
    valorTotal: 150_000_000,
    separacion: {
      valor: 5_000_000,
      valorPagado: 5_000_000,
      fechaPrevista: "2025-02-10",
      fechaPago: "2025-02-15",
    },
    cuotaInicial: {
      valor: 25_000_000,
      valorPagado: 25_000_000,
      fechaPrevista: "2025-04-15",
      fechaPago: "2025-04-20",
    },
    financiacion: {
      hitosGenerados: true,
      cuotas: crearCuotas({
        valor: 5_000_000,
        inicio: "2025-06-15",
        cantidad: 24,
        pagadasCompletas: 11,
        parcial: { numero: 12, valorPagado: 2_000_000, fechaPago: "2026-09-30" },
      }),
    },
  },
  {
    id: "cmp-lg-senderos-05",
    clienteId: "cli-laura-gomez",
    referencia: "OP-000198",
    proyectoId: "prj-senderos",
    loteId: "lot-sc-05",
    estadoComercial: "en_proceso",
    modalidad: "contado",
    valorTotal: 120_000_000,
    separacion: {
      valor: 8_000_000,
      valorPagado: 8_000_000,
      fechaPrevista: "2026-03-01",
      fechaPago: "2026-03-03",
    },
    cuotaInicial: {
      valor: 112_000_000,
      valorPagado: 40_000_000,
      fechaPrevista: "2026-11-30",
      fechaPago: "2026-06-18",
    },
    financiacion: null,
  },
  {
    id: "cmp-ch-altos-08",
    clienteId: "cli-camila-herrera",
    referencia: "OP-000214",
    proyectoId: "prj-altos",
    loteId: "lot-as-08",
    estadoComercial: "en_negociacion",
    modalidad: "financiada",
    valorTotal: 185_000_000,
    separacion: {
      valor: 6_000_000,
      valorPagado: 6_000_000,
      fechaPrevista: "2025-11-05",
      fechaPago: "2025-11-10",
    },
    cuotaInicial: {
      valor: 29_000_000,
      valorPagado: 29_000_000,
      fechaPrevista: "2026-01-15",
      fechaPago: "2026-01-20",
    },
    financiacion: {
      hitosGenerados: true,
      cuotas: crearCuotas({
        valor: 12_500_000,
        inicio: "2026-02-15",
        cantidad: 12,
        pagadasCompletas: 4,
      }),
    },
  },
  {
    id: "cmp-ch-reserva-03",
    clienteId: "cli-camila-herrera",
    referencia: "OP-000301",
    proyectoId: "prj-reserva",
    loteId: "lot-rb-03",
    estadoComercial: "en_proceso",
    modalidad: "financiada",
    valorTotal: 210_000_000,
    separacion: {
      valor: 10_000_000,
      valorPagado: 0,
      fechaPrevista: "2026-10-20",
      fechaPago: null,
    },
    cuotaInicial: {
      valor: 40_000_000,
      valorPagado: 0,
      fechaPrevista: "2026-12-15",
      fechaPago: null,
    },
    financiacion: {
      hitosGenerados: false,
      cuotas: [],
    },
  },
  {
    id: "cmp-ch-mirador-21",
    clienteId: "cli-camila-herrera",
    referencia: "OP-000088",
    proyectoId: "prj-mirador",
    loteId: "lot-mv-21",
    estadoComercial: "finalizada",
    modalidad: "contado",
    valorTotal: 128_000_000,
    separacion: {
      valor: 8_000_000,
      valorPagado: 8_000_000,
      fechaPrevista: "2025-01-10",
      fechaPago: "2025-01-12",
    },
    cuotaInicial: {
      valor: 120_000_000,
      valorPagado: 120_000_000,
      fechaPrevista: "2025-06-30",
      fechaPago: "2025-06-28",
    },
    financiacion: null,
  },
];
