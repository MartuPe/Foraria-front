import React from "react";

export function formatMoney(value: number, currency = "ARS", locale = "es-AR") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Money({ value }: { value: number }) {
  return <span>{formatMoney(value)}</span>;
}
