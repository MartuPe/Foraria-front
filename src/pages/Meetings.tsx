import { useMemo, useState } from "react";
import { Box, Typography, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArticleIcon from "@mui/icons-material/Article";
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/SectionHeader";
import InfoCard from "../components/InfoCard";
import { ForariaStatusModal } from "../components/StatCardForms";
import { getMeetings, getStats, Meeting,} from "../services/meetingService";
import { storage } from "../utils/storage";
import { Role } from "../constants/roles";
import "../styles/meetings.css";
import CallDialog from "../components/modals/JoinMeeting";
import NewMeet from "../components/modals/NewMeet";
import { CallDto } from "../services/callService";

type TabKey = "todas" | "actives" | "finalizada";

export default function Meetings() {
  const [selected, setSelected] = useState<Meeting | null>(null);
  const [showTranscription, setShowTranscription] = useState(false);
  const [tab, setTab] = useState<TabKey>("todas");
  const [openNewMeet, setOpenNewMeet] = useState(false);


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

  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [selectedMeetingForCall, setSelectedMeetingForCall] =
    useState<Meeting | null>(null);

  const navigate = useNavigate();

  const userRole = storage.role ?? "";
  const canManageMeetings = [Role.ADMIN, Role.CONSORCIO].includes(
    userRole as Role
  );

  const allMeetings = useMemo(() => getMeetings(), []);
  const stats = useMemo(() => getStats(allMeetings), [allMeetings]);

  const filteredMeetings = useMemo(() => {
    if (tab === "todas") return allMeetings;
    if (tab === "actives") {
      return allMeetings.filter(
        (m) => m.status === "scheduled" || m.status === "inProgress"
      );
    }
    if (tab === "finalizada") {
      return allMeetings.filter((m) => m.status === "finished");
    }
    return allMeetings;
  }, [allMeetings, tab]);

  const handleDownloadTranscript = () => {
    setStatusModal({
      open: true,
      variant: "error",
      title: "Descarga no disponible",
      message:
        "La descarga del PDF de la transcripción todavía no está habilitada. Se activará cuando el backend exponga el archivo.",
    });
  };

  const handleViewDetails = (meeting: Meeting) => {
    setSelected(meeting);
    setShowTranscription(true);
  };

  const handleCloseTranscriptDialog = () => {
    setSelected(null);
    setShowTranscription(false);
  };

  const handleOpenJoinPreview = (meeting: Meeting) => {
    setSelectedMeetingForCall(meeting);
    setCallDialogOpen(true);
  };

  const handleJoinSuccess = (call: CallDto) => {
    if (!selectedMeetingForCall) return;

    navigate(
      `/reuniones/${selectedMeetingForCall.id}/llamada/${call.id}`,
      {
        state: {
          meetingId: selectedMeetingForCall.id,
        },
      }
    );
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <Box className="foraria-page-container">
      <PageHeader
        title="Reuniones"
        actions={
          canManageMeetings ? (
            <Button variant="contained" color="secondary" onClick={() => setOpenNewMeet(true)}>
        + Nueva reunión
      </Button>
          ) : undefined
        }
        showSearch
        onSearchChange={(q) => console.log("Buscar:", q)}
        stats={[
          {
            icon: <CalendarTodayIcon />,
            title: "Programadas",
            value: stats.scheduled,
            color: "primary",
          },
          {
            icon: <VideocamIcon />,
            title: "En curso",
            value: stats.inProgress,
            color: "success",
          },
          {
            icon: <ArticleIcon />,
            title: "Con transcripción",
            value: stats.withTranscription,
            color: "info",
          },
          {
            icon: <QueryBuilderIcon />,
            title: "Este mes",
            value: stats.thisMonth,
            color: "secondary",
          },
        ]}
        tabs={[
          { label: "Todas", value: "todas" },
          { label: "Activas", value: "actives" },
          { label: "Finalizadas", value: "finalizada" },
        ]}
        selectedTab={tab}
        onTabChange={(v) => setTab(v as TabKey)}
      />

      <Stack spacing={2} mt={2}>
        {filteredMeetings.map((m) => (
          <InfoCard
            key={m.id}
            title={m.title}
            description={m.description}
            fields={[
              {
                label: `${formatDate(m.date)} · ${m.time}`,
                value: "",
                icon: <CalendarTodayIcon />,
              },
              { label: m.duration, value: "", icon: <QueryBuilderIcon /> },
              { label: m.location, value: "", icon: <VideocamIcon /> },
              {
                label: `${m.participants.length} participantes`,
                value: "",
                icon: <PersonIcon />,
              },
            ]}
            chips={m.tags.map((t) => ({
              label: t,
              color: "secondary" as const,
            }))}
            showDivider
            extraActions={[
              {
                label: "Unirse",
                color: "secondary",
                variant: "contained",
                onClick: () => handleOpenJoinPreview(m),
                icon: <VideocamIcon />,
              },
              {
                label: "Ver Transcripción",
                color: "primary",
                variant: "outlined",
                onClick: () => handleViewDetails(m),
                icon: <VisibilityIcon />,
              },
            ]}
          />
        ))}
      </Stack>

      {/* Diálogo de transcripción */}
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
          >
            Descargar
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

      <Dialog open={openNewMeet} onClose={() => setOpenNewMeet(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <NewMeet
            onCancel={() => setOpenNewMeet(false)}
            onCreated={(data) => {
              console.log("Reunión creada:", data);
              //Llamar al backend para crear la reunión y refrescar la lista de reuniones
            }}
          />
        </DialogContent>
      </Dialog>

      <CallDialog
        open={callDialogOpen}
        onClose={() => setCallDialogOpen(false)}
        meeting={selectedMeetingForCall}
        onJoinSuccess={handleJoinSuccess}
      />
    </Box>
  );
}