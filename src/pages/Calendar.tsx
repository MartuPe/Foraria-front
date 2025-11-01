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
  Typography,
  CircularProgress,
} from "@mui/material";
import { AddRounded, ChevronLeft, ChevronRight } from "@mui/icons-material";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import "../styles/fullcalendar.css";
import NewReserve from "../components/modals/NewReserve";
import PageHeader from "../components/SectionHeader";
import { Layout } from "../components/layout";
import { useGet } from "../hooks/useGet";

type Reserve = {
  description: string;
  createdAt: string;
  place_id: number;
  residence_id: number;
  user_id: number;
};

export default function Calendar() {
  const calendarRef = React.useRef<FullCalendar | null>(null);

  const [openReserve, setOpenReserve] = React.useState(false);
  const [openDay, setOpenDay] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState("");
  const [reserveDate, setReserveDate] = React.useState<Date | null>(null);
  const [fcLocale, setFcLocale] = React.useState<any>(undefined);

  const { data: reserves, loading, refetch } = useGet<Reserve[]>("/Reserve");

  
  const initialDate = React.useMemo(() => {
    const now = new Date();
    const localStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    console.log("initialDate (localStart) toString:", localStart.toString());
    console.log("initialDate (localStart) toISOString:", localStart.toISOString());
    return localStart;
  }, []);

 
  const events = React.useMemo(() => {
    if (!reserves) return [];
    return reserves.map((r, i) => {
      const date = new Date(r.createdAt);
      const time = date.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return {
        id: String(i),
        title: r.description || "Reserva",
        start: date, 
        extendedProps: {
          place: `Lugar #${r.place_id}`,
          time,
        },
      };
    });
  }, [reserves]);


  React.useEffect(() => {
    import("@fullcalendar/core/locales/es")
      .then((m) => setFcLocale(m.default ?? m))
      .catch(() => {});
  }, []);

  
  React.useEffect(() => {
    const today = new Date();
    const formatter = new Intl.DateTimeFormat("es-ES", {
      month: "long",
      year: "numeric",
    });
    const formatted = formatter.format(today);
    setTitle(formatted.charAt(0).toUpperCase() + formatted.slice(1));
  }, []);

  const goPrev = () => calendarRef.current?.getApi().prev();
  const goNext = () => calendarRef.current?.getApi().next();

  const isPast = (d: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const copy = new Date(d);
    copy.setHours(0, 0, 0, 0);
    return copy < today;
  };

  const onDateClick = (arg: DateClickArg) => {
    if (!isPast(arg.date)) setOpenDay(arg.date.toISOString());
  };

  const handleConfirmReserve = React.useCallback(() => {
    setOpenReserve(false);
    refetch();
  }, [refetch]);

  
  React.useEffect(() => {
    const t = setTimeout(() => {
      if (!calendarRef.current) return;
      try {
        const api = calendarRef.current.getApi();
        const apiDate = api.getDate(); 
        console.log("FullCalendar api.getDate() toString:", apiDate.toString());
        console.log("FullCalendar api.getDate() toISOString:", apiDate.toISOString());
      } catch (e) {
        console.log("FullCalendar api no disponible aún");
      }
    }, 200);
    return () => clearTimeout(t);
  }, []);

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
        />

        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            p: { xs: 1.5, md: 2 },
            borderRadius: 3,
            borderColor: "divider",
            position: "relative",
            minHeight: 400,
          }}
        >
          {loading && (
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: "rgba(255,255,255,0.6)",
                zIndex: 10,
              }}
            >
              <CircularProgress />
            </Stack>
          )}

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1.5 }}
          >
            <IconButton onClick={goPrev} size="small">
              <ChevronLeft />
            </IconButton>
            <Typography variant="h5" fontWeight={600} color="primary">
              {title}
            </Typography>
            <IconButton onClick={goNext} size="small">
              <ChevronRight />
            </IconButton>
          </Stack>

          <Divider sx={{ mb: 1.5 }} />

          <FullCalendar
          key={`${initialDate.toDateString()}-${fcLocale ? "L" : "N"}`}
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            initialDate={initialDate}
            timeZone="local"
            locale={fcLocale}
            firstDay={0}
            height="auto"
            fixedWeekCount={false}
            dayMaxEventRows={2}
            events={events}
            dateClick={onDateClick}
            headerToolbar={false}
            showNonCurrentDates={false}
            eventDisplay="list-item"
            eventContent={(arg) => {
              const { place, time } = arg.event.extendedProps as any;
              return (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span className="cal-event-name">{arg.event.title}</span>
                  <Typography
                    variant="caption"
                    sx={{ fontSize: "0.7rem", color: "text.secondary" }}
                  >
                    {place} – {time}
                  </Typography>
                </div>
              );
            }}
            dayCellDidMount={(info) => {
              const el = info.el;
              const isPastCell = el.classList.contains("fc-day-past");
              const isOtherMonth = el.classList.contains("fc-day-other");
              if (!isPastCell && !isOtherMonth) el.classList.add("cal-cursor-event");
            }}
            datesSet={(info) => {
              const activeStart =
                (info.view && (info.view as any).activeStart) || info.start;
              const formatter = new Intl.DateTimeFormat("es-ES", {
                month: "long",
                year: "numeric",
              });
              const formatted = formatter.format(activeStart);
              setTitle(formatted.charAt(0).toUpperCase() + formatted.slice(1));
              console.log("datesSet activeStart toString:", (activeStart as Date).toString());
              console.log("datesSet activeStart toISOString:", (activeStart as Date).toISOString());
            }}
          />
        </Paper>

      
        <Dialog
          open={openReserve}
          onClose={() => setOpenReserve(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle>Reservar espacio común</DialogTitle>
          <DialogContent dividers>
            <NewReserve
              date={reserveDate}
              onCancel={() => setOpenReserve(false)}
              onConfirm={handleConfirmReserve}
            />
          </DialogContent>
        </Dialog>

     
        <Dialog
          open={!!openDay}
          onClose={() => setOpenDay(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
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
            {events.filter(
              (e) => new Date(e.start).toDateString() === new Date(openDay!).toDateString()
            ).length > 0 ? (
              events
                .filter(
                  (e) => new Date(e.start).toDateString() === new Date(openDay!).toDateString()
                )
                .map((e) => (
                  <Typography key={e.id} variant="body2">
                    • {e.title} ({e.extendedProps.place} – {e.extendedProps.time})
                  </Typography>
                ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay eventos.
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDay(null)}>Cerrar</Button>
            <Button
              variant="contained"
              onClick={() => {
                setReserveDate(openDay ? new Date(openDay) : null);
                setOpenReserve(true);
                setOpenDay(null);
              }}
            >
              Reservar este día
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
