import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, Button, Chip, Grid } from "@mui/material";
import {
  GroupOutlined,
  ReportProblemOutlined,
  SavingsOutlined,
  EventAvailableOutlined,
  PersonAddAlt1Outlined,
  RequestQuoteOutlined,
  EventNoteOutlined,
  AssessmentOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";

import { AdminLayout } from "../../components/layout/AdminLayout";
import PageHeader from "../../components/SectionHeader";
import QuickAction from "../../components/QuickAction";
import { authService } from "../../services/authService";
import { useNavigate, /*Link as RouterLink*/ } from "react-router-dom";
import {
  fetchAdminDashboard,
  AdminDashboardData,
  RecentActivity,
  AdminTask,
} from "../../services/adminDashboardService";

const PriorityChip: React.FC<{ level: "Alta" | "Media" | "Baja" | "Pendiente" | "Completado" | "Programado" }> = ({ level }) => {
  const map: Record<string, "error" | "warning" | "default" | "success" | "info"> = {
    "Alta": "error",
    "Media": "warning",
    "Baja": "default",
    "Pendiente": "warning",
    "Completado": "success",
    "Programado": "info",
  };
  return <Chip size="small" label={level} color={map[level] ?? "default"} variant="outlined" />;
};


const ActivityItem: React.FC<{ item: RecentActivity }> = ({ item }) => {
  return (
    <div className={`lineitem lineitem--${item.type}`}>
      <div className="lineitem__content">
        <div className="lineitem__title">{item.title}</div>
        <div className="lineitem__meta">
          {item.when} · <PriorityChip level={item.status} />
        </div>
      </div>
    </div>
  );
};

const TaskItem: React.FC<{ task: AdminTask }> = ({ task }) => {
  return (
    <div className="taskitem">
      <div className="taskitem__title">{task.title}</div>
      <div className="taskitem__meta">
        {task.when} · <PriorityChip level={task.priority} />
      </div>
    </div>
  );
};

export default function AdminDashboardPage() {
const navigate = useNavigate();

  const [data, setData] = useState<AdminDashboardData | null>(null);

  useEffect(() => {
    fetchAdminDashboard().then(setData);
  }, []);

  if (!data) {
    return (
      <AdminLayout>
        <Box className="foraria-page-container">
          <div className="page-loading">Cargando dashboard…</div>
        </Box>
      </AdminLayout>
    );
  }
  
  const { header, kpis, recentActivity, tasks } = data;

  
const handleLogout = async () => {
    await authService.logout();
    navigate("/iniciarSesion", { replace: true });
  };
  return (
      <Box className="foraria-page-container">
           <Button
              onClick={handleLogout}
              color="secondary"
              variant="contained"
              size="small"
            >
              Cerrar sesión
            </Button>
        <PageHeader
          title={header.title}
          stats={[
            {
              icon: <GroupOutlined />,
              title: "Total Usuarios",
              value: String(kpis.totalUsers),
              color: "primary",
            },
            {
              icon: <ReportProblemOutlined />,
              title: "Reclamos Pendientes",
              value: String(kpis.pendingClaims),
              color: "warning",
            },
            {
              icon: <SavingsOutlined />,
              title: "% Expensas Cobradas",
              value: `${kpis.collectedRate}%`,
              color: "success",
            },
            {
              icon: <EventAvailableOutlined />,
              title: "Próximas Reservas",
              value: `${kpis.nextReservation.summary} - ${kpis.nextReservation.when}`,
              color: "secondary",
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
                to="/admin/usuarios/nuevo"
                icon={<PersonAddAlt1Outlined color="primary" />}
                title="Nuevo Usuario"
                subtitle="Crear cuenta"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <QuickAction
                to="/admin/gastos/cargar"
                icon={<RequestQuoteOutlined color="warning" />}
                title="Cargar Gasto"
                subtitle="Agregar gasto / factura"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <QuickAction
                to="/admin/reuniones/nueva"
                icon={<EventNoteOutlined color="secondary" />}
                title="Nueva Reunión"
                subtitle="Programar asamblea"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <QuickAction
                to="/admin/reportes"
                icon={<AssessmentOutlined color="success" />}
                title="Ver Reportes"
                subtitle="Cobranza y gestión"
              />
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <Paper className="panel" variant="outlined" sx={{ borderRadius: 3 }}>
              <Box className="panel__head">
                <h4>Actividad Reciente</h4>
                <span className="eye">
                  <VisibilityOutlined fontSize="small" />
                </span>
              </Box>

              <Box className="panel__content">
                <div className="list">
                  {recentActivity.map((it) => (
                    <ActivityItem key={it.id} item={it} />
                  ))}
                </div>
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <Paper className="panel" variant="outlined" sx={{ borderRadius: 3 }}>
              <Box className="panel__head">
                <h4>Tareas Pendientes</h4>
                <span className="eye">
                  <VisibilityOutlined fontSize="small" />
                </span>
              </Box>

              <Box className="panel__content">
                <div className="list">
                  {tasks.items.map((t) => (
                    <TaskItem key={t.id} task={t} />
                  ))}
                </div>

                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Button variant="outlined" href="/admin/tareas">
                    Ver Todas las Tareas
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        </Box>
  );
}