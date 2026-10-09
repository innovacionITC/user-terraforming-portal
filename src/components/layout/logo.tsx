import Image from "next/image";
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
    <span className={`inline-flex items-center ${tono === "claro" ? "rounded-2xl bg-white px-3 py-1.5" : ""}`}>
      <Image
        src="/logo-terra.png"
        alt="Terra. Lotes que construyen futuro"
        width={1082}
        height={927}
        priority
        className={compacto ? "h-10 w-auto" : "h-14 w-auto sm:h-16"}
      />
    </span>
  );

  if (!href) return marca;
  return (
    <Link href={href} className="rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terra-700">
      {marca}
    </Link>
  );
}
