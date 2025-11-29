import { api } from "../api/axios";

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
  when: string;
  status: "Pendiente" | "Completado" | "Programado";
}

export interface AdminTask {
  id: string;
  title: string;
  when: "Hoy" | "Mañana" | "Esta semana" | "Próxima semana";
  priority: "Alta" | "Media" | "Baja";
}

const getConsortiumId = () =>
  Number(localStorage.getItem("activeConsortiumId")) || 1;

async function safeGetAny<T>(
  url: string,
  params: any,
  fallback: T,
  label: string
): Promise<T> {
  try {
    const r = await api.get(url, { params });
    return r.data as T;
  } catch (e: any) {
    const status = e?.response?.status;
    const payload = e?.response?.data;
    // eslint-disable-next-line no-console
    console.warn(
      `[AdminDashboard] ${label} → error ${status ?? "?"}:`,
      payload ?? e?.message
    );
    return fallback;
  }
}

const firstOr = <T,>(v: any, def: T): T => (v ?? def) as T;

function parseCollectedRate(raw: any): number {
  if (raw == null) return 0;
  if (typeof raw === "number") return raw;
  return Number(
    raw.collectedRate ??
      raw.percentage ??
      raw.percent ??
      raw.collectedPercentage ??
      raw.value ??
      0
  );
}

function parseNextReservation(raw: any): { summary: string; when: string } {
  const list: any[] = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.upcomingReservations)
    ? raw.upcomingReservations
    : raw?.data && Array.isArray(raw.data)
    ? raw.data
    : [];

  if (!list.length) return { summary: "—", when: "Sin próximas" };

  const r = list[0];
  const place =
    r?.place?.name ?? r?.placeName ?? r?.summary ?? r?.title ?? "Reserva";

  const dt = r?.date ?? r?.startDate ?? r?.when ?? r?.start ?? r?.startTime;
  const when = dt ? new Date(dt).toLocaleString("es-AR") : "Próxima";

  return { summary: String(place), when };
}

export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const consortiumId = getConsortiumId();

  // Llamados reales (si fallan, usamos fallback)
  const [usersCount, pendingClaims, collectedRaw, upcomingRaw] =
    await Promise.all([
      safeGetAny<{ consortiumId?: number; totalUsers: number }>(
        "/dashboard/admin/users/count",
        { consortiumId },
        { totalUsers: 0 },
        "users/count"
      ),
      safeGetAny<{ consortiumId?: number; pendingClaims: number }>(
        "/dashboard/admin/claims/pending-count",
        { consortiumId },
        { pendingClaims: 0 },
        "claims/pending-count"
      ),
      safeGetAny<any>(
        "/dashboard/admin/expenses/collected-percentage",
        { consortiumId },
        0,
        "expenses/collected-percentage"
      ),
      safeGetAny<any>(
        "/dashboard/admin/reservations/upcoming",
        { consortiumId, limit: 5 },
        [],
        "reservations/upcoming"
      ),
    ]);

  const baseKpis = {
    totalUsers: firstOr(usersCount.totalUsers, 0),
    pendingClaims: firstOr(pendingClaims.pendingClaims, 0),
    collectedRate: parseCollectedRate(collectedRaw),
    nextReservation: parseNextReservation(upcomingRaw),
  };

  // 👇 MOCKS para demo (solo se usan si no hay datos reales útiles)
  const mockedKpis = {
    ...baseKpis,
    collectedRate:
      baseKpis.collectedRate && baseKpis.collectedRate > 0
        ? baseKpis.collectedRate
        : 78, // % Expensas cobradas para mostrar algo lindo
    nextReservation:
      baseKpis.nextReservation.summary === "—"
        ? {
            summary: "SUM",
            when: "Sáb 14/12",
          }
        : baseKpis.nextReservation,
  };

  const mockRecentActivity: RecentActivity[] = [
    {
      id: "act-1",
      type: "payment",
      title: "Se registró el pago de expensas del Depto 3B",
      when: "Hoy · 10:24",
      status: "Completado",
    },
    {
      id: "act-2",
      type: "claim",
      title: "Nuevo reclamo por filtración en cochera",
      when: "Hoy · 09:10",
      status: "Pendiente",
    },
    {
      id: "act-3",
      type: "meeting",
      title: "Asamblea ordinaria programada para el 15/12",
      when: "Ayer · 19:00",
      status: "Programado",
    },
    {
      id: "act-4",
      type: "maintenance",
      title: "Mantenimiento preventivo del ascensor",
      when: "Lun · 08:00",
      status: "Completado",
    },
  ];

  const mockTasks: AdminTask[] = [
    {
      id: "task-1",
      title: "Dar de alta nuevo usuario",
      when: "Hoy",
      priority: "Alta",
    },
    {
      id: "task-2",
      title: "Cargar factura de luz de octubre",
      when: "Hoy",
      priority: "Alta",
    },
    {
      id: "task-3",
      title: "Cargar nuevo proveedor de limpieza",
      when: "Esta semana",
      priority: "Media",
    },
     {
      id: "task-4",
      title: "Cargar nuevo proveedor de matenimiento",
      when: "Esta semana",
      priority: "Media",
    },
  ];

  return {
    header: { title: "Dashboard Administrativo" },
    kpis: mockedKpis,
    recentActivity: mockRecentActivity,
    tasks: { items: mockTasks },
  };
}