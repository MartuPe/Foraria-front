import { useState } from "react";
import { TextField, Button, MenuItem } from "@mui/material";



export default function ClaimForm() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Mantenimiento");
  const [priority, setPriority] = useState("Media");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ title, category, priority, description });
  };

  return (
    <form className="foraria-form foraria-card" onSubmit={handleSubmit}>
      <h2 className="foraria-form-title">Crear Nuevo Reclamo</h2>

      <div className="foraria-form-group">
        <label className="foraria-form-label">Título del Reclamo</label>
        <TextField
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Describe brevemente el problema..."
          variant="outlined"
          className="foraria-form-input"
        />
      </div>

      <div className="foraria-form-row">
        <div className="foraria-form-group">
          <label className="foraria-form-label">Categoría</label>
          <TextField
            select
            fullWidth
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="foraria-form-input"
          >
            <MenuItem value="Mantenimiento">Mantenimiento</MenuItem>
            <MenuItem value="Servicios">Servicios</MenuItem>
            <MenuItem value="Otro">Otro</MenuItem>
          </TextField>
        </div>

        <div className="foraria-form-group">
          <label className="foraria-form-label">Prioridad</label>
          <TextField
            select
            fullWidth
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="foraria-form-input"
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
          className="foraria-form-textarea"
        />
      </div>

      <div className="foraria-form-group">
        <label className="foraria-form-label">Adjuntar Fotos o Videos</label>
        <div className="foraria-form-upload">
          <span>Haz clic o arrastra archivos aquí</span>
        </div>
      </div>

      <div className="foraria-form-actions">
        <Button type="submit" className="foraria-gradient-button">
          Enviar Reclamo
        </Button>
        <Button className="foraria-outlined-white-button">Cancelar</Button>
      </div>
    </form>
  );
}