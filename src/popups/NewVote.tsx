import { useState } from "react";
import { TextField, Button, MenuItem, Box } from "@mui/material";

export default function ClaimForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [newOption, setNewOption] = useState("");
  const [options, setOptions] = useState(["Pileta", "SUM", "Parrilla"]);

  const handleAddOption = () => {
    const trimmed = newOption.trim();
    if (trimmed !== "" && !options.includes(trimmed)) {
      setOptions([...options, trimmed]);
      setNewOption(""); // Limpiar el input
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ title, category, description });
  };

  return (
    <form className="foraria-form" onSubmit={handleSubmit}>
      <h2 className="foraria-form-title">Crear Nueva Votación</h2>

      <div className="foraria-form-group">
        <label className="foraria-form-label">Título de la Votación</label>
        <TextField
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título del post..."
          variant="outlined"
        />
      </div>

      <div className="foraria-form-group group-size">
        <label className="foraria-form-label">Categoría</label>
        <TextField
          select
          fullWidth
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {options.map((opt, index) => (
            <MenuItem key={index} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>
      </div>

      <div className="foraria-form-group">
        <label className="foraria-form-label">Descripción</label>
        <TextField
          fullWidth
          multiline
          minRows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="¿Qué querés compartir con la comunidad?"
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
          >
            Añadir
          </Button>
        </Box>
      </div>

      <div className="foraria-form-actions">
        <Button type="submit" className="foraria-gradient-button boton-crear-reclamo">
          Crear Votación
        </Button>
        <Button className="foraria-outlined-white-button">Cancelar</Button>
      </div>
    </form>
  );
}