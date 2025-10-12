import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Stack,
  TextField,
  MenuItem,
  Button,
  Paper,
  Box,
  Tabs,
  Tab,
  Chip,
  Card,
  CardContent,
  Typography,
  IconButton,
} from "@mui/material";
import {
  AddOutlined,
  PushPinOutlined,
  PushPin,
  EditOutlined,
  DeleteOutline,
  VisibilityOutlined,
  ForumOutlined,
  PeopleAltOutlined,
  ChatBubbleOutlineOutlined,
  BookmarkAddedOutlined,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import PageHeader from "../../components/SectionHeader";

type ForoCategoria =
  | "General"
  | "Administración"
  | "Seguridad"
  | "Mantenimiento"
  | "Espacios Comunes"
  | "Garage y Parking";

type Post = {
  id: string;
  titulo: string;
  autor: string;
  rolAutor: string;
  categoria: ForoCategoria;
  cuerpo: string;
  likes: number;
  dislikes: number;
  respuestas: number;
  ultimaActividad: string;
  fijado: boolean;
};

const mockPosts: Post[] = [
  {
    id: "1",
    titulo: "🎉 Inauguración de la nueva pileta renovada",
    autor: "Carlos Administrador",
    rolAutor: "Admin",
    categoria: "Espacios Comunes",
    cuerpo:
      "La renovación de la pileta fue completada con éxito. El sistema de filtrado ya está activo…",
    likes: 24,
    dislikes: 1,
    respuestas: 8,
    ultimaActividad: "hace 30 min",
    fijado: true,
  },
  {
    id: "2",
    titulo: "🛡️ Nuevas medidas de seguridad en el edificio",
    autor: "Guardia de Seguridad",
    rolAutor: "Seguridad",
    categoria: "Seguridad",
    cuerpo:
      "Se incorporan cámaras adicionales en el garage e intercomunicadores mejorados…",
    likes: 18,
    dislikes: 2,
    respuestas: 5,
    ultimaActividad: "hace 1 h",
    fijado: false,
  },
];

const categorias: ForoCategoria[] = [
  "General",
  "Administración",
  "Seguridad",
  "Mantenimiento",
  "Espacios Comunes",
  "Garage y Parking",
];

export default function AdminForums() {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [searchParams, setSearchParams] = useSearchParams();

  // Obtener categoría desde URL params
  const [cat, setCat] = useState<"Todas" | ForoCategoria>("Todas");

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category') as "Todas" | ForoCategoria;
    if (categoryFromUrl && (categoryFromUrl === "Todas" || categorias.includes(categoryFromUrl as ForoCategoria))) {
      setCat(categoryFromUrl);
    }
  }, [searchParams]);

  // Actualizar URL cuando cambie la categoría
  const handleCategoryChange = (newCategory: "Todas" | ForoCategoria) => {
    setCat(newCategory);
    setSearchParams({ category: newCategory });
  };

  const togglePin = (id: string) =>
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, fijado: !p.fijado } : p))
    );
  const handleEdit = (id: string) => alert(`Editar post ${id}`);
  const handleDelete = (id: string) =>
    setPosts((prev) => prev.filter((p) => p.id !== id));
  const handleView = (id: string) => alert(`Ver post ${id}`);
  const handleNew = () => alert("Nuevo Post (abrir popup NewPost)");

  const totalRespuestas = posts.reduce((a, p) => a + p.respuestas, 0);
  const postsFijados = posts.filter((p) => p.fijado).length;

  const filtered = posts.filter((p) => {
    const byCat = cat === "Todas" ? true : p.categoria === cat;
    const byQuery =
      !query ||
      p.titulo.toLowerCase().includes(query.toLowerCase()) ||
      p.cuerpo.toLowerCase().includes(query.toLowerCase());
    return byCat && byQuery;
  });

  // Configuración de colores para tabs (igual que Documents.tsx)
  const tabColors: Record<string, string> = {
    Todas: "#666666",
    General: "#1e88e5",
    Administración: "#42a5f5",
    Seguridad: "#ef5350",
    Mantenimiento: "#ff9800",
    "Espacios Comunes": "#26a69a",
    "Garage y Parking": "#7e57c2",
  };

  return (
    <div className="page">
      <PageHeader
        title="Gestión de Foros"
        actions={
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddOutlined />}
            onClick={handleNew}
            size="small"
          >
            Nuevo Post
          </Button>
        }
      />

      {/* KPIs compactas */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Card variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
          <CardContent sx={{ p: 2, textAlign: "center" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <ForumOutlined sx={{ color: "primary.main", fontSize: 20 }} />
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "primary.main" }}
              >
                {posts.length}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Total Posts
            </Typography>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
          <CardContent sx={{ p: 2, textAlign: "center" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <PeopleAltOutlined sx={{ color: "success.main", fontSize: 20 }} />
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "success.main" }}
              >
                9
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Participantes
            </Typography>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
          <CardContent sx={{ p: 2, textAlign: "center" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <ChatBubbleOutlineOutlined sx={{ color: "secondary.main", fontSize: 20 }} />
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "secondary.main" }}
              >
                {totalRespuestas}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Respuestas
            </Typography>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
          <CardContent sx={{ p: 2, textAlign: "center" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <BookmarkAddedOutlined sx={{ color: "warning.main", fontSize: 20 }} />
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "warning.main" }}
              >
                {postsFijados}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Fijados
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Filtros normalizados */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{ p: 2, borderRadius: 2, mb: 2 }}
      >
        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
          <FilterListIcon color="primary" sx={{ fontSize: 20 }} />
          <Typography
            variant="subtitle1"
            color="primary"
            sx={{ fontWeight: 600 }}
          >
            Filtros
          </Typography>
        </Stack>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar posts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <TextField
            select
            size="small"
            label="Categoría"
            value={cat}
            onChange={(e) => handleCategoryChange(e.target.value as any)}
            sx={{ minWidth: { xs: "100%", md: 220 } }}
          >
            <MenuItem value="Todas">Todas</MenuItem>
            {categorias.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      {/* Tabs normalizadas con colores (igual que Documents.tsx) */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{ p: 2, borderRadius: 2, mb: 2 }}
      >
        <Tabs
          value={cat}
          onChange={(_, v) => handleCategoryChange(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              minHeight: 36,
              px: 2,
              mr: 1,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              color: "text.primary",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            },
            "& .Mui-selected": {
              color: "white !important", // TEXTO BLANCO para contraste
              backgroundColor:
                (theme) => tabColors[cat] || theme.palette.primary.main,
              borderColor:
                (theme) => tabColors[cat] || theme.palette.primary.main,
              boxShadow: "0 2px 8px rgba(8,61,119,0.25)",
            },
            "& .MuiTabs-indicator": {
              display: "none", // Sin indicador
            },
          }}
        >
          <Tab label="Todas" value="Todas" />
          {categorias.map((c) => (
            <Tab key={c} label={c} value={c} />
          ))}
        </Tabs>
      </Paper>

      {/* Lista de posts normalizada */}
      <Stack spacing={2}>
        {filtered.map((p) => (
          <Card
            key={p.id}
            variant="outlined"
            sx={{
              borderRadius: 2,
              "&:hover": {
                boxShadow: 2,
                transform: "translateY(-1px)",
                transition: "all 0.2s ease-in-out",
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, fontSize: "1.1rem", mb: 1 }}
                  >
                    {p.titulo}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                    <Chip
                      label={p.categoria}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: "0.7rem", height: 24 }}
                    />
                    <Chip
                      label={p.rolAutor}
                      size="small"
                      variant="filled"
                      color="primary"
                      sx={{ fontSize: "0.7rem", height: 24 }}
                    />
                    {p.fijado && (
                      <Chip
                        label="Fijado"
                        size="small"
                        variant="filled"
                        color="warning"
                        sx={{ fontSize: "0.7rem", height: 24 }}
                      />
                    )}
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1.5, lineHeight: 1.5 }}
                  >
                    {p.cuerpo}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.8rem" }}
                    >
                      👤 {p.autor}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.8rem" }}
                    >
                      🕒 {p.ultimaActividad}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={3} sx={{ fontSize: "0.8rem" }}>
                    <Typography variant="body2" color="text.secondary">
                      👍 {p.likes} likes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      👎 {p.dislikes} dislikes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      💬 {p.respuestas} respuestas
                    </Typography>
                  </Stack>
                </Box>

                {/* Botones de acción */}
                <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleView(p.id)}
                    sx={{ color: "primary.main" }}
                  >
                    <VisibilityOutlined fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => togglePin(p.id)}
                    sx={{ color: "warning.main" }}
                  >
                    {p.fijado ? (
                      <PushPin fontSize="small" />
                    ) : (
                      <PushPinOutlined fontSize="small" />
                    )}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(p.id)}
                    sx={{ color: "info.main" }}
                  >
                    <EditOutlined fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(p.id)}
                    sx={{ color: "error.main" }}
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        ))}

        {/* Mensaje si no hay resultados */}
        {filtered.length === 0 && (
          <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
            <Typography variant="h6" color="text.secondary">
              No se encontraron posts con los filtros aplicados
            </Typography>
          </Paper>
        )}
      </Stack>
    </div>
  );
}
