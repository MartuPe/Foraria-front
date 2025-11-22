
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

    <div className="foraria-form-group container-items">
      <div className="foraria-form-group group-size">
        <label className="foraria-form-label">Concepto</label>
        <TextField
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Descripcion del gasto"
          variant="outlined"
          className="foraria-form-input"
        />
        </div>

        <div className="foraria-form-group group-size">
        <label className="foraria-form-label ">Monto</label>
        <TextField
          fullWidth
          type="number"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="00.00"
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

 <div className="foraria-form-group container-items">
 
        <div className="foraria-form-group group-size">
          <label className="foraria-form-label">Categoria</label>
          <TextField
            select
            fullWidth
            onChange={(e) => {}}
            className="foraria-form-input"
          >
              <MenuItem value="Pileta">Pileta</MenuItem>
              <MenuItem value="SUM">SUM</MenuItem>
              <MenuItem value="Parrilla">Parrilla</MenuItem>
              <MenuItem value="Gimnasio">Gimnasio</MenuItem>
              <MenuItem value="Terraza">Terraza</MenuItem>
          </TextField>
        </div>
        <div className="foraria-form-group group-size">
          <label className="foraria-form-label">Tipo de comprobante</label>
          <TextField
            select
            fullWidth
            onChange={(e) => {}}
            className="foraria-form-input"
          >
            <MenuItem value="Factura">Factura</MenuItem>
            <MenuItem value="Recibo">Recibo</MenuItem>
            <MenuItem value="Presupuesto">Presupuesto</MenuItem>
          </TextField>
        </div>
        </div>

<div className="foraria-form-group container-items">
        <div className="foraria-form-group group-size-3-items">
        <label className="foraria-form-label">Proveedor</label>
        <TextField
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nombre del proveedor"
          variant="outlined"
          className="foraria-form-input"
        />
        </div>
    
      <div className="foraria-form-group group-size-3-items">
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
    
      <div className="foraria-form-group group-size-3-items">
        <label className="foraria-form-label">Vencimiento (Opcional)</label>
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
            </div>

      

       <div className="foraria-form-group">
        <label className="foraria-form-label">Numero de Factura</label>
        <TextField
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="FAC-0001-00000001"
          variant="outlined"
          className="foraria-form-input"
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
            {isDragActive
              ? "Suelta los archivos aquí..."
              : "Haz clic o arrastra archivos aquí"}
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

     
      <div className="foraria-form-actions">
        <Button type="submit" className="foraria-gradient-button boton-crear-reclamo">
          Guardar Gasto
        </Button>
        <Button className="foraria-outlined-white-button">Cancelar</Button>
      </div>
    </form>
  );
}
