import { useState, useEffect } from "react";
import { useCallback } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Box,
  Stack,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Paper,
} from "@mui/material";
import PageHeader from "../../components/SectionHeader";
import InvoiceUploadForm from "../../components/modals/UploadInvoice";
import InfoCard, { InfoFile } from "../../components/InfoCard";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Money from "../../components/Money";
import IconButton from "@mui/material/IconButton";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import isotipoForaria from "../../assets/Isotipo-Color.png";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import CircularProgress from "@mui/material/CircularProgress";



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
  const [openMonthModal, setOpenMonthModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");

const token = localStorage.getItem("accessToken");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabKey>("facturas");
const [detailsOpen, setDetailsOpen] = useState(false);
const [selectedExpense, setSelectedExpense] = useState<any | null>(null);
const [loadErrorInvoices, setLoadErrorInvoices] = useState<string | null>(null);
const [loadErrorExpenses, setLoadErrorExpenses] = useState<string | null>(null);
const handleViewExpense = (exp: any) => {
  setSelectedExpense(exp);
  setDetailsOpen(true);
};

const handleCloseDetails = () => {
  setSelectedExpense(null);
  setDetailsOpen(false);
};

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const getStoredConsortiumId = (): number | undefined => {
    return parseNullableNumber(localStorage.getItem("consortiumId"));
  };

 const fetchInvoices = useCallback(async () => {
  const token = localStorage.getItem("accessToken");
  setLoadingInvoices(true);
  setLoadErrorInvoices(null);
  try {
    const { data } = await axios.get<Invoice[]>("https://localhost:7245/api/Invoice", { 
      headers: { Authorization: `Bearer ${token}` }
    });
    setInvoices(data || []);
    setLoadErrorInvoices(null);
  } catch (err: any) {
    console.error("Error al cargar facturas", err);
    
    const errorMsg = err?.response?.data?.error || 
                    err?.response?.data?.message || 
                    String(err);
    
    const is404 = err?.response?.status === 404 || 
                  errorMsg.toLowerCase().includes("404") || 
                  errorMsg.toLowerCase().includes("not found");
    
    const isNotFound = errorMsg.toLowerCase().includes("no se encontraron");
    
    if (is404 || isNotFound) {
      setInvoices([]);
      setLoadErrorInvoices(null);
    } else {
      setInvoices([]);
      setLoadErrorInvoices("No se pudieron cargar las facturas. Intentá nuevamente más tarde.");
    }
  } finally {
    setLoadingInvoices(false);
  }
}, []);


  const fetchExpenses = useCallback( async () => {
    const token = localStorage.getItem("accessToken");
  setLoadingExpenses(true);
  setLoadErrorExpenses(null);
  try {
    const { data } = await axios.get<Expense[]>("https://localhost:7245/api/Expense", { 
      headers: { Authorization: `Bearer ${token}` }
    });
    const sorted = (data || []).slice().sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });
    setExpenses(sorted);
    setLoadErrorExpenses(null);
  } catch (err: any) {
    console.error("Error al cargar expensas", err);
    
    const errorMsg = err?.response?.data?.error || 
                    err?.response?.data?.message || 
                    String(err);
    
    const is404 = err?.response?.status === 404 || 
                  errorMsg.toLowerCase().includes("404") || 
                  errorMsg.toLowerCase().includes("not found");
    
    const isNotFound = errorMsg.toLowerCase().includes("no se encontraron");
    
    if (is404 || isNotFound) {
      setExpenses([]);
      setLoadErrorExpenses(null);
    } else {
      setExpenses([]);
      setLoadErrorExpenses("No se pudieron cargar las expensas. Intentá nuevamente más tarde.");
    }
  } finally {
    setLoadingExpenses(false);
  }
}, []);
  useEffect(() => {
    fetchInvoices();
    fetchExpenses();
  }, [fetchInvoices, fetchExpenses]);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
  const months = [
    { value: "01", label: "Enero" },
    { value: "02", label: "Febrero" },
    { value: "03", label: "Marzo" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Mayo" },
    { value: "06", label: "Junio" },
    { value: "07", label: "Julio" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  const openExpenseModal = () => {
    setSelectedMonth("");
    setSelectedYear(String(new Date().getFullYear()));
    setOpenMonthModal(true);
  };

  const handleGenerateExpense = async () => {
    try {
      if (!selectedYear || !selectedMonth) {
        
        return;
      }

      const input = `${selectedYear}-${selectedMonth}`;
      const consortiumId = getStoredConsortiumId();
      if (!consortiumId) {
      
        return;
      }

      const expensePayload = { consortiumId, month: input };
      console.log("Enviando Expense payload:", (expensePayload));

      const expenseResp = await axios.post(
        "https://localhost:7245/api/Expense" , 
        (expensePayload),
        {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          validateStatus: () => true,
        }
      );

      console.log("Expense response:", expenseResp.status, expenseResp.data);

      if (expenseResp.status === 200 || expenseResp.status === 201) {
        

        const [yearStr, monthStr] = input.split("-");
        const year = Number(yearStr);
        const month = Number(monthStr);
        const d = new Date(year, month - 1, 1);
        d.setMonth(d.getMonth() + 1);
        const nextMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

        const detailPayload = { consortiumId, month: nextMonth };
        console.log("Enviando ExpenseDetail payload:", (detailPayload));

        const detailResp = await axios.post(
          "https://localhost:7245/api/ExpenseDetail",
          (detailPayload),
          {
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            validateStatus: () => true,
          }
        );

        console.log("ExpenseDetail response:", detailResp.status, detailResp.data);

        if (detailResp.status === 200 || detailResp.status === 201) {
       
          fetchInvoices();
          fetchExpenses();
          setOpenMonthModal(false);
        } else {
          console.error("Error en ExpenseDetail", detailResp);
          alert(`Error al crear ExpenseDetail (status ${detailResp.status}).`);
        }
      } else {
        console.error("Error en Expense", expenseResp);
        alert(`Error al generar expensa (status ${expenseResp.status}).`);
      }
    } catch (err) {
      console.error("Excepción en generar expensa", err);
      alert("Ocurrió un error al generar la expensa. Revisá la consola para más detalles.");
    }
  };

  const handleTabFromHeader = (value: string) => {
    if (value === "facturas" || value === "expensas") setSelectedTab(value);
    else setSelectedTab("facturas");
  };

  const sortedInvoices = invoices.slice().sort((a, b) => {
    const da = a.dateOfIssue ? new Date(a.dateOfIssue).getTime() : 0;
    const db = b.dateOfIssue ? new Date(b.dateOfIssue).getTime() : 0;
    return db - da;
  });
const generateAdminPdf = (exp: Expense) => {
  const pdf = new jsPDF("p", "pt", "a4");

  const pageWidth = pdf.internal.pageSize.getWidth();

  pdf.setFillColor(13, 52, 102);
  pdf.rect(0, 0, pageWidth, 90, "F");

  const logoWidth = 80;
  const logoHeight = 80;
  const logoX = pageWidth / 2 - logoWidth / 2;
  const logoY = 0;
  pdf.addImage(isotipoForaria, "PNG", logoX, logoY, logoWidth, logoHeight);

  pdf.setFontSize(22);
  pdf.setTextColor(255, 255, 255);
  pdf.text("FORARIA", pageWidth / 2, 80, { align: "center" });

  const created = exp.createdAt ? new Date(exp.createdAt).toLocaleDateString("es-AR") : "-";
  const venc = exp.expirationDate
    ? new Date(exp.expirationDate).toLocaleDateString("es-AR")
    : "-";

  pdf.setFontSize(10);
  const rightX = pageWidth - 20;
  pdf.text(`CREADA: ${created}`, rightX, 25, { align: "right" });
  pdf.text(`VENCIMIENTO: ${venc}`, rightX, 40, { align: "right" });

  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text(
    `${exp.description || `Expensa ${exp.id}`}`,
    pageWidth / 2,
    130,
    { align: "center" }
  );

  const rows = exp.invoices.map((inv) => [
    inv.dateOfIssue ? new Date(inv.dateOfIssue).toLocaleDateString("es-AR") : "-",
    inv.description || inv.description || "-",
    inv.category || "-",
    "$" + inv.amount?.toLocaleString("es-AR"),
  ]);

  autoTable(pdf, {
    startY: 160,
    head: [["FECHA", "CONCEPTO", "CATEGORIA", "MONTO"]],
    body: rows,
    styles: { fontSize: 10, halign: "center", valign: "middle" },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      lineWidth: 0.5,
      lineColor: [180, 180, 180],
      fontStyle: "bold",
    },
    bodyStyles: {
      lineColor: [180, 180, 180],
      lineWidth: 0.3,
      cellPadding: 8,
    },
  });

  const finalY = (pdf as any).lastAutoTable.finalY + 30;
  pdf.setFontSize(20);
  pdf.text(
    `TOTAL: $${exp.totalAmount.toLocaleString("es-AR")}`,
    pageWidth / 2,
    finalY,
    { align: "center" }
  );

  pdf.save(`expensa_${exp.id}.pdf`);
};

  return (
    <div className="foraria-page-container">
      <PageHeader
        title="Carga de Facturas"
        actions={
          <>
            <Button variant="outlined" color="primary" onClick={openExpenseModal} sx={{ mr: 1 }}>
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

      {/* Modal de carga de factura */}
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

      {/* 🔹 Nuevo Modal Año/Mes */}
      <Dialog open={openMonthModal} onClose={() => setOpenMonthModal(false)}>
        <DialogTitle>Generar Expensa</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
            <FormControl fullWidth>
              <InputLabel>Año</InputLabel>
              <Select
                value={selectedYear}
                label="Año"
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {years.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Mes</InputLabel>
              <Select
                value={selectedMonth}
                label="Mes"
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {months.map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    {m.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMonthModal(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateExpense}
            disabled={!selectedYear || !selectedMonth}
          >
            Generar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contenido principal */}
      <Box sx={{ padding: 2 }}>
        <Stack spacing={2}>
          {selectedTab === "facturas" && (
  <>
    <Typography variant="h6">Facturas</Typography>
    
    {loadingInvoices && (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress />
          <Typography>Cargando facturas…</Typography>
        </Stack>
      </Box>
    )}
    
    {loadErrorInvoices && !loadingInvoices && (
      <Paper
        sx={{
          p: 6,
          textAlign: "center",
          border: "1px dashed #d0d0d0",
          borderRadius: 3,
          backgroundColor: "#fafafa",
        }}
      >
        <ReceiptLongOutlinedIcon
          sx={{ fontSize: 80, color: "text.disabled", mb: 2 }}
        />
        <Typography variant="h5" color="text.primary" gutterBottom>
          Error al cargar facturas
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {loadErrorInvoices}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => fetchInvoices()} 
          sx={{ mt: 1 }}
        >
          Reintentar
        </Button>
      </Paper>
    )}
    
    {!loadingInvoices && !loadErrorInvoices && sortedInvoices.length === 0 && (
      <Paper
        sx={{
          p: 6,
          textAlign: "center",
          border: "1px dashed #d0d0d0",
          borderRadius: 3,
          backgroundColor: "#fafafa",
        }}
      >
        <ReceiptLongOutlinedIcon
          sx={{ fontSize: 80, color: "text.disabled", mb: 2 }}
        />
        <Typography variant="h5" color="text.primary" gutterBottom>
          No hay facturas registradas
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          Aún no se han cargado facturas en el sistema.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Podés cargar una nueva factura haciendo clic en "Cargar Factura".
        </Typography>
      </Paper>
    )}
    
    {!loadingInvoices && !loadErrorInvoices &&
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
                        {
                          label: "Fecha emisión",
                          value: inv.dateOfIssue ? new Date(inv.dateOfIssue).toLocaleDateString() : "",
                        },
                        {
                          label: "Fecha vencimiento",
                          value: inv.expirationDate
                            ? new Date(inv.expirationDate).toLocaleDateString()
                            : "",
                        },
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
    <Typography variant="h6" sx={{ mb: 2 }}>
      Expensas
    </Typography>

    {loadingExpenses && (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress />
          <Typography>Cargando expensas…</Typography>
        </Stack>
      </Box>
    )}
    
    {loadErrorExpenses && !loadingExpenses && (
      <Paper
        sx={{
          p: 6,
          textAlign: "center",
          border: "1px dashed #d0d0d0",
          borderRadius: 3,
          backgroundColor: "#fafafa",
        }}
      >
        <ReceiptLongOutlinedIcon
          sx={{ fontSize: 80, color: "text.disabled", mb: 2 }}
        />
        <Typography variant="h5" color="text.primary" gutterBottom>
          Error al cargar expensas
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {loadErrorExpenses}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => fetchExpenses()} 
          sx={{ mt: 1 }}
        >
          Reintentar
        </Button>
      </Paper>
    )}
    
    {!loadingExpenses && !loadErrorExpenses && expenses.length === 0 && (
      <Paper
        sx={{
          p: 6,
          textAlign: "center",
          border: "1px dashed #d0d0d0",
          borderRadius: 3,
          backgroundColor: "#fafafa",
        }}
      >
        <ReceiptLongOutlinedIcon
          sx={{ fontSize: 80, color: "text.disabled", mb: 2 }}
        />
        <Typography variant="h5" color="text.primary" gutterBottom>
          No hay expensas generadas
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          Aún no se han generado expensas.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Podés generar una expensa haciendo clic en "Generar expensa por mes".
        </Typography>
      </Paper>
    )}

    {!loadingExpenses && !loadErrorExpenses &&
      expenses.map((exp) => {
        return (
          <InfoCard
            key={exp.id}
            title={exp.description || `Expensa ${exp.id}`}
            subtitle={
              <span style={{ fontSize: "1.8rem", fontWeight: "bold" }}>
                <span style={{ color: "rgb(249 115 22)" }}>
                  ${exp.totalAmount.toLocaleString("es-AR")}
                </span>
              </span>
            }
            chips={[
              {
                label: "Generada",
                color: "info",
                variant: "outlined",
              },
            ]}
            fields={[
              {
                label: "Creada:",
                value: exp.createdAt
                  ? new Date(exp.createdAt).toLocaleDateString("es-AR")
                  : "-",
              },
              {
                label: "Vence:",
                value: exp.expirationDate
                  ? new Date(exp.expirationDate).toLocaleDateString("es-AR")
                  : "-",
              },
            ]}
            showDivider
            extraActions={[
            {
            label: "PDF",
            icon: <DownloadIcon />,
            onClick: () => generateAdminPdf(exp),
            },
              {
                label: "Ver",
                icon: <VisibilityIcon />,
                onClick: () => handleViewExpense(exp),
              },
            ]}
            sx={{ mb: 2 }}
          />
        );
      })}

<Dialog open={!!detailsOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
  <DialogTitle>Detalle de expensa</DialogTitle>
  <DialogContent dividers>
    {selectedExpense && (
      <>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          {selectedExpense.description || `Expensa ${selectedExpense.id}`}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {"  "} Total unidad: <Money value={selectedExpense.totalAmount} />
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={1}>
          {selectedExpense.invoices.length === 0 && (
            <Typography>No hay facturas.</Typography>
          )}
          {selectedExpense.invoices.map((inv: any) => (
            <Box
              key={`dlg-inv-${inv.id}`}
              sx={{ borderRadius: 1, p: 1.25, bgcolor: "background.paper" }}
            >
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" noWrap>
                    {inv.concept || inv.description || `Factura ${inv.id}`}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    noWrap
                  >
                    {inv.supplierName || "-"} • {inv.category || "-"}
                  </Typography>
                </Box>
                <Typography variant="subtitle2">
                  ${inv.amount?.toFixed(2) ?? "0.00"}
                </Typography>
                {inv.filePath && (
                  <IconButton
                    size="small"
                    onClick={() => window.open(inv.filePath!, "_blank")}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Box>
          ))}
        </Stack>
      </>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseDetails}>Cerrar</Button>
  </DialogActions>
</Dialog>
  </>
)}
        </Stack>
      </Box>
    </div>
  );
}


