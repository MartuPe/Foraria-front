// AdminCargaFactura.tsx
import { useState, useEffect } from "react";
import { Button, Dialog, DialogContent, Box, Stack, Typography } from "@mui/material";
import PageHeader from "../../components/SectionHeader";
import InvoiceUploadForm from "../../components/modals/UploadInvoice";
import InfoCard, { InfoFile } from "../../components/InfoCard";
import axios from "axios";

interface InvoiceItem {
  description: string;
  amount: number;
  quantity: number;
  unitPrice: number;
}

interface Invoice {
  id: number;
  concept: string;
  category: string;
  invoiceNumber: string;
  supplierName: string;
  dateOfIssue: string;
  expirationDate: string;
  amount: number;
  cuit: string;
  subTotal: number;
  totalTaxes: number;
  description?: string | null;
  filePath?: string | null;
  supplierAddress?: string | null;
  purchaseOrder?: string | null;
  confidenceScore?: number | null;
  processedAt?: string | null;
  createdAt?: string | null;
  items: InvoiceItem[];
  expenseId?: number | null;
}

interface Expense {
  id: number;
  description: string;
  totalAmount: number;
  createdAt: string;
  expirationDate?: string | null;
  consortiumId: number;
  invoices: Invoice[];
}

const parseNullableNumber = (v: string | null): number | undefined => {
  if (v === null || v === undefined) return undefined;
  if (v === "null" || v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
};

type TabKey = "facturas" | "expensas";

export default function AdminCargaFactura() {
  const [open, setOpen] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabKey>("facturas");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const getStoredConsortiumId = (): number | undefined => {
    return parseNullableNumber(localStorage.getItem("consortiumId"));
  };

  // Fetch invoices
  const fetchInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const { data } = await axios.get<Invoice[]>("https://localhost:7245/api/Invoice");
      setInvoices(data || []);
    } catch (err) {
      console.error("Error al cargar facturas", err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  // Fetch expenses
  const fetchExpenses = async () => {
    setLoadingExpenses(true);
    try {
      const { data } = await axios.get<Expense[]>("https://localhost:7245/api/Expense");
      const sorted = (data || []).slice().sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      });
      setExpenses(sorted);
    } catch (err) {
      console.error("Error al cargar expensas", err);
    } finally {
      setLoadingExpenses(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchExpenses();
  }, []);

  /*const toInfoFiles = (filePath?: string | null): InfoFile[] =>
    filePath ? filePath.split(",").map((name) => ({ url: name, type: name.split(".").pop() })) : [];
*/
  // Generar expensa (con JSON.stringify y Content-Type)
  const handleGenerateExpense = async () => {
    try {
      const inputRaw = window.prompt("Indica el mes para generar la expensa en formato YYYY-MM (ej. 2025-11):");
      if (!inputRaw) return;

      const input = inputRaw.trim();
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(input)) {
        alert("Formato inválido. Usa YYYY-MM (por ejemplo 2025-11).");
        return;
      }

      const consortiumId = getStoredConsortiumId();
      if (!consortiumId) {
        alert("No hay consorcio activo en localStorage. Elegí un consorcio primero.");
        return;
      }

      const expensePayload = { consortiumId, month: input };
      console.log("Enviando Expense payload:", JSON.stringify(expensePayload));

      const expenseResp = await axios.post(
        "https://localhost:7245/api/Expense",
        JSON.stringify(expensePayload),
        {
          headers: { "Content-Type": "application/json" },
          validateStatus: () => true,
        }
      );

      console.log("Expense response:", expenseResp.status, expenseResp.data);

      if (expenseResp.status === 200 || expenseResp.status === 201) {
        alert(`Expensa generada para ${input}. Procediendo a crear detalles...`);

        const [yearStr, monthStr] = input.split("-");
        const year = Number(yearStr);
        const month = Number(monthStr);
        const d = new Date(year, month - 1, 1);
        d.setMonth(d.getMonth() + 1);
        const nextMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

        const detailPayload = { consortiumId, month: nextMonth };
        console.log("Enviando ExpenseDetail payload:", JSON.stringify(detailPayload));

        const detailResp = await axios.post(
          "https://localhost:7245/api/ExpenseDetail",
          JSON.stringify(detailPayload),
          {
            headers: { "Content-Type": "application/json" },
            validateStatus: () => true,
          }
        );

        console.log("ExpenseDetail response:", detailResp.status, detailResp.data);

        if (detailResp.status === 200 || detailResp.status === 201) {
          alert(`Detalle de expensa creado para ${nextMonth}.`);
          fetchInvoices();
          fetchExpenses();
        } else {
          console.error("Error en ExpenseDetail", detailResp);
          alert(`Error al crear ExpenseDetail (status ${detailResp.status}). Revisa la consola.`);
        }
      } else {
        console.error("Error en Expense", expenseResp);
        alert(`Error al generar expensa (status ${expenseResp.status}). Revisa la consola.`);
      }
    } catch (err) {
      console.error("Excepción en generar expensa", err);
      alert("Ocurrió un error al generar la expensa. Revisa la consola para más detalles.");
    }
  };

  // Wrapper para compatibilizar la firma del PageHeader y evitar errores de tipo
  const handleTabFromHeader = (value: string) => {
    // forzamos a TabKey porque PageHeader probablemente pasa string
    if (value === "facturas" || value === "expensas") {
      setSelectedTab(value);
    } else {
      setSelectedTab("facturas");
    }
  };

  // Ordenar facturas por dateOfIssue descendente
  const sortedInvoices = invoices.slice().sort((a, b) => {
    const da = a.dateOfIssue ? new Date(a.dateOfIssue).getTime() : 0;
    const db = b.dateOfIssue ? new Date(b.dateOfIssue).getTime() : 0;
    return db - da;
  });

  return (
    <div className="page">
      <PageHeader
        title="Carga de Facturas"
        actions={
          <>
            <Button variant="outlined" color="primary" onClick={handleGenerateExpense} sx={{ mr: 1 }}>
              Generar expensa por mes
            </Button>
            <Button variant="contained" color="secondary" onClick={handleOpen}>
              + Cargar Factura
            </Button>
          </>
        }
        tabs={[
          { label: "Facturas", value: "facturas" },
          { label: "Expensas", value: "expensas" },
        ]}
        selectedTab={selectedTab}
        onTabChange={handleTabFromHeader}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent>
          <InvoiceUploadForm
            onSuccess={() => {
              handleClose();
              fetchInvoices();
              fetchExpenses();
            }}
          />
        </DialogContent>
      </Dialog>

      <Box sx={{ padding: 2 }}>
        <Stack spacing={2}>
          {selectedTab === "facturas" && (
            <>
              <Typography variant="h6">Facturas</Typography>
              {loadingInvoices && <div>Cargando facturas...</div>}
              {!loadingInvoices && sortedInvoices.length === 0 && <div>No hay facturas.</div>}
              {!loadingInvoices &&
                sortedInvoices.map((inv) => {
                  const files: InfoFile[] = inv.filePath
                    ? inv.filePath.split(",").map((name) => ({
                        url: name,
                        type: name.split(".").pop(),
                      }))
                    : [];

                  return (
                    <InfoCard
                      key={`inv-${inv.id}`}
                      title={inv.concept}
                      subtitle={`Proveedor: ${inv.supplierName}`}
                      description={inv.description ?? ""}
                      price={inv.amount.toFixed(2)}
                      fields={[
                        { label: "Número de factura", value: inv.invoiceNumber },
                        { label: "Categoría", value: inv.category },
                        { label: "Fecha emisión", value: inv.dateOfIssue ? new Date(inv.dateOfIssue).toLocaleDateString() : "" },
                        { label: "Fecha vencimiento", value: inv.expirationDate ? new Date(inv.expirationDate).toLocaleDateString() : "" },
                      ]}
                      files={files}
                      filesCount={files.length}
                      showDivider
                    />
                  );
                })}
            </>
          )}

          {selectedTab === "expensas" && (
            <>
              <Typography variant="h6">Expensas</Typography>
              {loadingExpenses && <div>Cargando expensas...</div>}
              {!loadingExpenses && expenses.length === 0 && <div>No hay expensas.</div>}
              {!loadingExpenses &&
                expenses.map((exp) => {
                  const expFiles: InfoFile[] = (exp.invoices || [])
                    .flatMap((inv) => (inv.filePath ? inv.filePath.split(",") : []))
                    .map((name) => ({ url: name, type: name.split(".").pop() }));

                  return (
                    <Box key={`exp-${exp.id}`}>
                      <InfoCard
                        key={exp.id}
                        title={exp.description}
                        subtitle={`Total: $${exp.totalAmount.toFixed(2)} • Consorcio ${exp.consortiumId}`}
                        description={`Facturas: ${exp.invoices?.length ?? 0}`}
                        price={exp.totalAmount.toFixed(2)}
                        fields={[
                          { label: "Creada", value: exp.createdAt ? new Date(exp.createdAt).toLocaleString() : "" },
                          { label: "Vencimiento", value: exp.expirationDate ? new Date(exp.expirationDate).toLocaleDateString() : "" },
                        ]}
                        files={expFiles}
                        filesCount={expFiles.length}
                        showDivider
                      />
                    </Box>
                  );
                })}
            </>
          )}
        </Stack>
      </Box>
    </div>
  );
}
