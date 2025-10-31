// src/components/CheckoutButton.tsx
import React, { useState } from "react";
import { Button, CircularProgress } from "@mui/material";

type Props = {
  expenseId: number;
  residenceId: number;
  label?: string;
};

export default function CheckoutButton({ expenseId, residenceId, label = "Pagar con MercadoPago" }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("https://localhost:7245/api/Payment/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ expenseId, residenceId })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const json = await res.json();
      console.log("create-preference response:", json);
      const initPoint = json.initPoint ?? json.data?.initPoint ?? null;
      if (!initPoint) throw new Error("initPoint no recibido del backend");

      window.location.href = String(initPoint);
    } catch (e: any) {
      console.error("CheckoutButton error:", e);
      setError(e?.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleClick} disabled={loading}>
        {loading ? <><CircularProgress size={18} color="inherit" />&nbsp;Redirigiendo...</> : label}
      </Button>
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
    </>
  );
}
