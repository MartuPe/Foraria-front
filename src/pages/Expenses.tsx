import React, { useEffect, useState } from "react";
import "../styles/expenses.css";
import StatCard from "../components/StatCard";
import ExpenseItem, { Expense } from "../components/ExpenseItem";
import Money from "../components/Money";
import { fetchExpensesMock, formatDateISO } from "../services/expenses.mock";
import { Layout } from "../components/layout";

import PaymentsIcon from "@mui/icons-material/Payments";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";

export default function ExpensesPage() {
  const [items, setItems] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [header, setHeader] = useState<{
    unidad: string;
    titular: string;
    totalPendiente: number;
    ultimaExpensaMes: string;
    proximoVencISO: string;
  } | null>(null);

  useEffect(() => {
    fetchExpensesMock().then(({ header, items }) => {
      setHeader(header);
      setItems(items);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="page-loading">Cargando expensas…</div>;
  if (!header) return null;

  return (
    <Layout>
      <div className="page">
        <header className="page__header">
          <div className="title-row">
            <div className="title-left">
              <h1>Expensas</h1>
            </div>
            <div className="unit">
              <div>
                Unidad: <strong>{header.unidad}</strong>
              </div>
              <div>
                Titular: <strong>{header.titular}</strong>
              </div>
            </div>
          </div>

          <div className="stats">
            <StatCard
              accent="warning"
              icon={<PaymentsIcon color="action" />}
              label="Total Pendiente"
              value={
                <Money value={header.totalPendiente} /> as unknown as string
              }
            />
            <StatCard
              accent="success"
              icon={<CheckCircleOutlineIcon color="action" />}
              label="Última Expensa"
              value={header.ultimaExpensaMes}
            />
            <StatCard
              icon={<EventAvailableIcon color="action" />}
              label="Próximo Vencimiento"
              value={formatDateISO(header.proximoVencISO)}
            />
          </div>
        </header>

        <main className="page__content">
          {items.map((exp) => (
            <ExpenseItem key={exp.id} exp={exp} />
          ))}
        </main>
      </div>
    </Layout>
  );
}