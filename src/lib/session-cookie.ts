import "server-only";

import { cookies } from "next/headers";

import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/session";

const options = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function writeSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, { ...options, maxAge: SESSION_MAX_AGE_SECONDS });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { ...options, maxAge: 0 });
}
