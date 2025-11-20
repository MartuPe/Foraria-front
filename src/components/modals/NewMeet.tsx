import { useState, useMemo } from "react";
import { TextField, Button, MenuItem, CircularProgress } from "@mui/material";
import { ForariaStatusModal } from "../../components/StatCardForms";
import "../../styles/spent.css";

interface NewMeetProps {
  onCancel?: () => void;
  onCreated?: (data: {
    title: string;
    type: string;
    location: string;
    date: string;
    time: string;
    description: string;
  }) => void;
}

type FieldErrors = {
  title?: string;
  type?: string;
  location?: string;
  date?: string;
  time?: string;
  description?: string;
};

const API_BASE = process.env.REACT_APP_API_URL || "https://localhost:7245/api";

export default function NewMeet({
  onCancel,
  onCreated,
}: NewMeetProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const [dialog, setDialog] = useState<{
    open: boolean;
    type: "success" | "error";
    message: string;
  }>({
    open: false,
    type: "success",
    message: "",
  });

  const now = useMemo(() => new Date(), []);
  const todayISO = useMemo(
    () => now.toISOString().split("T")[0],
    [now]
  );
  const minTimeToday = useMemo(
    () => now.toTimeString().slice(0, 5),
    [now]
  );
  const isTodaySelected = date === todayISO;

  const validateBeforeSubmit = (): boolean => {
    const next: FieldErrors = {};

    if (!title.trim()) {
      next.title = "El título es obligatorio.";
    } else if (title.trim().length < 5) {
      next.title = "El título debe tener al menos 5 caracteres.";
    }

    if (!type) {
      next.type = "Debés seleccionar un tipo de reunión.";
    }

    if (!location) {
      next.location = "Debés seleccionar una ubicación.";
    }

    if (!date) {
      next.date = "La fecha es obligatoria.";
    } else if (date < todayISO) {
      next.date = "La fecha no puede ser anterior a hoy.";
    }

    if (!time) {
      next.time = "La hora es obligatoria.";
    }

    if (!description.trim()) {
      next.description = "La descripción es obligatoria.";
    } else if (description.trim().length < 10) {
      next.description = "La descripción debe tener al menos 10 caracteres.";
    }

    if (date && time) {
      const selectedDateTime = new Date(`${date}T${time}:00`);
      const nowReal = new Date();
      if (selectedDateTime.getTime() < nowReal.getTime()) {
        next.time =
          "La fecha y hora deben ser posteriores al momento actual.";
      }
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setFieldErrors({});

    if (!validateBeforeSubmit()) return;

    const userId = Number(localStorage.getItem("userId") || 0);
    if (!userId) {
      setDialog({
        open: true,
        type: "error",
        message: "No se pudo identificar tu usuario. Volvé a iniciar sesión e intentá nuevamente.",
      });
      return;
    }

    const payloadForm = { title, type, location, date, time, description };
    const payloadApi = {
      userId,
      ...payloadForm,
    };

    try {
      setSubmitting(true);

      const res = await fetch(`${API_BASE}/calls`, {
        method: "POST",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify(payloadApi),
      });

      if (!res.ok) {
        let friendlyMessage = "No se pudo crear la reunión. Intentá nuevamente más tarde.";

        if (res.status === 400) {
          friendlyMessage = "No se pudo crear la reunión. Verificá los datos e intentá nuevamente.";
        } else if (res.status === 403) {
          friendlyMessage = "No tenés permisos para crear reuniones. Verificá tu sesión.";
        }

        console.error("Error creando llamada/reunión:", res.status);
        setDialog({ open: true, type: "error", message: friendlyMessage, });
        return;
      }

      // const call: CallDto = await res.json(); (?)

      onCreated?.(payloadForm);
      setTitle("");
      setType("");
      setLocation("");
      setDate("");
      setTime("");
      setDescription("");
      setDialog({open: true, type: "success", message: "La reunión se creó correctamente.", });
    } catch (err) {
      console.error("Error de red al crear reunión:", err);
      setDialog({
        open: true,
        type: "error",
        message: "No pudimos conectarnos con el servidor. Intentá nuevamente más tarde.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setDialog((prev) => ({ ...prev, open: false }));
    if (dialog.type === "success") {
      onCancel?.();
    }
  };

  return (
    <>
      <form className="foraria-form" onSubmit={handleSubmit}>
        <h2 className="foraria-form-title">Nueva reunión</h2>

        <div className="foraria-form-group">
          <label className="foraria-form-label">Título de la reunión</label>
          <TextField
            fullWidth
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (fieldErrors.title) {
                setFieldErrors((prev) => ({ ...prev, title: undefined }));
              }
            }}
            placeholder="Ej: Asamblea Ordinaria Mensual"
            variant="outlined"
            className="foraria-form-input"
            error={!!fieldErrors.title}
          />
          {fieldErrors.title && (
            <div className="field-message field-message--error" aria-live="polite">
              {fieldErrors.title}
            </div>
          )}
        </div>

        <div className="foraria-form-group container-items">
          <div className="foraria-form-group group-size">
            <label className="foraria-form-label">Tipo de reunión</label>
            <TextField
              select
              fullWidth
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                if (fieldErrors.type) {
                  setFieldErrors((prev) => ({ ...prev, type: undefined }));
                }
              }}
              className="foraria-form-input"
              error={!!fieldErrors.type}
            >
              <MenuItem value="Asamblea">Asamblea</MenuItem>
              <MenuItem value="Emergencia">Emergencia</MenuItem>
              <MenuItem value="Mantenimiento">Mantenimiento</MenuItem>
              <MenuItem value="Social">Social / Evento</MenuItem>
            </TextField>
            {fieldErrors.type && (
              <div className="field-message field-message--error" role="alert" aria-live="polite" >
                {fieldErrors.type}
              </div>
            )}
          </div>

          <div className="foraria-form-group group-size">
            <label className="foraria-form-label">Ubicación</label>
            <TextField
              select
              fullWidth
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                if (fieldErrors.location) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    location: undefined,
                  }));
                }
              }}
              className="foraria-form-input"
              error={!!fieldErrors.location}
            >
              <MenuItem value="Virtual">Virtual (videollamada)</MenuItem>
              <MenuItem value="SUM">SUM</MenuItem>
              <MenuItem value="Hall">Hall de entrada</MenuItem>
              <MenuItem value="Otro">Otro espacio</MenuItem>
            </TextField>
            {fieldErrors.location && (
              <div className="field-message field-message--error" role="alert" aria-live="polite">
                {fieldErrors.location}
              </div>
            )}
          </div>
        </div>

        <div className="foraria-form-group container-items">
          <div className="foraria-form-group group-size">
            <label className="foraria-form-label">Fecha</label>
            <TextField
              fullWidth
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (fieldErrors.date) {
                  setFieldErrors((prev) => ({ ...prev, date: undefined }));
                }
              }}
              placeholder="dd/mm/aaaa"
              variant="outlined"
              className="foraria-form-input"
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: todayISO }}
              error={!!fieldErrors.date}
            />
            {fieldErrors.date && (
              <div className="field-message field-message--error" role="alert" aria-live="polite">
                {fieldErrors.date}
              </div>
            )}
          </div>

          <div className="foraria-form-group group-size">
            <label className="foraria-form-label">Hora</label>
            <TextField
              fullWidth
              type="time"
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
                if (fieldErrors.time) {
                  setFieldErrors((prev) => ({ ...prev, time: undefined }));
                }
              }}
              placeholder="--:--"
              variant="outlined"
              className="foraria-form-input"
              InputLabelProps={{ shrink: true }}
              inputProps={
                isTodaySelected ? { min: minTimeToday } : undefined
              }
              error={!!fieldErrors.time}
            />
            {fieldErrors.time && (
              <div className="field-message field-message--error" role="alert" aria-live="polite">
                {fieldErrors.time}
              </div>
            )}
          </div>
        </div>

        <div className="foraria-form-group">
          <label className="foraria-form-label">Descripción</label>
          <TextField
            fullWidth
            multiline
            minRows={4}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (fieldErrors.description) {
                setFieldErrors((prev) => ({
                  ...prev,
                  description: undefined,
                }));
              }
            }}
            placeholder="Detalle de los temas a tratar en la reunión"
            className="foraria-form-textarea"
            error={!!fieldErrors.description}
          />
          {fieldErrors.description && (
            <div className="field-message field-message--error" role="alert" aria-live="polite">
              {fieldErrors.description}
            </div>
          )}
        </div>

        <div className="foraria-form-actions">
          <Button type="submit" className="foraria-gradient-button boton-crear-reclamo" disabled={submitting}>
            {submitting ? <CircularProgress size={20} /> : "Crear reunión"}
          </Button>
          <Button type="button" className="foraria-outlined-white-button" onClick={onCancel} disabled={submitting}>
            Cancelar
          </Button>
        </div>
      </form>

      <ForariaStatusModal
        open={dialog.open}
        onClose={handleDialogClose}
        variant={dialog.type}
        title={dialog.type === "success" ? "Reunión creada" : "Error"}
        message={dialog.message}
        primaryActionLabel="Aceptar"
      />
    </>
  );
}