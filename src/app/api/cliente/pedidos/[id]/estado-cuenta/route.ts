import { json, withCliente } from "@/lib/http";
import { crm } from "@/services/crm";

export const dynamic = "force-dynamic";

export function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  return withCliente(async (cliente, today) => {
    const { id } = await context.params;
    const estado = crm.getEstadoCuenta(cliente.id, id, today);
    if (!estado) return json({ message: "No encontramos esta compra asociada a tu cuenta." }, 404);
    return json(estado);
  });
}
