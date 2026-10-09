import { PaginaInstitucional } from "@/components/layout/pagina-institucional";
import { sitio } from "@/config/sitio";

export const metadata = { title: "Ayuda" };

export default function AyudaPage() {
  return (
    <PaginaInstitucional titulo="Ayuda">
      <p>{sitio.ayuda}</p>
    </PaginaInstitucional>
  );
}
