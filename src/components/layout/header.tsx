"use client";

import { Building2, Home, Menu, Wallet, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { MenuUsuario } from "@/components/layout/menu-usuario";
import { NotificacionesMenu } from "@/components/layout/notificaciones-menu";
import { TerraLogo } from "@/components/layout/logo";
import type { Notificacion } from "@/domain/finanzas";
import type { ClientePublico } from "@/services/contracts";

const enlaces = [
  { href: "/inicio", etiqueta: "Inicio", icono: Home },
  { href: "/mis-lotes", etiqueta: "Mis lotes", icono: Building2 },
  { href: "/mis-pagos", etiqueta: "Mis pagos", icono: Wallet },
];

function activo(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header({
  cliente,
  notificaciones,
}: {
  cliente: ClientePublico | null;
  notificaciones: Notificacion[];
}) {
  const pathname = usePathname();
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <TerraLogo href="/inicio" />
        <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Principal">
          {enlaces.map((enlace) => {
            const Icono = enlace.icono;
            const seleccionado = activo(pathname, enlace.href);
            return (
              <Link
                key={enlace.href}
                href={enlace.href}
                aria-current={seleccionado ? "page" : undefined}
                className={`relative inline-flex h-20 items-center gap-2 px-3 text-sm font-semibold transition ${
                  seleccionado ? "text-terra-700" : "text-muted hover:text-ink"
                }`}
              >
                <Icono className="h-4 w-4" aria-hidden="true" />
                {enlace.etiqueta}
                {seleccionado ? <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-terra-600" /> : null}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <NotificacionesMenu items={notificaciones} />
          {cliente ? <MenuUsuario cliente={cliente} /> : <span className="h-9 w-28 animate-pulse rounded-full bg-canvas" />}
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-canvas md:hidden"
            aria-expanded={menuAbierto}
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setMenuAbierto((valor) => !valor)}
          >
            {menuAbierto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {menuAbierto ? (
        <nav className="border-t border-line bg-white px-4 py-2 md:hidden" aria-label="Principal móvil">
          {enlaces.map((enlace) => {
            const seleccionado = activo(pathname, enlace.href);
            const Icono = enlace.icono;
            return (
              <Link
                key={enlace.href}
                href={enlace.href}
                aria-current={seleccionado ? "page" : undefined}
                className={`flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold ${seleccionado ? "bg-terra-50 text-terra-700" : "text-ink"}`}
                onClick={() => setMenuAbierto(false)}
              >
                <Icono className="h-4 w-4" aria-hidden="true" />
                {enlace.etiqueta}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </header>
  );
}
