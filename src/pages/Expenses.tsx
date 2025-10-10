import React, { useEffect, useState, useMemo } from "react";
import { Box, Container, Grid } from "@mui/material";
import "../styles/expenses.css";
import StatCard from "../components/StatCard";
import ExpenseItem, { Expense } from "../components/ExpenseItem";
import Money from "../components/Money";
import { fetchExpensesMock, formatDateISO } from "../services/expenses.mock";
import PaymentsIcon from "@mui/icons-material/Payments";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PageHeader from "../components/SectionHeader";
import { Sidebar } from "../components/layout";

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
      <Box className="foraria-layout">
        <Sidebar />
        <Box className="foraria-page-container">
          <Container maxWidth="lg" sx={{ py: 3 }}>Cargando expensas…</Container>
        </Box>
      </Box>
    );
  }

  if (!header || !statValues) return null;

  return (
    <Box className="foraria-layout">
      <Sidebar />

      <Box className="foraria-page-container">
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <PageHeader
            title="Expensas"
            filters={[
              <Box key="unidad" sx={{ fontSize: 14, color: "text.secondary" }}>
                Unidad: <b>{header.unidad}</b>
              </Box>,
              <Box key="titular" sx={{ fontSize: 14, color: "text.secondary" }}>
                Titular: <b>{header.titular}</b>
              </Box>,
            ]}
            sx={{ mb: 2 }}
          />

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <StatCard
                accent="warning"
                icon={<PaymentsIcon color="action" />}
                label="Total Pendiente"
                value={<Money value={statValues.totalPendiente} />}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <StatCard
                accent="success"
                icon={<CheckCircleOutlineIcon color="action" />}
                label="Última Expensa"
                value={statValues.ultima}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <StatCard
                icon={<EventAvailableIcon color="action" />}
                label="Próximo Vencimiento"
                value={statValues.proximo}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: "grid", gap: 2 }}>
            {items.map((exp) => (
              <ExpenseItem key={exp.id} exp={exp} />
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
