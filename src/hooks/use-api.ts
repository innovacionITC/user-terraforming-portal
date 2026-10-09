"use client";

import { useEffect, useState } from "react";

import { ApiError, apiGet } from "@/lib/api-client";

export function useApi<T>(path: string | null) {
  const [nonce, setNonce] = useState(0);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(path !== null);

  useEffect(() => {
    if (!path) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setData(null);

    apiGet<T>(path, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setData(result);
        setLoading(false);
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setError(reason instanceof ApiError ? reason.message : "No fue posible consultar la información. Inténtalo de nuevo.");
        setLoading(false);
      });

    return () => controller.abort();
  }, [path, nonce]);

  return { data, error, loading, reload: () => setNonce((value) => value + 1) };
}
