// src/components/modals/EditMessage.tsx
import React, { useEffect, useState } from "react";
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
import { updateMessage } from "../../services/messageService";

interface EditMessageProps {
  messageId: number;
  initialContent: string;
  onClose: () => void;
  onUpdated: () => void; // callback del padre para refrescar mensajes
}

const MIN_CONTENT = 1;

export default function EditMessage({
  messageId,
  initialContent,
  onClose,
  onUpdated,
}: EditMessageProps) {
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent, messageId]);

  const hasError =
    content.trim().length > 0 && content.trim().length < MIN_CONTENT;

  const canSubmit = !loading && content.trim().length >= MIN_CONTENT;

  const handleSave = async () => {
    if (!canSubmit) return;

    setLoading(true);
    setError(null);
    try {
      await updateMessage(messageId, content.trim());
      onUpdated();
      onClose();
    } catch (e: any) {
      setError(
        typeof e?.message === "string"
          ? e.message
          : "No se pudo actualizar el mensaje."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <DialogTitle>Editar respuesta</DialogTitle>

      <Box sx={{ px: 3, pt: 1, pb: 2 }}>
        <Stack spacing={2}>
          <TextField
            label="Mensaje"
            fullWidth
            multiline
            minRows={3}
            maxRows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            error={hasError}
            helperText={hasError ? "El mensaje no puede estar vacío" : " "}
            autoFocus
          />

          {error && (
            <Typography variant="body2" color="error">
              {error}
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
          onClick={handleSave}
          disabled={!canSubmit}
          startIcon={loading ? <CircularProgress size={16} /> : undefined}
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </Button>
      </DialogActions>
    </Box>
  );
}
