import { useState } from "react";
import { Stack, TextField, Button, Typography } from "@mui/material";
import { residenceService } from "../../services/residenceService";
import { ForariaStatusModal } from "../StatCardForms";

type Props = {
  onSuccess: () => void;
};

type FieldErrors = {
  tower?: string;
  floor?: string;
  number?: string;
  consortiumId?: string;
};

export default function NewResidence({ onSuccess }: Props) {
  const [form, setForm] = useState({
    number: "",
    floor: "",
    tower: "",
    consortiumId: "",
  });
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [dialog, setDialog] = useState<{
    open: boolean;
    type: "success" | "error";
    message: string;
  }>({
    open: false,
    type: "success",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateBeforeSubmit = (): boolean => {
    const next: FieldErrors = {};

    if (!form.tower.trim()) {
      next.tower = "La torre es obligatoria.";
    }

    if (!form.floor.trim()) {
      next.floor = "El piso es obligatorio.";
    } else if (isNaN(Number(form.floor))) {
      next.floor = "El piso debe ser un número.";
    }

    if (!form.number.trim()) {
      next.number = "El número es obligatorio.";
    } else if (isNaN(Number(form.number))) {
      next.number = "El número debe ser un número válido.";
    }

    if (!form.consortiumId.trim()) {
      next.consortiumId = "El ID de consorcio es obligatorio.";
    } else if (isNaN(Number(form.consortiumId)) || Number(form.consortiumId) <= 0) {
      next.consortiumId = "El ID de consorcio debe ser un número mayor a 0.";
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (!validateBeforeSubmit()) return;

    setLoading(true);
    try {
      await residenceService.create({
        number: Number(form.number),
        floor: Number(form.floor),
        tower: form.tower.trim(),
        consortiumId: Number(form.consortiumId),
      });

      setDialog({
        open: true,
        type: "success",
        message: "Residencia creada correctamente.",
      });

      setForm({
        number: "",
        floor: "",
        tower: "",
        consortiumId: "",
      });
    } catch (err) {
      console.error("Error al crear residencia", err);
      setDialog({
        open: true,
        type: "error",
        message: "No se pudo crear la residencia.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setDialog((prev) => ({ ...prev, open: false }));
    if (dialog.type === "success") {
      onSuccess();
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <Typography variant="h6">Nueva residencia</Typography>

          <TextField
            label="Torre"
            name="tower"
            value={form.tower}
            onChange={handleChange}
            error={Boolean(fieldErrors.tower)}
          />
          {fieldErrors.tower && (
            <div
              className="field-message field-message--error"
              role="alert"
              aria-live="polite"
            >
              {fieldErrors.tower}
            </div>
          )}

          <TextField
            label="Piso"
            name="floor"
            type="number"
            value={form.floor}
            onChange={handleChange}
            error={Boolean(fieldErrors.floor)}
          />
          {fieldErrors.floor && (
            <div
              className="field-message field-message--error"
              role="alert"
              aria-live="polite"
            >
              {fieldErrors.floor}
            </div>
          )}

          <TextField
            label="Número"
            name="number"
            type="number"
            value={form.number}
            onChange={handleChange}
            error={Boolean(fieldErrors.number)}
          />
          {fieldErrors.number && (
            <div
              className="field-message field-message--error"
              role="alert"
              aria-live="polite"
            >
              {fieldErrors.number}
            </div>
          )}

          <TextField
            label="Consorcio ID"
            name="consortiumId"
            type="number"
            value={form.consortiumId}
            onChange={handleChange}
            error={Boolean(fieldErrors.consortiumId)}
          />
          {fieldErrors.consortiumId && (
            <div
              className="field-message field-message--error"
              role="alert"
              aria-live="polite"
            >
              {fieldErrors.consortiumId}
            </div>
          )}

          <Button variant="contained" type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Crear residencia"}
          </Button>
        </Stack>
      </form>

      <ForariaStatusModal
        open={dialog.open}
        onClose={handleDialogClose}
        variant={dialog.type}
        title={dialog.type === "success" ? "Residencia creada" : "Error"}
        message={dialog.message}
        primaryActionLabel="Aceptar"
      />
    </>
  );
}
