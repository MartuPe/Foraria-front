import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Dialog,
  DialogContent,
  CircularProgress,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import { supplierService, Supplier } from "../services/supplierService";
import NewSupplier from "../popups/NewSupplier";
import PageHeader from "../components/SectionHeader";
import { Layout } from "../components/layout";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [openNew, setOpenNew] = useState(false);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await supplierService.getAll();
      setSuppliers(data);
    } catch (err) {
      console.error("❌ Error al obtener proveedores:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar este proveedor?")) return;
    try {
      await supplierService.remove(id);
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      alert("Proveedor eliminado ✅");
    } catch {
      alert("Error al eliminar proveedor ❌");
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
        <CircularProgress />
      </div>
    );
  }

  const content = (
    <>
      <PageHeader
        title="Proveedores del Consorcio"
        actions={
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => setOpenNew(true)}
            sx={{ borderRadius: 999, fontWeight: 600 }}
          >
            Nuevo proveedor
          </Button>
        }
      />

      <Stack spacing={2}>
        {suppliers.length === 0 ? (
          <Typography color="text.secondary">No hay proveedores aún.</Typography>
        ) : (
          suppliers.map((s) => (
            <Card key={s.id} variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={1}
                >
                  <div>
                    <Typography variant="h6" color="primary">
                      {s.commercialName}
                    </Typography>
                    <Typography color="text.secondary">
                      {s.businessName} – {s.supplierCategory}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      📧 {s.email} | ☎️ {s.phone}
                    </Typography>
                  </div>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => handleDelete(s.id!)}
                  >
                    Eliminar
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>

      <Dialog open={openNew} onClose={() => setOpenNew(false)} maxWidth="md" fullWidth>
        <DialogContent>
          <NewSupplier onSuccess={() => {
            setOpenNew(false);
            fetchSuppliers();
          }} />
        </DialogContent>
      </Dialog>
    </>
  );

  return <Layout>{content}</Layout>;
}
