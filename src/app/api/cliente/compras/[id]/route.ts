import { json, withCliente } from "@/lib/http";
import { crm } from "@/services/crm";

export const dynamic = "force-dynamic";

export function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  return withCliente(async (cliente, today) => {
    const { id } = await context.params;
    const compra = crm.getCompra(cliente.id, id, today);
    if (!compra) return json({ message: "No encontramos esta compra asociada a tu cuenta." }, 404);
    return json(compra);
  });
}
