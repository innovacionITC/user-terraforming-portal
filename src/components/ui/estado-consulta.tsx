import { botonSecundario, tarjeta } from "@/components/ui/estilos";

export function EstadoConsulta({
  loading,
  error,
  onRetry,
  skeleton,
  children,
}: {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  skeleton: React.ReactNode;
  children: React.ReactNode;
}) {
  if (loading) return skeleton;
  if (error) {
    return (
      <div role="alert" className={`${tarjeta} px-6 py-10 text-center`}>
        <p className="text-base font-semibold text-ink">No pudimos cargar esta información</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">{error}</p>
        {onRetry ? (
          <button type="button" className={`${botonSecundario} mt-5`} onClick={onRetry}>
            Reintentar
          </button>
        ) : null}
      </div>
    );
  }
  return children;
}

export function Esqueleto({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-white/80 ${className}`} />;
}
