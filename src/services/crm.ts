import "server-only";

import { localCrmAdapter } from "@/services/adapters/local-crm-adapter";
import type { CrmDataSource } from "@/services/contracts";

/**
 * Único punto que las rutas del portal usan para leer información comercial.
 * Para conectar un origen real, implementa CrmDataSource y reemplaza esta exportación.
 * Las pantallas no deben importar este módulo ni los registros locales.
 */
export const crm: CrmDataSource = localCrmAdapter;
