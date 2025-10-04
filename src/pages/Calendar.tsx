import * as React from "react";
import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Stack, TextField, Typography } from "@mui/material";
import { AddRounded, CalendarMonthOutlined, ChevronLeft, ChevronRight } from "@mui/icons-material";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";

import "../styles/fullcalendar.css";
import NewReserve from "./NewReserve";

// Mock de eventos
const EVENTS = [
  { id: "1", title: "Fumigación", start: "2025-11-12" },
  { id: "2", title: "Limpieza de Tanques", start: "2025-10-15" },
  { id: "3", title: "Reunión de Consorcio", start: "2025-10-22" },
  { id: "4", title: "Reunión de Consorcio", start: "2025-10-22" },
  { id: "5", title: "Reunión de Consorcio", start: "2025-10-22" },
  { id: "6", title: "Reunión de Consorcio", start: "2025-10-22" },
  { id: "7", title: "Reunión de Consorcio", start: "2025-10-22" },
  { id: "8", title: "Reunión de Consorcio", start: "2025-10-22" },
];

export default function Calendar() {
  const calendarRef = React.useRef<FullCalendar | null>(null);

  const [openReserve, setOpenReserve] = React.useState(false);
  const [openDay, setOpenDay] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState("");
  const [reserveDate, setReserveDate] = React.useState<Date | null>(null);

  const updateTitle = () => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    const d = api.getDate();
    const t = d.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
    setTitle(t.charAt(0).toUpperCase() + t.slice(1));
  };

  React.useEffect(() => { setTimeout(updateTitle, 0); }, []);

  const goPrev = () => { calendarRef.current?.getApi().prev(); updateTitle(); };
  const goNext = () => { calendarRef.current?.getApi().next(); updateTitle(); };

  const isPast = (d: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const copy = new Date(d);
    copy.setHours(0, 0, 0, 0);
    return copy < today;
  };

  const onDateClick = (arg: DateClickArg) => {
    if (isPast(arg.date)) return;
    setOpenDay(arg.date.toISOString());
  };

  const handleConfirmReserve = (payload: {
    area: string;
    description: string;
    date: string;
    time: string | null;
  }) => {
    console.log("Reserva confirmada:", payload);
    setOpenReserve(false);
    // TODO: persistir en backend y refrescar eventos en FullCalendar
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ bgcolor: "#fff", borderRadius: 4, p: { xs: 2, md: 3 } }}>

        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
        <CalendarMonthOutlined sx={{ fontSize: 36, color: "#0B3A6E" }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#0B3A6E", lineHeight: 1.1,}}>
            Calendario y Reservas
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", mt: 0.5 }} >
            Visualiza eventos y reserva espacios comunes
          </Typography>
        </Box>

        <Button variant="contained" startIcon={<AddRounded />} onClick={() => setOpenReserve(true)}
          sx={{ borderRadius: 999, px: 2.4, py: 1.1, textTransform: "none", fontWeight: 800, boxShadow: "none", bgcolor: "#F59E0B", color: "#fff", "&:hover": { bgcolor: "#ea960b", boxShadow: "none", cursor: "pointer" }, }} >
          Reservar espacio común
        </Button>
      </Stack>
      <Divider sx={{ my: 2 }} />

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <IconButton onClick={goPrev} size="small">
            <ChevronLeft />
          </IconButton>
          <Typography variant="h4" fontWeight={800} color="#0B3A6E">
            {title}
          </Typography>
          <IconButton onClick={goNext} size="small">
            <ChevronRight />
          </IconButton>
        </Stack>

         <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={esLocale}
          firstDay={0}
          height="auto"
          fixedWeekCount={false}
          dayMaxEventRows={2}
          events={EVENTS}
          dateClick={onDateClick}
          headerToolbar={false}
          eventDisplay="list-item"
          eventContent={(arg) => (
            <>
              <span className="cal-dot" />
              <span className="cal-event-name">{arg.event.title}</span>
            </>
          )}

          dayCellDidMount={(info) => {
            const el = info.el;
            const isPastCell = el.classList.contains("fc-day-past");
            const isOtherMonth = el.classList.contains("fc-day-other");
            if (!isPastCell && !isOtherMonth) {
              el.classList.add("cal-cursor-event");
            }
          }}
        />
      </Box>

      {/* Popup: Reservar (usa tu componente) */}
      <Dialog open={openReserve} onClose={() => setOpenReserve(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reservar espacio común</DialogTitle>
        <DialogContent dividers>
          <NewReserve
            date={reserveDate}
            onCancel={() => setOpenReserve(false)}
            onConfirm={handleConfirmReserve}
          />
        </DialogContent>
        {/* Sin DialogActions porque los botones están dentro del componente */}
      </Dialog>

      {/* Popup: Día clickeado */}
      <Dialog open={!!openDay} onClose={() => setOpenDay(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {openDay &&
            new Date(openDay).toLocaleDateString("es-ES", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" gutterBottom>
            Eventos del día
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No hay eventos.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDay(null)}>Cerrar</Button>
          <Button
            variant="contained"
            onClick={() => {
              // abrir el popup con la fecha seleccionada
              const d = openDay ? new Date(openDay) : null;
              setOpenDay(null);
              setReserveDate(d);
              setOpenReserve(true);
            }}
          >
            Reservar este día
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}