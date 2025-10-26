import * as React from "react";
import {
  TextField,
  Button,
  MenuItem,
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Fade,
} from "@mui/material";
import { useGet } from "../../hooks/useGet";
import { useMutation } from "../../hooks/useMutation";

type NewReserveProps = {
  date?: Date | null;
  onCancel: () => void;
  onConfirm: () => void;
};

const horarios = [
  "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00",
  "17:00", "18:00", "19:00", "20:00",
  "21:00", "22:00",
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

  const { data: reservas, loading: loadingReservas, refetch } = useGet("/Reserve");
  const { mutate: crearReserva, loading: creando } = useMutation("/Reserve", "post");

  const isPastDate = React.useMemo(() => {
    if (!day) return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const chosen = new Date(day + "T00:00:00");
    return chosen < today;
  }, [day]);

  // Refetch solo si no hay reservas
  React.useEffect(() => {
    if (area && day && !reservas) refetch();
  }, [area, day]);

  // Horarios ocupados
  const horariosOcupados = React.useMemo(() => {
    if (!reservas || !Array.isArray(reservas) || !area || !day) return [];
    return reservas
      .filter((r: any) => r.place_id === getPlaceId(area) && r.date === day)
      .map((r: any) => r.time)
      .filter(Boolean);
  }, [reservas, area, day]);

  const isFormValid = !!area && !!day && !isPastDate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const payload = {
      description: description || "Sin descripción",
      createdAt: new Date().toISOString(),
      place_id: getPlaceId(area),
      residence_id: 1,
      user_id: 1,
      date: day,     // <-- fecha correcta
      time,          // <-- hora seleccionada
    };

    try {
      await crearReserva(payload);
      onConfirm();
    } catch (err) {
      console.error("Error al crear reserva", err);
    }
  };

  function getPlaceId(nombre: string): number {
    switch (nombre) {
      case "Pileta": return 1;
      case "SUM": return 2;
      case "Parrilla": return 3;
      default: return 0;
    }
  }

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

          {loadingReservas ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} />
              <Typography variant="body2">Cargando horarios...</Typography>
            </Stack>
          ) : (
            <Fade in>
              <ToggleButtonGroup
                value={time}
                exclusive
                onChange={(_e, v) => setTime(v)}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                  gap: 1,
                }}
              >
                {horarios.map((hora) => {
                  const ocupado = horariosOcupados.includes(hora);
                  return (
                    <ToggleButton
                      key={hora}
                      value={hora}
                      disabled={ocupado}
                      className="foraria-gradient-button"
                      sx={{
                        opacity: ocupado ? 0.5 : 1,
                        textDecoration: ocupado ? "line-through" : "none",
                      }}
                    >
                      {hora}
                    </ToggleButton>
                  );
                })}
              </ToggleButtonGroup>
            </Fade>
          )}
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
            disabled={!isFormValid || creando}
          >
            {creando ? "Guardando..." : "Confirmar"}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
