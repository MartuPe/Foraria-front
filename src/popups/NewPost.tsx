
import { useState } from "react";
import { TextField, Button} from "@mui/material";

export default function ClaimForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");


  

  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ title,description });
  };

  return (
    <form className="foraria-form" onSubmit={handleSubmit}>
      <h2 className="foraria-form-title">Crear Nuevo Post</h2>

    
      <div className="foraria-form-group">
        <label className="foraria-form-label">Titulo del post</label>
        <TextField
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titulo del post..."
          variant="outlined"
          className="foraria-form-input"
        />
      </div>

    

      <div className="foraria-form-group">
        <label className="foraria-form-label">Descripción</label>
        <TextField
          fullWidth
          multiline
          minRows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="¿Que queres compartir con la comunidad?"
          className="foraria-form-textarea"
        />
      </div>

     
      <div className="foraria-form-actions">
        <Button type="submit" className="foraria-gradient-button boton-crear-reclamo">
          Publicar
        </Button>
        <Button className="foraria-outlined-white-button">Cancelar</Button>
      </div>
    </form>
  );
}
