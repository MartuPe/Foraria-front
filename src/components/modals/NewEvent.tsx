
import { useState } from "react";
import { TextField, Button} from "@mui/material";
import { MenuItem } from "@mui/material";
// import "../styles/spent.css";
export default function ClaimForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  


  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ title,description });
  };

  return (
    <form className="foraria-form" onSubmit={handleSubmit}>
      <h2 className="foraria-form-title">Nuevo Evento</h2>

       <div className="foraria-form-group">
        <label className="foraria-form-label">Titulo del Evento</label>
        <TextField
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Fumigacion"
          variant="outlined"
          className="foraria-form-input"
        />
        </div>

    
      
 <div className="foraria-form-group container-items">
 
        <div className="foraria-form-group group-size">
          <label className="foraria-form-label">Categoria</label>
          <TextField
            select
            fullWidth
            onChange={(e) => {}}
            className="foraria-form-input"
          >
            <MenuItem value="Pileta">Mantenimiento</MenuItem>
            <MenuItem value="SUM">Servicio</MenuItem>
            <MenuItem value="Parilla">Administracion</MenuItem>
          </TextField>
        </div>
        <div className="foraria-form-group group-size">
          <label className="foraria-form-label">Ubicacion</label>
          <TextField
            select
            fullWidth
            onChange={(e) => {}}
            className="foraria-form-input"
          >
            <MenuItem value="Pileta">Factura</MenuItem>
            <MenuItem value="SUM">Recibo</MenuItem>
            <MenuItem value="Parilla">Presupuesto</MenuItem>
          </TextField>
        </div>
        </div>


    
     <div className="foraria-form-group container-items">
    
      <div className="foraria-form-group group-size ">
        <label className="foraria-form-label">Fecha de Inicio</label>
        <TextField
          fullWidth
          value={title}
          type="date"
          onChange={(e) => setTitle(e.target.value)}
          placeholder="dd/mm/aaaa"
          variant="outlined"
          className="foraria-form-input"
        />
        </div>
    
      <div className="foraria-form-group group-size">
        <label className="foraria-form-label">Hora de Inicio</label>
        <TextField
          fullWidth
          value={title}
           type="hour"
          onChange={(e) => setTitle(e.target.value)}
          placeholder="--:-- --"
          variant="outlined"
          className="foraria-form-input"
        />
           </div> 

        </div>

      <div className="foraria-form-group container-items">
    
      <div className="foraria-form-group group-size ">
        <label className="foraria-form-label">Fecha de Fin</label>
        <TextField
          fullWidth
          value={title}
          type="date"
          onChange={(e) => setTitle(e.target.value)}
          placeholder="dd/mm/aaaa"
          variant="outlined"
          className="foraria-form-input"
        />
        </div>
    
      <div className="foraria-form-group group-size">
        <label className="foraria-form-label">Hora de Fin</label>
        <TextField
          fullWidth
          value={title}
           type="hour"
          onChange={(e) => setTitle(e.target.value)}
          placeholder="--:-- --"
          variant="outlined"
          className="foraria-form-input"
        />
           </div> 

        </div>

      

 <div className="foraria-form-group">
        <label className="foraria-form-label">Descripción</label>
        <TextField
          fullWidth
          multiline
          minRows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripcion del evento"
          className="foraria-form-textarea"
        />
      </div>


     
      <div className="foraria-form-actions">
        <Button type="submit" className="foraria-gradient-button boton-crear-reclamo">
          Crear Evento
        </Button>
        <Button className="foraria-outlined-white-button">Cancelar</Button>
      </div>
    </form>
  );
}
