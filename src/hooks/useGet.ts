import { useEffect, useRef, useState } from "react";
import { api } from "../api/axios";

type Options = { params?: Record<string, any>; enabled?: boolean };

export function useGet<T = unknown>(url: string, opts: Options = {}) {
  const { params, enabled = true } = opts;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    try {
      const r = await api.get<T>(url, { params, signal: abortRef.current.signal });
      setData(r.data);
    } catch (e: any) {
      if (e?.name !== "CanceledError") setError(e?.message ?? "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) fetchData();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, JSON.stringify(params), enabled]);

  return { data, loading, error, refetch: fetchData, setData };
}
