import { json, withCliente } from "@/lib/http";
import { crm } from "@/services/crm";

export const dynamic = "force-dynamic";

export function GET() {
  return withCliente(async (cliente, today) => json(crm.getResumen(cliente.id, today)));
}
