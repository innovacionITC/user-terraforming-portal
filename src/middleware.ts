import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (session) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ message: "Tu sesión expiró. Inicia sesión de nuevo." }, { status: 401 });
  }

  const login = request.nextUrl.clone();
  login.pathname = "/login";
  login.search = "";
  if (request.nextUrl.pathname !== "/inicio") {
    login.searchParams.set("motivo", "sesion");
  }
  return NextResponse.redirect(login);
}

export const config = {
  matcher: [
    "/inicio",
    "/inicio/:path*",
    "/mis-lotes",
    "/mis-lotes/:path*",
    "/mis-pagos",
    "/mis-pagos/:path*",
    "/api/cliente/:path*",
  ],
};
