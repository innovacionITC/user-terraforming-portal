import Link from "next/link";

import { TerraLogo } from "@/components/layout/logo";
import { botonPrimario } from "@/components/ui/estilos";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="max-w-md text-center">
        <TerraLogo />
        <h1 className="mt-6 text-2xl font-extrabold text-ink">No encontramos esta página</h1>
        <p className="mt-2 text-sm text-muted">La dirección no corresponde a una sección del portal.</p>
        <Link href="/inicio" className={`${botonPrimario} mt-6`}>
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}
