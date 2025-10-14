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
  Snackbar,
  Alert,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { supplierService, Supplier } from "../services/supplierService";
import NewSupplier from "../popups/NewSupplier";
import SupplierDetail from "../popups/SupplierDetail";
import PageHeader from "../components/SectionHeader";
import { Layout } from "../components/layout";
import ConfirmDialog from "../components/ui/ConfirmDialog";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [openNew, setOpenNew] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Confirmación de borrado desde la grilla
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);

  // Toast
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: "success" | "error" | "info" }>(
    { open: false, msg: "", sev: "success" }
  );
  const openSnack = (msg: string, sev: "success" | "error" | "info" = "success") =>
    setSnack({ open: true, msg, sev });

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await supplierService.getAll();
      setSuppliers(data);
    } catch (err) {
      console.error("❌ Error al obtener proveedores:", err);
      openSnack("Error al cargar proveedores ❌", "error");
    } finally {
      setLoading(false);
    }
  };

  const askDelete = (id: number) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (toDeleteId == null) return;
    try {
      await supplierService.remove(toDeleteId);
      setSuppliers((prev) => prev.filter((s) => s.id !== toDeleteId));
      openSnack("Proveedor eliminado ✅", "success");
    } catch {
      openSnack("Error al eliminar proveedor ❌", "error");
    } finally {
      setConfirmOpen(false);
      setToDeleteId(null);
    }
  };

  const openDetailFor = (id: number) => {
    setSelectedId(id);
    setOpenDetail(true);
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
          <CircularProgress />
        </div>
      </Layout>
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
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={1}
                >
                  <div>
                    {/* TÍTULO CLICKEABLE -> abre detalle */}
                    <Typography
                      variant="h6"
                      color="primary"
                      sx={{
                        cursor: "pointer",
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                        wordBreak: "break-word",
                      }}
                      onClick={() => openDetailFor(s.id!)}
                      title="Ver detalle"
                    >
                      {s.commercialName}
                    </Typography>

                    <Typography color="text.secondary">
                      {s.businessName} – {s.supplierCategory}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {s.email && <>📧 {s.email} </>}
                      {s.phone && <>| ☎️ {s.phone}</>}
                    </Typography>
                  </div>

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => openDetailFor(s.id!)}
                    >
                      Ver detalle
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteOutlineIcon />}
                      onClick={() => askDelete(s.id!)}
                    >
                      Eliminar
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>

      {/* Crear */}
      <Dialog open={openNew} onClose={() => setOpenNew(false)} maxWidth="md" fullWidth>
        <DialogContent>
          <NewSupplier
            onSuccess={() => {
              setOpenNew(false);
              fetchSuppliers();
              openSnack("Proveedor creado ✅", "success");
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Detalle */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          {selectedId != null && (
            <SupplierDetail
              id={selectedId}
              onDeleted={() => {
                setOpenDetail(false);
                setSelectedId(null);
                fetchSuppliers();
                openSnack("Proveedor eliminado", "success");
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmación de borrado desde la grilla */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="¿Eliminar proveedor?"
        message="Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {/* Snackbar global */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.sev}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );

  return <Layout>{content}</Layout>;
}
