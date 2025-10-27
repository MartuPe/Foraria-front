import { api } from "../api/axios";

// Tipos de datos esperados (podés ajustarlos según tus modelos reales)
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
  header: { welcomeTitle: string };
}

const consortiumId = 1; // Ejemplo, reemplazar por el consorcio logueado
const userId = 1; // Id del usuario autenticado

export async function fetchDashboard(): Promise<DashboardData> {
  try {
    const [
      totalExpenseRes,
      expenseByCategoryRes,
      pendingExpensesRes,
      userSummaryRes,
      monthlyHistoryRes,
      pollCountRes,
      reserveCountRes,
    ] = await Promise.all([
      api.get(`/dashboard/expenses/total?consortiumId=${consortiumId}`),
      api.get(`/dashboard/expenses/category?consortiumId=${consortiumId}`),
      api.get(`/dashboard/expenses/pending?consortiumId=${consortiumId}`),
      api.get(`/dashboard/expenses/summary?userId=${userId}`),
      api.get(`/dashboard/expenses/monthly-history?userId=${userId}`),
      api.get(`/dashboard/polls/active?consortiumId=${consortiumId}`),
      api.get(`/dashboard/reservations/count?consortiumId=${consortiumId}`),
    ]);

    return {
      header: { welcomeTitle: "¡Bienvenido a tu Dashboard!" },
      kpis: {
        expensesThisMonth: totalExpenseRes.data.totalAmount,
        activePolls: pollCountRes.data.activePolls,
        activeBookings: reserveCountRes.data.activeReservations,
        notifications: 5, // si tenés endpoint real, cámbialo luego
      },
      expenseBreakdown: expenseByCategoryRes.data.data.map((c: any) => ({
        label: c.categoryName,
        value: c.percentage ?? c.amount,
        color: c.color ?? "#0B3A6E",
      })),
      pendingBills: pendingExpensesRes.data.pendingExpenses.map((e: any) => ({
        id: e.id,
        title: e.title ?? e.description,
        code: e.code ?? e.id,
        amount: e.amount,
        dueISO: e.dueDate,
        status: e.isOverdue ? "overdue" : "upcoming",
      })),
      paymentStatus: [
        { label: "Pagadas", value: userSummaryRes.data.data.paidPercent, color: "#1c69c7ff" },
        { label: "Vencidas", value: userSummaryRes.data.data.overduePercent, color: "#EF4444" },
        { label: "Próximas", value: userSummaryRes.data.data.upcomingPercent, color: "#F59E0B" },
      ],
      totals: {
        totalPending: userSummaryRes.data.data.totalPending,
        nextToDue: userSummaryRes.data.data.nextToDue,
        overdueCount: userSummaryRes.data.data.overdueCount,
        paidThisYear: userSummaryRes.data.data.paidThisYear,
      },
      paymentsHistory: monthlyHistoryRes.data.map((m: any) => ({
        label: m.monthName,
        value: m.totalPaid,
      })),
    };
  } catch (error) {
    console.error("Error cargando dashboard:", error);
    throw error;
  }
}