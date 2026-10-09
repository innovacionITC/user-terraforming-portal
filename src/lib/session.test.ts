import { describe, expect, it } from "vitest";

import { createSessionToken, verifySessionToken } from "@/lib/session";

const SECRET = "secreto-de-prueba-local-123";

describe("sesión local", () => {
  it("acepta un token vigente y rechaza alteraciones o vencimiento", async () => {
    const now = Date.parse("2026-10-09T12:00:00Z");
    const token = await createSessionToken("cli-juan-perez", SECRET, now);
    await expect(verifySessionToken(token, SECRET, now + 1000)).resolves.toEqual({ sub: "cli-juan-perez" });

    const [body, signature] = token.split(".");
    await expect(verifySessionToken(`${body}.${signature}x`, SECRET, now)).resolves.toBeNull();
    await expect(verifySessionToken(token, "otro-secreto-distinto", now)).resolves.toBeNull();
    await expect(verifySessionToken(token, SECRET, now + 9 * 60 * 60 * 1000)).resolves.toBeNull();
  });
});
