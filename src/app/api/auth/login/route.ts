import { crm } from "@/services/crm";
import { json } from "@/lib/http";
import { createSessionToken } from "@/lib/session";
import { writeSessionCookie } from "@/lib/session-cookie";

export const dynamic = "force-dynamic";

interface LoginBody {
  correo?: unknown;
  contrasena?: unknown;
}

export async function POST(request: Request) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return json({ message: "Revisa el correo y la contraseña." }, 400);
  }

  const correo = typeof body.correo === "string" ? body.correo : "";
  const contrasena = typeof body.contrasena === "string" ? body.contrasena : "";
  if (!correo.includes("@") || contrasena.length < 8) {
    return json({ message: "Ingresa un correo válido y una contraseña de al menos 8 caracteres." }, 400);
  }

  const cliente = crm.authenticate(correo, contrasena);
  if (!cliente) {
    return json({ message: "Correo o contraseña incorrectos." }, 401);
  }

  await writeSessionCookie(await createSessionToken(cliente.id));
  return json({ ok: true });
}
