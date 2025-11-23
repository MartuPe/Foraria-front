import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Dialog,
  DialogContent,
  Snackbar,
  Alert,
  Pagination,
  Box,
  Paper,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { supplierService, Supplier } from "../../services/supplierService";
import NewSupplier from "../../components/modals/NewSupplier";
import SupplierDetail from "../../components/modals/SupplierDetail";
import PageHeader from "../../components/SectionHeader";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import AddOutlined from "@mui/icons-material/AddOutlined";
import BusinessIcon from "@mui/icons-material/Business";

const CATEGORIES = ["Mantenimiento", "Limpieza", "Seguridad", "Jardinería"] as const;
type SortKey = "nameAsc" | "nameDesc" | "dateNew" | "dateOld" | "category";
type SnackSeverity = "success" | "error" | "info";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [openNew, setOpenNew] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);
  const consortiumId = Number(localStorage.getItem("consortiumId"));

  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    sev: "success" as SnackSeverity,
  });

  const openSnack = useCallback(
    (msg: string, sev: SnackSeverity = "success") => {
      setSnack({ open: true, msg, sev });
    },
    []
  );

  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");
  const [category, setCategory] = useState<string>(""); // "" = Todos
  const [sort, setSort] = useState<SortKey>("nameAsc");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [q]);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await supplierService.getAll(consortiumId);

      if (!Array.isArray(data)) {
        setLoadError("Respuesta inesperada del servidor");
        setSuppliers([]);
      } else {
        setSuppliers(data);
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.error || err.message?.toString() || "Error inesperado";
      if (
        String(message).includes("404") ||
        String(message).toLowerCase().includes("not found")
      ) {
        setSuppliers([]);
      } else {
        setLoadError("No se pudieron cargar los proveedores");
      }
    } finally {
      setLoading(false);
    }
  }, [consortiumId]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const askDelete = (id: number) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (toDeleteId == null) return;
    try {
      await supplierService.remove(toDeleteId);
      setSuppliers((prev) => prev.filter((s) => s.id !== toDeleteId));
      openSnack("Proveedor eliminado", "success");
    } catch {
      openSnack("No se pudo eliminar el proveedor", "error");
    } finally {
      setConfirmOpen(false);
      setToDeleteId(null);
    }
  };

  const openDetailFor = (id: number) => {
    setSelectedId(id);
    setOpenDetail(true);
  };

  const filtered = useMemo(() => {
    let list = suppliers;

    // filtro por categoría (si hay)
    if (category) list = list.filter((s) => s.supplierCategory === category);

    // filtro por texto
    if (qDebounced)
      list = list.filter((s) =>
        `${s.commercialName} ${s.businessName} ${s.email} ${s.phone} ${s.supplierCategory}`
          .toLowerCase()
          .includes(qDebounced)
      );

    const byDate = (d?: string) => (d ? new Date(d).getTime() : 0);

    return [...list].sort((a, b) => {
      switch (sort) {
        case "nameAsc":
          return (a.commercialName ?? "").localeCompare(b.commercialName ?? "");
        case "nameDesc":
          return (b.commercialName ?? "").localeCompare(a.commercialName ?? "");
        case "dateNew":
          return byDate(b.registrationDate) - byDate(a.registrationDate);
        case "dateOld":
          return byDate(a.registrationDate) - byDate(b.registrationDate);
        case "category":
          return (a.supplierCategory ?? "").localeCompare(
            b.supplierCategory ?? ""
          );
        default:
          return 0;
      }
    });
  }, [suppliers, qDebounced, category, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => setPage(1), [qDebounced, category, sort]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Tabs para el PageHeader: igual que Reclamos, pero por categoría
  const supplierTabs = useMemo(
    () => [
      { label: "Todos", value: "" },
      ...CATEGORIES.map((c) => ({ label: c, value: c })),
    ],
    []
  );

  return (
    <Box className="foraria-page-container">
      <PageHeader
        title="Gestión de Proveedores"
        showSearch
        onSearchChange={setQ}
        actions={
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddOutlined />}
            onClick={() => setOpenNew(true)}
            sx={{ px: 2.5, fontWeight: 600, textTransform: "none" }}
          >
            Nuevo Proveedor
          </Button>
        }
        tabs={supplierTabs}
        selectedTab={category}                 // "" = Todos
        onTabChange={(v) => setCategory(v as string)}
      />

      <Stack spacing={2}>
        {loadError ? (
          <Paper sx={{ p: 6, borderRadius: 3, textAlign: "center" }}>
            <BusinessIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6">{loadError}</Typography>
            <Button variant="contained" onClick={fetchSuppliers} sx={{ mt: 2 }}>
              Reintentar
            </Button>
          </Paper>
        ) : filtered.length === 0 ? (
          <Paper sx={{ p: 6, borderRadius: 3, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">
              No se encontraron proveedores
            </Typography>
          </Paper>
        ) : (
          paged.map((s) => (
            <Card
              key={s.id}
              variant="outlined"
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 4px 16px rgba(8,61,119,0.06)",
                transition: "transform .15s ease, box-shadow .15s ease",
                "&:hover": {
                  boxShadow: { xs: 1, sm: 4 },
                  transform: { xs: "none", sm: "translateY(-2px)" },
                },
              }}
            >
              <CardContent>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={1}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        cursor: "pointer",
                        "&:hover": { textDecoration: "underline" },
                      }}
                      onClick={() => openDetailFor(s.id!)}
                    >
                      {s.commercialName}
                    </Typography>
                    <Typography variant="body2">
                      {s.businessName} – {s.supplierCategory}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {s.email} {s.phone && `| ${s.phone}`}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => openDetailFor(s.id!)}
                    >
                      Ver
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

      {filtered.length > pageSize && (
        <Stack alignItems="center" mt={2}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => setPage(p)}
            shape="rounded"
          />
        </Stack>
      )}

      <Dialog open={openNew} onClose={() => setOpenNew(false)} maxWidth="md" fullWidth>
        <DialogContent>
          <NewSupplier
            consortiumId={consortiumId}
            onSuccess={() => {
              setOpenNew(false);
              fetchSuppliers();
              openSnack("Proveedor creado correctamente", "success");
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          {selectedId && (
            <SupplierDetail
              id={selectedId}
              onDeleted={() => {
                setOpenDetail(false);
                fetchSuppliers();
                openSnack("Proveedor eliminado", "success");
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="¿Eliminar proveedor?"
        message="Esta acción no se puede deshacer."
        confirmText="Eliminar"
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.sev} variant="filled">
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
