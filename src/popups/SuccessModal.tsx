import React from "react";
import { Modal, Box, Typography, Button, Stack, Link } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ open, onClose }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="success-modal-title"
      aria-describedby="success-modal-description"
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
              <CheckCircleOutlineIcon color="success" fontSize="medium" />
              <Typography id="success-modal-title" variant="h6" color="success.main">
                Tu voto fue registrado en la blockchain
              </Typography>
            </Stack>
          </Stack>

<Link
            href="https://amoy.polygonscan.com/address/0xfa2ce94f49224cfbc9bf6f2dacb28847de07df97"
           color="primary"
          >     
          <Typography id="success-modal-description" variant="body1" sx={{ color: "text.primary" }}>
            Para verificarlo click aqui
          </Typography>
 </Link>
      

          <Box textAlign="right">
            <Button variant="contained" color="success" onClick={onClose}>
              Cerrar
            </Button>
          </Box>
        </Stack>
      </Box>
    </Modal>
  );
};

export default SuccessModal;
