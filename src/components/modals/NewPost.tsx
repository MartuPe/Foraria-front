import React, { useState } from "react";
import {
  Box,
  Button,
  DialogActions,
  DialogTitle,
  DialogContent,
  Stack,
  TextField,
  MenuItem,
  Typography,
  Alert,
} from "@mui/material";
import { useMutation } from "../../hooks/useMutation";

interface NewPostProps {
  forumId: number | null;
  userId: number;
  onClose: () => void;
  onCreated: () => void;
}

const MIN_TITLE = 5;
const MIN_DESC = 10;

const categories = [
  { id: 1, label: "General" },
  { id: 2, label: "Administración" },
  { id: 3, label: "Seguridad" },
  { id: 4, label: "Mantenimiento" },
  { id: 5, label: "Espacios Comunes" },
  { id: 6, label: "Garage y Parking" },
];

export default function NewPost({ forumId, userId, onClose, onCreated }: NewPostProps) {
  const { mutate, loading, error } = useMutation("/Thread", "post");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState<number | "">("");

  const isTitleValid = title.trim().length >= MIN_TITLE;
  const isDescValid = desc.trim().length >= MIN_DESC;
  const isCategoryValid = category !== "";

  const handleSubmit = async () => {
    if (!isTitleValid || !isDescValid || !isCategoryValid) return;
    try {
      const payload = {
        theme: title.trim(),
        description: desc.trim(),
        forumId: category,  // y listo, sin fallback

        userId,
      };
      await mutate(payload);
      onCreated();
    } catch (e) {
      console.error("Error creando post:", e);
    }
  };

  return (
    <>
      <DialogTitle>Crear nuevo post</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            inputProps={{ minLength: MIN_TITLE }}
            helperText={
              !isTitleValid
                ? `Debe tener al menos ${MIN_TITLE} caracteres`
                : " "
            }
            error={!isTitleValid && title.length > 0}
          />

          <TextField
            select
            label="Categoría"
            fullWidth
            required
            value={category}
            onChange={(e) => setCategory(Number(e.target.value))}
            helperText={!isCategoryValid ? "Seleccioná una categoría" : " "}
            error={!isCategoryValid && category === ""}
          >
            <MenuItem value="">Seleccionar...</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Descripción"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            fullWidth
            multiline
            minRows={4}
            inputProps={{ minLength: MIN_DESC }}
            helperText={
              !isDescValid
                ? `Debe tener al menos ${MIN_DESC} caracteres`
                : " "
            }
            error={!isDescValid && desc.length > 0}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
          {typeof error === "string"
            ? error
          : (error as any)?.response?.data?.error || "Ocurrió un error al crear el post."}
          </Alert>
              )}


          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            ⚙️ Requisitos del post:
            <ul style={{ marginTop: 4, marginBottom: 0 }}>
              <li>Título con mínimo {MIN_TITLE} caracteres</li>
              <li>Descripción con mínimo {MIN_DESC} caracteres</li>
              <li>Seleccionar una categoría válida</li>
            </ul>
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          color="secondary"
          disabled={!isTitleValid || !isDescValid || !isCategoryValid || loading}
          onClick={handleSubmit}
        >
          {loading ? "Creando..." : "Crear post"}
        </Button>
      </DialogActions>
    </>
  );
}
