// src/components/modals/AcceptClaimModal.tsx
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useMutation } from "../../hooks/useMutation";
import "../../styles/spent.css";

type Sector = { id: number; name: string };

type Props = {
  open: boolean;
  onClose: () => void;
  claimId: number;
  claimTitle?: string;
  claimantName?: string;
  userId?: number;
  responsibleSectors?: Sector[];
  onSuccess?: () => void;
};

export default function AcceptClaimModal({
  open,
  onClose,
  claimId,
  claimTitle = "",
  claimantName = "",
  userId = Number(localStorage.getItem("userId")),
  responsibleSectors = [{ id: 0, name: "Seleccionar responsable" }],
  onSuccess,
}: Props) {
  const [description, setDescription] = useState("");
  const [responseDate, setResponseDate] = useState(() =>
    new Date().toISOString().slice(0, 16)
  );
  const [responsibleSectorId, setResponsibleSectorId] = useState<number>(
    responsibleSectors[0]?.id ?? 0
  );

  const { mutate, loading, error } = useMutation("/ClaimResponse", "post");

  useEffect(() => {
    if (open) {
      setDescription("");
      setResponseDate(new Date().toISOString().slice(0, 16));
      setResponsibleSectorId(responsibleSectors[0]?.id ?? 0);
    }

  }, [open, responsibleSectors]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const payload = {
      description,
      responseDate: new Date(responseDate).toISOString(),
      user_id: userId,
      claim_id: claimId,
      responsibleSector_id: responsibleSectorId ?? 0,
    };

    try {
      await mutate(payload);
      onClose();
      onSuccess?.();
    } catch {

    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Aceptar Reclamo</DialogTitle>
      <form onSubmit={handleSubmit} className="foraria-form">
        <DialogContent dividers>
          <Typography variant="subtitle1">Reclamo: {claimTitle}</Typography>
          <Typography variant="body2" gutterBottom>
            {claimantName}
          </Typography>

          <div className="foraria-form-group" style={{ marginTop: 12 }}>
            <label className="foraria-form-label">Respuesta al inquilino *</label>
            <TextField
              fullWidth
              multiline
              minRows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe las acciones que se tomarán para resolver el reclamo..."
              className="foraria-form-textarea"
            />
          </div>

          <div className="foraria-form-group">
            <div>
              <label className="foraria-form-label">Fecha estimada de resolución</label>
              <TextField
                fullWidth
                required
                type="datetime-local"
                value={responseDate}
                onChange={(e) => setResponseDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <FormControl fullWidth>
                <InputLabel id="responsible-select-label">Asignar a</InputLabel>
                <Select
                  labelId="responsible-select-label"
                  value={responsibleSectorId}
                  label="Asignar a"
                  onChange={(e) => setResponsibleSectorId(Number(e.target.value))}
                  required
                >
                  {responsibleSectors.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>

          {error && (
            <Typography color="error" variant="body2" style={{ marginTop: 12 }}>
              {error}
            </Typography>
          )}
        </DialogContent>

        <DialogActions className="foraria-form-actions" style={{ padding: "16px 24px" }}>
          <Button onClick={onClose} className="foraria-outlined-white-button">
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            className="foraria-gradient-button boton-crear-reclamo"
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Aceptar Reclamo"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
