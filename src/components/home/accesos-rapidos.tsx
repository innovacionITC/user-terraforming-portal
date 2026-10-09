import { ChevronRight, CircleDollarSign } from "lucide-react";
import Link from "next/link";

export function AccesosRapidos() {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-ink">Accesos rápidos</h2>
      <Link
        href="/mis-pagos"
        className="mt-3 flex items-center gap-4 rounded-2xl border border-[#d7e4fb] bg-[#eef4ff] px-4 py-4 transition hover:border-info/40 sm:px-5"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-info shadow-sm">
          <CircleDollarSign className="h-6 w-6" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-bold text-ink">Estado de cuenta</span>
          <span className="block text-sm text-muted">Revisa tus pagos y cuotas</span>
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-info" aria-hidden="true" />
      </Link>
    </section>
  );
}
