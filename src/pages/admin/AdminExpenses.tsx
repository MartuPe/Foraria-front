// AdminCargaFactura.tsx
import { useState, useEffect } from "react";
import { Button, Dialog, DialogContent, Box, Stack } from "@mui/material";
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
}

export default function AdminCargaFactura() {
  const [open, setOpen] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Traer facturas del backend
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<Invoice[]>("https://localhost:7245/api/Invoice");
      setInvoices(data);
    } catch (err) {
      console.error("Error al cargar facturas", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <div className="page">
      <PageHeader
        title="Carga de Facturas"
        actions={
          <Button variant="contained" color="secondary" onClick={handleOpen}>
            + Cargar Factura
          </Button>
        }
        tabs={[
          { label: "Todas", value: "todas" },
          { label: "Pendientes", value: "pendientes" },
          { label: "Procesadas", value: "procesadas" },
        ]}
        selectedTab={"todas"}
        onTabChange={() => {}}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
     <DialogContent>
  <InvoiceUploadForm
    onSuccess={() => {
      handleClose();  // cerrar modal
      fetchInvoices(); // recargar facturas
    }}
  />
</DialogContent>
      </Dialog>

      <Box sx={{ padding: 2 }}>
        <Stack spacing={2}>
          {loading && <div>Cargando facturas...</div>}
          {!loading && invoices.length === 0 && <div>No hay facturas cargadas.</div>}

          {!loading &&
            invoices.map((inv) => {
             
              const files: InfoFile[] = inv.filePath
                ? inv.filePath.split(",").map((name) => ({
                    url: name, 
                    type: name.split(".").pop(),
                  }))
                : [];

              return (
                <InfoCard
                  key={inv.id}
                  title={inv.concept}
                  subtitle={`Proveedor: ${inv.supplierName}`}
                  description={inv.description ?? ""}
                  price={inv.amount.toFixed(2)}
                  fields={[
                    { label: "Número de factura", value: inv.invoiceNumber },
                    { label: "Categoría", value: inv.category },
                    { label: "Fecha emisión", value: new Date(inv.dateOfIssue).toLocaleDateString() },
                    { label: "Fecha vencimiento", value: new Date(inv.expirationDate).toLocaleDateString() },
                  ]}
                  files={files}
                  filesCount={files.length}
                  showDivider
                />
              );
            })}
        </Stack>
      </Box>
    </div>
  );
}
