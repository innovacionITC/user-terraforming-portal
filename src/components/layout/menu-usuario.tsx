"use client";

import { ChevronDown, LogOut } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import type { ClientePublico } from "@/services/contracts";

export function MenuUsuario({ cliente }: { cliente: ClientePublico }) {
  const [abierto, setAbierto] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!abierto) return;
    const cerrar = (event: MouseEvent) => {
      if (!contenedor.current?.contains(event.target as Node)) setAbierto(false);
    };
    const tecla = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAbierto(false);
    };
    document.addEventListener("mousedown", cerrar);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", cerrar);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto]);

  async function cerrarSesion() {
    setCerrando(true);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/login");
  }

  return (
    <div className="relative" ref={contenedor}>
      <button
        type="button"
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terra-700"
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-controls={menuId}
        onClick={() => setAbierto((valor) => !valor)}
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-terra-700 text-xs font-bold text-white" aria-hidden="true">
          {cliente.iniciales}
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block max-w-40 truncate text-sm font-semibold text-ink">{cliente.nombreCompleto}</span>
          <span className="block text-[11px] text-muted">Cliente</span>
        </span>
        <ChevronDown className="hidden h-4 w-4 text-muted sm:block" aria-hidden="true" />
      </button>
      {abierto ? (
        <div id={menuId} role="menu" className="absolute right-0 z-50 mt-2 w-60 rounded-2xl border border-line bg-white p-2 shadow-lg">
          <div className="px-3 py-2">
            <p className="text-sm font-semibold text-ink">{cliente.nombreCompleto}</p>
            <p className="text-xs text-muted">{cliente.correo}</p>
            <p className="mt-1 text-xs font-medium text-terra-700">Cliente</p>
          </div>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-ink hover:bg-canvas disabled:opacity-60"
            onClick={cerrarSesion}
            disabled={cerrando}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {cerrando ? "Cerrando sesión..." : "Cerrar sesión"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
