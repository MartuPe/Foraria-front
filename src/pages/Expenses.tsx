import React, { useEffect, useState, useMemo } from "react";
import { Box, Container } from "@mui/material";
import "../styles/expenses.css";
import ExpenseItem, { Expense } from "../components/ExpenseItem";
import Money from "../components/Money";
import { fetchExpensesMock, formatDateISO } from "../services/expenses.mock";
import PaymentsIcon from "@mui/icons-material/Payments";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PageHeader from "../components/SectionHeader";
import { Layout } from "../components/layout";

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

  const statValues = useMemo(() => {
    if (!header) return null;
    return {
      totalPendiente: header.totalPendiente,
      ultima: header.ultimaExpensaMes,
      proximo: formatDateISO(header.proximoVencISO),
    };
  }, [header]);

  if (loading) {
    return (
      <Layout>
        <Box className="foraria-page-container">
          <Container maxWidth="lg" sx={{ py: 3 }}>Cargando expensas…</Container>
        </Box>
      </Layout>
    );
  }

  if (!header || !statValues) return null;

  return (
    <Layout>
      <Box className="foraria-page-container">
        <PageHeader
          title="Expensas"
          stats={[
            {
              icon: <PaymentsIcon color="action" />,
              title: "Total Pendiente",
              value: <Money value={statValues.totalPendiente} /> as unknown as string,
              color: "warning",
            },
            {
              icon: <CheckCircleOutlineIcon color="action" />,
              title: "Última Expensa",
              value: statValues.ultima,
              color: "success",
            },
            {
              icon: <EventAvailableIcon color="action" />,
              title: "Próximo Vencimiento",
              value: statValues.proximo,
              color: "secondary",
            },
          ]}
        />

        <Box sx={{ display: "grid", gap: 2 }}>
          {items.map((exp) => (
            <ExpenseItem key={exp.id} exp={exp} />
          ))}
        </Box>
      </Box>
    </Layout>
  );
}
