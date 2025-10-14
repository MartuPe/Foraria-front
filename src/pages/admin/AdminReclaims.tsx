import React, { useState } from "react";
import {
  Typography,
  Button,
  Stack,
  Paper,
  Dialog,
  DialogContent,
} from "@mui/material";
import PageHeader from "../../components/SectionHeader";
import NewClaim from "../../popups/NewClaim";
import { useGet } from "../../hooks/useGet";
import InfoCard from "../../components/InfoCard";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { useMutation } from "../../hooks/useMutation";
import ClaimResponseForm from "../../popups/ClaimResponseForm";

interface Claim {
  claim: {
    id?: number;
    title: string;
    description: string;
    priority?: string | null;
    category?: string | null;
    archive?: string | null;
    user_id?: number | null;
  };
}

const AdminReclaims: React.FC = () => {
  const { data: claim } = useGet<Claim[]>("/Claim");
  const [tab, setTab] = useState<"todas" | "actives" | "finalizada">("todas");

  const [openNewClaim, setOpenNewClaim] = useState(false);
  const [openResponse, setOpenResponse] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState<number | null>(null);

  // Mutación para rechazar reclamos
  const { mutate: rejectClaim, loading: rejecting } = useMutation("/Claim/reject", "put");

  const handleReject = async (id?: number) => {
    if (!id) return;
    if (!window.confirm("¿Seguro que deseas rechazar este reclamo?")) return;

    try {
      await rejectClaim(undefined, { params: { id } });
      alert("✅ Reclamo rechazado correctamente");
      window.location.reload();
    } catch (err) {
      alert("❌ Error al rechazar el reclamo");
      console.error(err);
    }
  };

  const handleAccept = (id?: number) => {
    if (!id) return;
    setSelectedClaimId(id);
    setOpenResponse(true);
  };

  return (
    <div className="page">
      <PageHeader
        title="Reclamos"
        actions={
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setOpenNewClaim(true)}
          >
            + Nuevo Reclamo
          </Button>
        }
        showSearch
        onSearchChange={(q) => console.log("Buscar:", q)}
        tabs={[
          { label: "Todas", value: "todas" },
          { label: "Activas", value: "actives" },
          { label: "Finalizadas", value: "finalizada" },
        ]}
        selectedTab={tab}
        onTabChange={(v) => setTab(v as typeof tab)}
      />

      {/* Modal nuevo reclamo */}
      <Dialog
        open={openNewClaim}
        onClose={() => setOpenNewClaim(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <NewClaim
            onSuccess={() => window.location.reload()}
            onCancel={() => setOpenNewClaim(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal respuesta al aceptar */}
      <Dialog
        open={openResponse}
        onClose={() => setOpenResponse(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          {selectedClaimId && (
            <ClaimResponseForm
              claimId={selectedClaimId}
              onCancel={() => setOpenResponse(false)}
              onSuccess={() => {
                alert("✅ Reclamo aceptado y respondido correctamente");
                setOpenResponse(false);
                window.location.reload();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Stack spacing={2}>
        {claim && claim.length > 0 ? (
          claim.map((c) => (
            <InfoCard
              key={c.claim.id}
              title={c.claim.title}
              description={c.claim.description}
              chips={[
                c.claim.priority
                  ? { label: c.claim.priority.toUpperCase(), color: "warning" }
                  : { label: "Sin prioridad" },
                c.claim.category
                  ? { label: c.claim.category, color: "info" }
                  : { label: "Sin categoría" },
              ]}
              actions={[
                {
                  label: "Aceptar",
                  icon: <CheckCircleOutlineIcon />,
                  onClick: () => handleAccept(c.claim.id),
                },
                {
                  label: rejecting ? "Procesando..." : "Rechazar",
                  icon: <HighlightOffIcon />,
                   onClick: rejecting ? undefined : () => handleReject(c.claim.id),
                },
              ]}
            />
          ))
        ) : (
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
              border: "1px solid #f0f0f0",
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No se encontraron reclamos
            </Typography>
          </Paper>
        )}
      </Stack>
    </div>
  );
};

export default AdminReclaims;
