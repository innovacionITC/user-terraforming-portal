import { json, withCliente } from "@/lib/http";

export const dynamic = "force-dynamic";

export function GET() {
  return withCliente(async (cliente) => json(cliente));
}
