import { DetalleScreen } from "@/app/(portal)/mis-compras/[id]/detalle-screen";

export const metadata = { title: "Detalle de compra" };

export default async function DetalleCompraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DetalleScreen compraId={id} />;
}
