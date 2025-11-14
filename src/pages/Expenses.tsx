import React, { useEffect, useState, useMemo } from "react";
import { Box, Stack, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Divider, Chip,IconButton, Card, CardContent, useTheme, CircularProgress, } from "@mui/material";
import "../styles/expenses.css";
import Money from "../components/Money";
import { fetchExpensesMock, formatDateISO } from "../services/expenses.mock";
import PaymentsIcon from "@mui/icons-material/Payments";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PageHeader from "../components/SectionHeader";
import axios from "axios";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PaidIcon from "@mui/icons-material/Paid";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import { ForariaStatusModal } from "../components/StatCardForms";

type Invoice = {
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
};

type ExpenseInner = {
  id: number;
  description: string;
  totalAmount: number;
  createdAt: string;
  expirationDate?: string | null;
  consortiumId: number;
  invoices: Invoice[];
};

type ExpenseDetail = {
  id: number;
  total: number;
  state: "Pending" | "Paid" | "Overdue" | string;
  expenseId: number;
  expense: ExpenseInner;
  residenceId: number;
};

export default function ExpensesPage() {
  const [items, setItems] = useState<ExpenseDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [header, setHeader] = useState<{
    unidad: string;
    titular: string;
    totalPendiente: number;
    ultimaExpensaMes: string;
    proximoVencISO: string;
  } | null>(null);

  const [detailsOpenFor, setDetailsOpenFor] = useState<ExpenseDetail | null>(null);
  const [downloadingPdfFor, setDownloadingPdfFor] = useState<number | null>(null);
  const [loadingPaymentFor, setLoadingPaymentFor] = useState<number | null>(null);
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
      setLoading(true);
      setLoadError(null);
      try {
        const url = `https://localhost:7245/api/ExpenseDetail?id=${residenceId}`;
        const resp = await axios.get<ExpenseDetail[]>(url);
        if (!mounted) return;
        const data = resp.data || [];
        data.sort((a, b) => {
          const ta = a.expense?.createdAt ? new Date(a.expense.createdAt).getTime() : 0;
          const tb = b.expense?.createdAt ? new Date(b.expense.createdAt).getTime() : 0;
          return tb - ta || b.id - a.id;
        });
        setItems(data);
      } catch (err) {
        console.error("Error cargando ExpenseDetail:", err);
        setItems([]);
        setLoadError("No se pudieron cargar las expensas. Intentá nuevamente más tarde.");
      } finally {
        setLoading(false);
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

  const handleDownloadPdf = async (detail: ExpenseDetail) => {
    try {
      setDownloadingPdfFor(detail.id);
      const url = `https://localhost:7245/api/ExpenseDetail/pdf?id=${detail.id}`;
      const resp = await axios.get(url, {
        responseType: "blob",
        validateStatus: () => true,
      });
      if (resp.status === 200) {
        const blob = new Blob([resp.data], {
          type: resp.headers["content-type"] || "application/pdf",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `expensa_${detail.expenseId}_residencia_${detail.residenceId}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(link.href);
      } else {
        console.warn("No se pudo descargar PDF. status:", resp.status);
        setStatusModal({
          open: true,
          variant: "error",
          title: "No se pudo descargar el PDF",
          message: "Ocurrió un problema al generar la expensa. Intentá nuevamente.",
        });
      }
    } catch (err) {
      console.error("Error descargando PDF:", err);
      setStatusModal({
        open: true,
        variant: "error",
        title: "No se pudo descargar el PDF",
        message: "Ocurrió un error. Por favor, intentá nuevamente.",
      });
    } finally {
      setDownloadingPdfFor(null);
    }
  };

  const handleMercadoPago = async (detail: ExpenseDetail) => {
    const residenceId = detail.residenceId;
    const expenseId = detail.id;

    try {
      setLoadingPaymentFor(detail.id);
      const res = await fetch(
        `https://localhost:7245/api/Payment/create-preference?expenseId=${expenseId}&residenceId=${residenceId}`,
        { method: "POST" }
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
        message:
          "No pudimos ingresar a Mercado Pago. Intentá nuevamente.",
      });
    } finally {
      setLoadingPaymentFor(null);
    }
  };

  if (loading) {
    return (
      <Box className="foraria-page-container" sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress />
          <Typography>Cargando expensas…</Typography>
        </Stack>
      </Box>
    );
  }

  if (loadError) {
    return (
      <Box className="foraria-page-container">
        <Typography variant="h5" color="error" sx={{ mb: 1 }}>
          No se pudieron cargar tus expensas
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {loadError}
        </Typography>
      </Box>
    );
  }

  if (!header || !statValues) return null;

  return (
    <>
      <Box className="foraria-page-container" sx={{ ml: 0 }}>
        <PageHeader
          title="Expensas"
          stats={[
            {
              icon: <PaymentsIcon color="action" />,
              title: "Total Pendiente",
              value: ( <Money value={statValues.totalPendiente} /> as unknown as string ),
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

        <Box>
          {items.map((detail) => {
            const exp = detail.expense;
            const color = stateColor(detail.state);
            const icon =
              detail.state.toLowerCase() === "paid" ? ( <PaidIcon /> ) : detail.state.toLowerCase() === "pending" ? ( <HourglassEmptyIcon /> ) : ( <AttachMoneyIcon /> );

            return (
              <Card
                key={detail.id}
                elevation={2}
                sx={{
                  borderRadius: 3,
                  p: 2,
                  transition: "0.2s",
                  "&:hover": { boxShadow: 4, transform: "translateY(-2px)" },
                  display: "flex",
                  flexDirection: "column",
                  mb: 2,
                }}
              >
                <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }} >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" >
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {exp.description || `Expensa ${exp.id}`}
                    </Typography>
                    <Chip
                      icon={icon}
                      label={detail.state}
                      size="small"
                      sx={{
                        bgcolor: color + "20",
                        color,
                        fontWeight: 600,
                      }}
                    />
                  </Stack>

                  <Divider />

                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    ${detail.total.toLocaleString("es-AR")}
                  </Typography>

                  <Stack direction="row" justifyContent="flex-end" spacing={1}>
                    <Button
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownloadPdf(detail)}
                      disabled={downloadingPdfFor === detail.id}
                    > {downloadingPdfFor === detail.id ? "Descargando..." : "PDF"}
                    </Button>

                    <Button
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => setDetailsOpenFor(detail)}
                    > Ver
                    </Button>

                    <Button
                      size="small"
                      variant="contained"
                      color="secondary"
                      startIcon={<LocalAtmIcon />}
                      onClick={() => handleMercadoPago(detail)}
                      disabled={loadingPaymentFor === detail.id}
                    >
                      {loadingPaymentFor === detail.id ? (
                        <>
                          <CircularProgress size={18} color="inherit" />
                          &nbsp;Redirigiendo...
                        </>
                      ) : (
                        "Pagar con MercadoPago"
                      )}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>

      <Dialog
        open={!!detailsOpenFor}
        onClose={() => setDetailsOpenFor(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detalle de expensa</DialogTitle>
        <DialogContent dividers>
          {detailsOpenFor && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                {detailsOpenFor.expense.description ||
                  `Expensa ${detailsOpenFor.expenseId}`}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Estado:{" "}
                <Chip
                  label={detailsOpenFor.state}
                  sx={{
                    color: "#fff",
                    bgcolor: stateColor(detailsOpenFor.state),
                    fontWeight: 600,
                  }}
                  size="small"
                />{" "}
                {"  "} Total unidad:{" "}
                <Money value={detailsOpenFor.total} />
              </Typography>

              <Divider sx={{ mb: 2 }} />

              <Stack spacing={1}>
                {detailsOpenFor.expense.invoices.length === 0 && (
                  <Typography>No hay facturas.</Typography>
                )}
                {detailsOpenFor.expense.invoices.map((inv) => (
                  <Box
                    key={`dlg-inv-${inv.id}`}
                    sx={{
                      borderRadius: 1,
                      p: 1.25,
                      bgcolor: "background.paper",
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
                          {inv.concept ||
                            inv.description ||
                            `Factura ${inv.id}`}
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
                          onClick={() =>
                            window.open(inv.filePath!, "_blank")
                          }
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