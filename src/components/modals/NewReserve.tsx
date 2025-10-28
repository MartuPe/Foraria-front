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
  Box,
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
  "21:00", "22:00", "23:00",
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
  const [pressedTime, setPressedTime] = React.useState<string | null>(null); // efecto visual

  const { data: reservas, loading: loadingReservas, /*refetch*/ } = useGet("/Reserve");
  const { mutate: crearReserva, loading: creando } = useMutation("/Reserve", "post");

  const isPastDate = React.useMemo(() => {
    if (!day) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosen = new Date(day + "T00:00:00");
    return chosen < today;
  }, [day]);

  // React.useEffect(() => {
  //   if (area && day) refetch();
  // }, [area, day]);

  const horariosOcupados = React.useMemo(() => {
    if (!reservas || !Array.isArray(reservas) || !area || !day) return [];
    return reservas
      .filter((r: any) => r.place_id === getPlaceId(area))
      .map((r: any) => {
        const dateObj = new Date(r.createdAt);
        const rDay = toInputDate(dateObj);
        const rTime = dateObj.toTimeString().slice(0, 5);
        return rDay === day ? rTime : null;
      })
      .filter(Boolean) as string[];
  }, [reservas, area, day]);

  React.useEffect(() => {
    setTime(null);
  }, [day, area]);

  const isFormValid = !!area && !!day && !isPastDate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    if (!time) {
      alert("Por favor selecciona un horario antes de confirmar.");
      return;
    }

    // ✅ combinar fecha + hora sin conversión a UTC
    const createdAt = `${day}T${time}:00.000`;

    const payload = {
      description: description || "Sin descripción",
      createdAt, // formato local sin Z
      place_id: getPlaceId(area),
      residence_id: 2,
      user_id: 1,
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
            Horarios disponibles
          </Typography>

          {loadingReservas ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} />
              <Typography variant="body2">Cargando horarios...</Typography>
            </Stack>
          ) : (
            <Fade in>
              <Box
                sx={{
                  maxHeight: 260,
                  overflowY: "auto",
                  px: 1,
                  py: 0.5,
                }}
              >
                <ToggleButtonGroup
                  value={pressedTime}
                  exclusive
                  onChange={(_, val) => setPressedTime(val)}
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    alignItems: "center",
                    justifyContent: "flex-start",
                    "& .MuiToggleButton-root": {
                      borderRadius: "12px !important",
                      margin: 0,
                    },
                  }}
                >
                  {horarios.map((hora) => {
                    const ocupado = horariosOcupados.includes(hora);
                    const isSelected = pressedTime === hora;

                    return (
                      <ToggleButton
        key={hora}
        value={hora}
        disabled={ocupado}
        className="foraria-gradient-button"
        onClick={() => {
          setPressedTime(hora);
          setTime(hora);
        }}
        sx={{
          borderRadius: "12px !important",
          opacity: ocupado ? 0.5 : 1,
          textDecoration: ocupado ? "line-through" : "none",
          transition: "all 0.15s ease",
          transform: isSelected ? "scale(0.96)" : "scale(1)",
          boxShadow: isSelected
            ? "0 0 10px rgba(0,0,0,0.25)"
            : "0 0 5px rgba(0,0,0,0.1)",
          border: isSelected
            ? "2px solid rgba(255,255,255,0.8)"
            : "1px solid rgba(255,255,255,0.3)",
          background: isSelected
            ? "linear-gradient(135deg, #f4d35e, #f0c93cff) !important"
            : "transparent",
          color: isSelected ? "#000000ff" : "inherit",
          "&:hover": {
            background: ocupado
              ? undefined
              : "linear-gradient(135deg, #f4d35e, #f0c93cff)",
            color: "#000",
          },
          "&:active": {
            transform: "scale(0.94)",
            background: "linear-gradient(135deg, #f4d35e, #f0c93cff)",
          },
          "&.Mui-disabled": {
            pointerEvents: "none",
          },
          minWidth: { xs: 64, sm: 80 },
          px: 1.5,
          py: 0.75,
          whiteSpace: "nowrap",
          textTransform: "none",
        }}
      >
        {hora}
      </ToggleButton>
                    );
                  })}
                </ToggleButtonGroup>
              </Box>
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
          <Button
            onClick={onCancel}
            sx={{
              borderRadius: "12px",
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            className="foraria-gradient-button"
            disabled={!isFormValid || creando}
            sx={{
              borderRadius: "12px",
              transition: "all 0.2s ease",
              transform: creando ? "scale(0.97)" : "scale(1)",
            }}
          >
            {creando ? "Guardando..." : "Confirmar"}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
