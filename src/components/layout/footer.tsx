import Link from "next/link";

import { TerraLogo } from "@/components/layout/logo";
import { sitio } from "@/config/sitio";

export function Footer() {
  return (
    <footer className="mt-8 border-t border-line bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <TerraLogo />
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted" aria-label="Información institucional">
          <Link className="hover:text-terra-700" href="/privacidad">
            Política de privacidad
          </Link>
          <Link className="hover:text-terra-700" href="/terminos">
            Términos y condiciones
          </Link>
          <Link className="hover:text-terra-700" href="/ayuda">
            Ayuda
          </Link>
        </nav>
      </div>
      <p className="border-t border-line px-4 py-3 text-center text-xs text-muted">
        © {sitio.anio} {sitio.razonSocial}. Todos los derechos reservados.
      </p>
    </footer>
  );
}
