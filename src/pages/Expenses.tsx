import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Container,
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
  Card,
  CardContent,
  useTheme,
  CircularProgress,
} from "@mui/material";
import "../styles/expenses.css";
import Money from "../components/Money";
import { fetchExpensesMock, formatDateISO } from "../services/expenses.mock";
import InfoCard from "../components/InfoCard";
import PaymentsIcon from "@mui/icons-material/Payments";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PageHeader from "../components/SectionHeader";
import { Layout } from "../components/layout";
import axios from "axios";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PaidIcon from "@mui/icons-material/Paid";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoForaria from '../assets/Isotipo-Color.png';

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

  useEffect(() => {
    let mounted = true;

    fetchExpensesMock().then(({ header }) => {
      if (!mounted) return;
      setHeader(header);
    });

    const residenceIdRaw = localStorage.getItem("residenceId");
    if (!residenceIdRaw) {
      console.warn("No residenceId en localStorage.");
      setLoading(false);
      return;
    }

    const residenceId = Number(residenceIdRaw);
    if (Number.isNaN(residenceId)) {
      console.warn("residenceId no válido:", residenceIdRaw);
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
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

const generatePdf = (detail: ExpenseDetail) => {
  const pdf = new jsPDF("p", "pt", "a4");
  const exp = detail.expense;


  const pageWidth = pdf.internal.pageSize.getWidth();
  pdf.setFillColor(13, 52, 102);
  pdf.rect(0, 0, pageWidth, 90, "F");


  const logoWidth = 80;  
  const logoHeight = 80; 
  const logoX = pageWidth / 2 - logoWidth / 2;
  const logoY = 0;
  pdf.addImage(logoForaria, "PNG", logoX, logoY, logoWidth, logoHeight);


  pdf.setFontSize(22);
  pdf.setTextColor(255, 255, 255);
  pdf.text("FORARIA",  pageWidth / 2, 80, { align: "center" });

 const created = new Date(exp.createdAt).toLocaleDateString("es-AR");
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
    `DESCRIPCIÓN: ${exp.description || `Expensa ${exp.id}`}`,
    pageWidth / 2,
    130,
    { align: "center" }
  );


  const rows = exp.invoices.map((inv) => [ inv.dateOfIssue ? new Date(inv.dateOfIssue).toLocaleDateString("es-AR") : "-", inv.concept || inv.description || "-", inv.category || "-", "$" + inv.amount?.toLocaleString("es-AR") ]);

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
    `TOTAL: $${detail.total.toLocaleString("es-AR")}`,
    pageWidth / 2,
    finalY,
    { align: "center" }
  );

  pdf.save(`expensa_${detail.expenseId}_unidad_${detail.residenceId}.pdf`);
};


  // 🔹 Nuevo: lógica para crear preferencia de pago (MercadoPago)
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
      console.log("create-preference response:", json);
      const initPoint = json.initPoint ?? json.data?.initPoint ?? null;
      if (!initPoint) throw new Error("initPoint no recibido del backend");

      window.location.href = String(initPoint);
    } catch (e: any) {
      console.error("Error iniciando pago:", e);
      alert(e?.message || "Error al iniciar pago");
    } finally {
      setLoadingPaymentFor(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box className="foraria-page-container">
          <Container maxWidth="lg" sx={{ py: 3 }}>
            Cargando expensas…
          </Container>
        </Box>
      </Layout>
    );
  }

  if (!header || !statValues) return null;

  return (
    <Layout>
      <Box className="foraria-page-container">
        <PageHeader
          title="Expensas"
          stats={[
            {
              icon: <PaymentsIcon color="action" />,
              title: "Total Pendiente",
              value: <Money value={statValues.totalPendiente} /> as unknown as string,
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
      detail.state.toLowerCase() === "paid" ? (
        <PaidIcon />
      ) : detail.state.toLowerCase() === "pending" ? (
        <HourglassEmptyIcon />
      ) : (
        <AttachMoneyIcon />
      );

    return (
      <InfoCard
        key={detail.id}
        title={exp.description || `Expensa ${exp.id}`}
        subtitle={ <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>
    <span style={{ color: 'rgb(249 115 22)' }}>${detail.total.toLocaleString('es-AR')}</span>
  </span>} 
   
        chips={[
          {
            label: detail.state,
            color:
              detail.state.toLowerCase() === "paid"
                ? "success"
                : detail.state.toLowerCase() === "pending"
                ? "warning"
                : "error",
            variant: "outlined",
          },
        ]}
        
        fields={[
          {
            label: "Creada:",
            value: new Date(exp.createdAt).toLocaleDateString("es-AR"),
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
            label:
              loadingPaymentFor === detail.id
                ? "Redirigiendo..."
                : "Pagar",
            icon: <LocalAtmIcon />,
            variant: "contained",
            color: "primary",
            onClick: () => handleMercadoPago(detail),
     
          },
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
  })}
</Box>
      </Box>

      <Dialog open={!!detailsOpenFor} onClose={() => setDetailsOpenFor(null)} maxWidth="md" fullWidth>
        <DialogTitle>Detalle de expensa</DialogTitle>
        <DialogContent dividers>
          {detailsOpenFor && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                {detailsOpenFor.expense.description || `Expensa ${detailsOpenFor.expenseId}`}
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
                />
                {"  "} Total unidad: <Money value={detailsOpenFor.total} />
              </Typography>

              <Divider sx={{ mb: 2 }} />

              <Stack spacing={1}>
                {detailsOpenFor.expense.invoices.length === 0 && <Typography>No hay facturas.</Typography>}
                {detailsOpenFor.expense.invoices.map((inv) => (
                  <Box key={`dlg-inv-${inv.id}`} sx={{ borderRadius: 1, p: 1.25, bgcolor: "background.paper" }}>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" noWrap>
                          {inv.concept || inv.description || `Factura ${inv.id}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {inv.supplierName || "-"} • {inv.category || "-"}
                        </Typography>
                      </Box>
                      <Typography variant="subtitle2">${inv.amount?.toFixed(2) ?? "0.00"}</Typography>
                      {inv.filePath && (
                        <IconButton size="small" onClick={() => window.open(inv.filePath!, "_blank")}>
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
    </Layout>
  );
}
