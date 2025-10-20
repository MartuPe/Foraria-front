import { useState } from "react";
import { Stack, TextField, Button, Typography } from "@mui/material";
import { residenceService } from "../../services/residenceService";

type Props = {
  onSuccess: () => void;
};

export default function NewResidence({ onSuccess }: Props) {
  const [form, setForm] = useState({
    number: "",
    floor: "",
    tower: "",
    consortiumId: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await residenceService.create({
        number: Number(form.number),
        floor: Number(form.floor),
        tower: form.tower,
        consortiumId: Number(form.consortiumId),
      });
      onSuccess();
    } catch {
      alert("Error al crear residencia");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <Typography variant="h6">Nueva residencia</Typography>
        <TextField
          label="Torre"
          name="tower"
          value={form.tower}
          onChange={handleChange}
          required
        />
        <TextField
          label="Piso"
          name="floor"
          type="number"
          value={form.floor}
          onChange={handleChange}
          required
        />
        <TextField
          label="Número"
          name="number"
          type="number"
          value={form.number}
          onChange={handleChange}
          required
        />
        <TextField
          label="Consorcio ID"
          name="consortiumId"
          type="number"
          value={form.consortiumId}
          onChange={handleChange}
          required
        />
        <Button variant="contained" type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Crear residencia"}
        </Button>
      </Stack>
    </form>
  );
}
