import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  // Tooltip,
  // Stack,
  // IconButton,
  // Typography,
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

// Tipos
interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorInitials: string;
  timeAgo: string;
  category: string;
  likes: number;
  dislikes: number;
  replies: number;
  isPinned?: boolean;
  lastActivity: string;
}

interface Forum {
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

const Forums: React.FC = () => {
  const { data: forum, loading, error } = useGet<Forum[]>("/Forum");
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


  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Layout>
      <Box className="foraria-page-container">
        <PageHeader
          title={`Foro - ${currentCategory}`}
          stats={[
            {
              icon: <ChatIcon />,
              title: `Posts en ${currentCategory}`,
              value:1,
              color: "primary",
            },
            {
              icon: <GroupsIcon />,
              title: "Participantes Activos",
              value: 1,
              color: "success",
            },
            {
              icon: <TrendingIcon />,
              title: "Total Respuestas",
              value: 1,
              color: "secondary",
            },
            {
              icon: <PinIcon />,
              title: "Posts Fijados",
              value: 1,
              color: "warning",
            },
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
    {
      label: "Comentar",
      // icon: <OpenInNewIcon />,
      onClick: () => console.log("Abrir comentarios"),
      variant: "outlined",
    },
    {
      label: "Votar",
      // icon: <DownloadIcon />,
      onClick: () => console.log("Votar propuesta"),
      variant: "contained",
      color: "success",
    },
  ]}

  showDivider
/>


       

          {/* Mensaje si no hay posts
          {0 === 0 && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No hay posts en {currentCategory} aún
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                ¡Sé el primero en crear un post en esta categoría!
              </Typography>
            </Box>
          )}
        </Box>

        {/* Modal de nuevo post */}
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogContent>
            <NewPost />
          </DialogContent>
        </Dialog>


      </Box>
    </Layout>
  );
};

export default Forums;
