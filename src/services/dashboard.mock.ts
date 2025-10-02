export type SummaryKPIs = {
  expensesThisMonth: number; // 8500
  activePolls: number;       // 2
  activeBookings: number;    // 3
  notifications: number;     // 5
};

export type DonutSlice = { label: string; value: number; color: string };

export type PendingBill = {
  id: string;
  title: string;      // "Expensas Diciembre"
  code: string;       // "EXP-2024-12"
  dueISO: string;     // "2024-12-10"
  amount: number;     // 450
  status: "overdue" | "due-soon" | "ok";
};

export async function fetchDashboardMock() {
  await new Promise((r) => setTimeout(r, 200));

  const kpis: SummaryKPIs = {
    expensesThisMonth: 8500,
    activePolls: 2,
    activeBookings: 3,
    notifications: 5,
  };

  const paymentStatus: DonutSlice[] = [
    { label: "Pagadas", value: 85, color: "#2ecc71" },
    { label: "Vencidas", value: 10, color: "#e74c3c" },
    { label: "Próximas", value: 5,  color: "#f4b400" },
  ];

  const expenseBreakdown: DonutSlice[] = [
    { label: "Administración", value: 25, color: "#0d3b66" },
    { label: "Servicios",      value: 28, color: "#f6d55c" },
    { label: "Seguridad",      value: 22, color: "#ed553b" },
    { label: "Mantenimiento",  value: 18, color: "#f4a261" },
    { label: "Otros",          value: 7,  color: "#ffe4a3" },
  ];

  const pendingBills: PendingBill[] = [
    {
      id: "1",
      title: "Expensas Diciembre",
      code: "EXP-2024-12",
      dueISO: "2024-12-10",
      amount: 450,
      status: "overdue",
    },
    {
      id: "2",
      title: "Expensas Enero",
      code: "EXP-2025-01",
      dueISO: "2025-01-10",
      amount: 420,
      status: "due-soon",
    },
    {
      id: "3",
      title: "Fondo de Mantenimiento",
      code: "MANT-2024-Q4",
      dueISO: "2025-01-15",
      amount: 150,
      status: "due-soon",
    },
  ];

  const paymentsHistory = [
    { label: "Sep", value: 380 },
    { label: "Oct", value: 320 },
    { label: "Nov", value: 420 },
    { label: "Dic", value: 380 },
    { label: "Ene", value: 500 },
  ];

  return {
    header: {
      welcomeTitle: "¡Bienvenido a tu Dashboard!",
      subtitle: "Aquí tienes un resumen de toda la actividad de tu consorcio",
    },
    kpis,
    paymentStatus,
    expenseBreakdown,
    pendingBills,
    paymentsHistory,
    totals: {
      totalPending: 1020,
      nextToDue: 2,
      overdueCount: 1,
      paidThisYear: 1250,
    },
  };
}
