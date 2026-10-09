import { Suspense } from "react";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { clienteDeLaSesion } from "@/lib/http";

export const metadata = { title: "Iniciar sesión" };

export default async function LoginPage() {
  const cliente = await clienteDeLaSesion();
  if (cliente) redirect("/inicio");
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
