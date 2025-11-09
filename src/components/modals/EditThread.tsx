// src/components/modals/EditThread.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  DialogTitle,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useMutation } from "../../hooks/useMutation";

interface EditThreadProps {
  onClose: () => void;
  threadId: number;
  initialTitle: string;
  initialDescription: string;
  onUpdated: () => void;
  userId: number; 
}


const MIN_TITLE = 5;
const MIN_DESC = 10;

export default function EditThread({
  onClose,
  threadId,
  initialTitle,
  initialDescription,
  onUpdated,
  userId,
}: EditThreadProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  // si cambia el hilo a editar, sincronizamos el formulario
  useEffect(() => {
    setTitle(initialTitle);
    setDescription(initialDescription);
  }, [initialTitle, initialDescription, threadId]);

  const { mutate, loading, error } = useMutation(
    `/Thread/${threadId}`,
    "put"
  );

  const titleError =
    title.trim().length > 0 && title.trim().length < MIN_TITLE;
  const descError =
    description.trim().length > 0 && description.trim().length < MIN_DESC;

  const canSubmit =
    !loading &&
    title.trim().length >= MIN_TITLE &&
    description.trim().length >= MIN_DESC;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const payload = {
  theme: title.trim(),
  description: description.trim(),
  userId, 
};


    try {
      await mutate(payload);
      onUpdated();
    } catch {
      // el error ya se muestra abajo
    }
  };

  return (
    <Box>
      <DialogTitle>Editar post</DialogTitle>

      <Box sx={{ px: 3, pt: 1, pb: 2 }}>
        <Stack spacing={2}>
          <TextField
            label="Título"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={titleError}
            helperText={
              titleError ? `Mínimo ${MIN_TITLE} caracteres` : " "
            }
            autoFocus
          />

          <TextField
            label="Descripción"
            fullWidth
            multiline
            minRows={3}
            maxRows={8}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={descError}
            helperText={
              descError ? `Mínimo ${MIN_DESC} caracteres` : " "
            }
          />

          {error && (
            <Typography variant="body2" color="error">
              {typeof error === "string"
                ? error
                : "No se pudo actualizar el post. Probá de nuevo."}
            </Typography>
          )}
        </Stack>
      </Box>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit}
          startIcon={loading ? <CircularProgress size={16} /> : undefined}
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </Button>
      </DialogActions>
    </Box>
  );
}
