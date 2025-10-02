
import { useState } from "react";
import { TextField, Button, MenuItem, Box, Typography } from "@mui/material";
import { useDropzone } from "react-dropzone";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export default function ClaimForm() {
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");
 
  const espacios = []
const horarios = [
  "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00",
  "17:00", "18:00", "19:00", "20:00",
  "21:00", "22:00"
];


  const onDrop = (acceptedFiles: File[]) => {

  };

  
const [horarioSeleccionado, setHorarioSeleccionado] = useState<string | null>(null);

  const handleChange = (_event: React.MouseEvent<HTMLElement>, newHorario: string | null) => {
    setHorarioSeleccionado(newHorario);
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ area, description });
  };

  return (
    <form className="foraria-form" onSubmit={handleSubmit}>
      <h2 className="foraria-form-title">Reservar Espacio Comun</h2>

    
      <div className="foraria-form-row">
        <div className="foraria-form-group">
          <label className="foraria-form-label">Espacio a Reservar</label>
          <TextField
            select
            fullWidth
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="foraria-form-input"
          >
            <MenuItem value="Pileta">Pileta</MenuItem>
            <MenuItem value="SUM">SUM</MenuItem>
            <MenuItem value="Parilla">Parilla</MenuItem>
          </TextField>
        </div>
        </div>

      <div className="foraria-form-group">
        <label className="foraria-form-label">Horarios Disponibles</label>
       
  <ToggleButtonGroup
        value={horarioSeleccionado}
        exclusive
        onChange={handleChange}
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          gap: 1,
        }}
      >
        {horarios.map((hora) => (
          <ToggleButton
            key={hora}
            value={hora}
            className="foraria-gradient-button"
          >
            {hora}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

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
      
    
      <div className="foraria-form-actions">
        <Button type="submit" className="foraria-gradient-button boton-crear-reclamo">
          Enviar Reclamo
        </Button>
        <Button className="foraria-outlined-white-button">Cancelar</Button>
      </div>
    </form>
  );
}
