import { useState } from "react";
import { api } from "../api/axios";

type Method = "post" | "put" | "patch" | "delete";

export function useMutation<TResp = unknown, TBody = any>(
  url: string,
  method: Method
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (body?: TBody, opts?: { params?: Record<string, any> }) => {
    setLoading(true);
    setError(null);
    try {
      if (method === "delete") {
        const r = await api.delete<TResp>(url, { data: body, params: opts?.params });
        return r.data;
      }
      const r = await api[method]<TResp>(url, body, { params: opts?.params });
      return r.data;
    } catch (e: any) {
      setError(e?.message ?? "Error");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}
