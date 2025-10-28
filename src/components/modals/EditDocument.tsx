import { useState } from "react";
import { 
  TextField, 
  Button, 
  MenuItem, 
  Box, 
  Typography, 
  Switch, 
  FormControlLabel,
  CircularProgress 
} from "@mui/material";
import { useMutation } from "../../hooks/useMutation";

interface Document {
  id: number;
  title: string;
  description: string;
  category: string;
  fileName: string;
  isPublic: boolean;
}

interface EditDocumentProps {
  document: Document;
  categories: string[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditDocument({ document, categories, onSuccess, onCancel }: EditDocumentProps) {
  const [title, setTitle] = useState(document.title);
  const [description, setDescription] = useState(document.description);
  const [category, setCategory] = useState(document.category);
  const [isPublic, setIsPublic] = useState(document.isPublic);
  const [formError, setFormError] = useState<string | null>(null);

  const { mutate, loading, error } = useMutation(`/Documents/${document.id}`, "put");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("El título es obligatorio.");
      return;
    }

    try {
      await mutate({
        title: title.trim(),
        description: description.trim(),
        category,
        isPublic
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error al actualizar documento:", err);
    }
  };

  return (
    <form className="foraria-form" onSubmit={handleSubmit}>
      <h2 className="foraria-form-title">Editar Documento</h2>

      <div className="foraria-form-group">
        <label className="foraria-form-label">Título del Documento</label>
        <TextField
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          variant="outlined"
          required
        />
      </div>

      <div className="foraria-form-group">
        <label className="foraria-form-label">Categoría</label>
        <TextField
          select
          fullWidth
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          variant="outlined"
          required
        >
          {categories.map(cat => (
            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
          ))}
        </TextField>
      </div>

      <div className="foraria-form-group">
        <label className="foraria-form-label">Descripción</label>
        <TextField
          fullWidth
          multiline
          minRows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          variant="outlined"
        />
      </div>

      <div className="foraria-form-group">
        <FormControlLabel
          control={
            <Switch
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              color="primary"
            />
          }
          label="Documento público (visible para todos los usuarios)"
        />
      </div>

      <Box sx={{ p: 2, bgcolor: "grey.100", borderRadius: 1, mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Archivo actual:</strong> {document.fileName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Para cambiar el archivo, elimina este documento y crea uno nuevo.
        </Typography>
      </Box>

      {formError && <p style={{ color: "red" }}>{formError}</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <div className="foraria-form-actions">
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          disabled={loading}
          className="foraria-gradient-button"
        >
          {loading ? <CircularProgress size={20} /> : "Actualizar Documento"}
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
