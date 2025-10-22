// AdminCargaFactura.tsx
import { useState } from "react";
import { Button, Dialog, DialogContent } from "@mui/material";
import PageHeader from "../../components/SectionHeader";
import InvoiceUploadForm from "../../components/modals/CargaFactura"; // ajusta la ruta si es necesario

export default function AdminCargaFactura() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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
          <InvoiceUploadForm />
        </DialogContent>
      </Dialog>

      <div style={{ padding: 16 }} />
    </div>
  );
}
