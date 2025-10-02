
import { useState } from "react";
import { TextField, Button, MenuItem, Box, Typography } from "@mui/material";
import { useDropzone } from "react-dropzone";
import "../styles/claim.css";

export default function ClaimForm() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Mantenimiento");
  const [priority, setPriority] = useState("Media");
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
    console.log({ title, category, priority, description, files });
  };

  return (
    <form className="foraria-form" onSubmit={handleSubmit}>
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

    
      <div className="foraria-form-row categoria-prioridad-contenedor">
        <div className="foraria-form-group categoria-prioridad-select">
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

        <div className="foraria-form-group categoria-prioridad-select">
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
          Enviar Reclamo
        </Button>
        <Button className="foraria-outlined-white-button">Cancelar</Button>
      </div>
    </form>
  );
}
