import { FormEvent, useState } from "react";
import {
  TextField,
  Button,
  DialogActions,
  Typography,
  MenuItem,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import { supplierService, Supplier } from "../services/supplierService";

interface Props {
  onSuccess?: () => void; // el padre muestra el toast de éxito
}

export default function NewSupplier({ onSuccess }: Props) {
  const [form, setForm] = useState<Supplier>({
    commercialName: "",
    businessName: "",
    cuit: "",
    supplierCategory: "",
    phone: "",
    email: "",
    address: "",
    contactPerson: "",
    observations: "",
    active: true,
  });

  const [loading, setLoading] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supplierService.create(form);
      onSuccess?.(); // cierra modal + refresca + toast en el padre
    } catch {
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h5" textAlign="center" mb={2}>
        Nuevo Proveedor
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        }}
      >
        <TextField
          label="Nombre Comercial"
          name="commercialName"
          value={form.commercialName}
          onChange={handleChange}
          fullWidth
          required
        />

        <TextField
          label="Razón Social"
          name="businessName"
          value={form.businessName}
          onChange={handleChange}
          fullWidth
          required
        />

        <TextField
          label="CUIT"
          name="cuit"
          value={form.cuit}
          onChange={handleChange}
          fullWidth
          required
          inputProps={{ maxLength: 11, inputMode: "numeric", pattern: "\\d{11}" }}
          helperText="11 dígitos sin guiones"
        />

        <TextField
          label="Categoría"
          name="supplierCategory"
          value={form.supplierCategory}
          onChange={handleChange}
          fullWidth
          select
          required
        >
          <MenuItem value="Mantenimiento">Mantenimiento</MenuItem>
          <MenuItem value="Limpieza">Limpieza</MenuItem>
          <MenuItem value="Seguridad">Seguridad</MenuItem>
          <MenuItem value="Jardinería">Jardinería</MenuItem>
        </TextField>

        <TextField
          label="Teléfono"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          fullWidth
        />

        <TextField
          label="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          fullWidth
          type="email"
          required
        />

        <Box sx={{ gridColumn: "1 / -1" }}>
          <TextField
            label="Dirección"
            name="address"
            value={form.address}
            onChange={handleChange}
            fullWidth
          />
        </Box>

        <Box sx={{ gridColumn: "1 / -1" }}>
          <TextField
            label="Persona de Contacto"
            name="contactPerson"
            value={form.contactPerson}
            onChange={handleChange}
            fullWidth
          />
        </Box>

        <Box sx={{ gridColumn: "1 / -1" }}>
          <TextField
            label="Observaciones"
            name="observations"
            value={form.observations}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
          />
        </Box>
      </Box>

      <DialogActions sx={{ mt: 3, justifyContent: "center" }}>
        <Button variant="contained" color="primary" type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>

      <Snackbar
        open={errorOpen}
        autoHideDuration={3500}
        onClose={() => setErrorOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setErrorOpen(false)} variant="filled">
          Error al guardar proveedor ❌
        </Alert>
      </Snackbar>
    </form>
  );
}
