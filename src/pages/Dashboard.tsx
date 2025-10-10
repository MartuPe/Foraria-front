import React, { useEffect, useState } from "react";
import "../styles/dashboard.css";
import { Paper, Button } from "@mui/material";
import PageHeader from "../components/SectionHeader";
import Money from "../components/Money";
import DonutChart from "../components/charts/Donut";
import BarsChart from "../components/charts/Bar";
import QuickAction from "../components/QuickAction";
import { fetchDashboardMock } from "../services/dashboard.mock";
import { Sidebar } from "../components/layout";
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
  const [data, setData] =
    useState<Awaited<ReturnType<typeof fetchDashboardMock>> | null>(null);

  useEffect(() => {
    fetchDashboardMock().then(setData);
  }, []);

  if (!data) {
    return (
      <div className="foraria-layout">
        <Sidebar />
        <div className="foraria-page-container">
          <div className="page-loading">Cargando dashboard…</div>
        </div>
      </div>
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

  return (
    <div className="foraria-layout">
      <Sidebar />

      <div className="foraria-page-container">
        <div className="page">
          <PageHeader
            title={header.welcomeTitle}
            stats={[
              {
                icon: <ReceiptLongIcon />,
                title: "Expensas del Mes",
                value: <span className="accent"><Money value={kpis.expensesThisMonth} /></span> as unknown as string,
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

          <section className="section">
            <h3>Acciones Rápidas</h3>
            <div className="quick">
              <QuickAction
                icon={<CalendarMonthIcon color="primary" />}
                title="Reservar Espacios"
                subtitle="Espacios comunes disponibles"
              />
              <QuickAction
                icon={<ReportProblemIcon color="warning" />}
                title="Nuevo Reclamo"
                subtitle="Reportar problemas o sugerencias"
              />
              <QuickAction
                icon={<ForumIcon color="action" />}
                title="Foros"
                subtitle="Participar en discusiones"
              />
              <QuickAction
                icon={<PaymentsIcon color="error" />}
                title="Mis Expensas"
                subtitle="Consultar mis pagos"
              />
            </div>
          </section>

          <section className="twocol">
            <Paper className="panel">
              <div className="panel__head">
                <h4>Mi Estado de Pagos</h4>
                <span className="eye">
                  <VisibilityOutlinedIcon fontSize="small" />
                </span>
              </div>

              <div className="panel__content two">
                <DonutChart data={paymentStatus} />
                <ul className="legend">
                  {paymentStatus.map((s) => (
                    <li key={s.label}>
                      <span className="dot" style={{ background: s.color }} />
                      {s.label} <span className="muted">{s.value}%</span>
                    </li>
                  ))}
                </ul>
              </div>

              <hr className="divider" />

              <div className="pending">
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
                          color={b.status === "overdue" ? "error" : "secondary"}>
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
              </div>
            </Paper>

            <Paper className="panel">
              <div className="panel__head">
                <h4>Desglose de Gastos del Consorcio</h4>
                <span className="eye">
                  <VisibilityOutlinedIcon fontSize="small" />
                </span>
              </div>

              <div className="panel__content two">
                <DonutChart data={expenseBreakdown} />
                <ul className="legend">
                  {expenseBreakdown.map((s) => (
                    <li key={s.label}>
                      <span className="dot" style={{ background: s.color }} />
                      {s.label}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="category-list">
                <h5>Categorías principales</h5>
                <ul>
                  {expenseBreakdown.map((s) => (
                    <li key={s.label}>
                      <span className="name">{s.label}</span>
                      <span className="perc">{s.value}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Paper>
          </section>
        </div>
      </div>
    </div>
  );
}
