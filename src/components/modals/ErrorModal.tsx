import React from "react";
import { Modal, Box, Typography, Button, Stack } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";


interface ErrorModalProps {
  open: boolean;
  errorMessage: string;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ open, errorMessage, onClose }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="error-modal-title"
      aria-describedby="error-modal-description"
      closeAfterTransition
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: 26,
          p: 4,
          minWidth: 350,
          maxWidth: 500,
          outline: "none",
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center">
              <ErrorOutlineIcon color="error" fontSize="medium" />
              <Typography id="error-modal-title" variant="h6" color="error">
                Error al enviar el voto
              </Typography>
            </Stack>
          </Stack>

  
          <Typography id="error-modal-description" variant="body1" sx={{ color: "text.primary" }}>
            {errorMessage}
          </Typography>

    
          <Box textAlign="right">
            <Button variant="contained" color="error" onClick={onClose}>
              Cerrar
            </Button>
          </Box>
        </Stack>
      </Box>
    </Modal>
  );
};

export default ErrorModal;
