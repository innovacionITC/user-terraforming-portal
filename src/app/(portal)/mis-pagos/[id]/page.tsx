import { PantallaEstadoCuenta } from "@/components/pagos/pantalla-estado-cuenta";

export const metadata = { title: "Estado de cuenta" };

export default async function EstadoCuentaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PantallaEstadoCuenta compraId={id} />;
}
