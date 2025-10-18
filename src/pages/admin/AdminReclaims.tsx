// src/pages/Claims.tsx
import React, { useState } from "react";
import { Box, Typography, Stack, Paper, Button, Dialog, DialogContent } from "@mui/material";
import PageHeader from "../../components/SectionHeader";
import InfoCard from "../../components/InfoCard";
import { Layout } from "../../components/layout";
import { useGet } from "../../hooks/useGet";
import NewClaim from "../../components/modals/NewClaim";
import AcceptClaimModal from "../../components/modals/AcceptClaimModal";
import RejectClaimModal from "../../components/modals/RejectClaimModal";

interface ClaimItem {
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

const Claims: React.FC = () => {
  const { data: claimData, loading, error, refetch } = useGet<ClaimItem[]>("/Claim");
  const [tab, setTab] = useState<"todas" | "actives" | "finalizada">("todas");


  const [openNew, setOpenNew] = useState(false);
  const handleOpenNew = () => setOpenNew(true);
  const handleCloseNew = () => setOpenNew(false);


  const [openAcceptId, setOpenAcceptId] = useState<number | null>(null);
  const [openRejectId, setOpenRejectId] = useState<number | null>(null);

  const API_BASE = process.env.REACT_APP_API_URL || "https://localhost:7245";

  if (loading) return <div>Cargando reclamos...</div>;
  if (error) return <div>Error al cargar: {error}</div>;

  return (
    <Layout>
      <Box className="foraria-page-container">
        <PageHeader
          title="Reclamos"
          actions={
            <Button variant="contained" color="secondary" onClick={handleOpenNew}>
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

  
        <Dialog open={openNew} onClose={handleCloseNew} maxWidth="md" fullWidth>
          <DialogContent>
            <NewClaim
              onSuccess={() => {
                handleCloseNew();
                refetch();
              }}
              onCancel={handleCloseNew}
            />
          </DialogContent>
        </Dialog>

        <Stack spacing={2}>
          {claimData && claimData.length > 0 ? (
            claimData.map((c) => {
              const id = c.claim.id ?? 0;
              return (
                <Box key={id}>
                  <InfoCard
                    title={c.claim.title}
                    description={c.claim.description}
                    chips={[
                      c.claim.priority
                        ? { label: c.claim.priority.toUpperCase(), color: "warning" }
                        : { label: "Sin prioridad" },
                      c.claim.category ? { label: c.claim.category, color: "info" } : { label: "Sin categoría" },
                    ]}
                    files={[{ url: `${API_BASE}${c.claim.archive ?? ""}`, type: "jpg" }]}
                  />

                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      className="foraria-gradient-button boton-crear-reclamo"
                      onClick={() => setOpenAcceptId(id)}
                    >
                      Aceptar Reclamo
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      className="foraria-outlined-white-button"
                      onClick={() => setOpenRejectId(id)}
                    >
                      Rechazar
                    </Button>
                  </Box>


                  <AcceptClaimModal
                    open={openAcceptId === id}
                    onClose={() => setOpenAcceptId(null)}
                    claimId={id}
                    claimTitle={c.claim.title}
                    claimantName={`Usuario ${c.claim.user_id ?? ""}`}
                    userId={Number(localStorage.getItem("userId") ?? 0)}
                    responsibleSectors={[{ id: 1, name: "Mantenimiento" }, { id: 2, name: "Administración" }]}
                    onSuccess={() => {
                      setOpenAcceptId(null);
                      refetch();
                    }}
                  />

      
                  <RejectClaimModal
                    open={openRejectId === id}
                    onClose={() => setOpenRejectId(null)}
                    claimId={id}
                    claimTitle={c.claim.title}
                    claimantName={`Usuario ${c.claim.user_id ?? ""}`}
                    onSuccess={() => {
                      setOpenRejectId(null);
                      refetch();
                    }}
                  />
                </Box>
              );
            })
          ) : (
            <Paper sx={{ p: 4, textAlign: "center", border: "1px solid #f0f0f0", borderRadius: 3 }}>
              <Typography variant="h6" color="text.secondary">
                No se encontraron reclamos
              </Typography>
            </Paper>
          )}
        </Stack>
      </Box>
    </Layout>
  );
};

export default Claims;
