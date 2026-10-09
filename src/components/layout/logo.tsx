import Link from "next/link";

export function TerraLogo({
  tono = "oscuro",
  compacto = false,
  href,
}: {
  tono?: "oscuro" | "claro";
  compacto?: boolean;
  href?: string;
}) {
  const marca = (
    <span className="inline-flex items-center gap-2.5">
      <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0" aria-hidden="true">
        <rect width="40" height="40" rx="11" fill={tono === "claro" ? "rgba(255,255,255,0.16)" : "#E8F6EE"} />
        <path d="M7 29.5 15 13.5 20 21 25.2 10.5 33 29.5Z" fill={tono === "claro" ? "#D7F0E1" : "#1F7A45"} />
        <path d="M12 29.5 18.2 19.2 22 24.2 26.2 16 31.2 29.5Z" fill="#8FCB6B" />
      </svg>
      <span className="leading-none text-left">
        <span className={`block text-[1.15rem] font-extrabold tracking-tight ${tono === "claro" ? "text-white" : "text-terra-800"}`}>Terra</span>
        {compacto ? null : (
          <span className={`mt-1 block text-[10px] font-medium tracking-wide ${tono === "claro" ? "text-white/75" : "text-muted"}`}>
            Gestión Inmobiliaria
          </span>
        )}
      </span>
    </span>
  );

  if (!href) return marca;
  return (
    <Link href={href} className="rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terra-700">
      {marca}
    </Link>
  );
}
