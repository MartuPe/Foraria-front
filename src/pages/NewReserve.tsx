// src/pages/NewReserve.tsx
import * as React from "react";
import { TextField, Button, MenuItem, Stack, Typography } from "@mui/material";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

type NewReserveProps = {
  date?: Date | null;
  onCancel: () => void;
  onConfirm: (payload: {
    area: string;
    description: string;
    date: string;
    time: string | null;
  }) => void;
};

const horarios = [
  "09:00","10:00","11:00","12:00",
  "13:00","14:00","15:00","16:00",
  "17:00","18:00","19:00","20:00",
  "21:00","22:00",
];

function toInputDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function NewReserve({ date, onCancel, onConfirm }: NewReserveProps) {
  const [area, setArea] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [day, setDay] = React.useState<string>(date ? toInputDate(date) : "");
  const [time, setTime] = React.useState<string | null>(null);

  const isPastDate = React.useMemo(() => {
    if (!day) return false;
    const today = new Date(); today.setHours(0,0,0,0);
    const chosen = new Date(day + "T00:00:00");
    return chosen < today;
  }, [day]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!day || !area || isPastDate) return;
    onConfirm({ area, description, date: day, time });
  };

  return (
    <form className="foraria-form" onSubmit={handleSubmit}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Reservar espacio común
      </Typography>

      <Stack spacing={2}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Fecha"
            type="date"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            error={isPastDate}
            helperText={isPastDate ? "No se pueden reservar fechas pasadas" : " "}
          />
          <TextField
            label="Espacio a reservar"
            select
            fullWidth
            value={area}
            onChange={(e) => setArea(e.target.value)}
          >
            <MenuItem value="Pileta">Pileta</MenuItem>
            <MenuItem value="SUM">SUM</MenuItem>
            <MenuItem value="Parrilla">Parrilla</MenuItem>
          </TextField>
        </Stack>

        <div>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Horarios (opcional)
          </Typography>
          <ToggleButtonGroup
            value={time}
            exclusive
            onChange={(_e, v) => setTime(v)}
            sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 1 }}
          >
            {horarios.map((hora) => (
              <ToggleButton key={hora} value={hora} className="foraria-gradient-button">
                {hora}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>

        <TextField
          label="Descripción (opcional)"
          fullWidth
          multiline
          minRows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detalles de tu reserva…"
        />

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={onCancel}>Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            className="foraria-gradient-button"
            disabled={!day || !area || isPastDate}
          >
            Confirmar
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
