import { useState, useEffect } from "react";
import { Box, Dialog, DialogTitle, DialogContent, IconButton, Typography, Stack, Tooltip, Button, } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import VideocamOffOutlinedIcon from "@mui/icons-material/VideocamOffOutlined";
import MicOutlinedIcon from "@mui/icons-material/MicOutlined";
import MicOffOutlinedIcon from "@mui/icons-material/MicOffOutlined";
import { callService, CallDto } from "../../services/callService";
import { storage } from "../../utils/storage";
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
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUserId =
    Number(localStorage.getItem("userId")) ||
    Number((storage as any).userId || 0) ||
    0;

  useEffect(() => {
    if (open) {
      setError(null);
      setLoading(false);
    }
  }, [open]);

  const handleConfirmJoin = async () => {
    if (!meeting) return;
    setLoading(true);
    setError(null);

    try {
      if (!currentUserId) {
        throw new Error("No se pudo identificar al usuario.");
      }

      const call = await callService.create(currentUserId);
      await callService.join(call.id, currentUserId);

      onJoinSuccess?.(call);
      onClose();
    } catch (e) {
      console.error(e);
      setError("No se pudo iniciar la reunión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const subtitle = error ?? "Revisá que tu micrófono y cámara estén configurados antes de unirte.";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" }, }}>
      <DialogTitle sx={{display: "flex", alignItems: "center", justifyContent: "space-between", pr: 2, }}>
        <Typography variant="subtitle1" fontWeight={600}>
          {meeting?.title ?? "Reunión"}
        </Typography>

        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{pt: 0, pb: 3,}}>
        <Box className="foraria-call-video">
          <VideocamOutlinedIcon className="foraria-call-main-icon" />
          <Typography variant="body2" className="foraria-call-connecting">
            {loading? "Conectando..." : "Conectando a la reunión (vista previa)"}
          </Typography>
        </Box>

        <Typography  variant="body2" color={error ? "error" : "text.secondary"} sx={{ mb: 2, textAlign: "center" }} >
          {subtitle}
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" className="foraria-call-controls" >
          <Tooltip title={micOn ? "Silenciar" : "Activar micrófono"}>
            <IconButton onClick={() => setMicOn((m) => !m)} className="foraria-call-control-btn" >
              {micOn ? (<MicOutlinedIcon color="primary" />) : (<MicOffOutlinedIcon className="foraria-call-icon-off" />)}
            </IconButton>
          </Tooltip>

          <Tooltip title={camOn ? "Apagar cámara" : "Encender cámara"}>
            <IconButton onClick={() => setCamOn((c) => !c)}
              className={ "foraria-call-control-btn" + (!camOn ? " foraria-call-control-btn--off" : "") } >
              {camOn ? (<VideocamOutlinedIcon color="primary" />) : (<VideocamOffOutlinedIcon className="foraria-call-icon-off" />)}
            </IconButton>
          </Tooltip>
        </Stack>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={handleConfirmJoin}
            disabled={loading || !meeting}
            startIcon={<VideocamOutlinedIcon />}
          >
            {loading ? "Entrando..." : "Entrar a la reunión"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}