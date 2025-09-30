import { Expense } from "../components/ExpenseItem";
import { formatMoney } from "../components/Money";

export type HeaderInfo = {
  unidad: string;      // "Depto. 4B"
  titular: string;     // "Juan Pérez"
  totalPendiente: number;
  ultimaExpensaMes: string; // "Octubre 2024"
  proximoVencISO: string;   // "2024-12-10"
};

export async function fetchExpensesMock(): Promise<{
  header: HeaderInfo;
  items: Expense[];
}> {
  // Simula delay de red
  await new Promise((r) => setTimeout(r, 250));

  const items: Expense[] = [
    {
      id: "nov-2024",
      mes: "Noviembre 2024",
      status: "pendiente",
      venceISO: "2024-12-10",
      total: 45250,
      canPay: true,
      conceptos: {
        administracion: 18500,
        mantenimiento: 12200,
        limpieza: 8900,
        seguridad: 4150,
        otros: 1500,
      },
    },
    {
      id: "oct-2024",
      mes: "Octubre 2024",
      status: "pagada",
      venceISO: "2024-11-10",
      total: 42180,
      pdfUrl: "#",
      conceptos: {
        administracion: 17500,
        mantenimiento: 11800,
        limpieza: 8200,
        seguridad: 3980,
        otros: 700,
      },
    },
    {
      id: "sep-2024",
      mes: "Septiembre 2024",
      status: "pagada",
      venceISO: "2024-10-10",
      total: 39750,
      pdfUrl: "#",
      conceptos: {
        administracion: 16800,
        mantenimiento: 10950,
        limpieza: 7800,
        seguridad: 3700,
        otros: 500,
      },
    },
    {
      id: "ago-2024",
      mes: "Agosto 2024",
      status: "vencida",
      venceISO: "2024-09-10",
      total: 38900,
      canPay: true,
      pdfUrl: "#",
      conceptos: {
        administracion: 16200,
        mantenimiento: 10500,
        limpieza: 7900,
        seguridad: 3800,
        otros: 500,
      },
    },
  ];

  const pendientes = items.filter(i => i.status !== "pagada")
                          .reduce((acc, i) => acc + i.total, 0);

  const header: HeaderInfo = {
    unidad: "Depto. 4B",
    titular: "Juan Pérez",
    totalPendiente: pendientes,
    ultimaExpensaMes: "Octubre 2024",
    proximoVencISO: "2024-12-10",
  };

  return { header, items };
}

export function formatDateISO(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function headerLabelTotal(n: number) {
  return formatMoney(n);
}
