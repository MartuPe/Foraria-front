// src/services/dashboardService.ts
import { api } from "../api/axios";
import { storage } from "../utils/storage";
import { getEffectiveIds } from "./userService";

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

/** 404/403 ⇒ fallback sin tirar error ni ensuciar consola */
async function safeGet<T>(url: string, params: any, fallback: T): Promise<T> {
  const res = await api.get(url, {
    params,
    validateStatus: (s) => (s >= 200 && s < 300) || s === 404 || s === 403,
  });
  if (res.status === 404 || res.status === 403) return fallback;
  return res.data as T;
}

/** Normaliza a array */
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
  // Aseguramos IDs desde token/storage y los persistimos
  let consortiumId = storage.consortiumId;
  let userId = storage.userId;

  if (!userId || !consortiumId) {
    try {
      const ids = await getEffectiveIds();
      userId = ids.userId;
      consortiumId = ids.consortiumId;
    } catch {
      // UI vacía amigable si no hay contexto
      return {
        header: { welcomeTitle: "¡Bienvenido a tu Dashboard!" },
        kpis: { expensesThisMonth: 0, activePolls: 0, activeBookings: 0, notifications: 0 },
        expenseBreakdown: [],
        pendingBills: [],
        paymentStatus: [
          { label: "Pagadas", value: 0, color: "#2568a7ff" },
          { label: "Vencidas", value: 0, color: "#EF4444" },
          { label: "Próximas", value: 0, color: "#F59E0B" },
        ],
        totals: { totalPending: 0, nextToDue: 0, overdueCount: 0, paidThisYear: 0 },
        paymentsHistory: [],
      };
    }
  }

  // No hay endpoint de categorías (de momento)
  const expenseBreakdown: ExpenseCategory[] = [];

  // Pedimos todo en paralelo (cada uno con fallback transparente)
  const [
    total,
    pendingRaw,
    summary,
    monthlyRaw,
    polls,
    reserves,
  ] = await Promise.all([
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
    safeGet<{ data: any }>(
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
    ),
    safeGet<any>(
      "/dashboard/expenses/monthly-history",
      { userId },
      []
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
  const monthly = asArray(monthlyRaw);

  return {
    header: { welcomeTitle: "¡Bienvenido a tu Dashboard!" },
    kpis: {
      expensesThisMonth: firstOr(total.totalAmount, 0),
      activePolls: firstOr(polls.activePolls, 0),
      activeBookings: firstOr(reserves.activeReservations, 0),
      notifications: 0,
    },
    expenseBreakdown,
    pendingBills: pendingList.map((e: any) => ({
      id: firstOr(e.id, 0),
      title: firstOr(e.title ?? e.description, "Expensa"),
      code: firstOr(e.code ?? e.id, "").toString(),
      amount: firstOr(e.amount, 0),
      dueISO: firstOr(e.dueDate ?? e.dueISO, new Date().toISOString()),
      status: e.isOverdue ? "overdue" : "upcoming",
    })),
    paymentStatus: [
      { label: "Pagadas",  value: firstOr(summary.data.paidPercent, 0),     color: "#2568a7ff" },
      { label: "Vencidas", value: firstOr(summary.data.overduePercent, 0),  color: "#EF4444" },
      { label: "Próximas", value: firstOr(summary.data.upcomingPercent, 0), color: "#F59E0B" },
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
