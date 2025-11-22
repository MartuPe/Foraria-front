import { useState } from "react";
import { TextField, Button, MenuItem, CircularProgress } from "@mui/material";
import { ForariaStatusModal } from "../../components/StatCardForms";
import "../../styles/spent.css";
import { callService } from "../../services/callService";
import { mapCallToMeeting, Meeting } from "../../services/meetingService";

interface NewMeetProps {
  onCancel?: () => void;
  onCreated?: (meeting: Meeting) => void;
}

type FieldErrors = {
  title?: string;
  type?: string;
  description?: string;
};


// const API_BASE = process.env.REACT_APP_API_URL || "https://foraria-api-e7dac8bpewbgdpbj.brazilsouth-01.azurewebsites.net/api";

export default function NewMeet({ onCancel, onCreated }: NewMeetProps) {

  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
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

    if (!description.trim()) {
      next.description = "La descripción es obligatoria.";
    } else if (description.trim().length < 10) {
      next.description = "La descripción debe tener al menos 10 caracteres.";
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
        message:
          "No se pudo identificar tu usuario. Volvé a iniciar sesión e intentá nuevamente.",
      });
      return;
    }

    const consortiumId = Number(localStorage.getItem("consortiumId") || 0);
    if (!consortiumId) {
      setDialog({open: true, type: "error", message: "No se encontró el consorcio asociado. Verificá tu sesión o configuración.", });
      return;
    }

    try {
      setSubmitting(true);
      const call = await callService.create({
        userId,
        title: title.trim(),
        description: description.trim(),
        meetingType: type,
        consortiumId,
      });
      const newMeeting = mapCallToMeeting(call);
      onCreated?.(newMeeting);
      setTitle("");
      setType("");
      setDescription("");
      setDialog({ open: true, type: "success", message: "La reunión se creó correctamente.",});
    } catch (error: any) {
      console.error("Error creando llamada/reunión:", error);

      let friendlyMessage = "No se pudo crear la reunión. Intentá nuevamente más tarde.";

      if (error?.response?.status === 400) {
        friendlyMessage =
          "No se pudo crear la reunión. Verificá los datos e intentá nuevamente.";
      } else if (error?.response?.status === 403) {
        friendlyMessage =
          "No tenés permisos para crear reuniones. Verificá tu sesión.";
      }

      setDialog({
        open: true,
        type: "error",
        message: friendlyMessage,
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

        <div className="foraria-form-group">
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
            <div className="field-message field-message--error" role="alert" aria-live="polite">
              {fieldErrors.type}
            </div>
          )}
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
          <Button type="submit" className="foraria-gradient-button boton-crear-reclamo"disabled={submitting}>
            {submitting ? <CircularProgress size={20} /> : "Crear reunión"}
          </Button>
          <Button type="button" className="foraria-outlined-white-button" onClick={onCancel} disabled={submitting} >
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