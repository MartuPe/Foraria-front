import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Avatar,
  IconButton,
  Dialog,
  DialogContent,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  ChatBubbleOutline as ChatIcon,
  PushPin as PinIcon,
  Groups as GroupsIcon,
  TrendingUp as TrendingIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { Layout } from "../components/layout";
import PageHeader from "../components/SectionHeader";
import NewPost from "../popups/NewPost";
import { useLocation } from "react-router-dom";

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

const Forums: React.FC = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Categoría actual desde la URL
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

  // Datos mock por categoría
  const getPostsByCategory = (category: string): ForumPost[] => {
    switch (category) {
      case "General":
        return [
          {
            id: "1",
            title:
              "Propuesta: Horarios extendidos para el SUM los fines de semana",
            content:
              "Hola vecinos! Quería proponer que se extiendan los horarios del SUM durante los fines de semana hasta las 2 AM para eventos familiares...",
            author: "María González",
            authorInitials: "MG",
            timeAgo: "hace 4 horas",
            category: "General",
            likes: 15,
            dislikes: 3,
            replies: 12,
            lastActivity: "hace 1 hora",
          },
          {
            id: "2",
            title: "Intercambio de plantas y semillas 🌱",
            content:
              "Hola! Soy una apasionada de la jardinería y me gustaría organizar un intercambio de plantas y semillas entre vecinos...",
            author: "Ana Martínez",
            authorInitials: "AM",
            timeAgo: "hace 2 días",
            category: "General",
            likes: 18,
            dislikes: 0,
            replies: 15,
            lastActivity: "hace 5 horas",
          },
        ];
      case "Administración":
        return [
          {
            id: "3",
            title: "Propuesta de cambio en el horario de administración",
            content:
              "Me gustaría proponer que se extienda el horario de atención de administración los sábados por la mañana para quienes trabajamos entre semana...",
            author: "Carlos Rodriguez",
            authorInitials: "CR",
            timeAgo: "hace 1 día",
            category: "Administración",
            likes: 8,
            dislikes: 2,
            replies: 6,
            lastActivity: "hace 3 horas",
          },
          {
            id: "4",
            title: "Consulta sobre el presupuesto anual",
            content:
              "¿Cuándo estará disponible el detalle del presupuesto para el próximo año? Me interesa conocer las partidas destinadas a mejoras...",
            author: "Roberto Silva",
            authorInitials: "RS",
            timeAgo: "hace 3 días",
            category: "Administración",
            likes: 12,
            dislikes: 1,
            replies: 9,
            lastActivity: "hace 1 día",
          },
        ];
      case "Seguridad":
        return [
          {
            id: "5",
            title: "Instalación de cámaras en el garage",
            content:
              "Propongo la instalación de cámaras de seguridad en el garage subterráneo. Últimamente han ocurrido varios incidentes...",
            author: "Luis García",
            authorInitials: "LG",
            timeAgo: "hace 6 horas",
            category: "Seguridad",
            likes: 22,
            dislikes: 1,
            replies: 18,
            lastActivity: "hace 2 horas",
          },
          {
            id: "6",
            title: "Mejoras en la iluminación del acceso",
            content:
              "El acceso principal está muy oscuro por las noches. Deberíamos mejorar la iluminación para mayor seguridad de todos...",
            author: "Patricia López",
            authorInitials: "PL",
            timeAgo: "hace 1 día",
            category: "Seguridad",
            likes: 16,
            dislikes: 0,
            replies: 11,
            lastActivity: "hace 4 horas",
          },
        ];
      case "Mantenimiento":
        return [
          {
            id: "7",
            title: "Reparación de la bomba de agua",
            content:
              "La bomba de agua del edificio está haciendo ruidos extraños desde la semana pasada. ¿Alguien más lo ha notado?...",
            author: "Miguel Torres",
            authorInitials: "MT",
            timeAgo: "hace 8 horas",
            category: "Mantenimiento",
            likes: 9,
            dislikes: 0,
            replies: 7,
            lastActivity: "hace 1 hora",
          },
          {
            id: "8",
            title: "Pintura de pasillos - Cronograma",
            content:
              "Se viene la época de pintar los pasillos. ¿Podríamos coordinar para que no interfiera con las actividades diarias?...",
            author: "Sandra Morales",
            authorInitials: "SM",
            timeAgo: "hace 2 días",
            category: "Mantenimiento",
            likes: 14,
            dislikes: 2,
            replies: 13,
            lastActivity: "hace 6 horas",
          },
        ];
      case "Espacios Comunes":
        return [
          {
            id: "9",
            title: "Renovación del mobiliario del SUM",
            content:
              "Las sillas y mesas del SUM están muy deterioradas. Propongo hacer una colecta para renovar el mobiliario...",
            author: "Elena Fernández",
            authorInitials: "EF",
            timeAgo: "hace 5 horas",
            category: "Espacios Comunes",
            likes: 20,
            dislikes: 3,
            replies: 16,
            lastActivity: "hace 30 min",
          },
          {
            id: "10",
            title: "Horarios de la terraza comunitaria",
            content:
              "Me gustaría discutir los horarios de uso de la terraza. Creo que deberíamos extenderlos en verano...",
            author: "Jorge Ruiz",
            authorInitials: "JR",
            timeAgo: "hace 1 día",
            category: "Espacios Comunes",
            likes: 11,
            dislikes: 1,
            replies: 8,
            lastActivity: "hace 3 horas",
          },
        ];
      case "Garage y Parking":
        return [
          {
            id: "11",
            title: "Reorganización de cocheras",
            content:
              "Propongo reorganizar la numeración de las cocheras para optimizar el espacio y evitar confusiones...",
            author: "Fernando Castro",
            authorInitials: "FC",
            timeAgo: "hace 3 horas",
            category: "Garage y Parking",
            likes: 7,
            dislikes: 4,
            replies: 12,
            lastActivity: "hace 1 hora",
          },
          {
            id: "12",
            title: "Bicicletas en el garage",
            content:
              "¿Podríamos habilitar un espacio específico para bicicletas en el garage? Están ocupando lugares de autos...",
            author: "Claudia Vega",
            authorInitials: "CV",
            timeAgo: "hace 2 días",
            category: "Garage y Parking",
            likes: 13,
            dislikes: 2,
            replies: 9,
            lastActivity: "hace 4 horas",
          },
        ];
      default:
        return [];
    }
  };

  const currentPosts = getPostsByCategory(currentCategory);

  const forumStats = {
    totalPosts: currentPosts.length,
    activeParticipants: currentPosts.length,
    totalReplies: currentPosts.reduce((sum, post) => sum + post.replies, 0),
    pinnedPosts: currentPosts.filter((post) => post.isPinned).length,
  };

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
              value: forumStats.totalPosts,
              color: "primary",
            },
            {
              icon: <GroupsIcon />,
              title: "Participantes Activos",
              value: forumStats.activeParticipants,
              color: "success",
            },
            {
              icon: <TrendingIcon />,
              title: "Total Respuestas",
              value: forumStats.totalReplies,
              color: "secondary",
            },
            {
              icon: <PinIcon />,
              title: "Posts Fijados",
              value: forumStats.pinnedPosts,
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

        {/* Lista de posts */}
        <Box sx={{ maxWidth: 1400, mx: "auto" }}>
          <Stack spacing={2}>
            {currentPosts.map((post) => (
              <Card
                key={post.id}
                sx={{
                  "&:hover": {
                    boxShadow: (theme) => theme.shadows[4],
                    transform: "translateY(-1px)",
                    transition: "all 0.2s ease-in-out",
                  },
                  position: "relative",
                }}
              >
                {post.isPinned && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      zIndex: 1,
                    }}
                  >
                    <PinIcon sx={{ color: "warning.main", fontSize: 20 }} />
                  </Box>
                )}

                <CardContent sx={{ p: 3 }}>
                  {/* Header del post */}
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2 }}
                  >
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: "primary.main",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                      }}
                    >
                      {post.authorInitials}
                    </Avatar>

                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          fontSize: "1.1rem",
                          mb: 0.5,
                          color: "text.primary",
                        }}
                      >
                        {post.title}
                      </Typography>

                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {post.author}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          •
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {post.timeAgo}
                        </Typography>
                        <Chip
                          label={post.category}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: "0.7rem",
                            height: 20,
                            ml: 1,
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  {/* Contenido */}
                  <Typography
                    variant="body1"
                    sx={{ mb: 2, lineHeight: 1.6, color: "text.secondary" }}
                  >
                    {post.content}
                  </Typography>

                  {/* Acciones / Meta */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      pt: 1,
                      borderTop: "1px solid",
                      borderTopColor: "divider",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <IconButton size="small" sx={{ color: "success.main" }}>
                          <ThumbUpIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="body2" color="text.secondary">
                          {post.likes}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <IconButton size="small" sx={{ color: "error.main" }}>
                          <ThumbDownIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="body2" color="text.secondary">
                          {post.dislikes}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <ChatIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          {post.replies} respuestas
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <ViewIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "0.8rem" }}
                      >
                        Última actividad: {post.lastActivity}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>

          {/* Mensaje si no hay posts */}
          {currentPosts.length === 0 && (
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
