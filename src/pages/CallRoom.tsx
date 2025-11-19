import { useEffect, useMemo, useState, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, IconButton, Typography, Stack, Paper, Tooltip, Button, Divider, TextField } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicOutlinedIcon from "@mui/icons-material/MicOutlined";
import MicOffOutlinedIcon from "@mui/icons-material/MicOffOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import VideocamOffOutlinedIcon from "@mui/icons-material/VideocamOffOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { callService, CallDto, CallParticipantDto, CallMessageDto } from "../services/callService";
import { getMeetingById } from "../services/meetingService";
import { storage } from "../utils/storage";
import { Role } from "../constants/roles";
import "../styles/meetings.css";

interface RouteParams extends Record<string, string | undefined> {
  meetingId?: string;
  callId?: string;
}

export default function CallRoom() {
  const { meetingId, callId } = useParams<RouteParams>();
  const navigate = useNavigate();
  const [call, setCall] = useState<CallDto | null>(null);
  const [participants, setParticipants] = useState<CallParticipantDto[]>([]);
  const [messages, setMessages] = useState<CallMessageDto[]>([]);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const numericMeetingId = Number(meetingId);
  const numericCallId = Number(callId);
  const meeting = useMemo(() => (numericMeetingId ? getMeetingById(numericMeetingId) : undefined), [numericMeetingId]);
  const currentUserId = Number(localStorage.getItem("userId") ?? 0);
  const role = storage.role as Role | undefined;
  const isAdminRole = role === Role.ADMIN || role === Role.CONSORCIO;
  const canEndCall = !!call && isAdminRole && call.createdByUserId === currentUserId;

  useEffect(() => {
    if (!numericCallId || Number.isNaN(numericCallId)) {
      setError("Identificador de llamada inválido.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadInitial = async () => {
      try {
        setLoading(true);
        setError(null);

        const [callDetails, state] = await Promise.all([
          callService.getDetails(numericCallId),
          callService.getState(numericCallId),
        ]);

        if (cancelled) return;

        setCall(callDetails);
        setParticipants(state.participants ?? []);
        setMessages(state.messages ?? []);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("No se pudo cargar la llamada.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadInitial();

    const interval = window.setInterval(() => {
      callService
        .getState(numericCallId)
        .then((state) => {
          if (!cancelled) {
            setParticipants(state.participants ?? []);
            setMessages(state.messages ?? []);
          }
        })
        .catch((e) => console.error(e));
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [numericCallId]);

  const handleEndCall = async () => {
    try {
      if (numericCallId && !Number.isNaN(numericCallId)) await callService.end(numericCallId);
    } catch (e) {
      console.error(e);
    } finally {
      navigate("/reuniones");
    }
  };

  const handleLeaveCall = () => {
    // endpoint "leave"
    navigate("/reuniones");
  };

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed) return;
    //sendMessage(...)
    console.log("Mensaje a enviar (pendiente backend):", trimmed);
    setNewMessage("");
  };

  const title = meeting?.title ?? (call ? `Llamada #${call.id}` : "Reunión en curso");
  const subtitle = meeting ? `${meeting.date} · ${meeting.time} · ${meeting.location}` : call ? `Estado: ${call.status}` : "Llamada en curso";
  const videoParticipants = participants.length ? participants
    : [
        { id: -1, userId: 0, isCameraOn: false, isMuted: true, isConnected: false } as CallParticipantDto,
        { id: -2, userId: 0, isCameraOn: false, isMuted: true, isConnected: false } as CallParticipantDto,
      ];

  return (
    <Box className="foraria-page-container foraria-call-room">
      <Box className="foraria-call-room-header">
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconButton onClick={() => navigate("/reuniones")}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>{title}</Typography>
            <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
          </Box>
        </Stack>

        <Button variant="contained" color={canEndCall ? "error" : "secondary"} startIcon={<CallEndIcon />} onClick={canEndCall ? handleEndCall : handleLeaveCall}>
          {canEndCall ? "Finalizar llamada" : "Salir de la llamada"}
        </Button>
      </Box>

      {error && (
        <Typography variant="body2" color="error" sx={{ mb: 1, textAlign: "center" }}>
          {error}
        </Typography>
      )}

      <Box className="foraria-call-room-body">
        <Paper className="foraria-call-room-video" elevation={0}>
          <Typography variant="body2" color="common.white" sx={{ mb: 2, opacity: 0.9 }}>
            Vista de videollamada (integración con proveedor WebRTC / SDK en desarrollo).
          </Typography>

          <Box className="foraria-call-room-video-grid">
            {videoParticipants.map((p, i) => {
              const isPlaceholder = p.id < 0;
              const cameraOn = !isPlaceholder && p.isCameraOn;
              const name = !isPlaceholder && p.userId ? `Usuario #${p.userId}` : "Participante";

              return (
                <Box key={p.id ?? i} className={"foraria-call-room-video-tile" + (!cameraOn ? " foraria-call-room-video-tile--off" : "")}>
                  <PersonOutlineIcon className="foraria-call-participant-icon" />
                  <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.9 }}>{name}</Typography>
                  {!cameraOn && (
                    <Typography variant="caption" sx={{ mt: 0.25, opacity: 0.7 }}>
                      Cámara apagada
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>

          <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ mt: 3 }}>
            <Tooltip title={micOn ? "Silenciar" : "Activar micrófono"}>
              <IconButton onClick={() => setMicOn((m) => !m)} className={"foraria-call-control-btn" + (!micOn ? " foraria-call-control-btn--off" : "")}>
                {micOn ? <MicOutlinedIcon color="primary" /> : <MicOffOutlinedIcon className="foraria-call-icon-off" />}
              </IconButton>
            </Tooltip>

            <Tooltip title={camOn ? "Apagar cámara" : "Encender cámara"}>
              <IconButton onClick={() => setCamOn((c) => !c)} className={"foraria-call-control-btn" + (!camOn ? " foraria-call-control-btn--off" : "")}>
                {camOn ? <VideocamOutlinedIcon color="primary" /> : <VideocamOffOutlinedIcon className="foraria-call-icon-off" />}
              </IconButton>
            </Tooltip>
          </Stack>

          {loading && (
            <Typography variant="caption" color="common.white" sx={{ mt: 1.5, display: "block", opacity: 0.6, textAlign: "center" }}>
              Cargando información de la llamada...
            </Typography>
          )}
        </Paper>

        <Paper className="foraria-call-room-side" elevation={0}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Participantes ({participants.length})
          </Typography>

          <Stack spacing={1.2}>
            {participants.map((p) => (
              <Box key={p.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PersonOutlineIcon fontSize="small" />
                  <span>Usuario #{p.userId}</span>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  {p.isMuted ? <MicOffOutlinedIcon fontSize="small" /> : <MicOutlinedIcon fontSize="small" />}
                  {p.isCameraOn ? <VideocamOutlinedIcon fontSize="small" /> : <VideocamOutlinedIcon fontSize="small" sx={{ opacity: 0.3 }} />}
                  <Typography variant="caption" color="text.secondary">
                    {p.isConnected ? "Conectado" : "Desconectado"}
                  </Typography>
                </Stack>
              </Box>
            ))}

            {!participants.length && !loading && (
              <Typography variant="caption" color="text.secondary">
                Aún no hay participantes conectados.
              </Typography>
            )}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Chat
          </Typography>

          <Box className="foraria-call-room-chat-list">
            {messages.length === 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                Todavía no hay mensajes en el chat.
              </Typography>
            )}

            {messages.map((m) => (
              <Box key={m.id} className="foraria-call-room-chat-message">
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Usuario #{m.userId}{" "}
                  <span className="foraria-call-room-chat-time">
                    {new Date(m.sentAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </Typography>
                <Typography variant="body2">{m.message}</Typography>
              </Box>
            ))}
          </Box>

          <form onSubmit={handleSendMessage}>
            <TextField size="small" fullWidth variant="outlined" placeholder="Escribí un mensaje..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} disabled />
            <Button type="submit" variant="contained" color="secondary" size="small" fullWidth sx={{ mt: 0.75 }} disabled>
              Enviar
            </Button>
          </form>
        </Paper>
      </Box>
    </Box>
  );
}
