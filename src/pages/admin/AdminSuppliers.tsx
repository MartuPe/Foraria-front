import { useEffect, useMemo, useState, useCallback } from "react";
import { Card, CardContent, Typography, Stack, Button, Dialog, DialogContent, Snackbar, Alert, TextField, MenuItem, InputAdornment, Skeleton, Pagination, Box, Select, Paper } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SortIcon from "@mui/icons-material/Sort";
import { supplierService, Supplier } from "../../services/supplierService";
import NewSupplier from "../../components/modals/NewSupplier";
import SupplierDetail from "../../components/modals/SupplierDetail";
import PageHeader from "../../components/SectionHeader";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import AddOutlined from "@mui/icons-material/AddOutlined";
import InventoryIcon from "@mui/icons-material/Inventory";
import PeopleIcon from "@mui/icons-material/People"
import BusinessIcon from "@mui/icons-material/Business"; 
const CATEGORIES = ["Mantenimiento", "Limpieza", "Seguridad", "Jardinería"] as const;
type SortKey = "nameAsc" | "nameDesc" | "dateNew" | "dateOld" | "category";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
const [loadError, setLoadError] = useState<string | null>(null);
  const [openNew, setOpenNew] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);
              const [totalSuppliers] = useState<number>(0);
            const [activeSuppliers] = useState<number>(0);
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
 const [roleFilter, setRoleFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("");
  const [sort, setSort] = useState<SortKey>("nameAsc");
  const [page, setPage] = useState(1);
  const pageSize = 6;
 const [, setSearch] = useState("");
  const consortiumId = Number(localStorage.getItem("consortiumId"));

  const [qDebounced, setQDebounced] = useState(q);
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [q]);

const fetchSuppliers = useCallback(async () => {
  setLoading(true);
  setLoadError(null); // Limpiar error previo
  
  
  try {
    const data = await supplierService.getAll(consortiumId);

    if (!Array.isArray(data)) {
      console.error("Respuesta inesperada al obtener proveedores:", data);
      setLoadError("Respuesta inesperada del servidor al cargar proveedores.");
      setSuppliers([]);
    } else {
      setSuppliers(data);
      setLoadError(null); // Éxito: limpiar error
    }
  } catch (err: any) {
    console.error("Error al obtener proveedores:", err);
    
    // Extraer mensaje de error
    const errorMsg = err?.response?.data?.error || 
                    err?.response?.data?.message || 
                    err?.message ||
                    String(err);
    
    // Detectar si es 404
    const is404 = err?.response?.status === 404 || 
                  errorMsg.toLowerCase().includes("404") || 
                  errorMsg.toLowerCase().includes("not found");
    
    const isNotFound = errorMsg.toLowerCase().includes("no se encontraron");
    
    if (is404 || isNotFound) {
      // Para 404, lista vacía sin error
      setSuppliers([]);
      setLoadError(null);
    } else {
      // Para otros errores, mostrar mensaje
      setSuppliers([]);
      setLoadError("No se pudieron cargar los proveedores. Intentá nuevamente más tarde.");
    }
  } finally {
    setLoading(false);
  }
}, [consortiumId]);

  const askDelete = (id: number) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };

  useEffect(() => {
  fetchSuppliers();
}, [fetchSuppliers]);

  const handleDelete = async () => {
    if (toDeleteId == null) return;
    try {
      await supplierService.remove(toDeleteId);
      setSuppliers((prev) => prev.filter((s) => s.id !== toDeleteId));
      openSnack("Proveedor eliminado", "success");

      setPage((p) => {
        const total = filtered.length - 1;
        const maxPage = Math.max(1, Math.ceil(total / pageSize));
        return Math.min(p, maxPage);
      });
    } catch (err) {
      console.error("Error al eliminar proveedor:", err);
      openSnack("No se pudo eliminar el proveedor. Intentá nuevamente.", "error");
    } finally {
      setConfirmOpen(false);
      setToDeleteId(null);
    }
  };

  const openDetailFor = (id: number) => {
    setSelectedId(id);
    setOpenDetail(true);
  };
console.log(localStorage.getItem("consortiumId"))
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    setPage(1);
  }, [qDebounced, category, sort]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const SkeletonCard = () => (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={1}
        >
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

  return (
    <Box className="foraria-page-container">
       <PageHeader
        title="Gestión de Proveedores"
        showSearch
        onSearchChange={(q) => {
          setSearch(q);

          setQ(q);
        }}
        actions={
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddOutlined />}
            onClick={() => setOpenNew(true)}
            sx={{
              px: 2.5,
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "0 6px 16px rgba(0,0,0,.08)",
            }}
          >
            Nuevo Proveedor
          </Button>
        }
        stats={[
          

          { icon: <InventoryIcon />, title: "Total Proveedores", value: totalSuppliers, color: "primary" },
          { icon: <PeopleIcon />, title: "Activos", value: activeSuppliers, color: "success" },
        ]}
        filters={[
          <Select
            key="roles"
            value={roleFilter}
            size="small"
            sx={{ minWidth: 180 }}
            onChange={(e) => setRoleFilter(e.target.value as string)}
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="approved">Aprobados</MenuItem>
            <MenuItem value="pending">Pendientes</MenuItem>
            <MenuItem value="blocked">Bloqueados</MenuItem>
          </Select>,

          <Stack
            key="supplier-filters"
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            mb={0}
            sx={{ alignItems: "center" }}
          >

            <TextField
              select
              label="Categoría"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              size="small"
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
              size="small"
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
          </Stack>,
        ]}
      />

      
  <Stack spacing={2}>
  { loadError ? (
    // NUEVO: Estado de error
    <Paper
      sx={{
        p: 6,
        textAlign: "center",
        border: "1px dashed #d0d0d0",
        borderRadius: 3,
        backgroundColor: "#fafafa",
      }}
    >
      <BusinessIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
      <Typography variant="h5" color="text.primary" gutterBottom>
        Error al cargar proveedores
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {loadError}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => fetchSuppliers()}
      >
        Reintentar
      </Button>
    </Paper>
  ) : suppliers.length === 0 && !q && !category ? (
    // NUEVO: Estado inicial vacío (sin proveedores, sin filtros)
    <Paper
      sx={{
        p: 6,
        textAlign: "center",
        border: "1px dashed #d0d0d0",
        borderRadius: 3,
        backgroundColor: "#fafafa",
      }}
    >
      <BusinessIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
      <Typography variant="h5" color="text.primary" gutterBottom>
        No hay proveedores registrados
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
        Aún no se han registrado proveedores en el sistema.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Comienza agregando tu primer proveedor.
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        size="large"
        startIcon={<AddOutlined />}
        onClick={() => setOpenNew(true)}
      >
        Crear Primer Proveedor
      </Button>
    </Paper>
  ) : filtered.length === 0 ? (
    // Estado filtrado vacío (hay proveedores pero ninguno coincide con filtros)
    <Paper
      sx={{
        p: 4,
        textAlign: "center",
        border: "1px solid #f0f0f0",
        borderRadius: 3,
      }}
    >
      <Typography variant="h6" color="text.secondary">
        No se encontraron proveedores con los filtros aplicados
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
        Intenta cambiar los filtros o realizar una nueva búsqueda
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
    </Paper>
  ) : (
    // Lista de proveedores
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
                {s.email && <>{s.email} </>}
                {s.phone && <>| {s.phone}</>}
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

        {!loading && filtered.length > pageSize && (
          <Stack alignItems="center" mt={2}>
            <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" shape="rounded" showFirstButton showLastButton />
          </Stack>
        )}

      <Dialog
        open={openNew}
        onClose={() => setOpenNew(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <NewSupplier
            consortiumId={consortiumId}
            onSuccess={() => {
              setOpenNew(false);
              fetchSuppliers();
              openSnack("Proveedor creado correctamente ✅", "success");
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          {selectedId != null && (
            <SupplierDetail
              id={selectedId}
              onDeleted={() => {
                setOpenDetail(false);
                setSelectedId(null);
                fetchSuppliers();
                openSnack("Proveedor eliminado ✅", "success");
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
        cancelText="Cancelar"
      />

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
    </Box>
  );
}