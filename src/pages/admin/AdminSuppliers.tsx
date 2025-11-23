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
  Chip,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddOutlined from "@mui/icons-material/AddOutlined";
import BusinessIcon from "@mui/icons-material/Business";

import { supplierService, Supplier } from "../../services/supplierService";
import NewSupplier from "../../components/modals/NewSupplier";
import SupplierDetail from "../../components/modals/SupplierDetail";
import PageHeader from "../../components/SectionHeader";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

type SnackSeverity = "success" | "error" | "info";

const CATEGORIES = ["Mantenimiento", "Limpieza", "Seguridad", "Jardinería"] as const;

export default function AdminSuppliers() {
  // ignoramos el primer valor del estado para que no marque 'loading' como unused
  const [, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [openNew, setOpenNew] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);
  const consortiumId = Number(localStorage.getItem("consortiumId"));

  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

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

  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [q]);

  const fetchSuppliers = useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const data = await supplierService.getAll(consortiumId);
      setSuppliers(Array.isArray(data) ? data : []);
    } catch {
      setLoadError("No se pudieron cargar los proveedores");
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
    if (!toDeleteId) return;
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

  const filtered = useMemo(() => {
    return suppliers.filter((s) => {
      const text = `${s.commercialName} ${s.businessName} ${s.email} ${s.phone} ${s.supplierCategory}`.toLowerCase();
      const matchCategory = !category || s.supplierCategory === category;
      const matchSearch = !qDebounced || text.includes(qDebounced);
      return matchCategory && matchSearch;
    });
  }, [suppliers, qDebounced, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const chipStyles = {
    ml: 1,
    borderRadius: 2,
    fontSize: "0.75rem",
    bgcolor: "#f4f4f4",
    borderColor: "#e0e0e0",
    "& .MuiChip-label": { px: 1.2 },
  } as const;

  const tabs = [
    { label: "Todos", value: "" },
    ...CATEGORIES.map((c) => ({ label: c, value: c })),
  ];

  return (
    <Box className="foraria-page-container">
      <PageHeader
        title="Gestión de Proveedores"
        showSearch
        onSearchChange={setQ}
        tabs={tabs}
        selectedTab={category}
        onTabChange={(v) => setCategory(v as string)}
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
      />

      <Stack spacing={2}>
        {loadError ? (
          <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3 }}>
            <BusinessIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6">{loadError}</Typography>
          </Paper>
        ) : filtered.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3 }}>
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
                    {/* Título + categoría estilo Foros */}
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography
                        variant="h6"
                        sx={{
                          cursor: "pointer",
                          "&:hover": { textDecoration: "underline" },
                        }}
                        onClick={() => {
                          setSelectedId(s.id!);
                          setOpenDetail(true);
                        }}
                      >
                        {s.commercialName}
                      </Typography>

                      <Chip
                        size="small"
                        label={s.supplierCategory || "Sin categoría"}
                        color="default"
                        variant="outlined"
                        sx={chipStyles}
                      />
                    </Stack>

                    <Typography variant="body2">{s.businessName}</Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      {s.email} {s.phone && `| ${s.phone}`}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => {
                        setSelectedId(s.id!);
                        setOpenDetail(true);
                      }}
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
