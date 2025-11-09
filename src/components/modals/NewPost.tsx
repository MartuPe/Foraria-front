// src/components/modals/NewPost.tsx
import React, { useState, useMemo } from "react";
import {
  Box,
  DialogTitle,
  DialogActions,
  Button,
  TextField,
  Stack,
  MenuItem,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useMutation } from "../../hooks/useMutation";

const CATEGORY_LABELS = [
  "General",
  "Administración",
  "Seguridad",
  "Mantenimiento",
  "Espacios Comunes",
  "Garage y Parking",
] as const;

interface NewPostProps {
  onClose: () => void;
  forumId: number; // foro actual (fallback)
  userId: number;
  onCreated: () => void;
  // mapa etiqueta -> forumId (solo se usa en admin / Todas)
  forumIdByLabel?: Partial<Record<(typeof CATEGORY_LABELS)[number], number>>;
  // categoría inicial que se ve en el combo
  initialCategoryLabel?: (typeof CATEGORY_LABELS)[number];
}

export default function NewPost({
  onClose,
  forumId,
  userId,
  onCreated,
  forumIdByLabel,
  initialCategoryLabel,
}: NewPostProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // categoría que se muestra en el select
  const [categoryLabel, setCategoryLabel] =
    useState<(typeof CATEGORY_LABELS)[number]>(
      initialCategoryLabel ?? "General"
    );

  const { mutate, loading, error } = useMutation("/Thread", "post");

  const MIN_TITLE = 5;
  const MIN_DESC = 10;

  const titleError =
    title.trim().length > 0 && title.trim().length < MIN_TITLE;
  const descError =
    description.trim().length > 0 && description.trim().length < MIN_DESC;

  const canSubmit =
    !loading &&
    title.trim().length >= MIN_TITLE &&
    description.trim().length >= MIN_DESC &&
    forumId > 0 &&
    userId > 0;

  // decide el forumId según la categoría elegida (si hay mapa)
  const forumIdToSend = useMemo(() => {
    const fromMap = forumIdByLabel?.[categoryLabel];
    return fromMap ?? forumId;
  }, [forumId, forumIdByLabel, categoryLabel]);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const payload = {
      theme: title.trim(),
      description: description.trim(),
      forumId: forumIdToSend,
      userId,
    };

    try {
      await mutate(payload);
      onCreated();
    } catch {
      // el error ya se muestra abajo
    }
  };

  return (
    <Box>
      <DialogTitle>Crear nuevo post</DialogTitle>

      <Box sx={{ px: 3, pt: 1, pb: 2 }}>
        <Stack spacing={2}>
          <TextField
            label="Título"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={titleError}
            helperText={titleError ? `Mínimo ${MIN_TITLE} caracteres` : " "}
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
            helperText={descError ? `Mínimo ${MIN_DESC} caracteres` : " "}
          />

          {/* Solo mostramos el selector de categoría si el admin está en "Todas"
              (o sea, si hay más de un foro posible en el mapa) */}
          {forumIdByLabel && Object.keys(forumIdByLabel).length > 1 && (
            <TextField
              select
              label="Categoría"
              fullWidth
              value={categoryLabel}
              onChange={(e) =>
                setCategoryLabel(
                  e.target.value as (typeof CATEGORY_LABELS)[number]
                )
              }
            >
              {CATEGORY_LABELS.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
          )}

          {error && (
            <Typography variant="body2" color="error">
              {typeof error === "string"
                ? error
                : "No se pudo crear el post. Probá de nuevo."}
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
          {loading ? "Creando..." : "Crear post"}
        </Button>
      </DialogActions>
    </Box>
  );
}
