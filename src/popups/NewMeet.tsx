
import { useState } from "react";
import { TextField, Button} from "@mui/material";
import { MenuItem } from "@mui/material";
import { useDropzone } from "react-dropzone";
import { Box, Typography } from "@mui/material";
import "../styles/spent.css";




export default function ClaimForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  
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

  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ title,description });
  };

  return (
    <form className="foraria-form" onSubmit={handleSubmit}>
      <h2 className="foraria-form-title">Nuevo Gasto</h2>

      <div className="foraria-form-group">
        <label className="foraria-form-label">Titular de la reunion</label>
        <TextField
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Asamblea Ordinaria"
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
        <label className="foraria-form-label">Fecha</label>
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
        <label className="foraria-form-label">Hora</label>
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
          placeholder="Descripcion del gasto"
          className="foraria-form-textarea"
        />
      </div>
     
      <div className="foraria-form-actions">
        <Button type="submit" className="foraria-gradient-button boton-crear-reclamo">
          Crear reunion
        </Button>
        <Button className="foraria-outlined-white-button">Cancelar</Button>
      </div>
    </form>
  );
}
