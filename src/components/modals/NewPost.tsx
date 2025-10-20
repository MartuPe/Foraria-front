import React, { useState } from "react";
import { TextField, Button } from "@mui/material";


export interface NewPostProps {
  onClose?: () => void;
  forumId?: number;
  onCreated?: (post: any) => void;
  onSubmit?: (data: { theme: string; description: string; forumId: number }) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export default function NewPost({
  onClose,
  forumId,
  onCreated,
  onSubmit,
  loading = false,
  error = null,
}: NewPostProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!title.trim()) {
      setLocalError("El título es obligatorio");
      return;
    }

    const payload = {
      theme: title,
      description,
      forumId: forumId ?? 1,
    };

    try {
      if (onSubmit) {
        await onSubmit(payload);
      }
      if (onCreated) onCreated(payload);
    } catch (err) {
      console.error("Error creando post", err);
    }
  };

  const handleCancel = () => {
    if (onClose) onClose();
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
          disabled={loading}
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
          placeholder="¿Qué querés compartir con la comunidad?"
          className="foraria-form-textarea"
          disabled={loading}
        />
      </div>

      {(localError || error) && (
        <div style={{ color: "red", marginBottom: 8 }}>
          {localError ?? error}
        </div>
      )}

      <div className="foraria-form-actions">
        <Button
          type="submit"
          className="foraria-gradient-button boton-crear-reclamo"
          disabled={loading}
          variant="contained"
          color="primary"
        >
          {loading ? "Publicando..." : "Publicar"}
        </Button>

        <Button
          className="foraria-outlined-white-button"
          disabled={loading}
          onClick={handleCancel}
          variant="outlined"
          sx={{ ml: 1 }}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
