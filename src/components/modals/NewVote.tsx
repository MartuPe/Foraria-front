import { useState } from "react";
import { TextField, Button, MenuItem, Box, CircularProgress } from "@mui/material";
import { useMutation } from "../../hooks/useMutation";

interface NewVoteProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function NewVote({ onSuccess, onCancel }: NewVoteProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<number>(1);
  const [newOption, setNewOption] = useState("");
  const [options, setOptions] = useState<string[]>(["Sí", "No"]);
  const [formError, setFormError] = useState<string | null>(null);
  const [consortiumId, setConsortiumId] = useState<number>(0);
  const { mutate, loading, error } = useMutation("https://foraria-api-e7dac8bpewbgdpbj.brazilsouth-01.azurewebsites.net/api/polls", "post");


 const handleAddOption = () => {
    setFormError(null);
    const trimmed = newOption.trim();
    if (!trimmed) return;
    if (options.includes(trimmed)) {
      setFormError("La opción ya existe.");
      return;
    }
    if (options.length >= 8) {
      setFormError("No se pueden tener más de 8 opciones.");
      return;
    }
    setOptions((prev) => [...prev, trimmed]);
    setNewOption("");
  };

  const handleRemoveOption = (index: number) => {
    setFormError(null);
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const validateBeforeSubmit = (): boolean => {
    if (!title.trim()) {
      setFormError("El título es obligatorio.");
      return false;
    }
    if (!description.trim()) {
      setFormError("La descripción es obligatoria.");
      return false;
    }
    if (options.length < 2) {
      setFormError("Debe haber al menos 2 opciones.");
      return false;
    }
    if (options.length > 8) {
      setFormError("No se pueden tener más de 8 opciones.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateBeforeSubmit()) return;

  const now = new Date();
  const createdAt = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();
  const deletedAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 - now.getTimezoneOffset() * 60000).toISOString();
const consortiumId = Number(localStorage.getItem("consortiumId"));

  
    const payload = {
      id: 0,
      title,
      description,
      categoryPollId: category,
      createdAt,
      deletedAt,
      state: "activa",
      userId: localStorage.getItem("userId"),
      options,
      consortiumId: consortiumId,
    };

console.log("Payload que se envía:", payload);

    try {
      await mutate(payload);
    

      setTitle("");
      setDescription("");
      setCategory(1);
      setOptions(["Sí", "No"]);

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error al crear votación:", err);

    }
  };

  return (
    <form className="foraria-form" onSubmit={handleSubmit}>
      <h2 className="foraria-form-title">Crear Nueva Votación</h2>

    
      <div className="foraria-form-group">
        <label className="foraria-form-label">Título</label>
        <TextField
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Reparación de la pileta"
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
          onChange={(e) => setCategory(Number(e.target.value))}
          variant="outlined"
        >
          <MenuItem value={1}>General</MenuItem>
          <MenuItem value={2}>Mantenimiento</MenuItem>
          <MenuItem value={3}>Eventos</MenuItem>
          <MenuItem value={4}>Presupuesto</MenuItem>
          <MenuItem value={5}>Seguridad</MenuItem>
          <MenuItem value={6}>Mejoras</MenuItem>
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
          placeholder="Describe el motivo de la votación..."
          variant="outlined"
          required
        />
      </div>

    
      <div className="foraria-form-group">
        <label className="foraria-form-label">Opciones</label>
        <Box display="flex" gap={2}>
          <TextField
            fullWidth
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            placeholder="Nueva opción"
            variant="outlined"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddOption}
            disabled={!newOption.trim()}
          >
            Añadir
          </Button>
        </Box>

      
    <ul style={{ marginTop: 10, paddingLeft: 20 }}>
  {options.map((opt, i) => (
    <li key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span>{opt}</span>
      <Button
        size="small"
        color="error"
        onClick={() => handleRemoveOption(i)}
        style={{ minWidth: "auto", padding: "2px 6px" }}
      >
        ✖
      </Button>
    </li>
  ))}
  {formError && <p style={{ color: "red", marginTop: "10px" }}>{formError}</p>}
</ul>
      </div>

      
      <div className="foraria-form-actions">
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          disabled={loading}
          className="foraria-gradient-button"
        >
          {loading ? <CircularProgress size={20} /> : "Crear Votación"}
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

   
      {error && (
        <p style={{ color: "red", marginTop: "10px" }}>
           Error: {error}
        </p>
      )}
    </form>
  );
}
