import React from "react";
import Badge from "./ui/Badge";
import { Button } from "@mui/material";
import {PaymentOutlined } from "@mui/icons-material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import Money from "./Money";

export type ExpenseConcepts = {
  administracion: number;
  mantenimiento: number;
  limpieza: number;
  seguridad: number;
  otros: number;
};

export type ExpenseStatus = "pendiente" | "pagada" | "vencida";

export type Expense = {
  id: string;
  mes: string;
  status: ExpenseStatus;
  venceISO: string;
  total: number;
  conceptos: ExpenseConcepts;
  pdfUrl?: string;
  canPay?: boolean;
};

function StatusBadge({ status }: { status: ExpenseStatus }) {
  if (status === "pagada") return <Badge variant="success">Pagada</Badge>;
  if (status === "vencida") return <Badge variant="danger">Vencida</Badge>;
  return <Badge variant="warning">Pendiente</Badge>;
}

export default function ExpenseItem({ exp }: { exp: Expense }) {
  const due = new Date(exp.venceISO);
  const dueLabel = due.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="expense">
      <div className="expense__header">
        <div className="expense__title">
          <span className={`status-dot status-dot--${exp.status}`} />
          <h3>Expensa {exp.mes}</h3>
        </div>
        <div className="expense__amount">
          <Money value={exp.total} />
        </div>
      </div>

      <div className="expense__meta">
        <StatusBadge status={exp.status} />
        <div className="due">
          <span className="ico"></span>
          <span>Vence: {dueLabel}</span>
        </div>
      </div>

      <div className="concepts">
        <div className="concept"><span>Administración</span><strong><Money value={exp.conceptos.administracion} /></strong></div>
        <div className="concept"><span>Mantenimiento</span><strong><Money value={exp.conceptos.mantenimiento} /></strong></div>
        <div className="concept"><span>Limpieza</span><strong><Money value={exp.conceptos.limpieza} /></strong></div>
        <div className="concept"><span>Seguridad</span><strong><Money value={exp.conceptos.seguridad} /></strong></div>
        <div className="concept"><span>Otros</span><strong><Money value={exp.conceptos.otros} /></strong></div>
      </div>

      <div className="expense__actions">
  {exp.canPay && (
    <Button
      variant="contained"
      color={exp.status === "vencida" ? "error" : "secondary"}
      startIcon={<PaymentOutlined />}
      onClick={() => alert("Pago")}
    >
      {exp.status === "vencida" ? "Pagar (Vencida)" : "Pagar Online"}
    </Button>
  )}

  <Button
    variant="outlined"
    color="primary"
    startIcon={<CloudDownloadIcon />}
    onClick={() => alert("Descargar PDF")}
  >
    Descargar PDF
  </Button>

  {exp.status === "pagada" && (
    <div className="paid-inline">
      <span className="ico"></span> <span>Pagada</span>
    </div>
  )}
</div>

    </div>
  );
}