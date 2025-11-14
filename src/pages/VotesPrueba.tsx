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
  RadioGroup,
  FormControlLabel,
  Radio,
  LinearProgress,
  Divider,
  Alert,
  Avatar,
  AvatarGroup,
  Tooltip,
  IconButton,
  Skeleton,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Gavel as GavelIcon,
  CalendarToday as CalendarTodayIcon,
  HowToVote as HowToVoteIcon,
  BarChart as BarChartIcon,
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
  Share as ShareIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon
} from "@mui/icons-material";
import PageHeader from "../components/SectionHeader";
import { useGet } from "../hooks/useGet";
import { useMutation } from "../hooks/useMutation";
import { useSignalR } from "../hooks/useSignalR";
import ErrorModal from "../components/modals/ErrorModal";
import SuccessModal from "../components/modals/SuccessModal";
import { storage } from "../utils/storage";
import { getEffectiveIds } from "../services/userService";

// ...existing interfaces...
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

interface VoteDto {
  user_Id: number;
  poll_Id: number;
  pollOption_Id: number;
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

interface UpdatePollDto {
  title?: string;
  description?: string;
  categoryPoll_id?: number;
  startDate?: string;
  endDate?: string;
}

interface PollStateChangeDto {
  newState: string;
}

interface PollVoteResult {
  pollId: number;
  results: { pollOptionId: number; votesCount: number }[];
}

interface UserCountResponse {
  totalUsers: number;
}

const POLL_STATES = {
  PENDIENTE: 'Pendiente',
  ACTIVA: 'Activa', 
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada'
};

const POLL_CATEGORIES = [
  { id: 1, name: 'Administración' },
  { id: 2, name: 'Mantenimiento' },
  { id: 3, name: 'Mejoras' },
  { id: 4, name: 'Normativas' },
  { id: 5, name: 'Presupuesto' },
  { id: 6, name: 'Seguridad' }
];

export default function VotesPrueba() {
  const isAdmin = storage.role === "Administrador" || storage.role === "Consorcio";
  
  const [tab, setTab] = useState<"todas" | "actives" | "finalizada" | "pendientes">("todas");
  const [polls, setPolls] = useState<Poll[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  
  // Estados para votación (igual que el original)
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [userVotes, setUserVotes] = useState<Set<number>>(new Set());
  const [selectedPollResults, setSelectedPollResults] = useState<Poll | null>(null);
  const [loadingVote, setLoadingVote] = useState<number | null>(null);

  // Estados para admin
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
  const [deletingPoll, setDeletingPoll] = useState<Poll | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Estados para crear/editar poll
  const [newPoll, setNewPoll] = useState<Partial<CreatePollDto>>({
    title: '',
    description: '',
    categoryPoll_id: 1,
    pollOptions: ['', '']
  });

  const { data: pollsData, loading, error, refetch } = useGet<Poll[]>(
    "https://localhost:7245/api/polls/with-results"
  );

  const { mutate: sendVote, error: voteError } = useMutation(
    "https://localhost:7245/api/votes",
    "post"
  );

 

  const { on, connected } = useSignalR({
    url: "https://localhost:7245/pollHub",
  });

  // ...existing useEffects...
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const res = await fetch("https://localhost:7245/api/User/count");
        const data: UserCountResponse = await res.json();
        setTotalUsers(data.totalUsers);
      } catch (err) {
        console.error("Error al obtener total de usuarios:", err);
      }
    };
    fetchUserCount();
  }, []);

  useEffect(() => {
    if (pollsData) setPolls(pollsData);
  }, [pollsData]);

  useEffect(() => {
    if (!connected) return;
    on("PollUpdated", (voteData: PollVoteResult) => {
      setPolls((prevPolls) =>
        prevPolls.map((poll) =>
          poll.id === voteData.pollId
            ? {
                ...poll,
                pollResults: voteData.results.map((r) => ({
                  pollOptionId: r.pollOptionId,
                  votesCount: r.votesCount,
                })),
              }
            : poll
        )
      );
    });
  }, [connected, on]);

  // Funciones originales de votación
  const handleOpenVoteModal = (poll: Poll) => {
    setSelectedPoll(poll);
    setSelectedOption(null);
  };

  const handleCloseVoteModal = () => {
    setSelectedPoll(null);
    setSelectedOption(null);
  };

  const handleOpenResultsModal = (poll: Poll) => {
    setSelectedPollResults(poll);
  };

  const handleCloseResultsModal = () => {
    setSelectedPollResults(null);
  };

  const handleSubmitVote = async () => {
    if (!selectedPoll || !selectedOption) return;
    
    setIsVoting(true);
    setLoadingVote(selectedPoll.id);
    const vote: VoteDto = {
      user_Id: Number(localStorage.getItem("userId")),
      poll_Id: selectedPoll.id,
      pollOption_Id: selectedOption,
    };
    
    try {
      await sendVote(vote);
      setUserVotes(prev => new Set(Array.from(prev).concat(selectedPoll.id)));
      setShowSuccessModal(true);
      handleCloseVoteModal();
    } catch (err) {
      console.error("Error al enviar voto:", err);
      setShowErrorModal(true);
    } finally {
      setIsVoting(false);
      setLoadingVote(null);
    }
  };

  // Corregir las funciones para admin
  const handleCreatePoll = async () => {
    try {
      const { userId } = await getEffectiveIds();
      const pollData: CreatePollDto = {
        ...newPoll as CreatePollDto,
        user_id: userId,
        startDate: newPoll.startDate || new Date().toISOString(),
        endDate: newPoll.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        pollOptions: (newPoll.pollOptions || []).filter(opt => opt.trim())
      };

      const response = await fetch("https://localhost:7245/api/polls", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pollData)
      });

      if (!response.ok) {
        throw new Error('Error al crear votación');
      }

      setShowSuccessModal(true);
      setShowCreateModal(false);
      setNewPoll({ title: '', description: '', categoryPoll_id: 1, pollOptions: ['', ''] });
      refetch();
    } catch (err) {
      console.error("Error al crear votación:", err);
      setShowErrorModal(true);
    }
  };

  const handleEditPoll = async () => {
    if (!editingPoll) return;
    
    try {
      const updateData: UpdatePollDto = {
        title: newPoll.title,
        description: newPoll.description,
        categoryPoll_id: newPoll.categoryPoll_id,
        startDate: newPoll.startDate,
        endDate: newPoll.endDate
      };

      const response = await fetch(`https://localhost:7245/api/polls/${editingPoll.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar votación');
      }

      setShowSuccessModal(true);
      setShowEditModal(false);
      setEditingPoll(null);
      refetch();
    } catch (err) {
      console.error("Error al editar votación:", err);
      setShowErrorModal(true);
    }
  };

  // Cambiar funciones de eliminación por cancelación
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelingPoll, setCancelingPoll] = useState<Poll | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);

  const openCancelModal = (poll: Poll) => {
    setCancelingPoll(poll);
    setShowCancelModal(true);
  };

  const handleCancelPoll = async () => {
    if (!cancelingPoll) return;
    
    setIsCanceling(true);
    try {
      await handleChangeState(cancelingPoll.id, POLL_STATES.CANCELADA);
      setShowSuccessModal(true);
      setShowCancelModal(false);
      setCancelingPoll(null);
    } catch (err) {
      console.error("Error al cancelar votación:", err);
      setShowErrorModal(true);
    } finally {
      setIsCanceling(false);
    }
  };

  const handleChangeState = async (pollId: number, newState: string) => {
    try {
      const stateData: PollStateChangeDto = { newState };
      
      const response = await fetch(`https://localhost:7245/api/polls/${pollId}/state`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stateData)
      });

      if (!response.ok) {
        throw new Error('Error al cambiar estado');
      }

      setShowSuccessModal(true);
      refetch();
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      setShowErrorModal(true);
    }
  };

  const openEditModal = (poll: Poll) => {
    setEditingPoll(poll);
    setNewPoll({
      title: poll.title,
      description: poll.description,
      categoryPoll_id: poll.categoryPollId,
      startDate: poll.startDate,
      endDate: poll.endDate,
      pollOptions: poll.pollOptions.map(opt => opt.text)
    });
    setShowEditModal(true);
  };

  // ...existing helper functions...
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
    const participationPercent = totalUsers > 0 ? Math.min(Math.round((totalVotes / totalUsers) * 100), 100) : 0;

    return {
      totalVotes,
      participationPercent,
      optionsWithResults,
      winner: winner && winner.votes > 0 ? winner : null
    };
  };

  const getRecentParticipants = (pollId: number) => {
    return [
      { id: 1, name: "María García", avatar: "MG" },
      { id: 2, name: "Juan López", avatar: "JL" },
      { id: 3, name: "Ana Martín", avatar: "AM" },
      { id: 4, name: "Carlos Ruiz", avatar: "CR" },
      { id: 5, name: "Laura Silva", avatar: "LS" },
    ];
  };

  const renderPollCard = (poll: Poll) => {
    const isActive = poll.state?.toLowerCase().trim() === "activa";
    const isPending = poll.state?.toLowerCase().trim() === "pendiente";
    const hasVoted = userVotes.has(poll.id);
    const { totalVotes, participationPercent } = getDetailedResults(poll);
    const recentParticipants = getRecentParticipants(poll.id);
    const isLoading = loadingVote === poll.id;

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
            transform: isActive || isPending ? 'translateY(-6px) scale(1.02)' : 'translateY(-2px)',
            boxShadow: isActive || isPending 
              ? '0 12px 24px rgba(0,0,0,0.15)' 
              : '0 4px 12px rgba(0,0,0,0.08)',
            borderColor: isActive ? 'success.dark' : isPending ? 'warning.dark' : 'grey.400',
            opacity: 1
          }
        }}
      >
        {/* Admin Actions */}
        {isAdmin && (
          <Stack
            direction="row"
            spacing={1}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 2,
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: 2,
              p: 0.5
            }}
          >
            {isPending && (
              <Tooltip title="Aprobar votación">
                <IconButton
                  size="small"
                  color="success"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChangeState(poll.id, POLL_STATES.ACTIVA);
                  }}
                >
                  <CheckCircleIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            
            {isActive && (
              <Tooltip title="Finalizar votación">
                <IconButton
                  size="small"
                  color="info"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChangeState(poll.id, POLL_STATES.FINALIZADA);
                  }}
                >
                  <GavelIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Editar">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditModal(poll);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Cambiar botón Eliminar por Cancelar */}
            <Tooltip title="Cancelar votación">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  openCancelModal(poll);
                }}
              >
                <CancelIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {isPending && (
              <Tooltip title="Cancelar">
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChangeState(poll.id, POLL_STATES.CANCELADA);
                  }}
                >
                  <CancelIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {(isActive || poll.state === POLL_STATES.FINALIZADA) && (
              <Tooltip title="Notarizar en blockchain">
                <IconButton
                  size="small"
                  color="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Implementar notarización
                  }}
                >
                  <SecurityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        )}

        {/* Estado indicator */}
        {!isActive && !isPending && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              backgroundColor: poll.state === POLL_STATES.CANCELADA ? 'error.main' : 'grey.600',
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
            {poll.state?.toUpperCase() || 'FINALIZADA'}
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

        {/* ...existing card content with same styling... */}
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
                  label={poll.state || "Finalizada"}
                  color={
                    isPending ? "warning" : 
                    isActive ? "success" : 
                    poll.state === POLL_STATES.CANCELADA ? "error" : "default"
                  }
                  size="small"
                  variant={isActive || isPending ? "filled" : "outlined"}
                  sx={{
                    fontWeight: 600,
                    backgroundColor: !isActive && !isPending && poll.state !== POLL_STATES.CANCELADA ? 'grey.200' : undefined,
                    color: !isActive && !isPending && poll.state !== POLL_STATES.CANCELADA ? 'grey.700' : undefined
                  }}
                />
                {hasVoted && (isActive || isPending) && (
                  <Chip 
                    label="Votaste" 
                    color="info" 
                    size="small"
                    icon={<CheckCircleIcon />}
                    variant="filled"
                  />
                )}
              </Stack>
            </Stack>

            {/* ...existing content sections with same styling... */}
            {(isActive || isPending) && poll.endDate && (
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

            {/* ...rest of existing card content... */}
            {!isActive && !isPending && (
              <Alert 
                severity={poll.state === POLL_STATES.CANCELADA ? "error" : "success"}
                sx={{ 
                  backgroundColor: poll.state === POLL_STATES.CANCELADA ? 'error.50' : 'grey.100',
                  border: '1px solid',
                  borderColor: poll.state === POLL_STATES.CANCELADA ? 'error.200' : 'grey.300',
                  '& .MuiAlert-icon': {
                    color: poll.state === POLL_STATES.CANCELADA ? 'error.main' : 'grey.600'
                  }
                }}
              >
                <Typography variant="body2" fontWeight={600} color={poll.state === POLL_STATES.CANCELADA ? 'error.dark' : 'grey.700'}>
                  Votación {poll.state === POLL_STATES.CANCELADA ? 'cancelada' : 'finalizada'} el {new Date(poll.endDate || poll.createdAt).toLocaleDateString('es-ES', {
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

            {totalVotes > 0 && (isActive || isPending) && (
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="caption" color="text.secondary">
                  Votaron recientemente:
                </Typography>
                <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: 12 } }}>
                  {recentParticipants.slice(0, Math.min(totalVotes, 5)).map((participant: { id: number; name: string; avatar: string }) => (
                    <Tooltip key={participant.id} title={participant.name}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {participant.avatar}
                      </Avatar>
                    </Tooltip>
                  ))}
                </AvatarGroup>
                {totalVotes > 5 && (
                  <Typography variant="caption" color="text.secondary">
                    +{totalVotes - 5} más
                  </Typography>
                )}
              </Stack>
            )}

            <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
              {isActive && hasVoted && !isLoading && (
                <Alert 
                  severity="success" 
                  sx={{ 
                    flex: 1,
                    '& .MuiAlert-message': { fontSize: '0.875rem' }
                  }}
                >
                  ¡Gracias por participar! Tu voto ha sido registrado.
                </Alert>
              )}

              {isLoading && (
                <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
                  <Skeleton variant="rectangular" width={40} height={20} />
                  <Typography variant="body2" color="text.secondary">
                    Enviando tu voto...
                  </Typography>
                </Stack>
              )}
              
              <Stack direction="row" spacing={1}>
                {isActive && !hasVoted && !isLoading && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<HowToVoteIcon />}
                    onClick={() => handleOpenVoteModal(poll)}
                    sx={{ 
                      borderRadius: 999,
                      px: 3,
                      py: 1,
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: 2,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        boxShadow: '0 8px 16px rgba(76, 175, 80, 0.3)',
                        transform: 'translateY(-2px) scale(1.05)',
                        backgroundColor: 'success.dark',
                      }
                    }}
                  >
                    Votar Ahora
                  </Button>
                )}

                <Button
                  variant={isActive || isPending ? "outlined" : "contained"}
                  color={isActive || isPending ? "primary" : "inherit"}
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
                  {isActive || isPending ? "Resultados" : "Ver Resultado Final"}
                </Button>

                {(isActive || isPending) && (
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

    if (tab === "actives") {
      filtered = filtered.filter(
        (p) => p.state.toLowerCase().trim() === "activa"
      );
    } else if (tab === "finalizada") {
      filtered = filtered.filter(
        (p) => p.state.toLowerCase().trim() === "finalizada"
      );
    } else if (tab === "pendientes") {
      filtered = filtered.filter(
        (p) => p.state.toLowerCase().trim() === "pendiente"
      );
    }

    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [polls, tab]);

  if (loading) return <p>Cargando votaciones...</p>;
  if (error) return <p>Error al cargar: {error}</p>;

  return (
    <Box className="foraria-page-container">
      <PageHeader
        title="Votaciones del Consorcio"
        tabs={[
          { label: "Todas", value: "todas" },
          { label: "Activas", value: "actives" },
          { label: "Finalizadas", value: "finalizada" },
          ...(isAdmin ? [{ label: "Pendientes", value: "pendientes" }] : [])
        ]}
        selectedTab={tab}
        onTabChange={(v) => setTab(v as typeof tab)}
        actions={
          isAdmin && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => setShowCreateModal(true)}
              sx={{ borderRadius: 999, fontWeight: 600 }}
            >
              Nueva Votación
            </Button>
          )
        }
      />

      {filteredPolls.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No hay votaciones disponibles.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {filteredPolls.map(renderPollCard)}
        </Stack>
      )}

      {/* ...existing modals (vote, results)... */}
      
      {/* Modal Crear Votación */}
      <Dialog
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Crear Nueva Votación</DialogTitle>
        <DialogContent>
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
              <InputLabel>Categoría</InputLabel>
              <Select
                value={newPoll.categoryPoll_id || 1}
                label="Categoría"
                onChange={(e) => setNewPoll(prev => ({ ...prev, categoryPoll_id: Number(e.target.value) }))}
              >
                {POLL_CATEGORIES.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Fecha de inicio"
                type="datetime-local"
                value={newPoll.startDate || ''}
                onChange={(e) => setNewPoll(prev => ({ ...prev, startDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Fecha de fin"
                type="datetime-local"
                value={newPoll.endDate || ''}
                onChange={(e) => setNewPoll(prev => ({ ...prev, endDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            <Typography variant="subtitle1">Opciones de votación</Typography>
            {(newPoll.pollOptions || []).map((option, index) => (
              <Stack key={index} direction="row" spacing={1} alignItems="center">
                <TextField
                  fullWidth
                  label={`Opción ${index + 1}`}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(newPoll.pollOptions || [])];
                    newOptions[index] = e.target.value;
                    setNewPoll(prev => ({ ...prev, pollOptions: newOptions }));
                  }}
                />
                {(newPoll.pollOptions || []).length > 2 && (
                  <IconButton
                    color="error"
                    onClick={() => {
                      const newOptions = (newPoll.pollOptions || []).filter((_, i) => i !== index);
                      setNewPoll(prev => ({ ...prev, pollOptions: newOptions }));
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Stack>
            ))}
            
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setNewPoll(prev => ({ 
                ...prev, 
                pollOptions: [...(prev.pollOptions || []), '']
              }))}
              sx={{ alignSelf: 'flex-start' }}
            >
              Agregar Opción
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowCreateModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCreatePoll}
            disabled={!newPoll.title || !newPoll.description || (newPoll.pollOptions || []).filter(opt => opt.trim()).length < 2}
          >
            Crear Votación
          </Button>
        </DialogActions>
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
          {/* Similar content to create modal but for editing */}
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
              <InputLabel>Categoría</InputLabel>
              <Select
                value={newPoll.categoryPoll_id || 1}
                label="Categoría"
                onChange={(e) => setNewPoll(prev => ({ ...prev, categoryPoll_id: Number(e.target.value) }))}
              >
                {POLL_CATEGORIES.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Fecha de inicio"
                type="datetime-local"
                value={newPoll.startDate || ''}
                onChange={(e) => setNewPoll(prev => ({ ...prev, startDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Fecha de fin"
                type="datetime-local"
                value={newPoll.endDate || ''}
                onChange={(e) => setNewPoll(prev => ({ ...prev, endDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowEditModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleEditPoll}
            disabled={!newPoll.title || !newPoll.description}
          >
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Cancelar (reemplaza Modal Eliminar) */}
      <Dialog
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Cancelar Votación</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 1 }}>
            ¿Estás seguro de que quieres cancelar esta votación?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>"{cancelingPoll?.title}"</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            La votación aparecerá como cancelada para todos los usuarios.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowCancelModal(false)} disabled={isCanceling}>
            No, mantener
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelPoll}
            disabled={isCanceling}
            startIcon={isCanceling ? <CircularProgress size={16} /> : <CancelIcon />}
          >
            {isCanceling ? 'Cancelando...' : 'Sí, cancelar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ...existing vote and results modals... */}
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
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Selecciona tu opción:
              </Typography>
              
              <RadioGroup
                value={selectedOption || ''}
                onChange={(e) => setSelectedOption(Number(e.target.value))}
              >
                {selectedPoll.pollOptions?.map((option) => (
                  <FormControlLabel
                    key={option.id}
                    value={option.id}
                    control={<Radio />}
                    label={
                      <Typography variant="body1">
                        {option.text}
                      </Typography>
                    }
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

      <SuccessModal 
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
      
      <ErrorModal
        errorMessage={voteError as string}
        onClose={() => setShowErrorModal(false)}
        open={showErrorModal && !!voteError}
      />
    </Box>
  );
}
