// dashboardService.ts
import { api } from "../api/axios";
import { storage } from "../utils/storage";
import { getEffectiveIds } from "./userService";

export interface ExpenseCategory {
  label: string;
  value: number;
  color?: string;
}
export interface PendingExpense {
  id: number;
  title: string;
  code: string;
  amount: number;
  dueISO: string;
  status: "overdue" | "upcoming";
}
export interface PaymentStatus {
  label: string;
  value: number; // porcentaje 0–100
  color: string;
}
export interface DashboardData {
  header: { welcomeTitle: string };
  kpis: {
    expensesThisMonth: number;
    activePolls: number;
    activeBookings: number;
    notifications: number;
  };
  expenseBreakdown: ExpenseCategory[];
  pendingBills: PendingExpense[];
  paymentStatus: PaymentStatus[];
  totals: {
    totalPending: number;
    nextToDue: number;
    overdueCount: number;
    paidThisYear: number;
  };
  paymentsHistory: { label: string; value: number }[];
}

async function safeGet<T>(url: string, params: any, fallback: T): Promise<T> {
  try {
    const res = await api.get(url, {
      params,
      validateStatus: (s) => (s >= 200 && s < 300) || s === 404 || s === 403,
    });
    if (res.status === 404 || res.status === 403) return fallback;
    return res.data as T;
  } catch {
    return fallback;
  }
}

function asArray<T = any>(v: any): T[] {
  if (Array.isArray(v)) return v as T[];
  if (Array.isArray(v?.data)) return v.data as T[];
  return [];
}

export async function fetchDashboard(): Promise<DashboardData> {
  let consortiumId = storage.consortiumId;
  let userId = storage.userId;
  if (!userId || !consortiumId) {
    const ids = await getEffectiveIds();
    userId = ids.userId;
    consortiumId = ids.consortiumId;
  }

  const [total, pendingRaw, summary, monthlyRaw, polls, reserves] =
    await Promise.all([
      safeGet<{ totalAmount: number }>(
        "/dashboard/expenses/total",
        { consortiumId },
        { totalAmount: 0 }
      ),
      safeGet<any>(
        "/dashboard/expenses/pending",
        { consortiumId },
        { pendingExpenses: [] }
      ),
      safeGet<{
        userId: number;
        generatedAt: string;
        data: {
          totalPending?: number;
          overdueInvoices?: number;
          totalPaidThisYear?: number;
        };
      }>("/dashboard/expenses/summary", { userId }, {
        userId: userId ?? 0,
        generatedAt: "",
        data: {},
      }),
      safeGet<any>(
        "/dashboard/expenses/monthly-history",
        { userId },
        { monthlyHistory: [] }
      ),
      safeGet<{ activePolls: number }>(
        "/dashboard/polls/active",
        { consortiumId },
        { activePolls: 0 }
      ),
      safeGet<{ activeReservations: number }>(
        "/dashboard/reservations/count",
        { consortiumId },
        { activeReservations: 0 }
      ),
    ]);

  const pendingList = asArray(pendingRaw?.pendingExpenses);
  const monthlyList = Array.isArray(monthlyRaw?.monthlyHistory)
    ? monthlyRaw.monthlyHistory
    : asArray(monthlyRaw);

  // ---- map de facturas pendientes (puede quedar vacío si el endpoint devuelve 404) ----
  const pendingBills: PendingExpense[] = pendingList.map(
    (e: any, idx: number) => ({
      id: Number(e.id ?? idx),
      title: String(e.description ?? "Expensa"),
      code: String(e.code ?? e.id ?? idx),
      amount: Number(e.totalAmount ?? 0),
      dueISO: new Date(e.expirationDate ?? Date.now()).toISOString(),
      // acá podrías marcar "overdue" si la fecha ya venció
      status: "upcoming",
    })
  );

  // ---- totales del usuario (de /summary) ----
  const totalPending = Number(summary?.data?.totalPending ?? 0);
  const overdueCount = Number(summary?.data?.overdueInvoices ?? 0);
  const paidThisYear = Number(summary?.data?.totalPaidThisYear ?? 0);

  // ---- donut "Mi Estado de Pagos": armamos porcentajes con esos montos ----
  const totalForPie = totalPending + paidThisYear;

  let paymentStatus: PaymentStatus[] = [];
  if (totalForPie > 0) {
    const pct = (v: number) =>
      totalForPie === 0 ? 0 : Math.round((v / totalForPie) * 100);

    paymentStatus = [
      {
        label: "Pendiente",
        value: pct(totalPending),
        color: "#f97316", // naranja
      },
      {
        label: "Pagado este año",
        value: pct(paidThisYear),
        color: "#22c55e", // verde
      },
      // Opcional: mostrar cantidad de vencidas como trozo aparte (si quisieras)
      // {
      //   label: `Facturas vencidas (${overdueCount})`,
      //   value: 0,
      //   color: "#ef4444",
      // },
    ];
  }

  // ---- historial de pagos (gráfico de barras) ----
  const paymentsHistory = monthlyList.map((m: any) => ({
    label: String(m.month ?? m.monthName ?? m.label ?? ""),
    value: Number(m.totalPaid ?? 0),
  }));

  return {
    header: { welcomeTitle: "¡Bienvenido a tu Dashboard!" },

    kpis: {
      expensesThisMonth: Number(total?.totalAmount ?? 0),
      activePolls: Number(polls?.activePolls ?? 0),
      activeBookings: Number(reserves?.activeReservations ?? 0),
      notifications: 0,
    },

    // de momento vacío hasta que tengas endpoint de desglose
    expenseBreakdown: [],

    pendingBills,
    paymentStatus,

    totals: {
      totalPending,
      nextToDue: 0, // cuando el back lo tenga, lo mapeamos
      overdueCount,
      paidThisYear,
    },

    paymentsHistory,
  };
}
