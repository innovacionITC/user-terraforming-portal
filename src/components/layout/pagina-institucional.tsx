import Link from "next/link";

import { Footer } from "@/components/layout/footer";
import { TerraLogo } from "@/components/layout/logo";

export function PaginaInstitucional({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <TerraLogo href="/login" />
          <Link href="/login" className="text-sm font-semibold text-terra-700">
            Iniciar sesión
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">{titulo}</h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
