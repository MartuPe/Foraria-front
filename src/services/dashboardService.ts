import axios from "axios";
import { api } from "../api/axios";

export interface ExpenseCategory { label: string; value: number; color?: string }
export interface PendingExpense { id: number; title: string; code: string; amount: number; dueISO: string; status: "overdue" | "upcoming" }
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

/** 🔒 Hardcode momentáneo para que SIEMPRE haya datos (igual que en User Management) */
const consortiumId = 1;
const userId = 1;

/** 404 ⇒ fallback; otros errores ⇒ se propagan (para no ocultar bugs reales) */
async function safeGet<T>(url: string, params: any, fallback: T): Promise<T> {
  try {
    const r = await api.get(url, { params });
    return r.data as T;
  } catch (e: any) {
    if (axios.isAxiosError(e) && e.response?.status === 404) return fallback;
    throw e;
  }
}

/** Normaliza a array: [], {data: []}, null -> [] */
function asArray<T = any>(v: any): T[] {
  if (Array.isArray(v)) return v as T[];
  if (Array.isArray(v?.data)) return v.data as T[];
  return [];
}

/** Devuelve valor o default si viene null/undefined */
function firstOr<T = any>(v: any, def: T): T {
  return (v ?? def) as T;
}

export async function fetchDashboard(): Promise<DashboardData> {
  const total = await safeGet<{ totalAmount: number }>(
    "/dashboard/expenses/total",
    { consortiumId },
    { totalAmount: 0 }
  );

  const byCatRaw = await safeGet<any>(
    "/dashboard/expenses/category",
    { consortiumId },
    { data: [] }
  );
  const byCat = asArray(byCatRaw);

  const pendingRaw = await safeGet<any>(
    "/dashboard/expenses/pending",
    { consortiumId },
    { pendingExpenses: [] }
  );
  const pendingList = asArray(pendingRaw?.pendingExpenses);

  const summary = await safeGet<{ data: any }>(
    "/dashboard/expenses/summary",
    { userId },
    {
      data: {
        paidPercent: 0,
        overduePercent: 0,
        upcomingPercent: 0,
        totalPending: 0,
        nextToDue: 0,
        overdueCount: 0,
        paidThisYear: 0,
      },
    }
  );

  const monthlyRaw = await safeGet<any>(
    "/dashboard/expenses/monthly-history",
    { userId },
    []
  );
  const monthly = asArray(monthlyRaw);

  const polls = await safeGet<{ activePolls: number }>(
    "/dashboard/polls/active",
    { consortiumId },
    { activePolls: 0 }
  );

  const reserves = await safeGet<{ activeReservations: number }>(
    "/dashboard/reservations/count",
    { consortiumId },
    { activeReservations: 0 }
  );

  return {
    header: { welcomeTitle: "¡Bienvenido a tu Dashboard!" },
    kpis: {
      expensesThisMonth: firstOr(total.totalAmount, 0),
      activePolls: firstOr(polls.activePolls, 0),
      activeBookings: firstOr(reserves.activeReservations, 0),
      notifications: 0,
    },
    expenseBreakdown: byCat.map((c: any) => ({
      label: firstOr(c.categoryName ?? c.label, "Sin categoría"),
      value: firstOr(c.percentage ?? c.amount, 0),
      color: c.color ?? "#0B3A6E",
    })),
    pendingBills: pendingList.map((e: any) => ({
      id: firstOr(e.id, 0),
      title: firstOr(e.title ?? e.description, "Expensa"),
      code: firstOr(e.code ?? e.id, "").toString(),
      amount: firstOr(e.amount, 0),
      dueISO: firstOr(e.dueDate ?? e.dueISO, new Date().toISOString()),
      status: e.isOverdue ? "overdue" : "upcoming",
    })),
    paymentStatus: [
      { label: "Pagadas",  value: firstOr(summary.data.paidPercent, 0),    color: "#2568a7ff" },
      { label: "Vencidas", value: firstOr(summary.data.overduePercent, 0), color: "#EF4444" },
      { label: "Próximas", value: firstOr(summary.data.upcomingPercent, 0),color: "#F59E0B" },
    ],
    totals: {
      totalPending: firstOr(summary.data.totalPending, 0),
      nextToDue: firstOr(summary.data.nextToDue, 0),
      overdueCount: firstOr(summary.data.overdueCount, 0),
      paidThisYear: firstOr(summary.data.paidThisYear, 0),
    },
    paymentsHistory: monthly.map((m: any) => ({
      label: firstOr(m.monthName ?? m.label, ""),
      value: firstOr(m.totalPaid ?? m.value, 0),
    })),
  };
}
