export const SESSION_COOKIE = "terra_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

const DEV_ONLY_SECRET = "desarrollo-local-terra-portal-no-usar-en-produccion";

/**
 * Firma local de sesión para el portal.
 * No constituye autenticación de producción ni reemplaza un proveedor como Microsoft Entra.
 */
export function getSessionSecret(): string {
  const configured = process.env.SESSION_SECRET;
  if (configured && configured.length >= 16) return configured;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET es obligatorio cuando NODE_ENV es production.");
  }
  return DEV_ONLY_SECRET;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const pad = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4));
  const binary = atob(value.replaceAll("-", "+").replaceAll("_", "/") + pad);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

async function sign(body: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return bytesToBase64Url(new Uint8Array(signature));
}

function sameString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return mismatch === 0;
}

export async function createSessionToken(clienteId: string, secret = getSessionSecret(), now = Date.now()): Promise<string> {
  const body = bytesToBase64Url(
    new TextEncoder().encode(JSON.stringify({ sub: clienteId, exp: now + SESSION_MAX_AGE_SECONDS * 1000 })),
  );
  return `${body}.${await sign(body, secret)}`;
}

export async function verifySessionToken(
  token: string,
  secret = getSessionSecret(),
  now = Date.now(),
): Promise<{ sub: string } | null> {
  const [body, signature, extra] = token.split(".");
  if (!body || !signature || extra) return null;
  const expected = await sign(body, secret);
  if (!sameString(signature, expected)) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(body))) as { sub?: unknown; exp?: unknown };
    if (typeof payload.sub !== "string" || payload.sub.length === 0) return null;
    if (typeof payload.exp !== "number" || payload.exp <= now) return null;
    return { sub: payload.sub };
  } catch {
    return null;
  }
}
