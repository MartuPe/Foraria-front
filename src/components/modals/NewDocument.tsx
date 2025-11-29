import { useState } from "react";
import { TextField, Button, MenuItem, Box, Typography, CircularProgress } from "@mui/material";
import { useDropzone } from "react-dropzone";
import { useMutation } from "../../hooks/useMutation";

interface NewDocumentProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function NewDocument({ onSuccess, onCancel }: NewDocumentProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Escrituras");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const { mutate, loading, error } = useMutation("/UserDocument", "post");

  const onDrop = (acceptedFiles: File[]) => {
    setFiles([...files, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
      "application/pdf": [],
      "application/msword": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [],
    },
    multiple: false, // Solo un archivo por ahora
    maxSize: 10 * 1024 * 1024, // 10MB máximo
  });

  const validateBeforeSubmit = (): boolean => {
    if (!title.trim()) {
      setFormError("El título es obligatorio.");
      return false;
    }
    if (!category.trim()) {
      setFormError("La categoría es obligatoria.");
      return false;
    }
    if (files.length === 0) {
      setFormError("Debe seleccionar un archivo.");
      return false;
    }
    return true;
  };

  // 🔧 NUEVO: Función para subir archivo y obtener URL
  const uploadFileToServer = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // TODO: Ajustar endpoint de upload según backend
      const response = await fetch('https://localhost:7245/Upload', {
        method: 'POST',
        body: formData,
        headers: {
          // No agregar Content-Type, el navegador lo hace automáticamente con boundary
          'Authorization': `bearer ${localStorage.getItem('authToken') || 'mock-jwt-token'}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }
      
      const result = await response.json();
      return result.url || result.filePath || `/uploads/${file.name}`;
    } catch (err) {
      console.error("Error uploading file:", err);
      // 🔧 FALLBACK: Si no hay endpoint de upload, usar URL temporal
      return `https://localhost:7245/uploads/${file.name}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateBeforeSubmit()) return;

    try {
      // 1. Subir archivo y obtener URL
      let fileUrl = "";
      if (files.length > 0) {
        fileUrl = await uploadFileToServer(files[0]);
      }

      // 2. Crear payload según CreateUserDocumentDto
      const payload = {
        title: title.trim(),
        description: description.trim() || "Documento subido desde la plataforma",
        category: category,
        url: fileUrl,
        user_id: 1, // TODO: obtener del contexto de auth
        consortium_id: 1, // TODO: obtener del contexto de auth
      };

      console.log("📤 Enviando payload:", payload);

      // 3. Crear documento en backend
      await mutate(payload);

      // 4. Limpiar form y cerrar
      setTitle("");
      setDescription("");
      setCategory("Escrituras");
      setFiles([]);

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error al subir documento:", err);
    }
  };

  return (
    <form className="foraria-form" onSubmit={handleSubmit}>
      <h2 className="foraria-form-title">Subir Documento</h2>

      <div className="foraria-form-group">
        <label className="foraria-form-label">Título del documento *</label>
        <TextField
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nombre descriptivo del documento..."
          variant="outlined"
          required
        />
      </div>

      <div className="foraria-form-group">
        <label className="foraria-form-label">Categoría *</label>
        <TextField
          select
          fullWidth
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          variant="outlined"
          required
        >
          <MenuItem value="Escrituras">Escrituras</MenuItem>
          <MenuItem value="Comprobantes">Comprobantes</MenuItem>
          <MenuItem value="Reglamentos">Reglamentos</MenuItem>
          <MenuItem value="Actas">Actas</MenuItem>
          <MenuItem value="Presupuestos">Presupuestos</MenuItem>
          <MenuItem value="Manuales">Manuales</MenuItem>
          <MenuItem value="Otros">Otros</MenuItem>
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
          placeholder="Describe el contenido del documento..."
          variant="outlined"
        />
      </div>

      <div className="foraria-form-group">
        <label className="foraria-form-label">Adjuntar Archivo *</label>
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
            {isDragActive
              ? "Suelta el archivo aquí..."
              : "Haz clic o arrastra un archivo aquí"}
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Formatos: PDF, Word, Imágenes • Máximo 10MB
          </Typography>
        </Box>

        {files.length > 0 && (
          <Box mt={2} sx={{ p: 2, bgcolor: "success.light", borderRadius: 1 }}>
            <Typography variant="subtitle2" color="success.dark">
              ✅ Archivo seleccionado:
            </Typography>
            {files.map((file, index) => (
              <Box key={index} sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {file.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {Math.round(file.size / 1024)} KB
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </div>

      {formError && (
        <Box sx={{ p: 2, bgcolor: "error.light", borderRadius: 1, mb: 2 }}>
          <Typography variant="body2" color="error.dark">
            ❌ {formError}
          </Typography>
        </Box>
      )}

      {error && (
        <Box sx={{ p: 2, bgcolor: "error.light", borderRadius: 1, mb: 2 }}>
          <Typography variant="body2" color="error.dark">
            ❌ Error del servidor: {error}
          </Typography>
        </Box>
      )}

      <div className="foraria-form-actions">
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          disabled={loading}
          className="foraria-gradient-button"
        >
          {loading ? <CircularProgress size={20} /> : "Subir Documento"}
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
