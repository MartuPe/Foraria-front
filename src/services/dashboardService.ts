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
  value: number;
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

  const [total, pendingRaw, summary, monthlyRaw, polls, reserves, percentageRaw,] = await Promise.all([
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
    }>(
      "/dashboard/expenses/summary",
      { userId },
      {
        userId: userId ?? 0,
        generatedAt: "",
        data: {},
      }
    ),
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
    safeGet<any>(
      "/dashboard/expenses/percentage-category",
      {},
      {}
    ),
  ]);

  const pendingList = asArray(pendingRaw?.pendingExpenses);
  const monthlyList = Array.isArray(monthlyRaw?.monthlyHistory) ? monthlyRaw.monthlyHistory : asArray(monthlyRaw);
  const now = Date.now();
  const pendingBills: PendingExpense[] = pendingList.map(
    (e: any, idx: number) => {
      const exp = new Date(e.expirationDate ?? Date.now());
      const status: "overdue" | "upcoming" =
        exp.getTime() < now ? "overdue" : "upcoming";
      return {
        id: Number(e.id ?? idx),
        title: String(e.description ?? "Expensa"),
        code: String(e.code ?? e.id ?? idx),
        amount: Number(e.totalAmount ?? 0),
        dueISO: exp.toISOString(),
        status,
      };
    }
  );

  const totalPending = Number(summary?.data?.totalPending ?? 0);
  const overdueCount = Number(summary?.data?.overdueInvoices ?? 0);
  const paidThisYear = Number(summary?.data?.totalPaidThisYear ?? 0);
  const baseTotal = totalPending + paidThisYear;

  let paymentStatus: PaymentStatus[] = [];
  if (baseTotal > 0) {
    const pct = (v: number) =>
      baseTotal === 0 ? 0 : Math.round((v / baseTotal) * 100);

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
    ];
  }

  const PALETTE = [
    "#2563eb",
    "#f97316",
    "#22c55e",
    "#e11d48",
    "#6366f1",
    "#14b8a6",
  ];

  let expenseBreakdown: ExpenseCategory[] = [];

  if (percentageRaw && typeof percentageRaw === "object" && "message" in percentageRaw) {
    expenseBreakdown = [];
  } else if (Array.isArray(percentageRaw)) {
    expenseBreakdown = percentageRaw.map((item: any, idx: number) => ({
      label: String(item.category ?? item.label ?? `Categoría ${idx + 1}`),
      value: Number(item.percentage ?? item.value ?? 0),
      color: PALETTE[idx % PALETTE.length],
    }));
  } else if (percentageRaw && typeof percentageRaw === "object") {
    expenseBreakdown = Object.entries(percentageRaw).map(
      ([key, value], idx) => ({
        label: String(key),
        value: Number(value ?? 0),
        color: PALETTE[idx % PALETTE.length],
      })
    );
  }

  const lastFive = monthlyList.slice(-5);
  const paymentsHistory = lastFive.map((m: any) => ({
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
    expenseBreakdown,
    pendingBills,
    paymentStatus,
    totals: {
      totalPending,
      nextToDue: 0,
      overdueCount,
      paidThisYear,
    },
    paymentsHistory,
  };
}