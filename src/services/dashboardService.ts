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
    safeGet<{ data: { totalPending?: number; overdueInvoices?: number; totalPaidThisYear?: number } }>(
      "/dashboard/expenses/summary",
      { userId },
      { data: {} }
    ),
    safeGet<any>("/dashboard/expenses/monthly-history", { userId }, []),
    safeGet<{ activePolls: number }>("/dashboard/polls/active", { consortiumId }, { activePolls: 0 }),
    safeGet<{ activeReservations: number }>("/dashboard/reservations/count", { consortiumId }, { activeReservations: 0 }),
  ]);

  const pendingList = asArray(pendingRaw?.pendingExpenses);
  const monthlyList = Array.isArray(monthlyRaw?.monthlyHistory)
    ? monthlyRaw.monthlyHistory
    : asArray(monthlyRaw);

  const pendingBills: PendingExpense[] = pendingList.map((e: any, idx: number) => ({
    id: Number(e.id ?? idx),
    title: String(e.description ?? "Expensa"),
    code: String(e.code ?? e.id ?? idx),
    amount: Number(e.totalAmount ?? 0),
    dueISO: new Date(e.expirationDate ?? Date.now()).toISOString(),
    status: "upcoming",
  }));

  return {
    header: { welcomeTitle: "¡Bienvenido a tu Dashboard!" },

    kpis: {
      expensesThisMonth: Number(total?.totalAmount ?? 0),
      activePolls: Number(polls?.activePolls ?? 0),
      activeBookings: Number(reserves?.activeReservations ?? 0),
      notifications: 0,
    },
    expenseBreakdown: [],
    pendingBills,
    // Hasta que el back devuelva porcentajes, dejamos vacío y tu UI ya muestra "Sin datos"
    paymentStatus: [],

    totals: {
      totalPending: Number(summary?.data?.totalPending ?? 0),
      nextToDue: 0,
      overdueCount: Number(summary?.data?.overdueInvoices ?? 0),
      paidThisYear: Number(summary?.data?.totalPaidThisYear ?? 0),
    },

    paymentsHistory: monthlyList.map((m: any) => ({
      label: String(m.month ?? m.monthName ?? m.label ?? ""),
      value: Number(m.totalPaid ?? 0),
    })),
  };
}