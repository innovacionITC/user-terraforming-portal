"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

interface Mensaje {
  id: string;
  autor: "cliente" | "sistema";
  texto: string;
}

const bienvenida: Mensaje = {
  id: "bienvenida",
  autor: "sistema",
  texto: "Hola. El chat de soporte todavía no está conectado, así que los mensajes no se envían.",
};

export function ChatSoporte() {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const [mensajes, setMensajes] = useState<Mensaje[]>([bienvenida]);
  const tituloId = useId();

  useEffect(() => {
    if (!abierto) return;
    const tecla = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAbierto(false);
    };
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  }, [abierto]);

  function enviar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const limpio = texto.trim();
    if (!limpio) return;
    setMensajes((actuales) => [
      ...actuales,
      { id: `cliente-${actuales.length}`, autor: "cliente", texto: limpio },
      {
        id: `sistema-${actuales.length}`,
        autor: "sistema",
        texto: "No pudimos enviar tu mensaje. El chat de soporte todavía no está habilitado.",
      },
    ]);
    setTexto("");
  }

  return (
    <div className="fixed bottom-5 right-4 z-30 flex flex-col items-end gap-3 sm:right-6">
      {abierto ? (
        <section
          role="dialog"
          aria-modal="false"
          aria-labelledby={tituloId}
          className="flex h-[min(32rem,calc(100vh-7rem))] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-2xl"
        >
          <header className="flex items-center justify-between bg-terra-700 px-4 py-3 text-white">
            <div>
              <h2 id={tituloId} className="text-sm font-bold">
                Soporte
              </h2>
              <p className="text-xs text-white/80">Terra Gestión Inmobiliaria</p>
            </div>
            <button type="button" className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10" onClick={() => setAbierto(false)} aria-label="Cerrar chat">
              <X className="h-4 w-4" />
            </button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto bg-canvas px-4 py-4">
            {mensajes.map((mensaje) => (
              <p
                key={mensaje.id}
                className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  mensaje.autor === "cliente" ? "ml-auto bg-terra-600 text-white" : "bg-white text-ink"
                }`}
              >
                {mensaje.texto}
              </p>
            ))}
          </div>
          <form className="flex items-center gap-2 border-t border-line p-3" onSubmit={enviar}>
            <label className="sr-only" htmlFor="mensaje-soporte">
              Mensaje para soporte
            </label>
            <input
              id="mensaje-soporte"
              className="min-w-0 flex-1 rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-terra-600"
              placeholder="Escribe un mensaje"
              value={texto}
              onChange={(event) => setTexto(event.target.value)}
            />
            <button type="submit" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-terra-600 text-white hover:bg-terra-700" aria-label="Enviar mensaje">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      ) : null}
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full bg-terra-700 px-4 py-3 text-sm font-bold text-white shadow-lg hover:bg-terra-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terra-800"
        aria-expanded={abierto}
        onClick={() => setAbierto((valor) => !valor)}
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        Soporte
      </button>
    </div>
  );
}
