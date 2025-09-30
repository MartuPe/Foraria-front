// src/pages/Meetings.tsx
import { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  TextField,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VideocamIcon from "@mui/icons-material/Videocam";
import GroupIcon from "@mui/icons-material/Group";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  getMeetings,
  getStats,
  Meeting,
  MeetingStatus,
} from "../services/meetingService";

type FilterTab = "all" | MeetingStatus;

/* ---------- Chip coloreado por etiqueta ---------- */
function ColoredTag({ label }: { label: string }) {
  const t = useTheme();
  const styles: Record<string, { bg: string; fg: string }> = {
    Programada: { bg: alpha(t.palette.primary.main, 0.12), fg: t.palette.primary.main },
    Finalizada: { bg: alpha(t.palette.grey[500], 0.18), fg: t.palette.text.secondary },
    Emergencia: { bg: alpha(t.palette.error.main, 0.14), fg: t.palette.error.main },
    Social: { bg: alpha(t.palette.success.main, 0.14), fg: t.palette.success.main },
    Mantenimiento: { bg: alpha(t.palette.warning.main, 0.18), fg: t.palette.warning.dark },
    Consorcio: { bg: alpha(t.palette.info.main, 0.14), fg: t.palette.info.main },
  };
  const s = styles[label] ?? { bg: t.palette.secondary.main, fg: t.palette.text.primary };
  return (
    <Chip
      size="small"
      label={label}
      sx={{ bgcolor: s.bg, color: s.fg, fontWeight: 600, borderRadius: "999px" }}
    />
  );
}

export default function Meetings() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");
  const [selected, setSelected] = useState<Meeting | null>(null);
  const [showTranscription, setShowTranscription] = useState(false);

  const data = getMeetings();
  const stats = getStats(data);

  const filtered = useMemo(() => {
    const byTab = tab === "all" ? data : data.filter((m) => m.status === tab);
    if (!query.trim()) return byTab;
    const q = query.toLowerCase();
    return byTab.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [data, tab, query]);

  /* ===========================================
   * Descargar PDF de transcripción (jsPDF)
   * =========================================== */
  const handleDownloadTranscript = () => {
    if (!selected?.transcription) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const marginX = 40;
    let y = 40;

    // Título
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`Transcripción – ${selected.title}`, marginX, y);
    y += 20;

    // Subtítulo (fecha/hora opcional)
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Generado desde Foraria`, marginX, y);
    y += 10;

    // Tabla con autoTable
    const rows = selected.transcription.map((t) => [t.speaker, t.time, t.text]);

    autoTable(doc, {
      head: [["Orador", "Hora", "Texto"]],
      body: rows,
      startY: y + 10,
      styles: { font: "helvetica", fontSize: 11, cellPadding: 6, valign: "top" },
      headStyles: { fillColor: [8, 61, 119], halign: "left" },
      columnStyles: {
        0: { cellWidth: 130 },
        1: { cellWidth: 60 },
        2: { cellWidth: 320 },
      },
      didDrawPage: (data) => {
        // Footer con número de página
        const page = doc.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(
          `Página ${page}`,
          doc.internal.pageSize.getWidth() - marginX,
          doc.internal.pageSize.getHeight() - 20,
          { align: "right" }
        );
      },
    });

    doc.save(`transcripcion-${selected.id}.pdf`);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: (t) => t.palette.secondary.main, p: { xs: 2, md: 3 } }}>
      <Paper
        elevation={0}
        sx={{
          maxWidth: 1200,
          mx: "auto",
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          bgcolor: "background.paper",
          boxShadow: "0 8px 28px rgba(8,61,119,0.08)",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Título */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Typography variant="h4" color="primary">
            Reuniones
          </Typography>
        </Stack>

        {/* Métricas */}
        <StatsRow scheduled={stats.scheduled} inProgress={stats.inProgress} withTranscription={stats.withTranscription} thisMonth={stats.thisMonth} />

        {/* Buscador + Tabs */}
        <Stack spacing={2} sx={{ mb: 2 }}>
          <TextField
            placeholder="Buscar reuniones..."
            fullWidth
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "secondary.main",
                "& fieldset": { borderColor: "divider" },
              },
            }}
          />

          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                color: "text.secondary",
                borderRadius: 2,
                minHeight: 36,
                px: 2,
                mr: 1,
                border: "1px solid",
                borderColor: "divider",
              },
              "& .Mui-selected": {
                bgcolor: "primary.main",
                color: "primary.contrastText !important",
                fontWeight: 700,
                borderColor: "primary.main",
                boxShadow: "0 2px 8px rgba(8,61,119,0.25)",
              },
              "& .MuiTabs-indicator": { display: "none" },
            }}
          >
            <Tab label="Todas" value="all" />
            <Tab label={`Programadas (${stats.scheduled})`} value="scheduled" />
            <Tab label={`Finalizadas (${data.filter(m=>m.status==='finished').length})`} value="finished" />
          </Tabs>
        </Stack>

        {/* Lista */}
        <Stack spacing={2.5}>
          {filtered.map((m) => (
            <Card key={m.id} elevation={0} variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6">{m.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {m.description}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  {m.tags.map((t, i) => (
                    <ColoredTag key={i} label={t} />
                  ))}
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }} alignItems="center">
                  <Meta icon={<EventIcon fontSize="small" />} text={m.date} />
                  <Meta icon={<AccessTimeIcon fontSize="small" />} text={`${m.time} (${m.duration})`} />
                  <Meta icon={<VideocamIcon fontSize="small" />} text={m.location} />
                  <Meta icon={<GroupIcon fontSize="small" />} text={`${m.participants.length} participantes`} />
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<InfoOutlinedIcon />}
                    onClick={() => {
                      setSelected(m);
                      setShowTranscription(false);
                    }}
                  >
                    Ver Detalle
                  </Button>

                  {m.hasRecording && (
                    <Button variant="outlined" color="primary" startIcon={<VideocamIcon />}>
                      Ver Grabación
                    </Button>
                  )}

                  {m.transcription && (
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<ArticleOutlinedIcon />}
                      onClick={() => {
                        setSelected(m);
                        setShowTranscription(true);
                      }}
                    >
                      Transcripción
                    </Button>
                  )}

                  {m.status === "scheduled" && (
                    <Button variant="contained" color="info" sx={{ ml: "auto" }} startIcon={<VideocamIcon />}>
                      Unirse
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Paper>

      {/* ------ MODALES ------ */}

      {/* Detalle */}
      <Dialog
        open={!!selected && !showTranscription}
        onClose={() => setSelected(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pr: 6 }}>
          {selected?.title}
          <IconButton onClick={() => setSelected(null)} sx={{ position: "absolute", right: 8, top: 8 }} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <GridTwoCols leftTitle="Fecha y Hora" leftText={`${selected?.date} a las ${selected?.time}`} rightTitle="Duración" rightText={selected?.duration} />
          <GridTwoCols leftTitle="Organizador" leftText={selected?.organizer} rightTitle="Ubicación" rightText={selected?.location} />
          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            Descripción
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selected?.description}
          </Typography>
          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            Participantes ({selected?.participants.length})
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
            {selected?.participants.map((p, i) => (
              <Chip key={i} label={p} size="small" />
            ))}
          </Stack>
          {selected?.status === "scheduled" && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                Enlace de Videollamada
              </Typography>
              <Typography color="primary">https://meet.foraria.com/asamblea-nov-2024</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Transcripción + Descargar */}
      <Dialog
        open={!!selected && showTranscription}
        onClose={() => {
          setSelected(null);
          setShowTranscription(false);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pr: 14, display: "flex", alignItems: "center", gap: 1 }}>
          <ArticleOutlinedIcon sx={{ color: "primary.main" }} />
          <Box sx={{ flex: 1 }}>
            Transcripción - {selected?.title}
          </Box>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadTranscript}
          >
            Descargar
          </Button>
          <IconButton
            onClick={() => {
              setSelected(null);
              setShowTranscription(false);
            }}
            aria-label="Cerrar"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            {selected?.transcription?.map((t, i) => (
              <Box key={i} sx={{ pl: 1, borderLeft: "3px solid", borderColor: "divider" }}>
                <Typography variant="subtitle2">
                  {t.speaker}{" "}
                  <Typography component="span" color="text.secondary" variant="caption">
                    {t.time}
                  </Typography>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t.text}
                </Typography>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setSelected(null);
              setShowTranscription(false);
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/* ---------- helpers UI ---------- */
function StatsRow({
  scheduled,
  inProgress,
  withTranscription,
  thisMonth,
}: {
  scheduled: number;
  inProgress: number;
  withTranscription: number;
  thisMonth: number;
}) {
  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
      <StatCard icon={<EventIcon />} title="Programadas" value={scheduled} color="primary" />
      <StatCard icon={<VideocamIcon />} title="En Curso" value={inProgress} color="success" />
      <StatCard icon={<ArticleOutlinedIcon />} title="Con Transcripción" value={withTranscription} color="secondary" />
      <StatCard icon={<AccessTimeIcon />} title="Este Mes" value={thisMonth} color="warning" />
    </Stack>
  );
}

function StatCard({
  icon,
  title,
  value,
  color = "primary",
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  color?: "primary" | "success" | "secondary" | "warning";
}) {
  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{ p: 2, borderRadius: 3, minWidth: 220, display: "flex", alignItems: "center", gap: 2 }}
    >
      <Box
        sx={(t) => ({
          width: 36,
          height: 36,
          borderRadius: "10px",
          display: "grid",
          placeItems: "center",
          bgcolor: alpha(t.palette[color].main, 0.2),
          color: t.palette[color].main,
        })}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h6">{value}</Typography>
      </Box>
    </Paper>
  );
}

function Meta({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
      <Box sx={{ display: "grid", placeItems: "center" }}>{icon}</Box>
      <Typography variant="body2">{text}</Typography>
    </Stack>
  );
}

function GridTwoCols({
  leftTitle,
  leftText,
  rightTitle,
  rightText,
}: {
  leftTitle?: string;
  leftText?: string;
  rightTitle?: string;
  rightText?: string;
}) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1, sm: 2 }} sx={{ mb: 1.5 }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2">{leftTitle}</Typography>
        <Typography variant="body2" color="text.secondary">
          {leftText}
        </Typography>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2">{rightTitle}</Typography>
        <Typography variant="body2" color="text.secondary">
          {rightText}
        </Typography>
      </Box>
    </Stack>
  );
}
