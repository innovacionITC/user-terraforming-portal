import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { hoyISO } from "@/lib/fecha";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { crm } from "@/services/crm";
import type { ClientePublico } from "@/services/contracts";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

async function pausaLocal() {
  const ms = Number(process.env.SIMULATED_LATENCY_MS ?? "0");
  if (Number.isFinite(ms) && ms > 0) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export async function clienteDeLaSesion(): Promise<ClientePublico | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await verifySessionToken(token);
  if (!session) return null;
  return crm.getCliente(session.sub);
}

export async function withCliente(handler: (cliente: ClientePublico, today: string) => Promise<Response> | Response) {
  try {
    await pausaLocal();
    const cliente = await clienteDeLaSesion();
    if (!cliente || cliente.rol !== "cliente") {
      return json({ message: "Tu sesión expiró. Inicia sesión de nuevo." }, 401);
    }
    return await handler(cliente, hoyISO());
  } catch (error) {
    console.error(error);
    return json({ message: "No fue posible consultar la información. Inténtalo de nuevo." }, 500);
  }
}
