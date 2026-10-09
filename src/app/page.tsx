import { redirect } from "next/navigation";

import { clienteDeLaSesion } from "@/lib/http";

export default async function PaginaRaiz() {
  const cliente = await clienteDeLaSesion();
  redirect(cliente ? "/inicio" : "/login");
}
