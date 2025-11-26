import { useEffect, useState, useMemo } from "react";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Button, 
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
  Divider,
  Avatar,
  AvatarGroup,
  Tooltip,
  IconButton,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  RadioGroup,            
  FormControlLabel,      
  Radio,
  Paper                  
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  BarChart as BarChartIcon,
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
  Share as ShareIcon,
  Notifications as NotificationsIcon,
  CalendarToday as CalendarTodayIcon,
  HowToVote as HowToVoteIcon 
} from "@mui/icons-material";
import PageHeader from "../components/SectionHeader";
import { useGet } from "../hooks/useGet";
import { useMutation } from "../hooks/useMutation";
import { useSignalR } from "../hooks/useSignalR";
import { api } from "../api/axios";
import { storage } from "../utils/storage"; 
import SuccessModal from "../components/modals/SuccessModal"; 
import NewVote from "../components/modals/NewVote"; // Importar tu componente

export interface PollOption {
  id: number;
  text: string;
}

export interface PollResult {
  pollOptionId: number;
  votesCount: number;
}

export interface Poll {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  deletedAt?: string | null;
  state: string;
  categoryPollId: number;
  userId?: number;
  pollOptions: PollOption[];
  pollResults: PollResult[];
  startDate?: string;
  endDate?: string;
}

interface CreatePollDto {
  title: string;
  description: string;
  categoryPoll_id: number;
  user_id: number;
  startDate: string;
  endDate: string;
  pollOptions: string[];
}

interface VoteDto {
  user_Id: number;
  poll_Id: number;
  pollOption_Id: number;
}

const BACKEND_STATE_VALUES: Record<string, string> = {
  pendiente: 'Pendiente',
  borrador: 'Borrador',
  activa: 'Activa',
  rechazada: 'Rechazada',
  cerrada: 'Cerrada'
};

const tienePermisos = localStorage.getItem("hasPermission")

interface PollCategory { id: number; name: string; }

const POLL_CATEGORIES: PollCategory[] = [
  { id: 1, name: 'General' },
  { id: 2, name: 'Mantenimiento' },
  { id: 3, name: 'Eventos' },
  { id: 4, name: 'Presupuesto' },
  { id: 5, name: 'Seguridad' },
  { id: 6, name: 'Mejoras' }
];

interface UserCountResponse {
  totalUsers: number;
}

interface PollVoteResult {
  pollId: number;
  results: { pollOptionId: number; votesCount: number }[];
}

export default function VotesPrueba() {
  const isAdministrador = storage.role === "Administrador" || storage.role === "Consorcio";
  
  const [tab, setTab] = useState<"todas" | "actives" | "finalizada" | "pendientes">("todas");
  const [polls, setPolls] = useState<Poll[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
const [loadError, setLoadError] = useState<string | null>(null);
  // Estados de votación
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [userVotes, setUserVotes] = useState<Set<number>>(new Set());
  const [showAlreadyVotedModal, setShowAlreadyVotedModal] = useState(false);
  const [showVoteErrorModal, setShowVoteErrorModal] = useState(false);       
  const [voteErrorMessage, setVoteErrorMessage] = useState<string>("");       
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pollVoters, setPollVoters] = useState<Record<number, { userId: number; userName: string }[]>>({}); 

  // Estados para admin - NewVote modal y editar
  const [showNewVoteModal, setShowNewVoteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
  
  // Estados para editar poll
  const [newPoll, setNewPoll] = useState<Partial<CreatePollDto & { state: string }>>({
    title: '',
    description: '',
    categoryPoll_id: 1,
    state: 'activa', 
    pollOptions: ['', '']
  });
  const [editErrors, setEditErrors] = useState<string[]>([]);

  const { data: pollsData, loading, error, refetch } = useGet<Poll[]>(
  "/polls/with-results"
);
  const [selectedPollResults, setSelectedPollResults] = useState<Poll | null>(null);

  const handleOpenResultsModal = (poll: Poll) => {
    setSelectedPollResults(poll);
  };

  const handleCloseResultsModal = () => {
    setSelectedPollResults(null);
  };

  const { mutate: sendVote } = useMutation(
    "https://foraria-api-e7dac8bpewbgdpbj.brazilsouth-01.azurewebsites.net/api/votes",
    "post"
  );

  const { on, connected } = useSignalR({
    url: "https://foraria-api-e7dac8bpewbgdpbj.brazilsouth-01.azurewebsites.net/pollHub",
  });

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const { data } = await api.get<UserCountResponse>("/User/count");
        setTotalUsers(data.totalUsers);
      } catch (err) {
        console.error("Error al obtener total de usuarios:", err);
      }
    };
    fetchUserCount();
  }, []);

 useEffect(() => {
  // Si hay datos, cargarlos y limpiar error
  if (pollsData) {
    setPolls(pollsData);
    setLoadError(null);
  }
  
  // Manejar errores
  if (error) {
    const errorMsg = typeof error === 'string' ? error : String(error);
    
    // Detectar si es un error 404 o "no se encontraron"
    const is404 = errorMsg.toLowerCase().includes("404") || 
                  errorMsg.toLowerCase().includes("not found") ||
                  errorMsg.toLowerCase().includes("status code 404");
    
    const isNotFound = errorMsg.toLowerCase().includes("no se encontraron") ||
                      errorMsg.toLowerCase().includes("no hay");
    
    if (is404 || isNotFound) {
      // Para 404, mostramos lista vacía SIN mensaje de error
      setPolls([]);
      setLoadError(null);
    } else {
      // Para otros errores, mostramos mensaje de error
      setPolls([]);
      setLoadError("No se pudieron cargar las votaciones. Intentá nuevamente más tarde.");
    }
  }
}, [pollsData, error]);

  useEffect(() => {
    if (!connected) return;
    on("PollUpdated", (voteData: PollVoteResult) => {
      setPolls((prevPolls) =>
        prevPolls.map((poll) =>
          poll.id === voteData.pollId
            ? {
                ...poll,
                pollResults: voteData.results.map((r: { pollOptionId: number; votesCount: number }) => ({
                  pollOptionId: r.pollOptionId,
                  votesCount: r.votesCount,
                })),
              }
            : poll
        )
      );
    });
  }, [connected, on]);

  // Handlers de votación
  const handleOpenVoteModal = (poll: Poll) => {
    setSelectedPoll(poll);
    setSelectedOption(null);
  };

  const handleCloseVoteModal = () => {
    setSelectedPoll(null);
    setSelectedOption(null);
  };

  const handleSubmitVote = async () => {
    if (!selectedPoll || !selectedOption) return;

    const userIdRaw = localStorage.getItem("userId");
    const userId = Number(userIdRaw);
    if (!userIdRaw || isNaN(userId)) {
      setVoteErrorMessage("Usuario inválido. Inicie sesión nuevamente.");
      setShowVoteErrorModal(true);
      return;
    }

    if (!["activa"].includes(selectedPoll.state.toLowerCase())) {
      setVoteErrorMessage("La votación no está activa.");
      setShowVoteErrorModal(true);
      return;
    }

    setIsVoting(true);

    const vote: VoteDto = {
      user_Id: userId,
      poll_Id: selectedPoll.id,
      pollOption_Id: selectedOption,
    };

    try {
      await sendVote(vote);
      setUserVotes(prev => {
        const next = new Set(prev);
        next.add(selectedPoll.id);
        localStorage.setItem("votedPollIds", JSON.stringify(Array.from(next)));
        return next;
      });
      handleCloseVoteModal();
      setShowSuccessModal(true); 
    } catch (err: any) {
      const status = err?.response?.status;
      const data = err?.response?.data;

      const payloadText = JSON.stringify(data || "").toLowerCase();
      const isAlready =
        (status === 400 || status === 409) &&
        /ya\s*vot(o|ó)|already\s*vot(ed)?|voto\s*duplicado/.test(payloadText);

      if (isAlready) {
        handleCloseVoteModal();
        setShowAlreadyVotedModal(true);
        setUserVotes(prev => {
          if (prev.has(selectedPoll.id)) return prev;
          const next = new Set(prev);
          next.add(selectedPoll.id);
          localStorage.setItem("votedPollIds", JSON.stringify(Array.from(next)));
          return next;
        });
      } else {
        let msg = "Error inesperado al votar.";
        if (status === 404) msg = "Votación u opción no encontrada.";
        else if (status === 500) msg = "Error interno del servidor.";
        else if (typeof data === "string") msg = data;
        else if (data?.message) msg = data.message;
        setVoteErrorMessage(msg);
        setShowVoteErrorModal(true);
      }
    } finally {
      setIsVoting(false);
    }
  };

  const handleEditPoll = async () => {
    if (!editingPoll) return;
    setEditErrors([]);
    try {
      const normalizedState = newPoll.state
        ? BACKEND_STATE_VALUES[newPoll.state.toLowerCase()] || newPoll.state
        : undefined;

      const updateData: any = {
        title: newPoll.title,
        description: newPoll.description,
        state: normalizedState,
        categoryPollId: newPoll.categoryPoll_id,
        userId: Number(localStorage.getItem("userId"))
      };
      if (newPoll.startDate) updateData.startDate = newPoll.startDate;
      if (newPoll.endDate) updateData.endDate = newPoll.endDate;

      await api.put(`/polls/${editingPoll.id}`, updateData);

      setShowEditModal(false);
      setEditingPoll(null);
      refetch();
    } catch (err: any) {
      console.error("Error al editar votación:", err);
      const backendErrors = err?.response?.data?.errors;
      if (backendErrors) {
        const collected: string[] = [];
        Object.keys(backendErrors).forEach(k => {
          backendErrors[k].forEach((m: string) => collected.push(`${k}: ${m}`));
        });
        setEditErrors(collected);
      }
    }
  };

  const openEditModal = (poll: Poll) => {
    setEditingPoll(poll);
    setNewPoll({
      title: poll.title,
      description: poll.description,
      categoryPoll_id: poll.categoryPollId,
      state: poll.state?.toLowerCase(), 
      startDate: poll.startDate,
      endDate: poll.endDate,
      pollOptions: poll.pollOptions.map(opt => opt.text)
    });
    setEditErrors([]);
    setShowEditModal(true);
  };

  const fetchPollVoters = async (pollId: number) => {                
    if (!isAdministrador || pollVoters[pollId]) return;
    try {
      const { data } = await api.get(`/votes/poll/${pollId}/users`);  
      setPollVoters(prev => ({ ...prev, [pollId]: data }));
    } catch (e) {
      console.error("Error obteniendo votantes reales:", e);
    }
  };

  const getDetailedResults = (poll: Poll) => {
    const resultsMap = new Map<number, number>();
    (poll.pollResults || []).forEach((r) =>
      resultsMap.set(r.pollOptionId, r.votesCount)
    );

    const totalVotes = Array.from(resultsMap.values()).reduce((s, v) => s + v, 0);
    
    const optionsWithResults = poll.pollOptions.map(option => {
      const votes = resultsMap.get(option.id) || 0;
      const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
      return {
        ...option,
        votes,
        percentage
      };
    }).sort((a, b) => b.votes - a.votes);

    const winner = optionsWithResults.length > 0 ? optionsWithResults[0] : null;
    const participationPercent = totalUsers > 0 ? Math.round((totalVotes / totalUsers) * 100) : 0;
    return {
      totalVotes,
      participationPercent,
      optionsWithResults,
      winner: winner && winner.votes > 0 ? winner : null
    };
  };

  const getRecentParticipants = (pollId: number) => {                
    if (!isAdministrador) return [];
    const cached = pollVoters[pollId];
    if (cached) return cached.slice(-6);
    fetchPollVoters(pollId);
    return [];
  };

  const renderPollCard = (poll: Poll) => {
    const stateLower = poll.state?.toLowerCase().trim();
    const isActive = stateLower === "activa";
    const isPending = stateLower === "pendiente";
    const isDraft = stateLower === "borrador";
    const isRejected = stateLower === "rechazada";
    const { totalVotes, participationPercent } = getDetailedResults(poll);
    const recentParticipants = getRecentParticipants(poll.id); 
    const hasVoted = userVotes.has(poll.id);
    const isPollOpen = isActive || isPending || isDraft; 

    return (
      <Card 
        key={poll.id} 
        variant="outlined" 
        sx={{ 
          borderRadius: 3,
          border: isActive ? '2px solid' : isPending ? '2px dashed' : '1px solid',
          borderColor: isActive ? 'success.main' : isPending ? 'warning.main' : 'grey.300',
          backgroundColor: isActive ? 'success.50' : isPending ? 'warning.50' : 'grey.50',
          position: 'relative',
          overflow: 'visible',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          opacity: isActive ? 1 : isPending ? 0.9 : 0.85,
          '&:hover': {
            transform: isActive || isPending ? 'translateY(-6px) scale(1)' : 'translateY(-2px)',
            boxShadow: isActive || isPending 
              ? '0 12px 24px rgba(0,0,0,0.15)' 
              : '0 4px 12px rgba(0,0,0,0.08)',
            borderColor: isActive ? 'success.dark' : isPending ? 'warning.dark' : 'grey.400',
            opacity: 1
          }
        }}
      >
        {isAdministrador && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              display: 'flex',
              gap: 0.5,
              zIndex: 2
            }}
          >
            <Tooltip title="Editar votación">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditModal(poll);
                }}
                sx={{
                  backgroundColor: 'white',
                  boxShadow: 1,
                  '&:hover': { boxShadow: 2 }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {!isActive && !isPending && !isDraft && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              backgroundColor: isRejected ? 'error.main' : 'grey.600',
              color: 'white',
              px: 1,
              py: 0.5,
              borderRadius: 999,
              fontSize: '0.75rem',
              fontWeight: 600,
              zIndex: 1
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 14 }} />
            {poll.state?.toUpperCase() || 'CERRADA'}
          </Box>
        )}

        {isPending && (
          <Chip
            icon={<AccessTimeIcon />}
            label="Pendiente Aprobación"
            color="warning"
            size="small"
            sx={{
              position: 'absolute',
              top: -8,
              right: 16,
              zIndex: 1,
              fontWeight: 600,
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' }
              }
            }}
          />
        )}

        <CardContent>
          <Stack spacing={2.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Typography 
                    variant="h6" 
                    color={isActive ? "primary" : isPending ? "warning.dark" : "text.secondary"}
                    sx={{ 
                      fontWeight: isActive || isPending ? 600 : 500,
                    }}
                  >
                    {poll.title}
                  </Typography>
                  {(isActive || isPending) && (
                    <IconButton size="small" color="default">
                      <ShareIcon fontSize="small" />
                    </IconButton>
                  )}
                </Stack>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 1.5,
                    opacity: isActive || isPending ? 1 : 0.8
                  }}
                >
                  {poll.description}
                </Typography>
              </Box>
              
              <Stack direction="row" spacing={1}>
                <Chip 
                  label={poll.state || "Cerrada"}
                  color={
                    isPending ? "warning" : 
                    isActive ? "success" :
                    isRejected ? "error" :
                    isDraft ? "info" :
                    "default"
                  }
                  size="small"
                  variant={isActive || isPending ? "filled" : "outlined"}
                  sx={{
                    fontWeight: 600,
                    backgroundColor: (!isActive && !isPending && !isDraft && !isRejected) ? 'grey.200' : undefined,
                    color: (!isActive && !isPending && !isDraft && !isRejected) ? 'grey.700' : undefined
                  }}
                />
              </Stack>
            </Stack>

            {(isActive || isPending || isDraft) && poll.endDate && (
              <Alert 
                severity={isPending ? "warning" : "info"}
                icon={<AccessTimeIcon />}
                sx={{ 
                  backgroundColor: isPending ? 'warning.50' : 'info.50',
                  border: '1px solid',
                  borderColor: isPending ? 'warning.200' : 'info.200'
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {isPending ? 'Pendiente aprobación' : `Finaliza: ${new Date(poll.endDate).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}`}
                </Typography>
              </Alert>
            )}

            {!isActive && !isPending && !isDraft && (
              <Alert 
                severity={isRejected ? "error" : "success"}
                sx={{ 
                  backgroundColor: isRejected ? 'error.50' : 'grey.100',
                  border: '1px solid',
                  borderColor: isRejected ? 'error.200' : 'grey.300',
                  '& .MuiAlert-icon': {
                    color: isRejected ? 'error.main' : 'grey.600'
                  }
                }}
              >
                <Typography variant="body2" fontWeight={600} color={isRejected ? 'error.dark' : 'grey.700'}>
                  Votación {isRejected ? 'rechazada' : 'cerrada'} el {new Date(poll.endDate || poll.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </Typography>
              </Alert>
            )}

            <Stack direction="row" alignItems="center" spacing={3} flexWrap="wrap">
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <CalendarTodayIcon 
                  fontSize="small" 
                  sx={{ color: isActive || isPending ? 'action.active' : 'action.disabled' }}
                />
                <Typography 
                  variant="body2" 
                  color={isActive || isPending ? "text.secondary" : "text.disabled"}
                >
                  {new Date(poll.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </Typography>
              </Stack>
              
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <PeopleIcon 
                  fontSize="small" 
                  sx={{ color: isActive || isPending ? 'action.active' : 'action.disabled' }}
                />
                <Typography 
                  variant="body2" 
                  color={isActive || isPending ? "text.secondary" : "text.disabled"}
                >
                  {totalVotes} {totalVotes === 1 ? 'voto' : 'votos'}
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography 
                  variant="body2" 
                  color={isActive || isPending ? "text.secondary" : "text.disabled"}
                >
                  {participationPercent}% participación
                </Typography>
              </Stack>
            </Stack>

          
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography 
                    variant="caption" 
                    color={isActive || isPending ? "text.secondary" : "text.disabled"}
                  >
                    Participación
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color={isActive || isPending ? "text.secondary" : "text.disabled"}
                    fontWeight={600}
                  >
                    {totalVotes}/{totalUsers}
                  </Typography>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={participationPercent} 
                  sx={{ 
                    height: 10, 
                    borderRadius: 5,
                    backgroundColor: isActive || isPending ? 'grey.200' : 'grey.100',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      background: isActive || isPending
                        ? (participationPercent > 50 
                            ? 'linear-gradient(90deg, #4caf50 0%, #81c784 100%)'
                            : 'linear-gradient(90deg, #ff9800 0%, #ffb74d 100%)')
                        : 'linear-gradient(90deg, #9e9e9e 0%, #bdbdbd 100%)'
                    }
                  }}
                />
              </Box>
            

            {totalVotes > 0 && (isActive || isPending) && isAdministrador && recentParticipants.length > 0 && ( 
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="caption" color="text.secondary">
                  Votaron recientemente:
                </Typography>
                <AvatarGroup max={6} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: 11 } }}>
                  {recentParticipants.map((participant) => {
                    const initials = participant.userName
                      .split(" ")
                      .map(p => p[0])
                      .join("")
                      .slice(0,2)
                      .toUpperCase();
                    return (
                      <Tooltip key={participant.userId} title={participant.userName}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>{initials}</Avatar>
                      </Tooltip>
                    );
                  })}
                </AvatarGroup>
                {pollVoters[poll.id] && pollVoters[poll.id].length > 6 && (
                  <Typography variant="caption" color="text.secondary">
                    +{pollVoters[poll.id].length - 6} más
                  </Typography>
                )}
              </Stack>
            )}

            <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1}>
                {isActive && !hasVoted && tienePermisos && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<HowToVoteIcon />}
                    onClick={() => handleOpenVoteModal(poll)}
                    disabled={isVoting}
                    sx={{ 
                      borderRadius: 999,
                      px: 3,
                      py: 1,
                      fontWeight: 600,
                      textTransform: 'none'
                    }}
                  >
                    {isVoting ? "Enviando..." : "Votar Ahora"}
                  </Button>
                )}

                <Button
                  variant={isActive || isPending || isDraft ? "outlined" : "contained"}
                  color={isActive || isPending || isDraft ? "primary" : "inherit"}
                  startIcon={<BarChartIcon />}
                  onClick={() => handleOpenResultsModal(poll)}
                  sx={{
                    borderRadius: 999,
                    px: 2.5,
                    fontWeight: 500,
                    textTransform: 'none',
                    backgroundColor: isActive || isPending ? undefined : 'grey.600',
                    color: isActive || isPending ? undefined : 'white',
                    borderColor: isActive || isPending ? undefined : 'grey.600',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: isActive || isPending ? 'primary.50' : 'grey.700',
                      borderColor: isActive || isPending ? 'primary.main' : 'grey.700',
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
                  {(isActive || isPending || isDraft) ? "Participación" : "Resultado Final"}
                </Button>

                {(isPollOpen && hasVoted) && (
                  <Chip
                    label="Ya votaste"
                    color="info"
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                )}

                {(isActive || isPending || isDraft) && (
                  <Tooltip title="Recibir notificaciones">
                    <IconButton 
                      size="small" 
                      color="default"
                      sx={{
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                          transform: 'rotate(15deg) scale(1.1)',
                        }
                      }}
                    >
                      <NotificationsIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  const filteredPolls = useMemo(() => {
    let filtered = [...polls];

    if (!isAdministrador) {
      filtered = filtered.filter(p => {
        const s = p.state?.toLowerCase().trim();
        return s === "activa" || s === "cerrada";
      });
    }

    if (tab === "actives") {
      filtered = filtered.filter(p => p.state.toLowerCase().trim() === "activa");
    } else if (tab === "finalizada") {
      filtered = filtered.filter(p => p.state.toLowerCase().trim() === "cerrada");
    } else if (tab === "pendientes") {
      filtered = filtered.filter(p => p.state.toLowerCase().trim() === "pendiente");
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [polls, tab, isAdministrador]);

  useEffect(() => {
    const raw = localStorage.getItem("votedPollIds");
    if (raw) {
      try {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          setUserVotes(new Set(arr.map(Number)));
        }
      } catch {}
    }
  }, []);

  // Handler para cuando NewVote tenga éxito
  const handleNewVoteSuccess = () => {
    setShowNewVoteModal(false);
    refetch(); // Recargar las votaciones
  };

  // Handler para cancelar NewVote
  const handleNewVoteCancel = () => {
    setShowNewVoteModal(false);
  };

  if (loading) {
  return (
    <Box className="foraria-page-container" sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <CircularProgress />
        <Typography>Cargando votaciones…</Typography>
      </Stack>
    </Box>
  );
}

// NUEVO: Mostrar error si existe
if (loadError) {
  return (
    <Box className="foraria-page-container">
      <PageHeader
        title="Votaciones del Consorcio"
        tabs={[
          { label: "Todas", value: "todas" },
          { label: "Activas", value: "actives" },
          { label: "Finalizadas", value: "finalizada" },
          ...(isAdministrador ? [{ label: "Pendientes", value: "pendientes" }] : [])
        ]}
        selectedTab={tab}
        onTabChange={(v) => setTab(v as typeof tab)}
        actions={
          isAdministrador && (
            <Button
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: 22 }} />}
              onClick={() => setShowNewVoteModal(true)}
              sx={{
                borderRadius: 3,
                px: { xs: 2.5, sm: 3.5 },
                py: { xs: 1.4, sm: 1.1 },
                fontWeight: 600,
                fontSize: { xs: '0.95rem', sm: '0.9rem' },
                textTransform: 'none',
                width: { xs: '100%', sm: 'auto' },
                boxShadow: '0 6px 18px rgba(245,158,11,0.35)',
                background: 'linear-gradient(135deg,#F59E0B 0%,#FBBF24 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                '&:hover': {
                  background: 'linear-gradient(135deg,#D97706 0%,#F59E0B 100%)',
                  boxShadow: '0 8px 22px rgba(245,158,11,0.45)'
                },
                '&:active': {
                  boxShadow: '0 4px 12px rgba(245,158,11,0.35)'
                }
              }}
            >
              Nueva Votación
            </Button>
          )
        }
      />
      
      <Paper
        sx={{
          p: 6,
          textAlign: "center",
          border: "1px dashed #d0d0d0",
          borderRadius: 3,
          backgroundColor: "#fafafa",
          mt: 2
        }}
      >
        <HowToVoteIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
        <Typography variant="h5" color="text.primary" gutterBottom>
          Error al cargar votaciones
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {loadError}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => refetch()} 
          sx={{ mt: 1 }}
        >
          Reintentar
        </Button>
      </Paper>
    </Box>
  );
}

  return (
    <Box className="foraria-page-container">
      <PageHeader
        title="Votaciones del Consorcio"
        tabs={[
          { label: "Todas", value: "todas" },
          { label: "Activas", value: "actives" },
          { label: "Finalizadas", value: "finalizada" },
          ...(isAdministrador ? [{ label: "Pendientes", value: "pendientes" }] : [])
        ]}
        selectedTab={tab}
        onTabChange={(v) => setTab(v as typeof tab)}
        actions={
          isAdministrador && (
            <Button
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: 22 }} />}
              onClick={() => setShowNewVoteModal(true)}
              sx={{
                borderRadius: 3,
                px: { xs: 2.5, sm: 3.5 },
                py: { xs: 1.4, sm: 1.1 },
                fontWeight: 600,
                fontSize: { xs: '0.95rem', sm: '0.9rem' },
                textTransform: 'none',
                width: { xs: '100%', sm: 'auto' },
                boxShadow: '0 6px 18px rgba(245,158,11,0.35)',
                background: 'linear-gradient(135deg,#F59E0B 0%,#FBBF24 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                '&:hover': {
                  background: 'linear-gradient(135deg,#D97706 0%,#F59E0B 100%)',
                  boxShadow: '0 8px 22px rgba(245,158,11,0.45)'
                },
                '&:active': {
                  boxShadow: '0 4px 12px rgba(245,158,11,0.35)'
                }
              }}
            >
              Nueva Votación
            </Button>
          )
        }
      />

     {filteredPolls.length === 0 ? (
  <Paper
    sx={{
      p: 6,
      textAlign: "center",
      border: "1px dashed #d0d0d0",
      borderRadius: 3,
      backgroundColor: "#fafafa",
    }}
  >
    <HowToVoteIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
    <Typography variant="h5" color="text.primary" gutterBottom>
      No hay votaciones disponibles
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
      {tab === "actives" 
        ? "No hay votaciones activas en este momento."
        : tab === "finalizada"
        ? "No hay votaciones finalizadas aún."
        : tab === "pendientes"
        ? "No hay votaciones pendientes de aprobación."
        : "Aún no se han creado votaciones para este consorcio."
      }
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {isAdministrador 
        ? "Podés crear una nueva votación haciendo clic en el botón 'Nueva Votación'."
        : "Las votaciones aparecerán aquí cuando la administración las cree."
      }
    </Typography>
  </Paper>
) : (
  <Stack spacing={2}>
    {filteredPolls.map(renderPollCard)}
  </Stack>
)}

      {/* Modal con componente NewVote */}
      <Dialog
        open={showNewVoteModal}
        onClose={() => setShowNewVoteModal(false)}
        maxWidth="md"
        fullWidth
      >
        <NewVote 
          onSuccess={handleNewVoteSuccess}
          onCancel={handleNewVoteCancel}
        />
      </Dialog>

      {/* Modal Editar */}
      <Dialog
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Editar Votación</DialogTitle>
        <DialogContent>
          {editErrors.length > 0 && (
            <Stack sx={{ mb: 2 }} spacing={1}>
              {editErrors.map((e, i) => (
                <Alert key={i} severity="error" variant="outlined">
                  {e}
                </Alert>
              ))}
            </Stack>
          )}
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Título"
              value={newPoll.title || ''}
              onChange={(e) => setNewPoll(prev => ({ ...prev, title: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Descripción"
              multiline
              rows={3}
              value={newPoll.description || ''}
              onChange={(e) => setNewPoll(prev => ({ ...prev, description: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={newPoll.state || 'activa'}
                label="Estado"
                onChange={(e) => setNewPoll(prev => ({ ...prev, state: e.target.value }))}
              >
                <MenuItem value="borrador">Borrador</MenuItem>
                <MenuItem value="pendiente">Pendiente</MenuItem>
                <MenuItem value="activa">Activa</MenuItem>
                <MenuItem value="rechazada">Rechazada</MenuItem>
                <MenuItem value="cerrada">Cerrada</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={newPoll.categoryPoll_id || 1}
                label="Categoría"
                onChange={(e) => setNewPoll(prev => ({ ...prev, categoryPoll_id: Number(e.target.value) }))}
              >
                {POLL_CATEGORIES.map((cat: { id: number; name: string }) => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Fecha de inicio"
                type="datetime-local"
                value={newPoll.startDate ? new Date(newPoll.startDate).toISOString().slice(0,16) : ''}
                onChange={(e) => setNewPoll(prev => ({ ...prev, startDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Fecha de fin"
                type="datetime-local"
                value={newPoll.endDate ? new Date(newPoll.endDate).toISOString().slice(0,16) : ''}
                onChange={(e) => setNewPoll(prev => ({ ...prev, endDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowEditModal(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleEditPoll}
            disabled={!newPoll.title || !newPoll.description}
          >
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Modal de Resultados */}
      <Dialog
        open={!!selectedPollResults}
        onClose={handleCloseResultsModal}
        maxWidth="md"
        fullWidth
      >
        {selectedPollResults && (() => {
          const results = getDetailedResults(selectedPollResults);
          return (
            <>
              <DialogTitle>
                <Typography variant="h6">Resultados: {selectedPollResults.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {selectedPollResults.description}
                </Typography>
              </DialogTitle>
              
              <DialogContent>
                <Divider sx={{ mb: 3 }} />
                
                {/* Resumen */}
                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Stack direction="row" spacing={4}>
                    <Box>
                      <Typography variant="overline" color="text.secondary">Total Votos</Typography>
                      <Typography variant="h4" color="primary">{results.totalVotes}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="overline" color="text.secondary">Participación</Typography>
                      <Typography variant="h4" color="secondary">{results.participationPercent}%</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={results.participationPercent} 
                        sx={{ height: 12, borderRadius: 6, mt: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        de {totalUsers} usuarios totales
                      </Typography>
                    </Box>
                  </Stack>

                  {results.winner && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      <Typography variant="subtitle1">
                        <strong>Opción ganadora:</strong> "{results.winner.text}" 
                        ({results.winner.votes} votos - {results.winner.percentage}%)
                      </Typography>
                    </Alert>
                  )}
                </Stack>

                {/* Desglose por opción */}
                <Typography variant="h6" gutterBottom>Desglose de votos</Typography>
                <Stack spacing={2}>
                  {results.optionsWithResults.map((option, index) => (
                    <Card key={option.id} variant="outlined" sx={{ p: 2 }}>
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1">
                            {index === 0 && results.winner ? '🏆 ' : ''}{option.text}
                          </Typography>
                          <Typography variant="h6" color="primary">
                            {option.votes} votos ({option.percentage}%)
                          </Typography>
                        </Stack>
                        <LinearProgress 
                          variant="determinate" 
                          value={option.percentage} 
                          sx={{ height: 8, borderRadius: 4 }}
                          color={index === 0 ? "success" : "primary"}
                        />
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </DialogContent>
              
              <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleCloseResultsModal} variant="contained">
                  Cerrar
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>

      {/* Modal de Votación */}
      <Dialog
        open={!!selectedPoll}
        onClose={handleCloseVoteModal}
        maxWidth="sm"
        fullWidth
      >
        {selectedPoll && (
          <>
            <DialogTitle>
              <Typography variant="h6">{selectedPoll.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {selectedPoll.description}
              </Typography>
            </DialogTitle>

            <DialogContent>
              <Typography variant="subtitle1" gutterBottom>
                Selecciona tu opción:
              </Typography>
              <RadioGroup
                value={selectedOption ?? ''}
                onChange={(e) => setSelectedOption(Number(e.target.value))}
              >
                {selectedPoll.pollOptions?.map((option) => (
                  <FormControlLabel
                    key={option.id}
                    value={option.id}
                    control={<Radio />}
                    label={<Typography variant="body1">{option.text}</Typography>}
                    sx={{ mb: 1 }}
                  />
                ))}
              </RadioGroup>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
              <Button onClick={handleCloseVoteModal}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmitVote}
                disabled={!selectedOption || isVoting}
                startIcon={<HowToVoteIcon />}
              >
                {isVoting ? 'Enviando...' : 'Confirmar Voto'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Modal Ya Votaste */}
      <Dialog
        open={showAlreadyVotedModal}
        onClose={() => setShowAlreadyVotedModal(false)}
        maxWidth="xs"
      >
        <DialogTitle>Ya participaste</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Ya emitiste tu voto en esta votación. Solo se permite un voto por usuario.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAlreadyVotedModal(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Error Genérico Voto */}
      <Dialog
        open={showVoteErrorModal}
        onClose={() => setShowVoteErrorModal(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Error al votar</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="error">
            {voteErrorMessage || "Ocurrió un error procesando el voto."}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowVoteErrorModal(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <SuccessModal
        open={showSuccessModal}                 
        onClose={() => setShowSuccessModal(false)} 
      />
    </Box>
  );
}