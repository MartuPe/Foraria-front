import * as React from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Paper, Stack, Typography, CircularProgress, useTheme, useMediaQuery } from "@mui/material";
import { AddRounded, ChevronLeft, ChevronRight } from "@mui/icons-material";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import "../styles/fullcalendar.css";
import NewReserve from "../components/modals/NewReserve";
import PageHeader from "../components/SectionHeader";
import { useGet } from "../hooks/useGet";

type Reserve = {
  description: string;
  createdAt: string;
  place_id: number;
  placeName: string;
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
  const urlGetReserves = `/Reserve/${localStorage.getItem("consortiumId")}`;
  const { data: reserves, loading, refetch } = useGet<Reserve[]>(urlGetReserves);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const initialDate = React.useMemo(() => {
    const now = new Date();
    const localStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return localStart;
  }, []);

  const events = React.useMemo(() => {
    if (!reserves) return [];
    return reserves.map((r, i) => {
      const date = new Date(r.createdAt);
      const time = date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", });
      return {
        id: String(i),
        title: r.description || "Reserva",
        start: date,
        extendedProps: {
          place: `${r.placeName}`,
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

  return (
    <Box className="foraria-page-container">
      <PageHeader
        title="Calendario y Reservas"
        actions={
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddRounded />}
            onClick={() => setOpenReserve(true)}
            sx={{ px: { xs: 2, md: 3 }, py: { xs: 0.75, md: 1 } }} // responsive
          >
            {isMobile ? "Reservar" : "Reservar espacio común"}
          </Button>
        }
      />
      <Paper
        elevation={0}
        variant="outlined"
        className="foraria-profile-section"
        sx={{
          mt: 2,
          p: { xs: 1, sm: 1.5, md: 2 },              // responsive
          borderRadius: 3,
          borderColor: "divider",
          position: "relative",
          minHeight: 400,
          overflow: 'hidden'
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
          sx={{
            mb: 1.5,
            flexWrap: 'wrap',
            gap: { xs: 1, sm: 0 }
          }}
        >
          <IconButton onClick={goPrev} size="small">
            <ChevronLeft />
          </IconButton>
          <Typography
            variant={isMobile ? "h6" : "h5"}
            fontWeight={600}
            color="primary"
            sx={{ flexGrow: 1, textAlign: 'center', order: { xs: 2, sm: 0 } }}
          >
            {title}
          </Typography>
          <IconButton onClick={goNext} size="small" sx={{ order: { xs: 3, sm: 0 } }}>
            <ChevronRight />
          </IconButton>
        </Stack>
        <Divider sx={{ mb: { xs: 1, md: 1.5 } }} />
        <Box
          sx={{
            width: '100%',
            overflowX: { xs: 'auto', md: 'visible' },
            WebkitOverflowScrolling: 'touch',
            '& .fc': { fontSize: { xs: '0.75rem', sm: '0.85rem' } },
            '& .fc-daygrid-day-number': {
              fontSize: { xs: '0.65rem', sm: '0.75rem' },
              fontWeight: 600,
              padding: { xs: '2px 4px', sm: '4px 6px' }
            },
            '& .fc-daygrid-day-frame': {
              minHeight: { xs: 74, sm: 88 }
            },
            '& .fc-daygrid-event': {
              fontSize: { xs: '0.60rem', sm: '0.70rem' },
              padding: { xs: '1px 3px', sm: '2px 4px' },
              borderRadius: 6,
              maxWidth: '100%'
            },
            '& .cal-event-name': {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block'
            },
            '& .fc-day-today': {
              backgroundColor: 'rgba(255,165,0,0.12)'
            }
          }}
        >
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
            dayMaxEventRows={isMobile ? 3 : 2}        // ligero ajuste móvil
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
                    sx={{ fontSize: { xs: '0.55rem', sm: '0.65rem' }, color: "text.secondary" }}
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
              const formatted = formatter.format(activeStart as Date);
              setTitle(formatted.charAt(0).toUpperCase() + formatted.slice(1));
            }}
          />
        </Box>
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
            (e) =>
              new Date(e.start).toDateString() ===
              new Date(openDay!).toDateString()
          ).length > 0 ? (
            events
              .filter(
                (e) =>
                  new Date(e.start).toDateString() ===
                  new Date(openDay!).toDateString()
              )
              .map((e) => (
                <Typography key={e.id} variant="body2">
                  • {e.title} ({(e as any).extendedProps.place} –{" "}
                  {(e as any).extendedProps.time})
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
            color="secondary"
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
  );
}
