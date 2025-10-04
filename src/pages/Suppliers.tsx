import { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Button,
  TextField,
  MenuItem,
  Divider,
  Rating,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link } from "react-router-dom";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";

type Category = "Mantenimiento" | "Limpieza" | "Seguridad" | "Jardinería";

type Supplier = {
  id: string;
  name: string;
  businessName: string;
  category: Category;
  phone: string;
  email: string;
  address: string;
  contactPerson: string;
  since: string;
  contractsCount: number;
  monthlyCost: number;
  rating: number;
};

const DEFAULT_SUPPLIERS: Supplier[] = [
  {
    id: "sup-1",
    name: "Mantenimiento Integral SA",
    businessName: "Mantenimiento Integral Sociedad Anónima",
    category: "Mantenimiento",
    phone: "+54 11 4567-8901",
    email: "contacto@mantenimientointegral.com",
    address: "Av. Corrientes 1234, CABA",
    contactPerson: "Juan Pérez",
    since: "14/12/2023",
    contractsCount: 2,
    monthlyCost: 73000,
    rating: 4.5,
  },
  {
    id: "sup-2",
    name: "Limpieza Profesional",
    businessName: "Limpieza Profesional SRL",
    category: "Limpieza",
    phone: "+54 11 2345-6789",
    email: "admin@limpiezaprofesional.com",
    address: "San Martín 567, CABA",
    contactPerson: "María González",
    since: "19/5/2023",
    contractsCount: 1,
    monthlyCost: 35000,
    rating: 5.0,
  },
  {
    id: "sup-3",
    name: "Seguridad Total",
    businessName: "Seguridad Total y Asociados SA",
    category: "Seguridad",
    phone: "+54 11 3456-7890",
    email: "info@seguridadtotal.com",
    address: "Rivadavia 890, CABA",
    contactPerson: "Carlos Rodríguez",
    since: "9/2/2023",
    contractsCount: 1,
    monthlyCost: 60000,
    rating: 4.2,
  },
  {
    id: "sup-4",
    name: "Jardinería Verde",
    businessName: "Jardinería Verde SRL",
    category: "Jardinería",
    phone: "+54 11 5678-9012",
    email: "contacto@jardineriaverde.com",
    address: "Florida 456, CABA",
    contactPerson: "Ana López",
    since: "9/4/2023",
    contractsCount: 1,
    monthlyCost: 15000,
    rating: 4.3,
  },
];

function formatARS(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Suppliers() {
  const [suppliers] = useState<Supplier[]>(DEFAULT_SUPPLIERS);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"Todas" | Category>("Todas");

  const categories = useMemo<("Todas" | Category)[]>(
    () => ["Todas", ...Array.from(new Set(suppliers.map(s => s.category))) as Category[]],
    [suppliers]
  );

  const kpis = useMemo(() => {
    const total = suppliers.length;
    const activeContracts = suppliers.reduce((acc, s) => acc + (s.contractsCount > 0 ? 1 : 0), 0);
    const uniqueCats = new Set(suppliers.map(s => s.category)).size;
    const avg =
      suppliers.length
        ? (suppliers.reduce((acc, s) => acc + s.rating, 0) / suppliers.length)
        : 0;
    return {
      total,
      activeContracts,
      uniqueCats,
      avg: Math.round(avg * 10) / 10,
    };
  }, [suppliers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return suppliers.filter(s => {
      const matchCat = category === "Todas" ? true : s.category === category;
      const matchTxt =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.businessName.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        s.contactPerson.toLowerCase().includes(q);
      return matchCat && matchTxt;
    });
  }, [suppliers, query, category]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "secondary.main", py: 3 }}>
      <Box
        sx={{
          maxWidth: 1000,
          mx: "auto",
          bgcolor: "background.paper",
          borderRadius: 3,
          p: 3,
          boxShadow: 2,
        }}
      >
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={1}
        >
          <Typography variant="h5" color="primary">
            Proveedores del Consorcio
          </Typography>

          <Button
            component={Link}
            to="/nuevoProveedor"
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            sx={{ borderRadius: 999, fontWeight: 600 }}
          >
            Nuevo proveedor
          </Button>
        </Stack>

        {/* KPIs */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
          <Card variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Proveedores</Typography>
              <Typography variant="h6"> {kpis.total} </Typography>
            </CardContent>
          </Card>
          <Card variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Contratos Activos</Typography>
              <Typography variant="h6" color="success.main">{kpis.activeContracts}</Typography>
            </CardContent>
          </Card>
          <Card variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Categorías</Typography>
              <Typography variant="h6" color="secondary.main">{kpis.uniqueCats}</Typography>
            </CardContent>
          </Card>
          <Card variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Promedio</Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Rating value={kpis.avg} precision={0.1} readOnly />
                <Typography variant="h6">{kpis.avg}</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        {/* Buscador + filtro */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
          sx={{ mt: 2 }}
        >
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
            onChange={(e) => setCategory(e.target.value as any)}
            sx={{ width: { xs: "100%", sm: 220 } }}
          >
            {categories.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {/* Listado */}
        <Stack spacing={2.5} sx={{ mt: 2 }}>
          {filtered.map((s) => (
            <Card key={s.id} variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Stack direction="row" alignItems="center" spacing={1.25} flexWrap="wrap">
                    <Typography variant="h6" color="primary">{s.name}</Typography>
                    <Chip label={s.category} size="small" />
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Rating value={s.rating} precision={0.1} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary">
                        ({s.rating.toFixed(1)})
                      </Typography>
                    </Stack>
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
                  <Typography variant="body2" color="text.secondary"><PhoneOutlinedIcon fontSize="small" /> {s.phone}</Typography>
                  <Typography variant="body2" color="text.secondary"><EmailOutlinedIcon fontSize="small" /> {s.email}</Typography>
                  <Typography variant="body2" color="text.secondary"><PlaceOutlinedIcon fontSize="small" /> {s.address}</Typography>
                  <Typography variant="body2" color="text.secondary"><DescriptionOutlinedIcon fontSize="small" /> {s.contractsCount} contrato{s.contractsCount !== 1 ? "s" : ""}</Typography>
                </Stack>

                <Stack direction="row" spacing={3} sx={{ mt: 1 }} flexWrap="wrap">
                  <Typography variant="body2" color="text.secondary"><PersonOutlineIcon fontSize="small" /> Contacto: {s.contactPerson}</Typography>
                  <Typography variant="body2" color="text.secondary"><CalendarMonthOutlinedIcon fontSize="small" /> Desde: {s.since}</Typography>
                  <Typography variant="body2" color="text.secondary"><AttachMoneyOutlinedIcon fontSize="small" /> Contratos activos: {formatARS(s.monthlyCost)}/mes</Typography>
                </Stack>

                <Divider sx={{ mt: 2 }} />
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
