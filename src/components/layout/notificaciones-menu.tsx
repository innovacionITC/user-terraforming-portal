"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { formatFecha } from "@/lib/format";
import type { Notificacion } from "@/domain/finanzas";

export function NotificacionesMenu({ items }: { items: Notificacion[] }) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const cantidad = items.length;

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

  return (
    <div className="relative" ref={contenedor}>
      <button
        type="button"
        className="relative grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terra-700"
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-controls={menuId}
        aria-label={cantidad > 0 ? `Notificaciones, ${cantidad}` : "Notificaciones"}
        onClick={() => setAbierto((valor) => !valor)}
      >
        <Bell className="h-5 w-5" />
        {cantidad > 0 ? (
          <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {cantidad}
          </span>
        ) : null}
      </button>
      {abierto ? (
        <div id={menuId} role="menu" className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-line bg-white p-2 shadow-lg">
          <p className="px-3 py-2 text-sm font-semibold text-ink">Notificaciones</p>
          {items.length === 0 ? (
            <p className="px-3 pb-3 text-sm text-muted">No tienes notificaciones por ahora.</p>
          ) : (
            <ul className="max-h-96 space-y-1 overflow-y-auto">
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    role="menuitem"
                    className="block rounded-xl px-3 py-2 hover:bg-canvas"
                    onClick={() => setAbierto(false)}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-ink">{item.titulo}</span>
                      <span className="shrink-0 text-[11px] text-muted">{formatFecha(item.fecha)}</span>
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted">{item.detalle}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
