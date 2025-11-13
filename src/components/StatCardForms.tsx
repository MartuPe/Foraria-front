import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, Box, } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

type StatusVariant = "success" | "error" | "info" | "warning";

interface ForariaStatusModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  variant?: StatusVariant;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
}

const variantConfig: Record<
  StatusVariant,
  { color: string; icon: React.ReactNode; defaultTitle: string }
> = {
  success: {
    color: "#2e7d32",
    icon: <CheckCircleOutlineIcon fontSize="large" />,
    defaultTitle: "Operación exitosa",
  },
  error: {
    color: "#d32f2f",
    icon: <ErrorOutlineIcon fontSize="large" />,
    defaultTitle: "Ocurrió un error",
  },
  info: {
    color: "#1565c0",
    icon: <InfoOutlinedIcon fontSize="large" />,
    defaultTitle: "Información",
  },
  warning: {
    color: "#ed6c02",
    icon: <WarningAmberIcon fontSize="large" />,
    defaultTitle: "Atención",
  },
};

export const ForariaStatusModal: React.FC<ForariaStatusModalProps> = ({
  open,
  onClose,
  title,
  message,
  variant = "info",
  primaryActionLabel = "Aceptar",
  onPrimaryAction,
}) => {
  const cfg = variantConfig[variant];

  const handlePrimary = () => {
    if (onPrimaryAction) onPrimaryAction();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      className="foraria-status-modal"
    >
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ color: cfg.color, display: "flex" }}>{cfg.icon}</Box>
          <Typography variant="h6">
            {title || cfg.defaultTitle}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handlePrimary}
          variant="contained"
          className="foraria-gradient-button"
        >
          {primaryActionLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};