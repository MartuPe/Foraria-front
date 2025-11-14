import { useState } from "react";
import { Box, Typography, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, } from "@mui/material";
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
import { ForariaStatusModal } from "../components/StatCardForms";

export default function Meetings() {
  const [selected, setSelected] = useState<Meeting | null>(null);
  const [showTranscription, setShowTranscription] = useState(false);

  const [tab, setTab] = useState<"todas" | "actives" | "finalizada">("todas");

  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: "success" | "error";
  }>({
    open: false,
    title: "",
    message: "",
    variant: "error",
  });

  const handleDownloadTranscript = () => {
    setStatusModal({
      open: true,
      variant: "error",
      title: "Descarga no disponible",
      message: "La descarga del PDF de la transcripción todavía no está habilitada. Se activará cuando el backend exponga el archivo.",
    });
  };

  const handleJoinMeeting = () => {
    setStatusModal({
      open: true,
      variant: "error",
      title: "Funcionalidad no disponible",
      message: "La sala de reunión aún no está configurada. Pronto podrás unirte directamente desde aquí.",
    });
  };

  const handleViewDetails = () => {
    setStatusModal({
      open: true,
      variant: "error",
      title: "Funcionalidad en desarrollo",
      message: "La vista de detalles de la reunión está en desarrollo. En la próxima versión vas a poder ver toda la información acá.",
    });
  };

  const handleCloseTranscriptDialog = () => {
    setSelected(null);
    setShowTranscription(false);
  };

  return (
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
        selectedTab={tab}
        onTabChange={(v) => setTab(v as typeof tab)}
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
        chips={[
          { label: "Programada", color: "secondary" },
          { label: "Consorcio", color: "warning" },
        ]}
        showDivider
        extraActions={[
          {
            label: "Unirse",
            color: "secondary",
            variant: "contained",
            onClick: handleJoinMeeting,
            icon: <VideocamIcon />,
          },
          {
            label: "Ver Detalles",
            color: "primary",
            variant: "outlined",
            onClick: handleViewDetails,
            icon: <VisibilityIcon />,
          },
        ]}
        sx={{ mt: 2 }}
      />

      <Dialog
        open={!!selected && showTranscription}
        onClose={handleCloseTranscriptDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            pr: 14,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ArticleOutlinedIcon sx={{ color: "primary.main" }} />
          <Box sx={{ flex: 1 }}>Transcripción - {selected?.title}</Box>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadTranscript}
          > Descargar
          </Button>
          <IconButton onClick={handleCloseTranscriptDialog} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={1.5}>
            {selected?.transcription && selected.transcription.length > 0 ? (
              selected.transcription.map((t, i) => (
                <Box
                  key={i}
                  sx={{
                    pl: 1,
                    borderLeft: "3px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="subtitle2">
                    {t.speaker}{" "}
                    <Typography
                      component="span"
                      color="text.secondary"
                      variant="caption"
                    >
                      {t.time}
                    </Typography>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t.text}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                Esta reunión todavía no tiene una transcripción disponible.
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTranscriptDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <ForariaStatusModal
        open={statusModal.open}
        onClose={() =>
          setStatusModal((prev) => ({
            ...prev,
            open: false,
          }))
        }
        variant={statusModal.variant}
        title={statusModal.title}
        message={statusModal.message}
        primaryActionLabel="Aceptar"
      />
    </Box>
  );
}