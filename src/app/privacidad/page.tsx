import { PaginaInstitucional } from "@/components/layout/pagina-institucional";
import { sitio } from "@/config/sitio";

export const metadata = { title: "Política de privacidad" };

export default function PrivacidadPage() {
  return (
    <PaginaInstitucional titulo="Política de privacidad">
      {sitio.politicaPrivacidad ? <p>{sitio.politicaPrivacidad}</p> : <p>Terra Gestión Inmobiliaria todavía no ha publicado el texto de su política de privacidad en este portal.</p>}
    </PaginaInstitucional>
  );
}
