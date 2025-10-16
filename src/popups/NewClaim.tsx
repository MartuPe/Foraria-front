import { useState } from "react";
import { TextField, Button, MenuItem, Box, Typography, CircularProgress } from "@mui/material";
import { useDropzone } from "react-dropzone";
import { useMutation } from "../hooks/useMutation";

interface ClaimFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ClaimForm({ onSuccess, onCancel }: ClaimFormProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Mantenimiento");
  const [priority, setPriority] = useState("Media");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const { mutate, loading, error } = useMutation("https://localhost:7245/api/Claim", "post");

  const onDrop = (acceptedFiles: File[]) => {
    setFiles([...files, ...acceptedFiles]);
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
    if (!title.trim()) {
      setFormError("El título es obligatorio.");
      return false;
    }
    if (!description.trim()) {
      setFormError("La descripción es obligatoria.");
      return false;
    }
    if (!category) {
      setFormError("Debe seleccionar una categoría.");
      return false;
    }
    if (!priority) {
      setFormError("Debe seleccionar una prioridad.");
      return false;
    }
    return true;
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
  setFormError(null);

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
      user_id: 1, //remplazar por usuario real
      residenceId: 1,
    };

    await mutate(payload);
    alert("✅ Reclamo creado correctamente");

    setTitle("");
    setDescription("");
    setCategory("Mantenimiento");
    setPriority("Media");
    setFiles([]);
    if (onSuccess) onSuccess();
  } catch (err) {
    console.error("Error al crear reclamo:", err);
    alert("Error al crear reclamo");
  }
};

  return (
    <form className="foraria-form" onSubmit={handleSubmit}>
      <h2 className="foraria-form-title">Crear Nuevo Reclamo</h2>

      <div className="foraria-form-group">
        <label className="foraria-form-label">Título del Reclamo</label>
        <TextField
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Describe brevemente el problema..."
          variant="outlined"
          required
        />
      </div>

      <div className="foraria-form-row categoria-prioridad-contenedor">
        <div className="foraria-form-group categoria-prioridad-select">
          <label className="foraria-form-label">Categoría</label>
          <TextField
            select
            fullWidth
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            variant="outlined"
            required
          >
            <MenuItem value="Mantenimiento">Mantenimiento</MenuItem>
            <MenuItem value="Servicios">Servicios</MenuItem>
            <MenuItem value="Otro">Otro</MenuItem>
          </TextField>
        </div>

        <div className="foraria-form-group categoria-prioridad-select">
          <label className="foraria-form-label">Prioridad</label>
          <TextField
            select
            fullWidth
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            variant="outlined"
            required
          >
            <MenuItem value="Alta">Alta</MenuItem>
            <MenuItem value="Media">Media</MenuItem>
            <MenuItem value="Baja">Baja</MenuItem>
          </TextField>
        </div>
      </div>

      <div className="foraria-form-group">
        <label className="foraria-form-label">Descripción Detallada</label>
        <TextField
          fullWidth
          multiline
          minRows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Proporciona todos los detalles relevantes del problema..."
          variant="outlined"
          required
        />
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
            <Typography variant="subtitle2">Archivos seleccionados:</Typography>
            <ul>
              {files.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </Box>
        )}
      </div>

      {formError && <p style={{ color: "red", marginTop: "10px" }}>{formError}</p>}
      {error && <p style={{ color: "red", marginTop: "10px" }}>Error: {error}</p>}

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
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
