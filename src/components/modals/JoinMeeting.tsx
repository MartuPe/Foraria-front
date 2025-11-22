import { useEffect, useRef, useState } from "react";
import { Box, Dialog, DialogTitle, DialogContent, IconButton, Typography, Stack, Tooltip, Button,} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import VideocamOffOutlinedIcon from "@mui/icons-material/VideocamOffOutlined";
import MicOutlinedIcon from "@mui/icons-material/MicOutlined";
import MicOffOutlinedIcon from "@mui/icons-material/MicOffOutlined";
import { callService, CallDto } from "../../services/callService";
import { Meeting } from "../../services/meetingService";
import "../../styles/meetings.css";

interface CallDialogProps {
  open: boolean;
  onClose: () => void;
  meeting: Meeting | null;
  onJoinSuccess?: (call: CallDto) => void;
}

export default function CallDialog({
  open,
  onClose,
  meeting,
  onJoinSuccess,
}: CallDialogProps) {
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startCamera = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: isMicOn,
      });
      setStream(media);
    } catch (err) {
      console.error("Error al acceder a la cámara/micrófono:", err);
      setError("No pudimos acceder a tu cámara o micrófono. Revisá los permisos del navegador.");
      setIsCameraOn(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    setStream(null);
  };

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (open && isCameraOn) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isCameraOn]);

  const handleToggleCamera = () => {
    if (isCameraOn) {
      setIsCameraOn(false);
      stopCamera();
    } else {
      setIsCameraOn(true);
      startCamera();
    }
  };

  const handleToggleMic = () => {
    setIsMicOn((prev) => {
      const next = !prev;
      if (stream) {
        stream.getAudioTracks().forEach((t) => {
          t.enabled = next;
        });
      }
      return next;
    });
  };

  const handleClose = () => {
    stopCamera();
    setError(null);
    onClose();
  };

  const handleJoin = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUserId = Number(localStorage.getItem("userId") || 0);
      if (!currentUserId) {
        throw new Error("No se pudo identificar al usuario.");
      }

      if (!meeting) {
        throw new Error("No se encontró la reunión seleccionada.");
      }

      const callId = meeting.id;
      await callService.join(callId, currentUserId);
      const call = await callService.getDetails(callId);

      onJoinSuccess?.(call);
      handleClose();
    } catch (e) {
      console.error(e);
      setError("No se pudo iniciar la reunión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle component="div" sx={{display: "flex", alignItems: "center", justifyContent: "space-between", pr: 1, }} >
        <Typography variant="h6">
          Unirse a la reunión{meeting ? `: ${meeting.title}` : ""}
        </Typography>
        <IconButton onClick={handleClose} aria-label="Cerrar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Box sx={{ position: "relative", width: "100%", pt: "56.25%", borderRadius: 2, overflow: "hidden", bgcolor: "black", }}>
            {isCameraOn && stream ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{ position: "absolute", top: 0, left: 0, width: "100%",height: "100%",objectFit: "cover",}}
              />
            ) : (
              <Box sx={{position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "grey.400", }}>
                <VideocamOffOutlinedIcon sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="body2">
                  Cámara desactivada para esta vista previa
                </Typography>
              </Box>
            )}
          </Box>

          <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
            <Tooltip title={isCameraOn ? "Apagar cámara" : "Encender cámara"}>
              <IconButton onClick={handleToggleCamera} color={isCameraOn ? "primary" : "default"}>
                {isCameraOn ? ( <VideocamOutlinedIcon /> ) : ( <VideocamOffOutlinedIcon /> )}
              </IconButton>
            </Tooltip>

            <Tooltip title={isMicOn ? "Silenciar micrófono" : "Activar micrófono"}>
              <IconButton onClick={handleToggleMic} color={isMicOn ? "primary" : "default"} >
                {isMicOn ? <MicOutlinedIcon /> : <MicOffOutlinedIcon />}
              </IconButton>
            </Tooltip>
          </Stack>

          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 1, }} >
            <Button onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button variant="contained" color="secondary" onClick={handleJoin} disabled={loading || !meeting} >
              {loading ? "Conectando..." : "Unirse a la reunión"}
            </Button>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}