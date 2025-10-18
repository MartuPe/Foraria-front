import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  ChatBubbleOutline as ChatIcon,
  PushPin as PinIcon,
  Groups as GroupsIcon,
  TrendingUp as TrendingIcon,
} from "@mui/icons-material";
import { Layout } from "../components/layout";
import PageHeader from "../components/SectionHeader";
import NewPost from "../components/modals/NewPost";
import InfoCard from "../components/InfoCard";
import { useLocation } from "react-router-dom";
import { useGet } from "../hooks/useGet";

interface Thread {
  id: number;
  theme: string;
  description: string;
  createdAt: string;
  state: string;
  userId?: number;
  forumId?: number;
}

const Forums: React.FC = () => {
  const { data: postsRaw, loading, error, refetch } = useGet<Thread[]>("https://localhost:7245/api/Thread");
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const currentCategory = useMemo(() => {
    const path = location.pathname;
    if (path.includes("/general")) return "General";
    if (path.includes("/administracion")) return "Administración";
    if (path.includes("/seguridad")) return "Seguridad";
    if (path.includes("/mantenimiento")) return "Mantenimiento";
    if (path.includes("/espacios-comunes")) return "Espacios Comunes";
    if (path.includes("/garage-parking")) return "Garage y Parking";
    return "General";
  }, [location.pathname]);

  const posts = useMemo(() => {
    if (!postsRaw) return [];
    return postsRaw.map((p) => {
      const date = p.createdAt ? new Date(p.createdAt) : null;
      return {
        id: String(p.id),
        title: p.theme ?? "Sin título",
        subtitle: `${p.userId} ${p.createdAt} ${p.forumId} `,
        description: p.description ?? "",
        chips: [
          {
            label: p.state ?? "Sin estado",
            color: p.state === "Activo" ? "success" : p.state === "Pendiente" ? "warning" : "default",
          },
        ],
        fields: [
          { label: "Fecha", value: date ? date.toLocaleString("es-AR") : "—" },
          { label: "Foro id", value: String(p.forumId ?? "-") },
        ],
        optionalFields: [{ label: `ID: ${p.id}` }],
        filesCount: 0,
        files: [],
        actions: [
          { label: "Comentar", variant: "outlined", onClick: () => console.log("Comentar", p.id) },
          { label: "Ver", variant: "contained", color: "primary", onClick: () => console.log("Ver", p.id) },
        ],
        extraActions: [],
        showDivider: true,
      } as React.ComponentProps<typeof InfoCard>;
    });
  }, [postsRaw]);

  const stats = useMemo(() => {
    const totalPosts = posts.length;
    const activeUsers = new Set(postsRaw?.map((p) => p.userId).filter(Boolean)).size || 0;
    const totalResponses = 0;
    const pinned = posts.filter((p) => (p as any).isPinned).length;
    return { totalPosts, activeUsers, totalResponses, pinned };
  }, [posts, postsRaw]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Layout>
      <Box className="foraria-page-container" sx={{ px: 2, py: 3 }}>
        <PageHeader
          title={`Foro - ${currentCategory}`}
          stats={[
            { icon: <ChatIcon />, title: `Posts en ${currentCategory}`, value: stats.totalPosts, color: "primary" },
            { icon: <GroupsIcon />, title: "Participantes Activos", value: stats.activeUsers, color: "success" },
            { icon: <TrendingIcon />, title: "Total Respuestas", value: stats.totalResponses, color: "secondary" },
            { icon: <PinIcon />, title: "Posts Fijados", value: stats.pinned, color: "warning" },
          ]}
          actions={
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={handleOpen}
              sx={{ textTransform: "none" }}
            >
              Nuevo Post
            </Button>
          }
        />

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {error && !loading && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" color="error">
              Error cargando posts
            </Typography>
            <Button onClick={() => refetch()} sx={{ mt: 2 }}>
              Reintentar
            </Button>
          </Box>
        )}

        {!loading && !error && posts.length === 0 && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No hay posts en {currentCategory} aún
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              ¡Sé el primero en crear un post en esta categoría!
            </Typography>
          </Box>
        )}

        <Box sx={{ display: "grid", gap: 2, mt: 2 }}>
          <InfoCard
            title="Propuesta: Horarios extendidos para el SUM los fines de semana"
            subtitle="Publicado por Mati González"
            description="Hola vecinos! Quería proponer que se extiendan los horarios del SUM durante los fines de semana hasta las 2AM para eventos familiares. Muchas veces necesitamos más tiempo para celebraciones y el horario actual se queda corto. ¿Qué opinan?"
            chips={[{ label: "Propuesta", color: "info" }]}
            fields={[
              { label: "Fecha", value: "17 de octubre, 2025" },
              { label: "Estado", value: "Pendiente de votación" },
            ]}
            actions={[
              { label: "Comentar", onClick: () => console.log("Abrir comentarios"), variant: "outlined" },
              { label: "Votar", onClick: () => console.log("Votar propuesta"), variant: "contained", color: "success" },
            ]}
            showDivider
          />

          {posts.map((p: any) => (
            <InfoCard
              key={p.id}
              title={p.title}
              subtitle={p.subtitle}
              description={p.description}
              chips={p.chips}
              actions={p.actions}
              extraActions={p.extraActions}
              sx={{}}
              showDivider={p.showDivider}
            />
          ))}
        </Box>

        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogContent>
            <NewPost onClose={handleClose} />
          </DialogContent>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Forums;
