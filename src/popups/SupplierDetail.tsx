import { useEffect, useState } from "react";
import { Stack, Typography, Divider, Chip, CircularProgress } from "@mui/material";
import { api } from "../api/axios";

type Props = { id: number };

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

export default function SupplierDetail({ id }: Props) {
  const [data, setData] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get<Supplier>(`/Supplier/${id}`); // GET /api/Supplier/{id}
        if (alive) setData(res.data);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  if (loading) return <Stack alignItems="center" p={3}><CircularProgress /></Stack>;
  if (!data)   return <Typography p={2}>Proveedor no encontrado</Typography>;

  return (
    <Stack gap={1.2} p={1}>
      <Typography variant="h5" color="primary">{data.commercialName}</Typography>
      <Typography variant="body2" color="text.secondary">{data.businessName}</Typography>

      <Stack direction="row" gap={1} alignItems="center">
        <Chip size="small" label={data.supplierCategory} />
        <Chip size="small" label={data.active ? "Activo" : "Inactivo"} color={data.active ? "success" : "default"} />
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      <Typography><b>CUIT:</b> {data.cuit}</Typography>
      {data.email && <Typography><b>Email:</b> {data.email}</Typography>}
      {data.phone && <Typography><b>Teléfono:</b> {data.phone}</Typography>}
      {data.address && <Typography><b>Dirección:</b> {data.address}</Typography>}
      {data.contactPerson && <Typography><b>Contacto:</b> {data.contactPerson}</Typography>}
      <Typography><b>Fecha alta:</b> {new Date(data.registrationDate).toLocaleDateString("es-AR")}</Typography>

      {data.observations && (
        <>
          <Divider sx={{ my: 1.5 }} />
          <Typography variant="subtitle2">Observaciones</Typography>
          <Typography variant="body2" color="text.secondary">{data.observations}</Typography>
        </>
      )}
    </Stack>
  );
}
