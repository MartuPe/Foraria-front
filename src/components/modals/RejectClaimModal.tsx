// src/components/RejectClaimModal.tsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useMutation } from "../../hooks/useMutation";

type Props = {
  open: boolean;
  onClose: () => void;
  claimId: number;
  claimTitle?: string;
  claimantName?: string;
  onSuccess?: () => void;
};

export default function RejectClaimModal({
  open,
  onClose,
  claimId,
  claimTitle = "",
  claimantName = "",
  onSuccess,
}: Props) {
  const { mutate, loading, error } = useMutation(`/Claim/reject/${claimId}`, "put");

  const handleReject = async () => {
    try {
      await mutate();
      onClose();
      onSuccess?.();
    } catch {
      // error mostrado por hook
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>¿Rechazar reclamo?</DialogTitle>
      <DialogContent dividers>
        <Typography>
          Estás a punto de rechazar el reclamo "<strong>{claimTitle}</strong>" de {claimantName}.
        </Typography>
        <Typography style={{ marginTop: 12 }}>
          Se notificará automáticamente al inquilino sobre esta decisión.
        </Typography>

        {error && (
          <Typography color="error" variant="body2" style={{ marginTop: 12 }}>
            {error}
          </Typography>
        )}
      </DialogContent>

      <DialogActions style={{ padding: "16px 24px" }}>
        <Button onClick={onClose} className="foraria-outlined-white-button">
          Cancelar
        </Button>

        <Button
          onClick={handleReject}
          variant="contained"
          color="error"
          disabled={loading}
          className="foraria-gradient-button"
          style={{ backgroundColor: "#d32f2f" }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : "Rechazar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
