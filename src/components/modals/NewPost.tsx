import React, { useState } from "react";
import { TextField, Button, Stack } from "@mui/material";
import { api } from "../../api/axios";

export interface NewPostProps {
  onClose?: () => void;
  forumId?: number;
  // podés agregar callbacks extra si los necesitás, p.e. onCreated(post)
  onCreated?: (post: any) => void;
}

export default function NewPost({ onClose, forumId, onCreated }: NewPostProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("El título es obligatorio");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        theme: title,
        description,
        // adaptar según tu backend: state, userId, forumId, etc.
        forumId: forumId ?? 1,
      };
      const res = await api.post("/Forum", payload);
      const created = res.data;
      if (onCreated) onCreated(created);
      if (onClose) onClose();
    } catch (err: any) {
      console.error("Error creando post", err);
      setError(err?.response?.data?.message ?? err?.message ?? "Error al crear post");
    } finally {
      setSubmitting(false);
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
          disabled={submitting}
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
          disabled={submitting}
        />
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: 8 }}>
          {error}
        </div>
      )}

      <div className="foraria-form-actions">
        <Button
          type="submit"
          className="foraria-gradient-button boton-crear-reclamo"
          disabled={submitting}
          variant="contained"
          color="primary"
        >
          {submitting ? "Publicando..." : "Publicar"}
        </Button>

        <Button
          className="foraria-outlined-white-button"
          disabled={submitting}
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
