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
  TextField,
  MenuItem,
  InputAdornment,
  Skeleton,
  Pagination,
  Box,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";

import { supplierService, Supplier } from "../../services/supplierService";
import NewSupplier from "../../popups/NewSupplier";
import SupplierDetail from "../../popups/SupplierDetail";
import PageHeader from "../../components/SectionHeader";
import { Layout } from "../../components/layout";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

// Helpers
const CATEGORIES = ["Mantenimiento", "Limpieza", "Seguridad", "Jardinería"] as const;
type SortKey = "nameAsc" | "nameDesc" | "dateNew" | "dateOld" | "category";

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
  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    sev: "success" | "error" | "info";
  }>({ open: false, msg: "", sev: "success" });

  const openSnack = useCallback(
    (msg: string, sev: "success" | "error" | "info" = "success") => {
      setSnack({ open: true, msg, sev });
    },
    []
  );

  // Controles de lista
  const [q, setQ] = useState(""); // búsqueda
  const [category, setCategory] = useState<string>(""); // filtro
  const [sort, setSort] = useState<SortKey>("nameAsc");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // Debounce básico para q (mejor UX)
  const [qDebounced, setQDebounced] = useState(q);
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [q]);

  const fetchSuppliers = useCallback(async () => {
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
  }, [openSnack]);

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
      openSnack("Proveedor eliminado ✅", "success");
      // Ajuste de paginación si quedó página “vacía”
      setPage((p) => {
        const total = filtered.length - 1; // uno menos tras borrar
        const maxPage = Math.max(1, Math.ceil(total / pageSize));
        return Math.min(p, maxPage);
      });
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

  // Filtro + búsqueda + orden
  const filtered = useMemo(() => {
    let list = suppliers;

    if (category) list = list.filter((s) => s.supplierCategory === category);

    if (qDebounced) {
      list = list.filter((s) => {
        const txt = `${s.commercialName ?? ""} ${s.businessName ?? ""} ${s.email ?? ""} ${
          s.phone ?? ""
        } ${s.supplierCategory ?? ""}`.toLowerCase();
        return txt.includes(qDebounced);
      });
    }

    const byDate = (d?: string) => (d ? new Date(d).getTime() : 0);

    list = [...list].sort((a, b) => {
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
          return (a.supplierCategory ?? "").localeCompare(b.supplierCategory ?? "");
        default:
          return 0;
      }
    });

    return list;
  }, [suppliers, qDebounced, category, sort]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    // reset page cuando cambian filtros/búsqueda/orden
    setPage(1);
  }, [qDebounced, category, sort]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  // Loading skeletons
  const SkeletonCard = () => (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width={220} height={28} />
            <Skeleton variant="text" width={280} />
            <Skeleton variant="text" width={200} />
          </Box>
          <Stack direction="row" spacing={1}>
            <Skeleton variant="rounded" width={130} height={36} />
            <Skeleton variant="rounded" width={120} height={36} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

  return(
    <div className="page">
      <PageHeader
        title="Proveedores del Consorcio"
        actions={
          <Button variant="contained" color="secondary" onClick={() => setOpenNew(true)}>
            + Nuevo Provedor
          </Button>


        }

        
      />

      {/* Controles */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} mb={2}>
        <TextField
          placeholder="Buscar por nombre, razón social, email, teléfono…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          label="Categoría"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {CATEGORIES.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Ordenar"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          sx={{ minWidth: 220 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SortIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        >
          <MenuItem value="nameAsc">Nombre (A→Z)</MenuItem>
          <MenuItem value="nameDesc">Nombre (Z→A)</MenuItem>
          <MenuItem value="dateNew">Alta (más nuevo)</MenuItem>
          <MenuItem value="dateOld">Alta (más viejo)</MenuItem>
          <MenuItem value="category">Categoría</MenuItem>
        </TextField>
      </Stack>

      {/* Lista */}
      <Stack spacing={2}>
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : filtered.length === 0 ? (
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                No encontramos proveedores
              </Typography>
              <Typography color="text.secondary" paragraph>
                Probá limpiar filtros o crear un nuevo proveedor.
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  setQ("");
                  setCategory("");
                  setSort("nameAsc");
                }}
                sx={{ mr: 1 }}
              >
                Limpiar filtros
              </Button>
              <Button variant="outlined" onClick={() => setOpenNew(true)}>
                Crear proveedor
              </Button>
            </CardContent>
          </Card>
        ) : (
          paged.map((s) => (
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

      {/* Paginación */}
      {!loading && filtered.length > pageSize && (
        <Stack alignItems="center" mt={2}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => setPage(p)}
            color="primary"
            shape="rounded"
            showFirstButton
            showLastButton
          />
        </Stack>
      )}

      {/* Crear */}
      <Dialog open={openNew} onClose={() => setOpenNew(false)} maxWidth="md" fullWidth>
        <DialogContent>
          <NewSupplier
            onSuccess={() => {
              setOpenNew(false);
              fetchSuppliers();
              openSnack("Proveedor creado ", "success");
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
                openSnack("Proveedor eliminado ", "success");
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
    </div>
  );

}
