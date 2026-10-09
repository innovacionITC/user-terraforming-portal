import { json, withCliente } from "@/lib/http";
import { crm } from "@/services/crm";

export const dynamic = "force-dynamic";

export function GET() {
  return withCliente(async (cliente, today) => json({ items: crm.getNotificaciones(cliente.id, today) }));
}