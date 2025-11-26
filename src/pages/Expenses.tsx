import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
  IconButton,
  useTheme,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import "../styles/expenses.css";
import Money from "../components/Money";
import { fetchExpensesMock, formatDateISO } from "../services/expenses.mock";
import InfoCard from "../components/InfoCard";
import PaymentsIcon from "@mui/icons-material/Payments";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PageHeader from "../components/SectionHeader";
import axios from "axios";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoForaria from "../assets/Isotipo-Color.png";
import { ForariaStatusModal } from "../components/StatCardForms";
import { storage } from "../utils/storage";
import { Role } from "../constants/roles";
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
  description?: string | null;
  filePath?: string | null;
  items: InvoiceItem[];
}

interface ExpenseInner {
  id: number;
  description: string;
  totalAmount: number;
  createdAt: string;
  expirationDate?: string | null;
  consortiumId: number;
  invoices: Invoice[];
}

interface ExpenseDetail {
  id: number;
  total: number;
  state: "Pending" | "Paid" | "Overdue" | string;
  expenses: ExpenseInner[];
  residenceId: number;
}

export default function ExpensesPage() {
  const [items, setItems] = useState<ExpenseDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
const isAdmin = storage.role === Role.ADMIN || storage.role === Role.CONSORCIO || storage.role === Role.OWNER ;
  const [header, setHeader] = useState<{
    unidad: string;
    titular: string;
    totalPendiente: number;
    ultimaExpensaMes: string;
    proximoVencISO: string;
  } | null>(null);

  const [detailsOpenFor, setDetailsOpenFor] = useState<ExpenseDetail | null>(
    null
  );
  const [loadingPaymentFor, setLoadingPaymentFor] = useState<number | null>(
    null
  );
  const theme = useTheme();

  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: "success" | "error";
  }>({
    open: false,
    title: "",
    message: "",
    variant: "error",
  });

  useEffect(() => {
    let mounted = true;

    fetchExpensesMock().then(({ header }) => {
      if (!mounted) return;
      setHeader(header);
    });

    const residenceIdRaw = localStorage.getItem("residenceId");
    if (!residenceIdRaw) {
      console.warn("No residenceId en localStorage.");
      setLoadError("No se encontró la unidad asociada a tu usuario.");
      setLoading(false);
      return;
    }

    const residenceId = Number(residenceIdRaw);
    if (Number.isNaN(residenceId)) {
      console.warn("residenceId no válido:", residenceIdRaw);
      setLoadError("La unidad asociada a tu usuario no es válida.");
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      const token = localStorage.getItem("accessToken");
      setLoading(true);
      setLoadError(null);
      try {
        const url = `https://foraria-api-e7dac8bpewbgdpbj.brazilsouth-01.azurewebsites.net/api/ExpenseDetail?id=${residenceId}`;
        const resp = await axios.get<ExpenseDetail[]>(url, {
          headers: { Authorization: `bearer ${token}` },
        });
        if (!mounted) return;
        const data = resp.data || [];
        setItems(data);
      } catch (err: any) {
        console.error("Error cargando ExpenseDetail:", err);
        if (!mounted) return;

        const errorMsg =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          String(err);

        const is404 =
          err?.response?.status === 404 ||
          errorMsg.toLowerCase().includes("404") ||
          errorMsg.toLowerCase().includes("not found");

        const isNotFound =
          errorMsg.toLowerCase().includes("no se encontraron") ||
          errorMsg.toLowerCase().includes("not found");

        if (is404 || isNotFound) {
          setItems([]);
        } else {
          setItems([]);
          setLoadError(
            "No se pudieron cargar las expensas. Intentá nuevamente más tarde."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDetails();
    return () => {
      mounted = false;
    };
  }, []);

  const statValues = useMemo(() => {
    if (!header) return null;
    return {
      totalPendiente: header.totalPendiente,
      ultima: header.ultimaExpensaMes,
      proximo: formatDateISO(header.proximoVencISO),
    };
  }, [header]);

  const translateState = (state: string) => {
    const normalized = state.toLowerCase();
    switch (normalized) {
      case "pending":
        return "Pendiente";
      case "paid":
        return "Pagada";
      case "overdue":
      case "expired":
        return "Vencida";
      default:
        return state;
    }
  };

  const stateChipColor = (state: string) => {
    const normalized = state.toLowerCase();
    switch (normalized) {
      case "pending":
        return "warning";
      case "paid":
        return "success";
      case "overdue":
      case "expired":
        return "error";
      default:
        return "default";
    }
  };

  const stateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case "paid":
        return theme.palette.success.main;
      case "pending":
        return theme.palette.warning.main;
      case "overdue":
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

   const generatePdf = async (detail: ExpenseDetail) => {
    if (!detail.expenses || detail.expenses.length === 0) return;

    try {
      // Fetch del Expense completo para obtener expenseDetailDtos
      const token = localStorage.getItem("accessToken");
      const expenseId = detail.expenses[0].id;
      
      const resp = await axios.get(
        `https://foraria-api-e7dac8bpewbgdpbj.brazilsouth-01.azurewebsites.net/api/Expense`,
        { headers: { Authorization: `bearer ${token}` } }
      );

      const fullExpense = resp.data.find((e: any) => e.id === expenseId);
      if (!fullExpense) {
        console.error("No se encontró la expensa completa");
        return;
      }

      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();

      // Header azul
      pdf.setFillColor(13, 52, 102);
      pdf.rect(0, 0, pageWidth, 90, "F");

      // Logo
      const logoWidth = 80;
      const logoHeight = 80;
      const logoX = pageWidth / 2 - logoWidth / 2;
      const logoY = 0;
      pdf.addImage(logoForaria, "PNG", logoX, logoY, logoWidth, logoHeight);

      // Título
      pdf.setFontSize(22);
      pdf.setTextColor(255, 255, 255);
      pdf.text("FORARIA", pageWidth / 2, 80, { align: "center" });

      // Fechas
      const created = fullExpense.createdAt
        ? new Date(fullExpense.createdAt).toLocaleDateString("es-AR")
        : "-";
      const venc = fullExpense.expirationDate
        ? new Date(fullExpense.expirationDate).toLocaleDateString("es-AR")
        : "-";

      pdf.setFontSize(10);
      const rightX = pageWidth - 20;
      pdf.text(`CREADA: ${created}`, rightX, 25, { align: "right" });
      pdf.text(`VENCIMIENTO: ${venc}`, rightX, 40, { align: "right" });

      // Descripción
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${fullExpense.description || `Expensa ${fullExpense.id}`}`, pageWidth / 2, 120, {
        align: "center",
      });

      let currentY = 140;

      // Tabla de residencias
      const residencesRows = fullExpense.expenseDetailDtos.map((expDetail: any) => {
        const residence = expDetail.residenceResponseDtos;
        const userName = residence.users.length > 0 
          ? `${residence.users[0].firstName} ${residence.users[0].lastName}`
          : "-";
        
        return [
          `${residence.floor}° ${residence.tower} - ${residence.number}`,
          userName,
          residence.coeficient.toFixed(2),
          "$0.00", // Expensa anterior (no está en los datos)
          `$${expDetail.total.toLocaleString("es-AR")}`,
        ];
      });

      autoTable(pdf, {
        startY: currentY,
        head: [["UNIDAD", "TITULAR", "COEF.", "EXP. ANTERIOR", "A PAGAR"]],
        body: residencesRows,
        foot: [
          [
            "",
            "",
            "",
            "TOTAL",
            `$${fullExpense.totalAmount.toLocaleString("es-AR")}`,
          ],
        ],
        styles: { fontSize: 9, halign: "center", valign: "middle" },
        headStyles: {
          fillColor: [13, 52, 102],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        footStyles: {
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          fontStyle: "bold",
          fontSize: 11,
        },
        bodyStyles: {
          lineColor: [180, 180, 180],
          lineWidth: 0.3,
          cellPadding: 6,
        },
      });

      currentY = (pdf as any).lastAutoTable.finalY + 20;

      // Título de desglose
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("DETALLE DE GASTOS EXPENSAS ORDINARIAS", 40, currentY);
      currentY += 15;

      // Tabla de facturas con items
      const invoiceRows: any[] = [];
      fullExpense.invoices.forEach((inv: any) => {
        // Si hay items, mostrar cada uno
        if (inv.items && inv.items.length > 0) {
          inv.items.forEach((item: any) => {
            invoiceRows.push([
              item.description || "-",
              inv.category || "-",
              `$${item.amount.toLocaleString("es-AR")}`,
            ]);
          });
        } else {
          // Si no hay items, mostrar la factura completa
          invoiceRows.push([
            inv.description || inv.concept || "-",
            inv.category || "-",
            `$${inv.amount.toLocaleString("es-AR")}`,
          ]);
        }
      });

      autoTable(pdf, {
        startY: currentY,
        head: [["CONCEPTO", "CATEGORÍA", "MONTO"]],
        body: invoiceRows,
        foot: [
          ["", "TOTAL GASTOS", `$${fullExpense.totalAmount.toLocaleString("es-AR")}`],
        ],
        styles: { fontSize: 9, halign: "left", valign: "middle" },
        headStyles: {
          fillColor: [13, 52, 102],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        footStyles: {
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          fontStyle: "bold",
          fontSize: 10,
        },
        bodyStyles: {
          lineColor: [180, 180, 180],
          lineWidth: 0.3,
          cellPadding: 6,
        },
        columnStyles: {
          0: { cellWidth: "auto" },
          1: { cellWidth: 100 },
          2: { cellWidth: 80, halign: "right" },
        },
      });

      pdf.save(`expensa_${fullExpense.id}.pdf`);
    } catch (error) {
      console.error("Error generando PDF:", error);
      setStatusModal({
        open: true,
        variant: "error",
        title: "Error al generar PDF",
        message: "No se pudo generar el PDF. Intentá nuevamente.",
      });
    }
  };

  const handleMercadoPago = async (detail: ExpenseDetail) => {
    const residenceId = detail.residenceId;
    const expenseId = detail.id;

    try {
      setLoadingPaymentFor(detail.id);
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `https://foraria-api-e7dac8bpewbgdpbj.brazilsouth-01.azurewebsites.net/api/Payment/create-preference?expenseId=${expenseId}&residenceId=${residenceId}`,
        {
          method: "POST",
          headers: { Authorization: `bearer ${token}` },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const json = await res.json();
      const initPoint = json.initPoint ?? json.data?.initPoint ?? null;
      if (!initPoint) throw new Error("initPoint no recibido del backend");
      window.location.href = String(initPoint);
    } catch (e: any) {
      console.error("Error iniciando pago:", e);
      setStatusModal({
        open: true,
        variant: "error",
        title: "Error al iniciar el pago",
        message: "No pudimos ingresar a Mercado Pago. Intentá nuevamente.",
      });
    } finally {
      setLoadingPaymentFor(null);
    }
  };

  if (loading) {
    return (
      <Box
        className="foraria-page-container"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 200,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress />
          <Typography>Cargando expensas…</Typography>
        </Stack>
      </Box>
    );
  }

  if (!header || !statValues) return null;

  const isEmpty = items.length === 0;

  return (
    <>
      <Box className="foraria-page-container" sx={{ ml: 0 }}>
        <PageHeader
          title="Expensas"
          stats={[
            {
              icon: <PaymentsIcon color="action" />,
              title: "Total Pendiente",
              value: (
                <Money value={statValues.totalPendiente} /> as unknown as string
              ),
              color: "warning",
            },
            {
              icon: <CheckCircleOutlineIcon color="action" />,
              title: "Última Expensa",
              value: statValues.ultima,
              color: "success",
            },
            {
              icon: <EventAvailableIcon color="action" />,
              title: "Próximo Vencimiento",
              value: statValues.proximo,
              color: "secondary",
            },
          ]}
        />

        <Stack spacing={2}>
          {isEmpty ? (
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
                {loadError
                  ? "Error al cargar expensas"
                  : "No hay expensas registradas"}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                {loadError
                  ? "No se pudieron cargar las expensas. Intentá nuevamente más tarde."
                  : "Aún no se han generado expensas para tu unidad."}
              </Typography>
              {!loadError && (
                <Typography variant="body2" color="text.secondary">
                  Las expensas aparecerán aquí cuando la administración las
                  cargue.
                </Typography>
              )}
            </Paper>
          ) : (
            items.map((detail) => {
              const exp = detail.expenses && detail.expenses.length > 0 
                ? detail.expenses[0] 
                : null;

              if (!exp) return null;

              return (
                <InfoCard
                  key={detail.id}
                  title={exp.description || `Expensa ${exp.id}`}
                  subtitle={
                    <span style={{ fontSize: "2rem", fontWeight: "bold" }}>
                      <span style={{ color: "rgb(249 115 22)" }}>
                        ${detail.total.toLocaleString("es-AR")}
                      </span>
                    </span>
                  }
                  chips={[
                    {
                      label: translateState(detail.state),
                      color: stateChipColor(detail.state),
                      variant: "outlined",
                    },
                  ]}
                  fields={[
                    {
                      label: "Creada:",
                      value: new Date(exp.createdAt).toLocaleDateString(
                        "es-AR"
                      ),
                    },
                    {
                      label: "Vence:",
                      value: exp.expirationDate
                        ? new Date(exp.expirationDate).toLocaleDateString(
                            "es-AR"
                          )
                        : "-",
                    },
                  ]}
                  showDivider
                  extraActions={[
  ...(isAdmin && detail.state?.toLowerCase() !== "paid"
    ? [{
        label: loadingPaymentFor === detail.id ? "Redirigiendo..." : "Pagar",
        icon: <LocalAtmIcon />,
        variant: "contained" as const,
        color: "primary" as const,
        onClick: () => { void handleMercadoPago(detail); },
      }]
    : []),
  {
    label: "Ver",
    icon: <VisibilityIcon />,
    onClick: () => setDetailsOpenFor(detail),
  },
  {
    label: "PDF",
    icon: <DownloadIcon />,
    onClick: () => generatePdf(detail),
  },
]}
                  sx={{ mb: 2 }}
                />
              );
            })
          )}
        </Stack>
      </Box>

      <Dialog
        open={!!detailsOpenFor}
        onClose={() => setDetailsOpenFor(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detalle de expensa</DialogTitle>
        <DialogContent dividers>
          {detailsOpenFor && detailsOpenFor.expenses && detailsOpenFor.expenses.length > 0 && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                {detailsOpenFor.expenses[0].description ||
                  `Expensa ${detailsOpenFor.expenses[0].id}`}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Estado:{" "}
                <Chip
                  label={translateState(detailsOpenFor.state)}
                  color={stateChipColor(detailsOpenFor.state)}
                  sx={{
                    fontWeight: 600,
                    color: "#fff",
                    bgcolor: stateColor(detailsOpenFor.state),
                  }}
                  size="small"
                />
                {"  "} Total unidad: <Money value={detailsOpenFor.total} />
              </Typography>

              <Divider sx={{ mb: 2 }} />

              {/* Tabla de distribución */}
              <Typography variant="h6" sx={{ mb: 2 }}>
                Distribución por Unidad
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "primary.main" }}>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Unidad
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center">
                        Coeficiente
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">
                        Total
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow sx={{ bgcolor: "info.50" }}>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Tu Unidad (Residencia {detailsOpenFor.residenceId})
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        {(detailsOpenFor.total / detailsOpenFor.expenses[0].totalAmount).toFixed(4)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>
                        ${detailsOpenFor.total.toLocaleString("es-AR")}
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ bgcolor: "grey.100" }}>
                      <TableCell colSpan={2} sx={{ fontWeight: "bold" }}>
                        TOTAL EXPENSA
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>
                        ${detailsOpenFor.expenses[0].totalAmount.toLocaleString("es-AR")}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Divider sx={{ mb: 2 }} />

              <Typography variant="h6" sx={{ mb: 2 }}>
                Detalle de Gastos
              </Typography>
              <Stack spacing={1}>
                {detailsOpenFor.expenses[0].invoices.length === 0 && (
                  <Typography>No hay facturas.</Typography>
                )}
                {detailsOpenFor.expenses[0].invoices.map((inv) => {
                  const myCoeficient = detailsOpenFor.total / detailsOpenFor.expenses[0].totalAmount;
                  const myPortion = inv.amount * myCoeficient;

                  return (
                    <Box key={`dlg-inv-${inv.id}`}>
                      <Box
                        sx={{
                          borderRadius: 1,
                          p: 1.25,
                          bgcolor: "background.paper",
                          border: "1px solid",
                          borderColor: "grey.300",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            alignItems: "center",
                          }}
                        >
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
                          <Box sx={{ textAlign: "right" }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                              ${inv.amount?.toLocaleString("es-AR") ?? "0.00"}
                            </Typography>
                            <Typography variant="caption" color="primary" sx={{ fontWeight: "bold" }}>
                              Tu parte: ${myPortion.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Typography>
                          </Box>
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

                      {/* Items de la factura */}
                      {inv.items && inv.items.length > 0 && (
                        <Box sx={{ ml: 3, mt: 1 }}>
                          {inv.items.map((item, idx) => {
                            const itemPortion = item.amount * myCoeficient;
                            return (
                              <Box
                                key={`item-${idx}`}
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  py: 0.5,
                                  px: 1,
                                  bgcolor: "grey.50",
                                  borderRadius: 1,
                                  mb: 0.5,
                                }}
                              >
                                <Typography variant="caption" color="text.secondary">
                                  • {item.description} (x{item.quantity} @ $
                                  {item.unitPrice})
                                </Typography>
                                <Box sx={{ textAlign: "right" }}>
                                  <Typography
                                    variant="caption"
                                    sx={{ fontWeight: "bold", display: "block" }}
                                  >
                                    ${item.amount.toLocaleString("es-AR")}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="primary"
                                    sx={{ fontSize: "0.65rem" }}
                                  >
                                    ${itemPortion.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </Typography>
                                </Box>
                              </Box>
                            );
                          })}
                        </Box>
                      )}
                    </Box>
                  );
                })}

                {/* Totales finales */}
                <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 2 }}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Total Expensa:
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      ${detailsOpenFor.expenses[0].totalAmount.toLocaleString("es-AR")}
                    </Typography>
                  </Stack>
                  <Divider sx={{ my: 1 }} />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="h6" color="primary" sx={{ fontWeight: "bold" }}>
                      Tu parte a pagar:
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: "bold" }}>
                      ${detailsOpenFor.total.toLocaleString("es-AR")}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpenFor(null)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <ForariaStatusModal
        open={statusModal.open}
        onClose={() =>
          setStatusModal((prev) => ({
            ...prev,
            open: false,
          }))
        }
        variant={statusModal.variant}
        title={statusModal.title}
        message={statusModal.message}
        primaryActionLabel="Aceptar"
      />
    </>
  );
}