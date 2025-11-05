// src/services/dashboardService.ts
import { api } from "../api/axios";
import { storage } from "../utils/storage";
import { getEffectiveIds } from "./userService";

export interface ExpenseCategory { label: string; value: number; color?: string }
export interface PendingExpense {
  id: number;
  title: string;
  code: string;
  amount: number;
  dueISO: string;
  status: "overdue" | "upcoming";
}
export interface PaymentStatus { label: string; value: number; color: string }
export interface DashboardData {
  header: { welcomeTitle: string };
  kpis: { expensesThisMonth: number; activePolls: number; activeBookings: number; notifications: number };
  expenseBreakdown: ExpenseCategory[];
  pendingBills: PendingExpense[];
  paymentStatus: PaymentStatus[];
  totals: { totalPending: number; nextToDue: number; overdueCount: number; paidThisYear: number };
  paymentsHistory: { label: string; value: number }[];
}

/** Devuelve fallback en 404/403/errores sin romper la UI */
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
  // IDs desde token/storage
  let consortiumId = storage.consortiumId;
  let userId = storage.userId;
  if (!userId || !consortiumId) {
    const ids = await getEffectiveIds();
    userId = ids.userId;
    consortiumId = ids.consortiumId;
  }

  // Requests en paralelo
  const [
    total,
    pendingRaw,
    summary,
    monthlyRaw,
    polls,
    reserves,
  ] = await Promise.all([
    safeGet<{ totalAmount: number }>("/dashboard/expenses/total", { consortiumId }, { totalAmount: 0 }),
    safeGet<any>("/dashboard/expenses/pending", { consortiumId }, { pendingExpenses: [] }),
    safeGet<{ data: { totalPending: number; overdueInvoices: number; totalPaidThisYear: number } }>(
      "/dashboard/expenses/summary",
      { userId },
      { data: { totalPending: 0, overdueInvoices: 0, totalPaidThisYear: 0 } }
    ),
    safeGet<any>("/dashboard/expenses/monthly-history", { userId }, []),
    safeGet<{ activePolls: number }>("/dashboard/polls/active", { consortiumId }, { activePolls: 0 }),
    safeGet<{ activeReservations: number }>("/dashboard/reservations/count", { consortiumId }, { activeReservations: 0 }),
  ]);

  // Normalizaciones simples
  const pendingList = asArray(pendingRaw?.pendingExpenses);
  const monthlyList = Array.isArray(monthlyRaw?.monthlyHistory)
    ? monthlyRaw.monthlyHistory
    : asArray(monthlyRaw);

  // Mapeo de pendientes (tu back devuelve description, totalAmount, expirationDate)
  const pendingBills: PendingExpense[] = pendingList.map((e: any) => ({
    id: Number(e.id ?? 0),
    title: String(e.description ?? "Expensa"),
    code: String(e.code ?? e.id ?? ""),
    amount: Number(e.totalAmount ?? e.amount ?? 0),
    dueISO: new Date(e.expirationDate ?? e.dueDate ?? Date.now()).toISOString(),
    status: "upcoming",
  }));

  // Fallback rápido por si el summary no está disponible
  const sumPendingFromPendingList = pendingBills.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  return {
    header: { welcomeTitle: "¡Bienvenido a tu Dashboard!" },

    kpis: {
      expensesThisMonth: Number(total?.totalAmount ?? 0),
      activePolls: Number(polls?.activePolls ?? 0),
      activeBookings: Number(reserves?.activeReservations ?? 0),
      notifications: 0,
    },

    // (de momento vacío hasta que tengas endpoint de categorías)
    expenseBreakdown: [],

    pendingBills,

    // Mantenemos simple hasta tener % reales del back
    paymentStatus: [
      { label: "Pagadas",  value: 0, color: "#2568a7ff" },
      { label: "Vencidas", value: 0, color: "#EF4444" },
      { label: "Próximas", value: 0, color: "#F59E0B" },
    ],

    totals: {
      // priorizamos summary; si no viene, usamos la suma de pendientes
      totalPending: Number(summary?.data?.totalPending ?? sumPendingFromPendingList ?? 0),
      nextToDue: 0,
      overdueCount: Number(summary?.data?.overdueInvoices ?? 0),
      paidThisYear: Number(summary?.data?.totalPaidThisYear ?? 0),
    },

    paymentsHistory: monthlyList.map((m: any) => ({
      label: String(m.month ?? m.monthName ?? m.label ?? ""),
      value: Number(m.totalPaid ?? m.value ?? 0),
    })),
  };
}