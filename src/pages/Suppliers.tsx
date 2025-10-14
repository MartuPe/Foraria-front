// src/pages/Suppliers.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Card, CardContent, Typography, Chip, Stack, Button,
  TextField, MenuItem, Rating, Dialog, DialogContent
} from "@mui/material";
import { Layout } from "../components/layout";
import PageHeader from "../components/SectionHeader";
import NewSupplier from "../popups/NewSupplier";
import { api } from "../api/axios";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

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

  // 🔹 Estado local para el popup (como antes)
  const [openNewSupplier, setOpenNewSupplier] = useState(false);
  const handleOpenNewSupplier = () => setOpenNewSupplier(true);
  const handleCloseNewSupplier = () => setOpenNewSupplier(false);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<Supplier[]>("/Supplier"); // GET /api/Supplier
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
        (s.contactPerson ?? "").toLowerCase().includes(q);
      return matchCat && matchTxt;
    });
  }, [suppliers, query, category]);

  const handleCreated = async () => {
    await loadSuppliers();       // refrescamos la lista
    handleCloseNewSupplier();    // cerramos el modal
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
            onClick={handleOpenNewSupplier}
            sx={{ borderRadius: 999, fontWeight: 600 }}
          >
            Nuevo proveedor
          </Button>
        }
      />

      {/* Buscador + filtro */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Buscar proveedores…"
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

      {/* Listado */}
      {loading ? (
        <Typography variant="body1">Cargando proveedores…</Typography>
      ) : filtered.length === 0 ? (
        <Typography variant="body1">No se encontraron proveedores.</Typography>
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
                    <Typography variant="h6" color="primary">
                      {s.commercialName}
                    </Typography>
                    <Chip label={s.supplierCategory} size="small" />
                    {s.rating != null && (
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Rating value={s.rating} precision={0.1} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary">
                          ({s.rating.toFixed(1)})
                        </Typography>
                      </Stack>
                    )}
                  </Stack>

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityOutlinedIcon />}
                    sx={{ borderRadius: 999, px: 1.5, fontWeight: 600 }}
                  >
                    Ver Detalle
                  </Button>
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {s.businessName}
                </Typography>

                <Stack direction="row" spacing={3} sx={{ mt: 1.5 }} flexWrap="wrap">
                  {s.phone && (
                    <Typography variant="body2" color="text.secondary">
                      <PhoneOutlinedIcon fontSize="small" /> {s.phone}
                    </Typography>
                  )}
                  {s.email && (
                    <Typography variant="body2" color="text.secondary">
                      <EmailOutlinedIcon fontSize="small" /> {s.email}
                    </Typography>
                  )}
                  {s.address && (
                    <Typography variant="body2" color="text.secondary">
                      <PlaceOutlinedIcon fontSize="small" /> {s.address}
                    </Typography>
                  )}
                </Stack>

                <Stack direction="row" spacing={3} sx={{ mt: 1 }} flexWrap="wrap">
                  {s.contactPerson && (
                    <Typography variant="body2" color="text.secondary">
                      <PersonOutlineIcon fontSize="small" /> Contacto: {s.contactPerson}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    <CalendarMonthOutlinedIcon fontSize="small" />{" "}
                    {new Date(s.registrationDate).toLocaleDateString("es-AR")}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Popup (estado local, como antes) */}
      <Dialog open={openNewSupplier} onClose={handleCloseNewSupplier} maxWidth="md" fullWidth>
        <DialogContent>
          <NewSupplier onSuccess={handleCreated} />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
