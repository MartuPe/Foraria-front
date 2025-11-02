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
  Skeleton
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import BarChartIcon from "@mui/icons-material/BarChart";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ShareIcon from "@mui/icons-material/Share";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PageHeader from "../components/SectionHeader";
import { Layout } from "../components/layout";
import { useGet } from "../hooks/useGet";
import { useMutation } from "../hooks/useMutation";
import { useSignalR } from "../hooks/useSignalR";
import ErrorModal from "../components/modals/ErrorModal";
import SuccessModal from "../components/modals/SuccessModal";


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
}

interface VoteDto {
  user_Id: number;
  poll_Id: number;
  pollOption_Id: number;
}

interface PollVoteResult {
  pollId: number;
  results: { pollOptionId: number; votesCount: number }[];
}

interface UserCountResponse {
  totalUsers: number;
}


export default function Votes() {
  const [tab, setTab] = useState<"todas" | "actives" | "finalizada">("todas");
  const [polls, setPolls] = useState<Poll[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  
  // Estados para el modal de votación
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  
  // Mock de votos del usuario (esto debería venir de la API)
  const [userVotes, setUserVotes] = useState<Set<number>>(new Set());

  // Nuevo estado para el modal de resultados
  const [selectedPollResults, setSelectedPollResults] = useState<Poll | null>(null);
  const [loadingVote, setLoadingVote] = useState<number | null>(null);

  const { data: pollsData, loading, error } = useGet<Poll[]>(
    "https://localhost:7245/api/polls/with-results"
  );

  const { mutate: sendVote, error: voteError } = useMutation(
    "https://localhost:7245/api/votes",
    "post"
  );

  const { on, connected } = useSignalR({
    url: "https://localhost:7245/pollHub",
  });

 
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
      user_Id: 1, // reemplazar con usuario real
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

  // Mock de participantes recientes (esto vendría de la API)
  const getRecentParticipants = (pollId: number) => {
    // Simulamos algunos usuarios que votaron recientemente
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
          border: isActive ? '2px solid' : '1px solid',
          borderColor: isActive ? 'success.main' : 'grey.300',
          backgroundColor: isActive ? 'success.50' : 'grey.50',
          position: 'relative',
          overflow: 'visible',
          // Diferentes estilos para activas vs finalizadas
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          opacity: isActive ? 1 : 0.85,
          '&:hover': {
            transform: isActive ? 'translateY(-6px) scale(1.02)' : 'translateY(-2px)',
            boxShadow: isActive 
              ? '0 12px 24px rgba(0,0,0,0.15)' 
              : '0 4px 12px rgba(0,0,0,0.08)',
            borderColor: isActive ? 'success.dark' : 'grey.400',
            opacity: 1
          },
          // Animación diferente para finalizadas
          animation: isActive ? 'fadeInUp 0.5s ease-out' : 'fadeInUpSoft 0.6s ease-out',
          '@keyframes fadeInUp': {
            '0%': { opacity: 0, transform: 'translateY(30px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' }
          },
          '@keyframes fadeInUpSoft': {
            '0%': { opacity: 0, transform: 'translateY(20px)' },
            '100%': { opacity: 0.85, transform: 'translateY(0)' }
          }
        }}
      >
        {/* Indicador de estado mejorado */}
        {!isActive && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              backgroundColor: 'grey.600',
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
            FINALIZADA
          </Box>
        )}

        {/* Trending solo para activas */}
        {participationPercent > 70 && isActive && (
          <Chip
            icon={<TrendingUpIcon />}
            label="Popular"
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
            {/* Header con estilos diferentes */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Typography 
                    variant="h6" 
                    color={isActive ? "primary" : "text.secondary"}
                    sx={{ 
                      fontWeight: isActive ? 600 : 500,
                      textDecoration: isActive ? 'none' : 'none'
                    }}
                  >
                    {poll.title}
                  </Typography>
                  {isActive && (
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
                    opacity: isActive ? 1 : 0.8
                  }}
                >
                  {poll.description}
                </Typography>
              </Box>
              
              <Stack direction="row" spacing={1}>
                <Chip 
                  label={isActive ? "Activa" : "Finalizada"}
                  color={isActive ? "success" : "default"}
                  size="small"
                  variant={isActive ? "filled" : "outlined"}
                  sx={{
                    fontWeight: 600,
                    backgroundColor: isActive ? undefined : 'grey.200',
                    color: isActive ? undefined : 'grey.700'
                  }}
                />
                {hasVoted && isActive && (
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

            {/* Fecha límite solo para activas */}
            {isActive && poll.deletedAt && (
              <Alert 
                severity="info" 
                icon={<AccessTimeIcon />}
                sx={{ 
                  backgroundColor: 'info.50',
                  border: '1px solid',
                  borderColor: 'info.200'
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  Finaliza: {new Date(poll.deletedAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Alert>
            )}

            {/* Resultado destacado para finalizadas */}
            {!isActive && (
              <Alert 
                severity="success" 
                sx={{ 
                  backgroundColor: 'grey.100',
                  border: '1px solid',
                  borderColor: 'grey.300',
                  '& .MuiAlert-icon': {
                    color: 'grey.600'
                  }
                }}
              >
                <Typography variant="body2" fontWeight={600} color="grey.700">
                  Votación finalizada el {new Date(poll.deletedAt || poll.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </Typography>
              </Alert>
            )}

            {/* Información básica con colores diferentes */}
            <Stack direction="row" alignItems="center" spacing={3} flexWrap="wrap">
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <CalendarTodayIcon 
                  fontSize="small" 
                  sx={{ color: isActive ? 'action.active' : 'action.disabled' }}
                />
                <Typography 
                  variant="body2" 
                  color={isActive ? "text.secondary" : "text.disabled"}
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
                  sx={{ color: isActive ? 'action.active' : 'action.disabled' }}
                />
                <Typography 
                  variant="body2" 
                  color={isActive ? "text.secondary" : "text.disabled"}
                >
                  {totalVotes} {totalVotes === 1 ? 'voto' : 'votos'}
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography 
                  variant="body2" 
                  color={isActive ? "text.secondary" : "text.disabled"}
                >
                  {participationPercent}% participación
                </Typography>
              </Stack>
            </Stack>

            {/* Barra de progreso con colores diferentes */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography 
                  variant="caption" 
                  color={isActive ? "text.secondary" : "text.disabled"}
                >
                  Participación
                </Typography>
                <Typography 
                  variant="caption" 
                  color={isActive ? "text.secondary" : "text.disabled"}
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
                  backgroundColor: isActive ? 'grey.200' : 'grey.100',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 5,
                    background: isActive 
                      ? (participationPercent > 50 
                          ? 'linear-gradient(90deg, #4caf50 0%, #81c784 100%)'
                          : 'linear-gradient(90deg, #ff9800 0%, #ffb74d 100%)')
                      : 'linear-gradient(90deg, #9e9e9e 0%, #bdbdbd 100%)'
                  }
                }}
              />
            </Box>

            {/* Participantes solo para activas */}
            {totalVotes > 0 && isActive && (
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

            {/* Acciones diferentes para activas vs finalizadas */}
            <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
              {/* Solo para activas */
              isActive && hasVoted && !isLoading && (
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
                {/* Botón votar solo para activas */}
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
                      },
                      '&:active': {
                        transform: 'translateY(0) scale(0.98)',
                      }
                    }}
                  >
                    Votar Ahora
                  </Button>
                )}

                {/* Botón resultados con diferentes estilos */}
                <Button
                  variant={isActive ? "outlined" : "contained"}
                  color={isActive ? "primary" : "inherit"}
                  startIcon={<BarChartIcon />}
                  onClick={() => handleOpenResultsModal(poll)}
                  sx={{ 
                    borderRadius: 999,
                    px: 2.5,
                    fontWeight: 500,
                    textTransform: 'none',
                    backgroundColor: isActive ? undefined : 'grey.600',
                    color: isActive ? undefined : 'white',
                    borderColor: isActive ? undefined : 'grey.600',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: isActive ? 'primary.50' : 'grey.700',
                      borderColor: isActive ? 'primary.main' : 'grey.700',
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
                  {isActive ? "Resultados" : "Ver Resultado Final"}
                </Button>

                {/* Notificaciones solo para activas */}
                {isActive && (
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
    }

    
    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [polls, tab]);

  if (loading) return <p>Cargando votaciones...</p>;
  if (error) return <p>Error al cargar: {error}</p>;

  return (
    <Layout>
      <Box className="foraria-page-container">
        <PageHeader
          title="Votaciones del Consorcio"
          tabs={[
            { label: "Todas", value: "todas" },
            { label: "Activas", value: "actives" },
            { label: "Finalizadas", value: "finalizada" },
          ]}
          selectedTab={tab}
          onTabChange={(v) => setTab(v as typeof tab)}
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

        {/* Modales de Error y Éxito */}
        <ErrorModal
          open={showErrorModal && !!voteError}
          onClose={() => setShowErrorModal(false)}
          errorMessage={voteError as string}
        />

        <SuccessModal
          open={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
        />
      </Box>
    </Layout>
  );
}
