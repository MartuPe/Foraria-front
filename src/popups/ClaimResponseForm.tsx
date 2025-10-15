import { useState } from "react";
import { TextField, Button, Box } from "@mui/material";
import { useMutation } from "../hooks/useMutation";

interface ClaimResponseFormProps {
  claimId: number;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function ClaimResponseForm({
  claimId,
  onCancel,
  onSuccess,
}: ClaimResponseFormProps) {
  const [description, setDescription] = useState("");
  const [responsibleSectorId, setResponsibleSectorId] = useState<number>(0);
  const { mutate, loading } = useMutation("/ClaimResponse", "post");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutate({
        description,
        responseDate: new Date().toISOString(),
        user_id: 2,
        claim_id: claimId,
        responsibleSector_id: responsibleSectorId,
      });
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("❌ Error al enviar la respuesta");
    }
  };

  return (
    <form className="foraria-form" onSubmit={handleSubmit}>
      <h2 className="foraria-form-title">Responder Reclamo</h2>

      <div className="foraria-form-group">
        <label className="foraria-form-label">Descripción de la respuesta</label>
        <TextField
          fullWidth
          multiline
          minRows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe la resolución del reclamo..."
          variant="outlined"
          className="foraria-form-input"
        />
      </div>

      <div className="foraria-form-group">
        <label className="foraria-form-label">ID del sector responsable</label>
        <TextField
          fullWidth
          type="number"
          value={responsibleSectorId}
          onChange={(e) => setResponsibleSectorId(Number(e.target.value))}
          placeholder="Ej: 1"
          variant="outlined"
        />
      </div>

      <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          disabled={loading}
        >
          {loading ? "Enviando..." : "Enviar respuesta"}
        </Button>
        <Button variant="outlined" onClick={onCancel}>
          Cancelar
        </Button>
      </Box>
    </form>
  );
}
