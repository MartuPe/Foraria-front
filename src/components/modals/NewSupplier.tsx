import { FormEvent, useState } from "react";
import { TextField, Button, DialogActions, Typography, MenuItem, Box, } from "@mui/material";
import { supplierService, CreateSupplier } from "../../services/supplierService";
import { ForariaStatusModal } from "../StatCardForms";

interface Props {
  onSuccess?: () => void;
  consortiumId: number;
}

type FieldErrors = {
  commercialName?: string;
  businessName?: string;
  cuit?: string;
  supplierCategory?: string;
  phone?: string;
  email?: string;
};

export default function NewSupplier({ onSuccess, consortiumId }: Props) {
  const [form, setForm] = useState<CreateSupplier>({
    commercialName: "",
    businessName: "",
    cuit: "",
    supplierCategory: "",
    phone: "",
    email: "",
    address: "",
    contactPerson: "",
    observations: "",
    consortiumId,
  });

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [dialog, setDialog] = useState<{
    open: boolean;
    message: string;
  }>({
    open: false,
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let v = value;

    if (name === "cuit") {
      v = value.replace(/\D+/g, "").slice(0, 11);
    }

    setForm((prev) => ({ ...prev, [name]: v }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};
    const emailRegex = /^\S+@\S+\.\S+$/;

    if (!form.commercialName.trim()) {
      next.commercialName = "El nombre comercial es obligatorio.";
    }

    if (!form.businessName.trim()) {
      next.businessName = "La razón social es obligatoria.";
    }

    if (!form.cuit.trim()) {
      next.cuit = "El CUIT es obligatorio.";
    } else if (!/^\d{11}$/.test(form.cuit)) {
      next.cuit = "El CUIT debe tener exactamente 11 dígitos.";
    }

    if (!form.supplierCategory) {
      next.supplierCategory = "Seleccioná una categoría.";
    }

    const email = (form.email ?? "").trim();
    if (!email) {
      next.email = "El email es obligatorio.";
    } else if (!emailRegex.test(email)) {
      next.email = "Ingresá un email válido.";
    }

    const phoneRaw = (form.phone ?? "").trim();
    if (phoneRaw) {
      const digits = phoneRaw.replace(/\D+/g, "");
      if (!digits.length) {
        next.phone = "Ingresá un teléfono válido.";
      }
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!consortiumId || consortiumId <= 0) {
      setDialog({
        open: true,
        message: "No se encontró un consorcio válido para asociar el proveedor.",
      });
      return;
    }

    setFieldErrors({});
    if (!validate()) return;

    setLoading(true);
    try {
      await supplierService.create({ ...form, consortiumId });
      onSuccess?.();
    } catch (err) {
      console.error("Error al guardar proveedor", err);
      setDialog({
        open: true,
        message: "No se pudo guardar el proveedor. Intentá nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setDialog((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
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
          <div>
            <TextField
              label="Nombre Comercial"
              name="commercialName"
              value={form.commercialName}
              onChange={handleChange}
              fullWidth
              required
              error={Boolean(fieldErrors.commercialName)}
            />
            {fieldErrors.commercialName && (
              <div
                className="field-message field-message--error"
                role="alert"
                aria-live="polite"
              >
                {fieldErrors.commercialName}
              </div>
            )}
          </div>

          <div>
            <TextField
              label="Razón Social"
              name="businessName"
              value={form.businessName}
              onChange={handleChange}
              fullWidth
              required
              error={Boolean(fieldErrors.businessName)}
            />
            {fieldErrors.businessName && (
              <div
                className="field-message field-message--error"
                role="alert"
                aria-live="polite"
              >
                {fieldErrors.businessName}
              </div>
            )}
          </div>

          <div>
            <TextField
              label="CUIT"
              name="cuit"
              value={form.cuit}
              onChange={handleChange}
              fullWidth
              required
              inputProps={{ maxLength: 11, inputMode: "numeric", pattern: "\\d{11}" }}
              helperText="11 dígitos sin guiones"
              error={Boolean(fieldErrors.cuit)}
            />
            {fieldErrors.cuit && (
              <div
                className="field-message field-message--error"
                role="alert"
                aria-live="polite"
              >
                {fieldErrors.cuit}
              </div>
            )}
          </div>

          <div>
            <TextField
              label="Categoría"
              name="supplierCategory"
              value={form.supplierCategory}
              onChange={handleChange}
              fullWidth
              select
              required
              error={Boolean(fieldErrors.supplierCategory)}
            >
              <MenuItem value="Mantenimiento">Mantenimiento</MenuItem>
              <MenuItem value="Limpieza">Limpieza</MenuItem>
              <MenuItem value="Seguridad">Seguridad</MenuItem>
              <MenuItem value="Jardinería">Jardinería</MenuItem>
            </TextField>
            {fieldErrors.supplierCategory && (
              <div
                className="field-message field-message--error"
                role="alert"
                aria-live="polite"
              >
                {fieldErrors.supplierCategory}
              </div>
            )}
          </div>

          <div>
            <TextField
              label="Teléfono"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              fullWidth
              error={Boolean(fieldErrors.phone)}
            />
            {fieldErrors.phone && (
              <div
                className="field-message field-message--error"
                role="alert"
                aria-live="polite"
              >
                {fieldErrors.phone}
              </div>
            )}
          </div>

          <div>
            <TextField
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              type="email"
              required
              error={Boolean(fieldErrors.email)}
            />
            {fieldErrors.email && (
              <div
                className="field-message field-message--error"
                role="alert"
                aria-live="polite"
              >
                {fieldErrors.email}
              </div>
            )}
          </div>

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
      </form>

      <ForariaStatusModal
        open={dialog.open}
        onClose={handleDialogClose}
        variant="error"
        title="Error"
        message={dialog.message}
        primaryActionLabel="Aceptar"
      />
    </>
  );
}
