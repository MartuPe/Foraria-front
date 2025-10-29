import React, { useEffect, useState } from "react";
import "../styles/dashboard.css";
import { Paper, Button, Box, Typography, Grid } from "@mui/material";
import PageHeader from "../components/SectionHeader";
import Money from "../components/Money";
import DonutChart from "../components/charts/Donut";
import BarsChart from "../components/charts/Bar";
import QuickAction from "../components/QuickAction";
import { fetchDashboard } from "../services/dashboardService";
import { Layout } from "../components/layout";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import EventIcon from "@mui/icons-material/Event";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import ForumIcon from "@mui/icons-material/Forum";
import PaymentsIcon from "@mui/icons-material/Payments";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

export default function DashboardPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchDashboard>> | null>(null);
  
  useEffect(() => {
    fetchDashboard().then(setData);
  }, []);

  if (!data) {
    return (
      <Layout>
        <Box className="foraria-page-container">
          <div className="page-loading">Cargando dashboard…</div>
        </Box>
      </Layout>
    );
  }

  const {
    header,
    kpis,
    paymentStatus,
    expenseBreakdown,
    pendingBills,
    paymentsHistory,
    totals,
  } = data;

  const paymentSum = paymentStatus.reduce((acc, s) => acc + (Number(s.value) || 0), 0);
  const paymentData =
    paymentSum > 0
      ? paymentStatus
      : [{ label: "Sin datos", value: 100, color: "#e5e7eb" }];

  return (
    <Layout>
      <Box className="foraria-page-container">
        <PageHeader
          title={header.welcomeTitle}
          stats={[
            {
              icon: <ReceiptLongIcon />,
              title: "Expensas del Mes",
              value: (
                <span className="accent">
                  <Money value={kpis.expensesThisMonth} />
                </span>
              ) as unknown as string,
              color: "warning",
            },
            {
              icon: <HowToVoteIcon />,
              title: "Votaciones Activas",
              value: String(kpis.activePolls),
              color: "primary",
            },
            {
              icon: <EventIcon />,
              title: "Reservas Activas",
              value: String(kpis.activeBookings),
              color: "secondary",
            },
            {
              icon: <NotificationsActiveIcon />,
              title: "Noticias / Informes",
              value: String(kpis.notifications),
              color: "info",
            },
          ]}
        />

        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, mb: 2 }} variant="outlined">
          <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700 }}>
            Acciones Rápidas
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <QuickAction
                to="/calendario"
                icon={<CalendarMonthIcon color="primary" />}
                title="Reservar Espacios"
                subtitle="Espacios comunes disponibles"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <QuickAction
                to="/reclamos"
                icon={<ReportProblemIcon color="warning" />}
                title="Nuevo Reclamo"
                subtitle="Reportar problemas o sugerencias"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <QuickAction
                to="/forums/general"
                icon={<ForumIcon color="action" />}
                title="Foros"
                subtitle="Participar en discusiones"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <QuickAction
                to="/expensas"
                icon={<PaymentsIcon color="error" />}
                title="Mis Expensas"
                subtitle="Consultar mis pagos"
              />
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Paper className="panel" variant="outlined" sx={{ borderRadius: 3 }}>
              <Box className="panel__head">
                <h4>Mi Estado de Pagos</h4>
                <span className="eye">
                  <VisibilityOutlinedIcon fontSize="small" />
                </span>
              </Box>

              <Box className="panel__content two">
                <DonutChart data={paymentData} />
                <ul className="legend">
                  {paymentData.map((s) => (
                    <li key={s.label}>
                      <span className="dot" style={{ background: s.color }} />
                      {s.label} <span className="muted">{s.value}%</span>
                    </li>
                  ))}
                </ul>
              </Box>

              <hr className="divider" />

              <Box className="pending">
                <h5>Facturas Pendientes ({pendingBills.length})</h5>
                <div className="bills">
                  {pendingBills.map((b) => (
                    <div key={b.id} className={`bill bill--${b.status}`}>
                      <div className="bill__left">
                        <div className="bill__title">{b.title}</div>
                        <div className="bill__meta">
                          ID: {b.code} · Vence:{" "}
                          {new Date(b.dueISO).toLocaleDateString("es-AR")}
                        </div>
                        <div className={`bill__tag bill__tag--${b.status}`}>
                          {b.status === "overdue" ? "Vencida" : "Vence pronto"}
                        </div>
                      </div>
                      <div className="bill__right">
                        <div className="bill__amount">
                          <Money value={b.amount} />
                        </div>
                        <Button
                          variant="contained"
                          color={b.status === "overdue" ? "error" : "secondary"}
                        >
                          Pagar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="totals">
                  <div>
                    <span className="muted">Total pendiente:</span>{" "}
                    <strong className="neg">
                      <Money value={totals.totalPending} />
                    </strong>
                  </div>
                  <div>
                    <span className="muted">Próximas a vencer:</span>{" "}
                    <strong>{totals.nextToDue}</strong>
                  </div>
                  <div>
                    <span className="muted">Facturas vencidas:</span>{" "}
                    <strong className="neg">{totals.overdueCount}</strong>
                  </div>
                  <div>
                    <span className="muted">Pagado este año:</span>{" "}
                    <strong className="pos">
                      <Money value={totals.paidThisYear} />
                    </strong>
                  </div>
                </div>

                <div className="history">
                  <h5>Historial de Pagos – Últimos 5 Meses</h5>
                  <BarsChart data={paymentsHistory} />
                </div>
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <Paper className="panel" variant="outlined" sx={{ borderRadius: 3 }}>
              <Box className="panel__head">
                <h4>Desglose de Gastos del Consorcio</h4>
                <span className="eye">
                  <VisibilityOutlinedIcon fontSize="small" />
                </span>
              </Box>

              <div className="panel__content two">
                <DonutChart data={(expenseBreakdown.length ? expenseBreakdown : [
                  { label: "Sin datos", value: 100, color: "#e5e7eb" },
                ]).map(s => ({ ...s, color: s.color ?? "#aaaaaaff" }))} />
                <ul className="legend">
                  {(expenseBreakdown.length ? expenseBreakdown : [
                    { label: "Sin datos", value: 100, color: "#e5e7eb" },
                  ]).map((s) => (
                    <li key={s.label}>
                      <span className="dot" style={{ background: s.color ?? "#aaaaaaff" }} />
                      {s.label} <span className="muted">{s.value}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
}
