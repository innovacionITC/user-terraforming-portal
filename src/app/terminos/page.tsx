import { PaginaInstitucional } from "@/components/layout/pagina-institucional";
import { sitio } from "@/config/sitio";

export const metadata = { title: "Términos y condiciones" };

export default function TerminosPage() {
  return (
    <PaginaInstitucional titulo="Términos y condiciones">
      {sitio.terminos ? <p>{sitio.terminos}</p> : <p>Terra Gestión Inmobiliaria todavía no ha publicado los términos y condiciones en este portal.</p>}
    </PaginaInstitucional>
  );
}
