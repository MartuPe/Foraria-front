import React, { useEffect, useState } from "react";
import { TextField, Button, Typography } from "@mui/material";
import { useMutation } from "../../hooks/useMutation";

export interface NewPostProps {
  onClose?: () => void;
  forumId?: number;
  userId?: number;
  onCreated?: (post: any) => void;
  onSubmit?: (data: { theme: string; description: string; forumId: number }) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export default function NewPost({
  onClose,
  forumId,
  userId,
  onCreated,
  onSubmit,
  loading = false,
  error = null,
}: NewPostProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

 
  const { mutate, loading: mutLoading, error: mutError } = useMutation("/Thread", "post");


  const isLoading = loading || mutLoading;
  const effectiveError = localError ?? error ?? mutError ?? null;

  useEffect(() => {
   
    if (title || description) setLocalError(null);
  }, [title, description]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!title.trim()) {
      setLocalError("El título es obligatorio");
      return;
    }

    if (!forumId) {
      setLocalError("No se detectó el foro destino");
      return;
    }

    if (!userId || userId === 0) {
      setLocalError("Usuario no identificado. Iniciá sesión antes de crear un post.");
      return;
    }

    const payloadForBackend = {
      theme: title.trim(),
      description: description.trim(),
      forumId: forumId,
      userId: userId,
    };

    try {
      if (onSubmit) {
        
        await onSubmit({
          theme: payloadForBackend.theme,
          description: payloadForBackend.description,
          forumId: payloadForBackend.forumId,
        });
        onCreated?.(payloadForBackend);
      } else {
     
        const created = await mutate(payloadForBackend);
        onCreated?.(created ?? payloadForBackend);
      }
      onClose?.();
    } catch (err) {
    
      if (!(err as any)?.response) {
        setLocalError("Error inesperado al crear el post");
      }
      console.error("Error creando post", err);
    }
  };

  const handleCancel = () => {
    onClose?.();
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
          disabled={isLoading}
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
          disabled={isLoading}
        />
      </div>

      {effectiveError && (
        <Typography color="error" variant="body2" sx={{ mb: 1 }}>
          {effectiveError}
        </Typography>
      )}

      <div className="foraria-form-actions">
        <Button
          type="submit"
          className="foraria-gradient-button boton-crear-reclamo"
          disabled={isLoading}
          variant="contained"
          color="primary"
        >
          {isLoading ? "Publicando..." : "Publicar"}
        </Button>

        <Button
          className="foraria-outlined-white-button"
          disabled={isLoading}
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
