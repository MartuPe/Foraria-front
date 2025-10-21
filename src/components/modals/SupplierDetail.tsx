// src/popups/SupplierDetail.tsx
import { useEffect, useState } from "react";
import {
  Stack, Typography, Divider, Chip, CircularProgress, Button,
  Dialog, DialogTitle, DialogActions
} from "@mui/material";
import { api } from "../../api/axios";

type Props = { id: number; onDeleted?: () => void };

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

export default function SupplierDetail({ id, onDeleted }: Props) {
  const [data, setData] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<Supplier>(`/Supplier/${id}`);
        setData(res.data);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    try {
      await api.delete(`/Supplier/${id}`);
      setConfirmOpen(false);
      onDeleted?.(); // el padre cierra modal + refresca + muestra toast
    } catch (err) {
      console.error("Error al eliminar proveedor", err);
    }
  };

  if (loading) return <Stack alignItems="center" p={3}><CircularProgress /></Stack>;
  if (!data) return <Typography p={2}>Proveedor no encontrado</Typography>;

  return (
    <Stack gap={1.2} p={1}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" color="primary" sx={{ wordBreak: "break-word" }}>
          {data.commercialName}
        </Typography>
        <Button
          variant="contained"
          color="error"
          size="small"
          onClick={() => setConfirmOpen(true)}
        >
          Eliminar
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary">{data.businessName}</Typography>

      <Stack direction="row" gap={1} flexWrap="wrap">
        <Chip label={data.supplierCategory} />
        <Chip
          label={data.active ? "Activo" : "Inactivo"}
          color={data.active ? "success" : "default"}
        />
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      <Typography><b>CUIT:</b> {data.cuit}</Typography>
      {data.email && <Typography><b>Email:</b> {data.email}</Typography>}
      {data.phone && <Typography><b>Teléfono:</b> {data.phone}</Typography>}
      {data.address && <Typography><b>Dirección:</b> {data.address}</Typography>}
      {data.contactPerson && <Typography><b>Contacto:</b> {data.contactPerson}</Typography>}
      <Typography>
        <b>Fecha de alta:</b>{" "}
        {new Date(data.registrationDate).toLocaleDateString("es-AR")}
      </Typography>

      {data.observations && (
        <>
          <Divider sx={{ my: 1.5 }} />
          <Typography variant="subtitle2">Observaciones</Typography>
          <Typography variant="body2" color="text.secondary">{data.observations}</Typography>
        </>
      )}

      {/* Confirmación de borrado */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>¿Eliminar este proveedor?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button color="error" onClick={handleDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
