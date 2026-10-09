"use client";

import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { TerraLogo } from "@/components/layout/logo";
import { botonPrimario, campo } from "@/components/ui/estilos";
import { ApiError, apiPost } from "@/lib/api-client";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [verContrasena, setVerContrasena] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const sesionVencida = params.get("motivo") === "sesion";

  async function ingresar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!correo.trim() || !correo.includes("@")) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }
    if (contrasena.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setCargando(true);
    try {
      await apiPost("/api/auth/login", { correo, contrasena });
      router.replace("/inicio");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "No fue posible iniciar sesión.");
      setCargando(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1fr)]">
      <section className="relative hidden overflow-hidden bg-terra-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Image src="/images/hero-entrada.jpg" alt="" fill priority className="object-cover opacity-50" sizes="50vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-terra-900 via-terra-900/75 to-terra-800/55" />
        <div className="relative">
          <TerraLogo tono="claro" />
        </div>
        <div className="relative max-w-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-terra-100">Portal de clientes</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight text-white">Consulta tus compras y el estado de tu proceso.</h1>
          <p className="mt-4 text-base leading-relaxed text-white/80">
            Revisa tus lotes, los pagos registrados y las cuotas asociadas a tu negociación.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <TerraLogo />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-ink">Bienvenido</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">Ingresa para consultar tus compras y tu estado de cuenta.</p>
          {sesionVencida ? (
            <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800" role="status">
              Tu sesión expiró. Ingresa de nuevo.
            </p>
          ) : null}
          <form className="mt-8 space-y-4" onSubmit={ingresar} noValidate>
            <div>
              <label htmlFor="correo" className="mb-1.5 block text-sm font-semibold text-ink">
                Correo electrónico
              </label>
              <input
                id="correo"
                name="correo"
                type="email"
                autoComplete="username"
                inputMode="email"
                className={campo}
                value={correo}
                onChange={(event) => setCorreo(event.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="contrasena" className="mb-1.5 block text-sm font-semibold text-ink">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="contrasena"
                  name="contrasena"
                  type={verContrasena ? "text" : "password"}
                  autoComplete="current-password"
                  className={`${campo} pr-11`}
                  value={contrasena}
                  onChange={(event) => setContrasena(event.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted hover:text-ink"
                  onClick={() => setVerContrasena((valor) => !valor)}
                  aria-label={verContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {verContrasena ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error ? (
              <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            ) : null}
            <button type="submit" className={`${botonPrimario} w-full py-3`} disabled={cargando}>
              {cargando ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {cargando ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
