import React from "react";

type Variant = "success" | "warning" | "danger" | "neutral";

export default function Badge({
  children,
  variant = "neutral",
}: {
  children: React.ReactNode;
  variant?: Variant;
}) {
  return <span className={`badge badge--${variant}`}>{children}</span>;
}
