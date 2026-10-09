import Link from "next/link";

import { TablaCompras } from "@/components/compras/tabla-compras";
import { tarjeta } from "@/components/ui/estilos";
import type { CompraListado } from "@/services/contracts";

export function ResumenCompras({ compras }: { compras: CompraListado[] }) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-ink">Mis compras</h2>
          <p className="text-sm text-muted">Aquí puedes ver el resumen de tus oportunidades o compras.</p>
        </div>
        <Link href="/mis-compras" className="text-sm font-semibold text-terra-700 hover:underline">
          Ver todas mis compras
        </Link>
      </div>
      <div className={tarjeta}>
        <TablaCompras compras={compras.slice(0, 4)} />
      </div>
    </section>
  );
}
