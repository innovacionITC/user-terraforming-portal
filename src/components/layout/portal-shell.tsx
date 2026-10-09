"use client";

import { createContext, useContext } from "react";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { useApi } from "@/hooks/use-api";
import type { Notificacion } from "@/domain/finanzas";
import type { ClientePublico } from "@/services/contracts";

const ClienteContext = createContext<ClientePublico | null>(null);

export function useClienteActual() {
  return useContext(ClienteContext);
}

export function PortalShell({ children }: { children: React.ReactNode }) {
  const perfil = useApi<ClientePublico>("/api/cliente/me");
  const notas = useApi<{ items: Notificacion[] }>("/api/cliente/notificaciones");

  return (
    <ClienteContext.Provider value={perfil.data}>
      <div className="flex min-h-screen flex-col">
        <Header cliente={perfil.data} notificaciones={notas.data?.items ?? []} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        <Footer />
      </div>
    </ClienteContext.Provider>
  );
}
