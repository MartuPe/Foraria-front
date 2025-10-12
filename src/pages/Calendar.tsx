import * as React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import { AddRounded, ChevronLeft, ChevronRight} from "@mui/icons-material";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import "../styles/fullcalendar.css";
import NewReserve from "../popups/NewReserve";
import PageHeader from "../components/SectionHeader";
import { Layout } from "../components/layout";

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
  const [fcLocale, setFcLocale] = React.useState<any>(undefined);

  React.useEffect(() => {
    if (process.env.NODE_ENV === "test") return;
    import("@fullcalendar/core/locales/es")
      .then((m) => setFcLocale(m.default ?? m))
      .catch(() => {});
  }, []);

  const updateTitle = () => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    const d = api.getDate();
    const t = d.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
    setTitle(t.charAt(0).toUpperCase() + t.slice(1));
  };

  React.useEffect(() => {
    setTimeout(updateTitle, 0);
  }, []);

  const goPrev = () => { calendarRef.current?.getApi().prev(); updateTitle(); };
  const goNext = () => { calendarRef.current?.getApi().next(); updateTitle(); };

  const isPast = (d: Date) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const copy = new Date(d); copy.setHours(0,0,0,0);
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
  };

  return (
    <Layout>
      <Box className="foraria-page-container">
        <PageHeader
          title="Calendario y Reservas"
          actions={
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddRounded />}
              onClick={() => setOpenReserve(true)}
            >
              Reservar espacio común
            </Button>
          }
          sx={{ mb: 2 }}
        />

        <Paper elevation={0} variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 3, borderColor: "divider" }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
            <IconButton onClick={goPrev} size="small" aria-label="Mes anterior"><ChevronLeft /></IconButton>
            <Typography variant="h5" fontWeight={600} color="primary">{title}</Typography>
            <IconButton onClick={goNext} size="small" aria-label="Mes siguiente"><ChevronRight /></IconButton>
          </Stack>
          <Divider sx={{ mb: 1.5 }} />
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale={fcLocale}
            firstDay={0}
            height="auto"
            fixedWeekCount={false}
            dayMaxEventRows={2}
            events={EVENTS}
            dateClick={onDateClick}
            headerToolbar={false}
            eventDisplay="list-item"
            eventContent={(arg) => (<><span className="cal-dot" /><span className="cal-event-name">{arg.event.title}</span></>)}
            dayCellDidMount={(info) => {
              const el = info.el;
              const isPastCell = el.classList.contains("fc-day-past");
              const isOtherMonth = el.classList.contains("fc-day-other");
              if (!isPastCell && !isOtherMonth) el.classList.add("cal-cursor-event");
            }}
          />
        </Paper>

        {/* Dialogs */}
        <Dialog open={openReserve} onClose={() => setOpenReserve(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle>Reservar espacio común</DialogTitle>
          <DialogContent dividers>
            <NewReserve date={reserveDate} onCancel={() => setOpenReserve(false)} onConfirm={handleConfirmReserve} />
          </DialogContent>
        </Dialog>

        <Dialog open={!!openDay} onClose={() => setOpenDay(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle>
            {openDay && new Date(openDay).toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="subtitle2" gutterBottom>Eventos del día</Typography>
            <Typography variant="body2" color="text.secondary">No hay eventos.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDay(null)}>Cerrar</Button>
            <Button variant="contained" onClick={() => {
              const d = openDay ? new Date(openDay) : null;
              setOpenDay(null); setReserveDate(d); setOpenReserve(true);
            }}>
              Reservar este día
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
