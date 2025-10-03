
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
      <h2 className="foraria-form-title">Nuevo Proveedor</h2>

    <div className="foraria-form-group container-items">
      <div className="foraria-form-group group-size">
        <label className="foraria-form-label">Nombre Comercial</label>
        <TextField
          fullWidth
          placeholder="Ej: Ferreteria El Tornillo"
          variant="outlined"
          className="foraria-form-input"
        />
        </div>

        <div className="foraria-form-group group-size">
        <label className="foraria-form-label ">Razon Social</label>
        <TextField
          fullWidth
          placeholder="Ej: Juan Perez SRL"
          variant="outlined"
          className="foraria-form-input"
        />
      </div>
      </div>

      

 <div className="foraria-form-group container-items">
 
        <div className="foraria-form-group group-size">
          <label className="foraria-form-label ">CUIT</label>
        <TextField
          fullWidth
          type="number"
          placeholder="20-12345678-9"
          variant="outlined"
          className="foraria-form-input"
        />
        </div>
        <div className="foraria-form-group group-size">
          <label className="foraria-form-label">Categoria</label>
          <TextField
            select
            fullWidth
            onChange={(e) => {}}
            className="foraria-form-input"
          >
            <MenuItem value="Pileta">Mantenimiento</MenuItem>
            <MenuItem value="SUM">Limpieza</MenuItem>
            <MenuItem value="Parilla">Seguridad</MenuItem>
          </TextField>
        </div>
        </div>

 <div className="foraria-form-group container-items">
      <div className="foraria-form-group group-size">
        <label className="foraria-form-label">Telefono</label>
        <TextField
          fullWidth
          type="number"
         
          placeholder="+543412345678"
          variant="outlined"
          className="foraria-form-input"
        />
        </div>

        <div className="foraria-form-group group-size">
        <label className="foraria-form-label ">Mail</label>
        <TextField
          fullWidth
          type="email"

          placeholder="contacto@proveedor.com"
          variant="outlined"
          className="foraria-form-input"
        />
      </div>
      </div>

      

       <div className="foraria-form-group">
        <label className="foraria-form-label">Direccion</label>
        <TextField
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Av. Siempre Viva 1234"
          variant="outlined"
          className="foraria-form-input"
        />
        </div>
        
       <div className="foraria-form-group">
        <label className="foraria-form-label">Persona de Contacto</label>
        <TextField
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Juan Perez"
          variant="outlined"
          className="foraria-form-input"
        />
        </div>

<div className="foraria-form-group">
        <label className="foraria-form-label">Observacion</label>
        <TextField
          fullWidth
          multiline
          minRows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Notas Adicionales"
          className="foraria-form-textarea"
        />
      </div>
     
      <div className="foraria-form-actions">
        <Button type="submit" className="foraria-gradient-button boton-crear-reclamo">
          Crear Proveedor
        </Button>
        <Button className="foraria-outlined-white-button">Cancelar</Button>
      </div>
    </form>
  );
}
