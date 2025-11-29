import { useState } from "react";
import { TextField, Button, MenuItem, Box, Typography, CircularProgress, } from "@mui/material";
import { useDropzone } from "react-dropzone";
import { useMutation } from "../../hooks/useMutation";
import { ForariaStatusModal } from "../../components/StatCardForms";

interface ClaimFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

type FieldErrors = {
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
};

export default function ClaimForm({ onSuccess, onCancel }: ClaimFormProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Mantenimiento");
  const [priority, setPriority] = useState("Media");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);

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

  const { mutate, loading, error } = useMutation(
    "https://localhost:7245/Claim",
    "post"
  );

  const onDrop = (acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
      "video/*": [],
    },
    multiple: true,
  });

  const validateBeforeSubmit = (): boolean => {
    const next: FieldErrors = {};

    if (!title.trim()) {
      next.title = "El título es obligatorio.";
    } else if (title.trim().length < 5) {
      next.title = "El título debe tener al menos 5 caracteres.";
    }

    if (!description.trim()) {
      next.description = "La descripción es obligatoria.";
    } else if (description.trim().length < 10) {
      next.description = "La descripción debe tener al menos 10 caracteres.";
    }

    if (!category) {
      next.category = "Debe seleccionar una categoría.";
    }

    if (!priority) {
      next.priority = "Debe seleccionar una prioridad.";
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (!validateBeforeSubmit()) return;

    try {
      let base64File: string | null = null;
      if (files.length > 0) {
        base64File = await toBase64(files[0]);
      }

      const payload = {
        title,
        description,
        priority,
        category,
        archive: base64File,
        user_id: Number(localStorage.getItem("userId")),
        residenceId: localStorage.getItem("residenceId"),
        consortiumId: localStorage.getItem("consortiumId"),
        state: "hola",
      };

      await mutate(payload);

      setDialog({
        open: true,
        type: "success",
        message: "Tu reclamo fue creado correctamente.",
      });

      setTitle("");
      setDescription("");
      setCategory("Mantenimiento");
      setPriority("Media");
      setFiles([]);
    } catch (err: any) {
      console.error("Error al crear reclamo:", err);

      setDialog({
        open: true,
        type: "error",
        message: "No se pudo crear el reclamo.",
      });
    }
  };

  const handleDialogClose = () => {
    setDialog((prev) => ({ ...prev, open: false }));
    if (dialog.type === "success" && onSuccess) onSuccess();
  };

  return (
    <>
      <form className="foraria-form" onSubmit={handleSubmit}>
        <h2 className="foraria-form-title">Crear Nuevo Reclamo</h2>

        <div className="foraria-form-group">
          <label className="foraria-form-label">Título del Reclamo</label>
          <TextField
            fullWidth
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (fieldErrors.title) {
                setFieldErrors((prev) => ({ ...prev, title: undefined }));
              }
            }}
            placeholder="Describe brevemente el problema..."
            variant="outlined"
            error={Boolean(fieldErrors.title)}
          />
          {fieldErrors.title && (
            <div
              className="field-message field-message--error"
              role="alert"
              aria-live="polite"
            >
              {fieldErrors.title}
            </div>
          )}
        </div>

        <div className="foraria-form-row categoria-prioridad-contenedor">
          <div className="foraria-form-group categoria-prioridad-select">
            <label className="foraria-form-label">Categoría</label>
            <TextField
              select
              fullWidth
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                if (fieldErrors.category) {
                  setFieldErrors((prev) => ({ ...prev, category: undefined }));
                }
              }}
              variant="outlined"
              error={Boolean(fieldErrors.category)}
            >
              <MenuItem value="Mantenimiento">Mantenimiento</MenuItem>
              <MenuItem value="Servicios">Servicios</MenuItem>
              <MenuItem value="Otro">Otro</MenuItem>
            </TextField>
            {fieldErrors.category && (
              <div
                className="field-message field-message--error"
                role="alert"
                aria-live="polite"
              >
                {fieldErrors.category}
              </div>
            )}
          </div>

          <div className="foraria-form-group categoria-prioridad-select">
            <label className="foraria-form-label">Prioridad</label>
            <TextField
              select
              fullWidth
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                if (fieldErrors.priority) {
                  setFieldErrors((prev) => ({ ...prev, priority: undefined }));
                }
              }}
              variant="outlined"
              error={Boolean(fieldErrors.priority)}
            >
              <MenuItem value="Alta">Alta</MenuItem>
              <MenuItem value="Media">Media</MenuItem>
              <MenuItem value="Baja">Baja</MenuItem>
            </TextField>
            {fieldErrors.priority && (
              <div
                className="field-message field-message--error"
                role="alert"
                aria-live="polite"
              >
                {fieldErrors.priority}
              </div>
            )}
          </div>
        </div>

        <div className="foraria-form-group">
          <label className="foraria-form-label">Descripción Detallada</label>
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
            placeholder="Proporciona todos los detalles relevantes del problema..."
            variant="outlined"
            error={Boolean(fieldErrors.description)}
          />
          {fieldErrors.description && (
            <div
              className="field-message field-message--error"
              role="alert"
              aria-live="polite"
            >
              {fieldErrors.description}
            </div>
          )}
        </div>

        <div className="foraria-form-group">
          <label className="foraria-form-label">Adjuntar Archivo</label>
          <Box
            {...getRootProps()}
            sx={{
              border: "2px dashed #083D77",
              borderRadius: "8px",
              padding: "20px",
              textAlign: "center",
              backgroundColor: isDragActive ? "#FEFBEF" : "#F2F5F8",
              cursor: "pointer",
              color: "#083D77",
            }}
          >
            <input {...getInputProps()} />
            <Typography>
              {isDragActive ? "Suelta los archivos aquí..." : "Haz clic o arrastra archivos aquí"}
            </Typography>
          </Box>

          {files.length > 0 && (
            <Box mt={2}>
              <Typography variant="subtitle2">
                Archivos seleccionados:
              </Typography>
              <ul>
                {files.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </Box>
          )}
        </div>

        {error && (
          <div
            className="field-message field-message--error field-message--general"
            role="alert"
            aria-live="polite"
          > No se pudo crear el reclamo.
          </div>
        )}

        <div className="foraria-form-actions">
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            disabled={loading}
            className="foraria-gradient-button"
          >
            {loading ? <CircularProgress size={20} /> : "Enviar Reclamo"}
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onCancel}
            disabled={loading}
            className="foraria-outlined-white-button"
          > Cancelar
          </Button>
        </div>
      </form>

      <ForariaStatusModal
        open={dialog.open}
        onClose={handleDialogClose}
        variant={dialog.type}
        title={dialog.type === "success" ? "Reclamo creado" : "Error"}
        message={dialog.message}
        primaryActionLabel="Aceptar"
      />
    </>
  );
}
