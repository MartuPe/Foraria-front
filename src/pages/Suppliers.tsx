import { useEffect, useMemo, useState } from "react";
import {
  Card, CardContent, Typography, Chip, Stack, Button,
  TextField, MenuItem, Rating, Dialog, DialogContent,
  DialogTitle, IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

import { Layout } from "../components/layout";
import PageHeader from "../components/SectionHeader";
import NewSupplier from "../popups/NewSupplier";
import SupplierDetail from "../popups/SupplierDetail";
import { api } from "../api/axios";

type Supplier = {
  id: number;
  commercialName: string;
  businessName: string;
  cuit: string;
  supplierCategory: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  observations?: string;
  registrationDate: string;
  active: boolean;
  rating?: number;
};

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"Todas" | string>("Todas");

  // Popup: Form (alta / edición)
  const [openForm, setOpenForm] = useState(false);
  const [formId, setFormId] = useState<number | null>(null);
  const openCreate = () => { setFormId(null); setOpenForm(true); };
  const closeForm = () => setOpenForm(false);

  // Popup: Detalle
  const [openDetail, setOpenDetail] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const openDetailFor = (id: number) => { setDetailId(id); setOpenDetail(true); };
  const closeDetail = () => { setOpenDetail(false); setDetailId(null); };

  // Cargar lista desde backend
  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<Supplier[]>("/Supplier");
      setSuppliers(data);
    } catch (e) {
      console.error("Error cargando proveedores:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSuppliers(); }, []);

  const categories = useMemo(() => {
    const set = new Set(suppliers.map(s => s.supplierCategory));
    return ["Todas", ...Array.from(set)];
  }, [suppliers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return suppliers.filter(s => {
      const matchCat = category === "Todas" ? true : s.supplierCategory === category;
      const matchTxt =
        !q ||
        s.commercialName.toLowerCase().includes(q) ||
        (s.businessName ?? "").toLowerCase().includes(q) ||
        (s.email ?? "").toLowerCase().includes(q) ||
        (s.address ?? "").toLowerCase().includes(q) ||
        (s.contactPerson ?? "").toLowerCase().includes(q) ||
        s.cuit.toLowerCase().includes(q);
      return matchCat && matchTxt;
    });
  }, [suppliers, query, category]);

  const handleCreatedOrUpdated = async () => {
    await loadSuppliers();
    closeForm();
  };

  return (
    <Layout>
      <PageHeader
        title="Proveedores del Consorcio"
        actions={
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddCircleOutlineIcon />}
            onClick={openCreate}
            sx={{ borderRadius: 999, fontWeight: 600 }}
          >
            Nuevo proveedor
          </Button>
        }
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Buscar por nombre, CUIT, email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          size="small"
        />
        <TextField
          select
          size="small"
          label="Categoría"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          sx={{ width: { xs: "100%", sm: 220 } }}
        >
          {categories.map((c) => (
            <MenuItem key={c} value={c}>{c}</MenuItem>
          ))}
        </TextField>
      </Stack>

      {loading ? (
        <Typography>Cargando proveedores…</Typography>
      ) : filtered.length === 0 ? (
        <Typography>No se encontraron proveedores.</Typography>
      ) : (
        <Stack spacing={2}>
          {filtered.map((s) => (
            <Card key={s.id} variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Stack direction="row" alignItems="center" spacing={1.25} flexWrap="wrap">
                    <Typography variant="h6" color="primary">{s.commercialName}</Typography>
                    <Chip label={s.supplierCategory} size="small" />
                    {s.rating && (
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Rating value={s.rating} precision={0.1} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary">({s.rating.toFixed(1)})</Typography>
                      </Stack>
                    )}
                  </Stack>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityOutlinedIcon />}
                    onClick={() => openDetailFor(s.id)}
                  >
                    Ver Detalle
                  </Button>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {s.businessName}
                </Typography>
                <Stack direction="row" spacing={3} sx={{ mt: 1.5 }} flexWrap="wrap">
                  {s.phone && <Typography><PhoneOutlinedIcon fontSize="small" /> {s.phone}</Typography>}
                  {s.email && <Typography><EmailOutlinedIcon fontSize="small" /> {s.email}</Typography>}
                  {s.address && <Typography><PlaceOutlinedIcon fontSize="small" /> {s.address}</Typography>}
                </Stack>
                <Stack direction="row" spacing={3} sx={{ mt: 1 }} flexWrap="wrap">
                  {s.contactPerson && <Typography><PersonOutlineIcon fontSize="small" /> {s.contactPerson}</Typography>}
                  <Typography><CalendarMonthOutlinedIcon fontSize="small" /> {new Date(s.registrationDate).toLocaleDateString("es-AR")}</Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog open={openForm} onClose={closeForm} maxWidth="md" fullWidth>
        <DialogContent>
          <NewSupplier id={formId ?? undefined} onSuccess={handleCreatedOrUpdated} />
        </DialogContent>
      </Dialog>

      <Dialog open={openDetail} onClose={closeDetail} maxWidth="sm" fullWidth>
  <DialogTitle>
    Detalle del proveedor
    <IconButton
      aria-label="close"
      onClick={closeDetail}
      sx={{ position: "absolute", right: 8, top: 8 }}
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>
  <DialogContent dividers>
    {detailId && (
      <SupplierDetail
        id={detailId}
        onDeleted={async () => {
          await loadSuppliers(); // refresca lista
          closeDetail();          // cierra popup
        }}
      />
    )}
  </DialogContent>
</Dialog>

    </Layout>
  );
}
