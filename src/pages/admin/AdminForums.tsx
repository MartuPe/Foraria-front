 import * as React from "react";
import {
  Container,
  Stack,
  TextField,
  MenuItem,
  Button,
  Chip,
  Paper,
  Box,
  Tabs,
  Tab,
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
} from "@mui/icons-material";

import SectionHeader from "../../components/SectionHeader";
import StatCard from "../../components/StatCard";
import InfoCard from "../../components/InfoCard";

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
  const [query, setQuery] = React.useState("");
  const [cat, setCat] = React.useState<"Todas" | ForoCategoria>("Todas");
  const [posts, setPosts] = React.useState<Post[]>(mockPosts);

  const filtered = posts.filter((p) => {
    const byCat = cat === "Todas" ? true : p.categoria === cat;
    const byQuery =
      !query ||
      p.titulo.toLowerCase().includes(query.toLowerCase()) ||
      p.cuerpo.toLowerCase().includes(query.toLowerCase());
    return byCat && byQuery;
  });

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

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <SectionHeader title="Gestión de Foros" />

      {/* KPIs (Box + CSS grid) */}
      <Box
        sx={{
          mt: 1,
          mb: 2,
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
        }}
      >
        <StatCard icon={<ForumOutlined />} label="Total de Posts" value={posts.length} />
        <StatCard icon={<PeopleAltOutlined />} label="Participantes Activos" value={9} />
        <StatCard icon={<ChatBubbleOutlineOutlined />} label="Total Respuestas" value={totalRespuestas} />
        <StatCard icon={<BookmarkAddedOutlined />} label="Posts Fijados" value={postsFijados} />
      </Box>

      {/* Barra de acciones */}
      <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between"
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar posts…"
            onChange={(e) => setQuery(e.target.value)}
          />
          <Stack direction="row" spacing={1.5} alignItems="center">
            <TextField
              select
              size="small"
              label="Categoría"
              value={cat}
              onChange={(e) => setCat(e.target.value as any)}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="Todas">Todas</MenuItem>
              {categorias.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
            <Button variant="contained" startIcon={<AddOutlined />} onClick={handleNew}>
              Nuevo Post
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ mt: 2 }}>
          <Tabs
            value={cat}
            onChange={(_, v) => setCat(v)}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                minHeight: 36,
                px: 2,
                mr: 1,
                border: "1px solid",
                borderColor: "divider",
              },
              "& .Mui-selected": {
                bgcolor: "primary.main",
                color: "primary.contrastText !important",
                borderColor: "primary.main",
                boxShadow: "0 2px 8px rgba(8,61,119,0.25)",
              },
              "& .MuiTabs-indicator": { display: "none" },
            }}
          >
            <Tab label="Todas las Categorías" value="Todas" />
            {categorias.map((c) => (
              <Tab key={c} label={c} value={c} />
            ))}
          </Tabs>
        </Box>
      </Paper>

      {/* Lista de posts (Box grid) */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr" }, // a futuro podés hacer 2 col en xl si querés
        }}
      >
        {filtered.map((p) => (
          <InfoCard
            key={p.id}
            title={p.titulo}
            subtitle={`${p.autor} · Última actividad: ${p.ultimaActividad}`}
            description={p.cuerpo}
            chips={[
              { label: p.categoria },
              ...(p.fijado ? [{ label: "Fijado", color: "warning" as const }] : []),
            ]}
            fields={[
              { label: "Likes:", value: p.likes },
              { label: "Dislikes:", value: p.dislikes },
              { label: "Respuestas:", value: p.respuestas },
            ]}
            actions={[
              { label: "Ver", icon: <VisibilityOutlined />, color: "secondary", onClick: () => handleView(p.id) },
              { label: p.fijado ? "Desfijar" : "Fijar", icon: p.fijado ? <PushPin /> : <PushPinOutlined />, variant: "outlined", onClick: () => togglePin(p.id) },
              { label: "Editar", icon: <EditOutlined />, variant: "outlined", onClick: () => handleEdit(p.id) },
              { label: "Eliminar", icon: <DeleteOutline />, color: "error", variant: "outlined", onClick: () => handleDelete(p.id) },
            ]}
            showDivider
          />
        ))}
      </Box>
    </Container>
  );
}
