// src/pages/Claims.tsx
import React, { useState } from "react";
import { Box, Typography, Stack, Paper, Button, Dialog, DialogContent } from "@mui/material";
import PageHeader from "../components/SectionHeader";
import InfoCard from "../components/InfoCard";
import { Layout } from "../components/layout";
import { useGet } from "../hooks/useGet";
import NewClaim from "../components/modals/NewClaim";
import AcceptClaimModal from "../components/modals/AcceptClaimModal";
import RejectClaimModal from "../components/modals/RejectClaimModal";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface ClaimResponse {
  description?: string | null;
  responseDate?: string | null;
  user_id?: number | null;
  claim_id?: number | null;
  responsibleSector_id?: number | null;
}

interface User {
  id?: number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}

interface ClaimItem {
  claim: {
    id?: number;
    title: string;
    description: string;
    priority?: string | null;
    category?: string | null;
    archive?: string | null;
    user_id?: number | null;
    createdAt?: string | null;
  };
  user?: User | null;
  claimResponse?: ClaimResponse | null;
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

  const fileTypeFromPath = (path?: string) => {
    if (!path) return "";
    const parts = path.split(".");
    return parts.length > 1 ? parts.pop()?.toLowerCase() ?? "" : "";
  };

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

              const userFullName =
                c.user?.firstName || c.user?.lastName
                  ? `${c.user?.firstName ?? ""} ${c.user?.lastName ?? ""}`.trim()
                  : `Usuario ${c.claim.user_id ?? ""}`;

              const createdAtFormatted = c.claim.createdAt
                ? new Date(c.claim.createdAt).toLocaleString()
                : "-";

           const adminResponseText = c.claimResponse?.description?.trim() ?? "";
          const adminResponseDate = c.claimResponse?.responseDate?? undefined;

              const files = c.claim.archive
                ? [
                    {
                      url: `${API_BASE}${c.claim.archive}`,
                      type: fileTypeFromPath(c.claim.archive),
                    },
                  ]
                : [];

     

              const actions = [
                {
                  label: "Aceptar",
                  variant: "contained" as const,
                  color: "primary" as const,
                  onClick: () => setOpenAcceptId(id),
                },
                {
                  label: "Rechazar",
                  variant: "outlined" as const,
                  color: "error" as const,
                  onClick: () => setOpenRejectId(id),
                },
              ];

              return (
                <Box key={id}>
                  <InfoCard
                    title={c.claim.title}
                    description={c.claim.description}
                    chips={
                      [
                        c.claim.priority ? { label: c.claim.priority.toUpperCase(), color: "warning" } : { label: "Sin prioridad" },
                        c.claim.category ? { label: c.claim.category, color: "info" } : { label: "Sin categoría" },
                      ] as any
                    }
                    fields={[
                      { label: userFullName, value: "", icon: <PersonOutlineIcon sx={{fontSize:25}}/> },
                      { label: createdAtFormatted, value: "", icon: <CalendarTodayIcon sx={{fontSize:20}}/> },
                    ]}
                    
                    {...(files.length > 0 ? { files } : {})}
                    actions={actions}
                    sx={{ mb: 1 }}
                    {...(adminResponseText ? { adminResponse: { title: "Respuesta de la Administración", text: adminResponseText, date: adminResponseDate } } : {})}
                  />

                  <AcceptClaimModal
                    open={openAcceptId === id}
                    onClose={() => setOpenAcceptId(null)}
                    claimId={id}
                    claimTitle={c.claim.title}
                    claimantName={userFullName}
                    userId={Number(localStorage.getItem("userId") ?? 0)}
                    responsibleSectors={[
                      { id: 1, name: "Mantenimiento" },
                      { id: 2, name: "Administración" },
                    ]}
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
                    claimantName={userFullName}
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
