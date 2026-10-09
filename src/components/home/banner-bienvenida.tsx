import Image from "next/image";

export function BannerBienvenida({ nombre }: { nombre: string }) {
  return (
    <section className="relative min-h-[230px] overflow-hidden rounded-3xl bg-terra-900">
      <Image
        src="/images/hero-entrada.jpg"
        alt="Entrada de un proyecto inmobiliario de Terra"
        fill
        priority
        className="object-cover object-[70%_center]"
        sizes="(min-width: 1280px) 1120px, 100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0d2b1c] via-[#0d2b1c]/88 to-[#0d2b1c]/15" />
      <div className="relative z-10 max-w-xl px-6 py-8 sm:px-10 sm:py-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">¡Hola, {nombre}!</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/90 sm:text-base">
          Te damos la bienvenida a tu Portal de Gestión Inmobiliaria. Aquí puedes consultar tus compras, conocer tu Estado de cuenta y acceder a la información relacionada con tu proceso.
        </p>
      </div>
    </section>
  );
}
