import React, { useMemo, useState } from "react";
import { Box, Typography, Stack, Paper, Dialog, DialogContent } from "@mui/material";
import PageHeader from "../../components/SectionHeader";
import InfoCard from "../../components/InfoCard";
import { useGet } from "../../hooks/useGet";
import AcceptClaimModal from "../../components/modals/AcceptClaimModal";
import RejectClaimModal from "../../components/modals/RejectClaimModal";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { storage } from "../../utils/storage";
import { Role } from "../../constants/roles";

interface ClaimResponse {
  description?: string | null;
  responseDate?: string | null;
  user_id: number;
  claim_id: number;
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
    state?: string | null;
  };
  user?: User | null;
  claimResponse?: ClaimResponse | null;
}

type TabKey = "todas" | "enproceso" | "resuelto" | "cerrado" | "rechazado";

const AdminClaims: React.FC = () => {
  const { data: claimData, loading, error, refetch } = useGet<ClaimItem[]>("/Claim");

  const [tab, setTab] = useState<TabKey>("todas");
  const [search, setSearch] = useState<string>("");

  const [openAcceptId, setOpenAcceptId] = useState<number | null>(null);
  const [openRejectId, setOpenRejectId] = useState<number | null>(null);

  const API_BASE = process.env.REACT_APP_API_URL || "https://localhost:7245";

  // Aunque la ruta ya está protegida con RequireRoles, mantenemos el guardado por rol aquí.
  const userRole = storage.role ?? "";
  const canManageClaims = [Role.ADMIN, Role.CONSORCIO].includes(userRole as Role);

  const safeClaimData = useMemo(() => claimData ?? [], [claimData]);

  const filteredAndSorted = useMemo(() => {
    const normalize = (s?: string | null) => (s ?? "").toString().trim().toLowerCase();
    const q = normalize(search);

    const byTab = safeClaimData.filter((c) => {
      const state = normalize(c.claim.state);
      if (tab === "todas") return true;

      if (tab === "enproceso") {
        const inProcess = ["en proceso", "enproceso", "proceso", "in_progress", "inprogress", "processing"];
        return (
          state !== "" &&
          (inProcess.includes(state) ||
            (!["resuelto", "resolved", "cerrado", "closed", "finalizada", "finalizado", "rechazado"].includes(state) &&
              !state.startsWith("rechaz")))
        );
      }
      if (tab === "resuelto") return ["resuelto", "resolved", "resolvido"].includes(state);
      if (tab === "cerrado") return ["cerrado", "closed", "finalizada", "finalizado"].includes(state);
      if (tab === "rechazado") return ["rechazado", "rechazada", "rejected"].includes(state);
      return true;
    });

    const bySearch = q
      ? byTab.filter((c) => {
          const norm = (s?: string | null) => (s ?? "").toString().trim().toLowerCase();
          const title = norm(c.claim.title);
          const description = norm(c.claim.description);
          const priority = norm(c.claim.priority);
          const category = norm(c.claim.category);
          const userName = norm(`${c.user?.firstName ?? ""} ${c.user?.lastName ?? ""}`);
          return (
            title.includes(q) ||
            description.includes(q) ||
            priority.includes(q) ||
            category.includes(q) ||
            userName.includes(q)
          );
        })
      : byTab;

    return [...bySearch].sort((a, b) => {
      const ta = a.claim.createdAt ? new Date(a.claim.createdAt).getTime() : 0;
      const tb = b.claim.createdAt ? new Date(b.claim.createdAt).getTime() : 0;
      return tb - ta;
    });
  }, [safeClaimData, tab, search]);

  if (loading) return <div>Cargando reclamos...</div>;
  if (error) return <div>Error al cargar: {String(error)}</div>;

  const fileTypeFromPath = (path?: string) => {
    if (!path) return "";
    const parts = path.split(".");
    return parts.length > 1 ? parts.pop()?.toLowerCase() ?? "" : "";
  };

  const normalize = (s?: string | null) => (s ?? "").toString().trim().toLowerCase();

  const stateChipFor = (raw?: string | null) => {
    const s = normalize(raw);
    if (!s) return { label: "Nuevo", color: "primary" as const, variant: "filled" as const };
    if (s.startsWith("rechaz")) return { label: raw!, color: "error" as const, variant: "filled" as const };
    if (s.includes("en proceso") || s.includes("proceso") || s.includes("in_progress") || s.includes("processing"))
      return { label: raw!, color: "warning" as const, variant: "filled" as const };
    if (s.includes("resuelto") || s.includes("resolved") || s.includes("acept") || s.includes("aceptado"))
      return { label: raw!, color: "success" as const, variant: "filled" as const };
    return { label: raw!, color: "primary" as const, variant: "filled" as const };
  };

  const priorityChipFor = (raw?: string | null) => {
    const p = normalize(raw);
    if (!p) return { label: "Sin prioridad", color: "default" as const, variant: "outlined" as const };
    if (p.includes("alta")) return { label: raw!, color: "error" as const, variant: "outlined" as const };
    if (p.includes("media") || p.includes("media/alta") || p.includes("mediana"))
      return { label: raw!, color: "warning" as const, variant: "outlined" as const };
    if (p.includes("baja") || p.includes("low")) return { label: raw!, color: "warning" as const, variant: "outlined" as const };
    return { label: raw!, color: "warning" as const, variant: "outlined" as const };
  };

  const categoryChipFor = (raw?: string | null) =>
    !raw ? { label: "Sin categoría", color: "default" as const, variant: "outlined" as const }
         : { label: raw, color: "info" as const, variant: "outlined" as const };

  return (
    <Box className="foraria-page-container">
      <PageHeader
        title="Gestión de Reclamos"
        showSearch
        onSearchChange={(q) => setSearch(q)}
        tabs={[
          { label: "Todos", value: "todas" },
          { label: "En proceso", value: "enproceso" },
          { label: "Resuelto", value: "resuelto" },
          { label: "Cerrado", value: "cerrado" },
          { label: "Rechazado", value: "rechazado" },
        ]}
        selectedTab={tab}
        onTabChange={(v) => setTab(v as TabKey)}
      />

      <Stack spacing={2}>
        {filteredAndSorted.length > 0 ? (
          filteredAndSorted.map((c) => {
            const id = c.claim.id ?? 0;

            const userFullName =
              c.user?.firstName || c.user?.lastName
                ? `${c.user?.firstName ?? ""} ${c.user?.lastName ?? ""}`.trim()
                : `Usuario ${c.claim.user_id ?? ""}`;

            const createdAtFormatted = c.claim.createdAt
              ? new Date(c.claim.createdAt).toLocaleString()
              : "-";

            const adminResponseText = c.claimResponse?.description?.trim() ?? "";
            const adminResponseDate = c.claimResponse?.responseDate ?? undefined;

            const files = c.claim.archive
              ? [{ url: `${API_BASE}${c.claim.archive}`, type: fileTypeFromPath(c.claim.archive) }]
              : [];

            const actions = canManageClaims
                ? [
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
                  ]
                : [];

            const stateChip = stateChipFor(c.claim.state);
            const priorityChip = priorityChipFor(c.claim.priority);
            const categoryChip = categoryChipFor(c.claim.category);
            const chips = [
              { label: stateChip.label, color: stateChip.color, variant: stateChip.variant },
              { label: priorityChip.label, color: priorityChip.color, variant: priorityChip.variant },
              { label: categoryChip.label, color: categoryChip.color, variant: categoryChip.variant },
            ] as any;

            return (
              <Box key={id}>
                  <InfoCard
                    title={c.claim.title}
                    description={c.claim.description}
                    chips={chips}
                    fields={[
                      { label: userFullName, value: "", icon: <PersonOutlineIcon sx={{ fontSize: 25 }} /> },
                      { label: createdAtFormatted, value: "", icon: <CalendarTodayIcon sx={{ fontSize: 20 }} /> },
                    ]}
                    {...(files.length > 0 ? { files } : {})}
                    actions={actions}
                    sx={{ mb: 1 }}
                    {...(adminResponseText
                      ? { adminResponse: { title: "Respuesta de la Administración", text: adminResponseText, date: adminResponseDate } }
                      : {})}
                  />

                <AcceptClaimModal
                  open={openAcceptId === id}
                  onClose={() => setOpenAcceptId(null)}
                  claimId={id}
                  claimTitle={c.claim.title}
                  claimantName={userFullName}
                  userId={Number(localStorage.getItem("userId") ?? 1)}
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

      {/* (Opcional) dialogs globales si querés mostrar texto o formularios adicionales */}
      <Dialog open={false} onClose={() => {}}>
        <DialogContent />
      </Dialog>
    </Box>
  );
};

export default AdminClaims;
