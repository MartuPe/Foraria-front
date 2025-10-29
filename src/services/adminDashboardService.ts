export interface AdminDashboardData {
  header: { title: string };
  kpis: {
    totalUsers: number;
    pendingClaims: number;
    collectedRate: number; // %
    nextReservation: { summary: string; when: string };
  };
  recentActivity: RecentActivity[];
  tasks: { items: AdminTask[] };
}

export interface RecentActivity {
  id: string;
  type: "claim" | "payment" | "meeting" | "maintenance" | "user";
  title: string;
  when: string;   // ej: "Hace 15 minutos"
  status: "Pendiente" | "Completado" | "Programado";
}

export interface AdminTask {
  id: string;
  title: string;
  when: "Hoy" | "Mañana" | "Esta semana" | "Próxima semana";
  priority: "Alta" | "Media" | "Baja";
}

export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  // Simulamos latencia para que se vea el "Cargando..."
  await new Promise(r => setTimeout(r, 500));

  return {
    header: { title: "Dashboard Administrativo" },
    kpis: {
      totalUsers: 124,
      pendingClaims: 8,
      collectedRate: 87,
      nextReservation: { summary: "SUM", when: "Hoy · 18:00" },
    },
    recentActivity: [
      { id: "a1", type: "claim",       title: "Nuevo reclamo sobre filtración en Depto. 3A", when: "Hace 15 minutos", status: "Pendiente" },
      { id: "a2", type: "payment",     title: "Pago de expensas recibido · Depto. 5B",       when: "Hace 30 minutos", status: "Completado" },
      { id: "a3", type: "meeting",     title: "Reunión de consorcio programada para mañana",  when: "Hace 1 hora",     status: "Programado" },
      { id: "a4", type: "maintenance", title: "Mantenimiento de ascensores completado",       when: "Hace 2 horas",    status: "Completado" },
      { id: "a5", type: "user",        title: "Nuevo usuario registrado · Depto. 7C",         when: "Hace 3 horas",    status: "Completado" },
    ],
    tasks: {
      items: [
        { id: "t1", title: "Revisar presupuestos de proveedores", when: "Hoy",            priority: "Alta" },
        { id: "t2", title: "Preparar asamblea mensual",           when: "Mañana",         priority: "Alta" },
        { id: "t3", title: "Actualizar lista de morosos",         when: "Esta semana",    priority: "Media" },
        { id: "t4", title: "Programar mantenimiento trimestral",  when: "Próxima semana", priority: "Media" },
      ],
    },
  };
}
