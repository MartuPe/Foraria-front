import React from "react";
import { Card } from "./ui/Card";

export default function StatCard({
  icon,
  label,
  value,
  accent = "none",
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  accent?: "success" | "warning" | "none";
}) {
  return (
    <Card className={`stat ${accent !== "none" ? `stat--${accent}` : ""}`}>
      <div className="stat__icon">{icon}</div>
      <div className="stat__content">
        <div className="stat__label">{label}</div>
        <div className="stat__value">{value}</div>
      </div>
    </Card>
  );
}
