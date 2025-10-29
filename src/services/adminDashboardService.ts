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
    // Log útil para depurar rápidamente cuál endpoint tronó
    // (no rompe la UI)
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
  const list: any[] =
    Array.isArray(raw)
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

  const kpis = {
    totalUsers: firstOr(usersCount.totalUsers, 0),
    pendingClaims: firstOr(pendingClaims.pendingClaims, 0),
    collectedRate: parseCollectedRate(collectedRaw),
    nextReservation: parseNextReservation(upcomingRaw),
  };

  // Hasta que tengas endpoints para esto, dejamos listas vacías
  return {
    header: { title: "Dashboard Administrativo" },
    kpis,
    recentActivity: [],
    tasks: { items: [] },
  };
}