import { useState } from "react";
import React from "react";
import { Box, Typography, Stack, Paper,Button, Dialog, DialogContent } from "@mui/material";
import PageHeader from "../components/SectionHeader";
import InfoCard from "../components/InfoCard";
import { Layout } from "../components/layout";
import { useGet } from "../hooks/useGet";
import NewClaim from "../popups/NewClaim"

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

const Claims: React.FC = () => {
    const { data: claim, loading, error } = useGet<Claim[]>("/Claim");
    const [tab, setTab] = useState<"todas" | "actives" | "finalizada">("todas");
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);


  if (loading) return <div>Cargando reclamos...</div>;
  if (error) return <div>Error al cargar: {error}</div>;

  return (
    <Layout>
      <Box className="foraria-page-container">
       <PageHeader
          title="Reclamos"
           actions={
            <Button variant="contained" color="secondary" onClick={handleOpen} >
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

        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogContent>
            <NewClaim
               onSuccess={() => {
                 window.location.reload();
               }}
               onCancel={handleClose}
            />
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
              />
            ))
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
