import { useEffect, useMemo, useState } from "react";
import { Box, Typography, Stack, Button, Dialog, DialogContent,} from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ArticleIcon from "@mui/icons-material/Article";
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate, useLocation } from "react-router-dom";
import PageHeader from "../components/SectionHeader";
import InfoCard from "../components/InfoCard";
import { ForariaStatusModal } from "../components/StatCardForms";
import { getStats, Meeting, fetchMeetingsByConsortium,} from "../services/meetingService";
import { storage } from "../utils/storage";
import { Role } from "../constants/roles";
import "../styles/meetings.css";
import CallDialog from "../components/modals/JoinMeeting";
import NewMeet from "../components/modals/NewMeet";
import { CallDto } from "../services/callService";

type TabKey = "todas" | "actives" | "finalizada";

export default function Meetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [tab, setTab] = useState<TabKey>("todas");
  const [openNewMeet, setOpenNewMeet] = useState(false);
  const [statusModal, setStatusModal] = useState<{ open: boolean; title: string; message: string; variant: "success" | "error";}>({open: false, title: "", message: "", variant: "error",});
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [selectedMeetingForCall, setSelectedMeetingForCall] = useState<Meeting | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const userRole = storage.role ?? "";
  const canManageMeetings = [Role.ADMIN, Role.CONSORCIO].includes(userRole as Role);

  useEffect(() => {
    const loadMeetings = async () => {
      try {
        setLoading(true);
        const consortiumId = Number(
          localStorage.getItem("consortiumId") || 0
        );

        if (!consortiumId) {
          setStatusModal({
            open: true,
            title: "Sin consorcio",
            message:"No se encontró el consorcio asociado. Verificá tu sesión o configuración.",
            variant: "error",
          });
          return;
        }

        const data = await fetchMeetingsByConsortium(consortiumId);
        setMeetings(data);
      } catch (err) {
        console.error("Error cargando reuniones:", err);
        setStatusModal({
          open: true,
          title: "Error al cargar reuniones",
          message: "No pudimos obtener la lista de reuniones. Intentá nuevamente más tarde.",
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    loadMeetings();
  }, []);

  const stats = useMemo(() => getStats(meetings), [meetings]);

  const filteredMeetings = useMemo(() => {
    if (tab === "todas") return meetings;
    if (tab === "actives") {
      return meetings.filter(
        (m) => m.status === "scheduled" || m.status === "inProgress"
      );
    }
    if (tab === "finalizada") {
      return meetings.filter((m) => m.status === "finished");
    }
    return meetings;
  }, [meetings, tab]);

  const handleOpenJoinPreview = (meeting: Meeting) => {
    setSelectedMeetingForCall(meeting);
    setCallDialogOpen(true);
  };

  const handleJoinSuccess = (call: CallDto) => {
    if (!selectedMeetingForCall) return;
    setCallDialogOpen(false);
    const base = isAdminRoute ? `/admin/reuniones/${selectedMeetingForCall.id}` : `/reuniones/${selectedMeetingForCall.id}`;
    navigate(`${base}/llamada/${call.id}`, {
      state: { meetingId: selectedMeetingForCall.id,},
    });
  };

  const formatLocalYMD = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

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
            icon: <CheckCircleOutlinedIcon />,
            title: "Finalizadas",
            value: stats.finished,
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
        {loading && <Typography>Cargando reuniones...</Typography>}
        {!loading && filteredMeetings.length === 0 && (
          <Typography color="text.secondary">
            No hay reuniones para mostrar.
          </Typography>
        )}
        {!loading &&
          filteredMeetings.map((m) => (
            <InfoCard
              key={m.id}
              title={m.title}
              description={m.description}
              fields={[
                {
                  label: `${formatLocalYMD(m.date)} · ${m.time}`,
                  value: "",
                  icon: <CalendarTodayIcon />,
                },
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
              extraActions={
                m.status === "finished" ? undefined : [{label: "Unirse", color: "secondary" as const, variant: "contained" as const, onClick: () => handleOpenJoinPreview(m), icon: <VideocamIcon />,},]
              }
            />
          ))}
      </Stack>

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
            onCreated={(newMeeting) => {
              setMeetings((prev) => [newMeeting, ...prev]);
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