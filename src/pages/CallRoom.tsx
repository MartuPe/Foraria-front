import { useEffect, useMemo, useState, FormEvent, useRef,} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Box, IconButton, Typography, Stack, Paper, Tooltip, Button, Divider, TextField,} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicOutlinedIcon from "@mui/icons-material/MicOutlined";
import MicOffOutlinedIcon from "@mui/icons-material/MicOffOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import VideocamOffOutlinedIcon from "@mui/icons-material/VideocamOffOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { callService, CallDto, CallParticipantDto, CallMessageDto,} from "../services/callService";
import { getMeetingById } from "../services/meetingService";
import { storage } from "../utils/storage";
import { Role } from "../constants/roles";
import { useSignalR } from "../hooks/useSignalRCalls";
import { RTCClient } from "../services/rtcClient";
import "../styles/meetings.css";

interface RouteParams extends Record<string, string | undefined> {
  meetingId?: string;
  callId?: string;
}

const HUB_URL = "https://localhost:7245/callhub";

function normalizeParticipants(list: CallParticipantDto[] | undefined) {
  return (list ?? []).map((p) => ({
    ...p,
    isConnected: p.leftAt ? false : p.isConnected ?? true,
  }));
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
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const numericMeetingId = Number(meetingId);
  const numericCallId = Number(callId);
  const meeting = useMemo(
    () => (numericMeetingId ? getMeetingById(numericMeetingId) : undefined),
    [numericMeetingId]
  );
  const currentUserId = Number(localStorage.getItem("userId") ?? 0);
  const role = storage.role as Role | undefined;
  const isAdminRole = role === Role.ADMIN || role === Role.CONSORCIO;
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith("/admin");
  const canEndCall = !!call && isAdminRole && call.createdByUserId === currentUserId;
  const rtcRef = useRef<RTCClient | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const connectionUsersRef = useRef<Map<string, number>>(new Map());
  const remoteVideoRefs = useRef<Map<number, HTMLVideoElement | null>>(new Map());
  const setRemoteVideoRef =
    (userId: number) => (el: HTMLVideoElement | null) => {
      remoteVideoRefs.current.set(userId, el);
      if (el && rtcRef.current) {
        const stream = rtcRef.current.getRemoteStream(userId);
        if (stream) {
          el.srcObject = stream;
        }
      }
    };

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
        setParticipants(normalizeParticipants(state.participants));
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
            setParticipants(normalizeParticipants(state.participants));
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

  const { connected, send, on, off } = useSignalR({
    url: HUB_URL,
    onConnected: async (connection) => {
      console.log("✅ SignalR conectado en CallRoom, id:", connection.connectionId);
      if (!numericCallId || !currentUserId) return;

      try {
        await connection.invoke("JoinCall", numericCallId.toString(), currentUserId);
        console.log("JoinCall enviado:", numericCallId, currentUserId);
      } catch (err) {
        console.error("Error al invocar JoinCall:", err);
      }
    },
    onDisconnected: () => {
      console.log("CallRoom: conexión SignalR cerrada");
    },
  });

  useEffect(() => {
    if (!numericCallId || Number.isNaN(numericCallId)) return;

    let cancelled = false;

    const initMediaAndRtc = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        rtcRef.current = new RTCClient(
          (offer, toUserId) =>
            send("SendOffer", numericCallId.toString(), toUserId, offer),
          (answer, toUserId) =>
            send("SendAnswer", numericCallId.toString(), toUserId, answer),
          (candidate, toUserId) =>
            send(
              "SendIceCandidate",
              numericCallId.toString(),
              toUserId,
              candidate
            ),
          (userId, remoteStream) => {
            console.log("🎥 Llega stream remoto para userId:", userId);
            const videoEl = remoteVideoRefs.current.get(userId);
            if (videoEl) {
              videoEl.srcObject = remoteStream;
            }
          }
        );

        await rtcRef.current.setLocalStream(stream);
      } catch (err) {
        console.error("No se pudo acceder a cámara/micrófono:", err);
        setError("No se pudo acceder a la cámara o micrófono.");
      }
    };

    initMediaAndRtc();

    return () => {
      cancelled = true;
      rtcRef.current?.closeAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericCallId]);

  useEffect(() => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach((t) => {
      t.enabled = micOn;
    });
  }, [micOn, localStream]);

  useEffect(() => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach((t) => {
      t.enabled = camOn;
    });
  }, [camOn, localStream]);

  useEffect(() => {
    if (!connected) return;
    if (!numericCallId) return;

    const handleCurrentParticipants = (
      payload: { connectionId: string; userId: number }[]
    ) => {
      console.log("📥 CurrentParticipants:", payload);
      setParticipants((prev) => {
        const map = new Map<number, CallParticipantDto>();
        prev.forEach((p) => {
          if (p.isConnected) {
            map.set(p.userId, p);
          }
        });

        payload.forEach((u) => {
          connectionUsersRef.current.set(u.connectionId, u.userId);
          const existing = map.get(u.userId);
          const updated: CallParticipantDto = {
            id: existing?.id ?? Math.random(),
            userId: u.userId,
            isCameraOn: existing?.isCameraOn ?? true,
            isMuted: existing?.isMuted ?? true,
            isConnected: true,
            joinedAt:
              (existing as any)?.joinedAt ?? new Date().toISOString(),
          };

          map.set(u.userId, updated);
        });

        return Array.from(map.values());
      });
    };

    const handleUserJoined = (payload: {
      userId: number;
      connectionId: string;
    }) => {
      console.log("➕ UserJoined recibido:", payload);
      connectionUsersRef.current.set(payload.connectionId, payload.userId);
      setParticipants((prev) => {
        const exists = prev.some((p) => p.userId === payload.userId);
        if (exists) {
          return prev.map((p) =>
            p.userId === payload.userId ? { ...p, isConnected: true } : p
          );
        }

        const newParticipant: CallParticipantDto = {
          id: Math.random(),
          userId: payload.userId,
          isCameraOn: true,
          isMuted: true,
          isConnected: true,
          joinedAt: new Date().toISOString(),
        };

        return [...prev, newParticipant];
      });

      if (rtcRef.current) {
        rtcRef.current
          .createOffer(payload.userId)
          .catch((e) => console.error("Error creando offer:", e));
      }
    };

    const handleUserLeft = (payload: {
      userId: number;
      connectionId: string;
    }) => {
      console.log("➖ UserLeft recibido:", payload);

      setParticipants((prev) =>
        prev.map((p) =>
          p.userId === payload.userId ? { ...p, isConnected: false, leftAt: new Date().toISOString() } : p)
      );

      rtcRef.current?.closePeer(payload.userId);
    };

    const handleUserMuteChanged = (payload: {
      userId: number;
      isMuted: boolean;
    }) => {
      console.log("UserMuteChanged:", payload);
      setParticipants((prev) =>
        prev.map((p) =>
          p.userId === payload.userId ? { ...p, isMuted: payload.isMuted } : p
        )
      );
    };

    const handleUserCameraChanged = (payload: {
      userId: number;
      isCameraOn: boolean;
    }) => {
      console.log("UserCameraChanged:", payload);
      setParticipants((prev) =>
        prev.map((p) =>
          p.userId === payload.userId ? { ...p, isCameraOn: payload.isCameraOn } : p
        )
      );
    };

    const handleReceiveChatMessage = (payload: {
      userId: number;
      message: string;
      sentAt: string | Date;
    }) => {
      console.log("ReceiveChatMessage:", payload);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random(),
          userId: payload.userId,
          message: payload.message,
          sentAt: new Date(payload.sentAt),
        } as CallMessageDto,
      ]);
    };

    const handleReceiveOffer = async (payload: {
      from: string;
      offer: any;
    }) => {
      console.log("ReceiveOffer:", payload);

      const remoteUserId = connectionUsersRef.current.get(payload.from);
      console.log("➡ from connectionId mapeado a userId:", remoteUserId);
      if (!remoteUserId || !rtcRef.current) return;

      try {
        await rtcRef.current.receiveOffer(remoteUserId, payload.offer);
      } catch (e) {
        console.error("Error al procesar offer:", e);
      }
    };

    const handleReceiveAnswer = async (payload: {
      from: string;
      answer: any;
    }) => {
      console.log("ReceiveAnswer:", payload);

      const remoteUserId = connectionUsersRef.current.get(payload.from);
      console.log("➡ from connectionId mapeado a userId:", remoteUserId);

      if (!remoteUserId || !rtcRef.current) return;

      try {
        await rtcRef.current.receiveAnswer(remoteUserId, payload.answer);
      } catch (e) {
        console.error("Error al procesar answer:", e);
      }
    };

    const handleReceiveIceCandidate = async (payload: {
      from: string;
      candidate: any;
    }) => {
      console.log("❄ ReceiveIceCandidate:", payload);

      const remoteUserId = connectionUsersRef.current.get(payload.from);
      console.log("➡ from connectionId mapeado a userId:", remoteUserId);

      if (!remoteUserId || !rtcRef.current) return;

      try {
        await rtcRef.current.receiveIceCandidate(
          remoteUserId,
          payload.candidate
        );
      } catch (e) {
        console.error("Error al procesar ICE:", e);
      }
    };

    on("CurrentParticipants", handleCurrentParticipants);
    on("UserJoined", handleUserJoined);
    on("UserLeft", handleUserLeft);
    on("UserMuteChanged", handleUserMuteChanged);
    on("UserCameraChanged", handleUserCameraChanged);
    on("ReceiveChatMessage", handleReceiveChatMessage);

    on("ReceiveOffer", handleReceiveOffer);
    on("ReceiveAnswer", handleReceiveAnswer);
    on("ReceiveIceCandidate", handleReceiveIceCandidate);

    return () => {
      off("CurrentParticipants", handleCurrentParticipants);
      off("UserJoined", handleUserJoined);
      off("UserLeft", handleUserLeft);
      off("UserMuteChanged", handleUserMuteChanged);
      off("UserCameraChanged", handleUserCameraChanged);
      off("ReceiveChatMessage", handleReceiveChatMessage);

      off("ReceiveOffer", handleReceiveOffer);
      off("ReceiveAnswer", handleReceiveAnswer);
      off("ReceiveIceCandidate", handleReceiveIceCandidate);
    };
  }, [connected, numericCallId, on, off, currentUserId]);

  const handleEndCall = async () => {
    try {
      if (numericCallId && !Number.isNaN(numericCallId)) {
        await callService.end(numericCallId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (connected && numericCallId && currentUserId) {
        await send("LeaveCall", numericCallId.toString(), currentUserId);
      }

      const basePath = isAdminRoute ? "/admin/reuniones" : "/reuniones";
      navigate(basePath);
    }
  };

  const handleLeaveCall = async () => {
    try {
      if (connected && numericCallId && currentUserId) {
        await send("LeaveCall", numericCallId.toString(), currentUserId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      const basePath = isAdminRoute ? "/admin/reuniones" : "/reuniones";
      navigate(basePath);
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed || !numericCallId || !currentUserId) return;

    try {
      await send(
        "SendChatMessage",
        numericCallId.toString(),
        currentUserId,
        trimmed
      );
      setNewMessage("");
    } catch (err) {
      console.error("Error enviando mensaje de chat:", err);
    }
  };

  const title =
    meeting?.title ?? (call ? `Llamada #${call.id}` : "Reunión en curso");
  const subtitle = meeting ? `${meeting.date} · ${meeting.time} · ${meeting.location}` : call ? `Estado: ${call.status}` : "Llamada en curso";

  const visibleParticipants = useMemo(() => {
    const map = new Map<number, CallParticipantDto>();
    for (const p of participants) {
      if (!p.isConnected) continue;
      map.set(p.userId, p);
    }
    return Array.from(map.values());
  }, [participants]);

  const videoParticipants = visibleParticipants.length
    ? visibleParticipants
    : [
        {
          id: -1,
          userId: 0,
          isCameraOn: false,
          isMuted: true,
          isConnected: false,
          joinedAt: new Date().toISOString(),
        } as CallParticipantDto,
      ];

  return (
    <Box className="foraria-page-container foraria-call-room">
      <Box className="foraria-call-room-header">
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconButton onClick={() => navigate("/reuniones")}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        </Stack>

        <Button variant="contained" color={canEndCall ? "error" : "secondary"} startIcon={<CallEndIcon />} onClick={canEndCall ? handleEndCall : handleLeaveCall} >
          {canEndCall ? "Finalizar llamada" : "Salir de la llamada"}
        </Button>
      </Box>

      {error && (
        <Typography variant="body2" color="error" sx={{ mb: 1, textAlign: "center" }} >
          {error}
        </Typography>
      )}

      <Box className="foraria-call-room-body">
        <Paper className="foraria-call-room-video" elevation={0}>
          <Typography variant="body2" color="common.white" sx={{ mb: 2, opacity: 0.9 }} >
            Videollamada en curso.
          </Typography>

          <Box className="foraria-call-room-video-grid">
            <Box className="foraria-call-room-video-tile">
              <video ref={localVideoRef} autoPlay playsInline muted className="foraria-call-video-element" />
              <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.9 }}>
                Vos
              </Typography>
            </Box>

            {videoParticipants
              .filter((p) => p.userId !== currentUserId)
              .map((p) => {
                const name = `Participante #${p.userId}`;
                return (
                  <Box key={p.id} className={ "foraria-call-room-video-tile" + (p.isCameraOn === false ? " foraria-call-room-video-tile--off" : "")}>
                    <video ref={setRemoteVideoRef(p.userId)} autoPlay playsInline className="foraria-call-video-element"/>
                    <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.9 }} >
                      {name}
                    </Typography>
                    {p.isCameraOn === false && (
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
              <IconButton
                onClick={() => setMicOn((m) => !m)}
                className={"foraria-call-control-btn" + (!micOn ? " foraria-call-control-btn--off" : "")}>
                {micOn ? (<MicOutlinedIcon color="primary" />) : (<MicOffOutlinedIcon className="foraria-call-icon-off" />)}
              </IconButton>
            </Tooltip>

            <Tooltip title={camOn ? "Apagar cámara" : "Encender cámara"}>
              <IconButton onClick={() => setCamOn((c) => !c)} className={"foraria-call-control-btn" + (!camOn ? " foraria-call-control-btn--off" : "")}>
                {camOn ? (<VideocamOutlinedIcon color="primary" />) : (<VideocamOffOutlinedIcon className="foraria-call-icon-off" />)}
              </IconButton>
            </Tooltip>
          </Stack>

          {loading && (
            <Typography
              variant="caption"
              color="common.white"
              sx={{
                mt: 1.5,
                display: "block",
                opacity: 0.6,
                textAlign: "center",
              }}
            >
              Cargando información de la llamada...
            </Typography>
          )}
        </Paper>

        <Paper className="foraria-call-room-side" elevation={0}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Participantes ({visibleParticipants.length})
          </Typography>

          <Stack spacing={1.2}>
            {visibleParticipants.map((p) => (
              <Box
                key={p.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 14,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <PersonOutlineIcon fontSize="small" />
                  <span>
                    {p.userId === currentUserId
                      ? "Vos"
                      : `Usuario #${p.userId}`}
                  </span>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  {p.isMuted ? (
                    <MicOffOutlinedIcon fontSize="small" />
                  ) : (
                    <MicOutlinedIcon fontSize="small" />
                  )}
                  {p.isCameraOn ? (
                    <VideocamOutlinedIcon fontSize="small" />
                  ) : (
                    <VideocamOutlinedIcon
                      fontSize="small"
                      sx={{ opacity: 0.3 }}
                    />
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {p.isConnected ? "Conectado" : "Desconectado"}
                  </Typography>
                </Stack>
              </Box>
            ))}

            {!visibleParticipants.length && !loading && (
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
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontStyle: "italic" }}
              >
                Todavía no hay mensajes en el chat.
              </Typography>
            )}

            {messages.map((m) => (
              <Box
                key={m.id}
                className="foraria-call-room-chat-message"
              >
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Usuario #{m.userId}{" "}
                  <span className="foraria-call-room-chat-time">
                    {new Date(m.sentAt).toLocaleTimeString("es-AR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </Typography>
                <Typography variant="body2">{m.message}</Typography>
              </Box>
            ))}
          </Box>

          <form onSubmit={handleSendMessage}>
            <TextField
              size="small"
              fullWidth
              variant="outlined"
              placeholder="Escribí un mensaje..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              size="small"
              fullWidth
              sx={{ mt: 0.75 }}
            >
              Enviar
            </Button>
          </form>
        </Paper>
      </Box>
    </Box>
  );
}
