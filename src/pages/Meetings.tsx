import { useState } from "react";
import {
  Box, Typography, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
} from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import PageHeader from "../components/SectionHeader";
import InfoCard from "../components/InfoCard";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArticleIcon from "@mui/icons-material/Article";
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Meeting } from "../services/meetingService";
import { Layout } from "../components/layout";

export default function Meetings() {
  const [selected, setSelected] = useState<Meeting | null>(null);
  const [showTranscription, setShowTranscription] = useState(false);

  const handleDownloadTranscript = () => {
    alert("La descarga de PDF se habilitará cuando el backend exponga el archivo.");
  };

  return (
    <Layout>
      <Box className="foraria-page-container">
        <PageHeader
          title="Reuniones"
          showSearch
          onSearchChange={(q) => console.log("Buscar:", q)}
          stats={[
            { icon: <CalendarTodayIcon />, title: "Programadas", value: 5, color: "primary" },
            { icon: <VideocamIcon />, title: "En curso", value: 2, color: "success" },
            { icon: <ArticleIcon />, title: "Con transcripción", value: 2, color: "info" },
            { icon: <QueryBuilderIcon />, title: "Este mes", value: 1, color: "secondary" },
          ]}
          tabs={[
            { label: "Todas", value: "todas" },
            { label: "Activas", value: "actives" },
            { label: "Finalizadas", value: "finalizada" },
          ]}
          selectedTab="todas"
          onTabChange={(v) => console.log("Tab:", v)}
        />

        <InfoCard
          title="Asamblea Ordinaria Mensual"
          description="Revisión de expensas, votación de mejoras y temas varios de la comunidad."
          fields={[
            { label: "15 Nov 2025", value: "", icon: <CalendarTodayIcon /> },
            { label: "19:00 (2 horas)", value: "", icon: <QueryBuilderIcon /> },
            { label: "Virtual", value: "", icon: <VideocamIcon /> },
            { label: "5 participantes", value: "", icon: <PersonIcon /> },
          ]}
          chips={[{ label: "Programada", color: "secondary" }, { label: "Consorcio", color: "warning" }]}
          showDivider
          extraActions={[
            { label: "Unirse", color: "secondary", variant: "contained", onClick: () => alert("Unirse"), icon: <VideocamIcon /> },
            { label: "Ver Detalles", color: "primary", variant: "outlined", onClick: () => alert("Detalles"), icon: <VisibilityIcon /> },
          ]}
          sx={{ mt: 2 }}
        />

        <Dialog
          open={!!selected && showTranscription}
          onClose={() => { setSelected(null); setShowTranscription(false); }}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ pr: 14, display: "flex", alignItems: "center", gap: 1 }}>
            <ArticleOutlinedIcon sx={{ color: "primary.main" }} />
            <Box sx={{ flex: 1 }}>Transcripción - {selected?.title}</Box>
            <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadTranscript}>
              Descargar
            </Button>
            <IconButton onClick={() => { setSelected(null); setShowTranscription(false); }} aria-label="Cerrar">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={1.5}>
              {selected?.transcription?.map((t, i) => (
                <Box key={i} sx={{ pl: 1, borderLeft: "3px solid", borderColor: "divider" }}>
                  <Typography variant="subtitle2">
                    {t.speaker} <Typography component="span" color="text.secondary" variant="caption">{t.time}</Typography>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{t.text}</Typography>
                </Box>
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setSelected(null); setShowTranscription(false); }}>Cerrar</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
