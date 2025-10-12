import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Card,
  CardContent,
  Stack,
  IconButton,
  Paper,
  Dialog,
  DialogContent,
} from "@mui/material";
import PageHeader from "../components/SectionHeader";
import NewClaim from "../popups/NewClaim";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DownloadIcon from "@mui/icons-material/Download";
import ErrorIcon from "@mui/icons-material/Error";
import { Layout } from "../components/layout";

interface Reclamo {
  id: string;
  titulo: string;
  descripcion: string;
  estado: "nuevo" | "en-proceso" | "resuelto" | "cerrado";
  prioridad: "baja" | "media" | "alta" | "urgente";
  categoria: string;
  autor: string;
  fechaCreacion: string;
  archivos?: { nombre: string; tipo: string; size: string }[];
  respuestaAdmin?: string;
}

// Mock (restaurado)
const reclamosMock: Reclamo[] = [
  {
    id: "1",
    titulo: "Gotera en el pasillo del 3er piso",
    descripcion:
      "Hay una gotera constante en el pasillo que está causando humedad y podría ser peligroso.",
    estado: "en-proceso",
    prioridad: "alta",
    categoria: "Mantenimiento",
    autor: "María González",
    fechaCreacion: "16 Nov 2024",
    archivos: [
      { nombre: "gotera_pasillo.jpg", tipo: "imagen", size: "2.5 MB" },
      { nombre: "humedad_detalle.jpg", tipo: "imagen", size: "1.8 MB" },
    ],
    respuestaAdmin:
      "Hemos contactado al plomero y programamos la revisión para el viernes.",
  },
  {
    id: "2",
    titulo: "Ruidos molestos en horarios nocturnos",
    descripcion:
      "Los vecinos del 2B realizan ruidos excesivos después de las 22hs, violando el reglamento.",
    estado: "nuevo",
    prioridad: "media",
    categoria: "Convivencia",
    autor: "Carlos Rodríguez",
    fechaCreacion: "17 Nov 2024",
  },
  {
    id: "3",
    titulo: "Luz quemada en el ascensor",
    descripcion:
      "La luz del ascensor principal está quemada desde hace una semana.",
    estado: "resuelto",
    prioridad: "media",
    categoria: "Electricidad",
    autor: "Ana Martínez",
    fechaCreacion: "15 Nov 2024",
    respuestaAdmin:
      "Se reemplazó la lámpara LED. El mantenimiento está solucionado.",
  },
  {
    id: "4",
    titulo: "Problemas con la presión del agua",
    descripcion:
      "La presión del agua en los últimos pisos es muy baja, especialmente por las mañanas.",
    estado: "en-proceso",
    prioridad: "alta",
    categoria: "Plomería",
    autor: "Luis González",
    fechaCreacion: "18 Nov 2024",
    respuestaAdmin:
      "Estamos evaluando la instalación de un sistema de presurización.",
  },
  {
    id: "5",
    titulo: "Basura acumulada en el patio",
    descripcion:
      "Hay basura acumulada en el patio trasero que no se retiró en la última recolección.",
    estado: "cerrado",
    prioridad: "media",
    categoria: "Limpieza",
    autor: "Roberto Silva",
    fechaCreacion: "8 Nov 2024",
    respuestaAdmin: "Se removió la basura acumulada, problema resuelto.",
  },
];

const Claims: React.FC = () => {
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>("todas");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const estadosConfig = [
    { key: "todos", label: "Todos", count: 5, textColor: "#666666" },
    { key: "nuevo", label: "Nuevos", count: 1, textColor: "#2196f3" },
    { key: "en-proceso", label: "En Proceso", count: 2, textColor: "#ff9800" },
    { key: "resuelto", label: "Resueltos", count: 1, textColor: "#4caf50" },
    { key: "cerrado", label: "Cerrados", count: 1, textColor: "#f44336" },
  ];

  const prioridadesConfig = [
    { key: "todas", label: "Todas", count: 5, textColor: "#666666" },
    { key: "baja", label: "Baja", count: 0, textColor: "#2196f3" },
    { key: "media", label: "Media", count: 3, textColor: "#ff9800" },
    { key: "alta", label: "Alta", count: 2, textColor: "#4caf50" },
    { key: "urgente", label: "Urgente", count: 0, textColor: "#f44336" },
  ];

  const categoriasConfig = [
    { key: "todas", label: "Todas", count: 5, textColor: "#666666" },
    { key: "mantenimiento", label: "Mantenimiento", count: 1, textColor: "#2196f3" },
    { key: "plomeria", label: "Plomería", count: 1, textColor: "#ff9800" },
    { key: "electricidad", label: "Electricidad", count: 1, textColor: "#4caf50" },
    { key: "limpieza", label: "Limpieza", count: 1, textColor: "#f44336" },
    { key: "seguridad", label: "Seguridad", count: 0, textColor: "#f97316" },
    { key: "convivencia", label: "Convivencia", count: 1, textColor: "#d32f2f" },
    { key: "administracion", label: "Administración", count: 0, textColor: "#c416f9ff" },
    { key: "otros", label: "Otros", count: 0, textColor: "#c80f62ff" },
  ];

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "nuevo": return "info";
      case "en-proceso": return "warning";
      case "resuelto": return "success";
      case "cerrado": return "default";
      default: return "default";
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case "baja": return "success";
      case "media": return "info";
      case "alta": return "warning";
      case "urgente": return "error";
      default: return "default";
    }
  };

  const reclamosFiltrados = reclamosMock.filter((r) => {
    const pasaEstado = filtroEstado === "todos" || r.estado === filtroEstado;
    const pasaPrioridad = filtroPrioridad === "todas" || r.prioridad === filtroPrioridad;
    const pasaCategoria =
      filtroCategoria === "todas" ||
      r.categoria.toLowerCase() === filtroCategoria.toLowerCase();
    return pasaEstado && pasaPrioridad && pasaCategoria;
  });

  return (
    <Layout>
      <Box className="foraria-page-container">
        <PageHeader
          title="Reclamos y Sugerencias"
          actions={
            <Button variant="contained" color="secondary" onClick={handleOpen}>
              + Nuevo Reclamo
            </Button>
          }
        />

        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogContent>
            <NewClaim />
          </DialogContent>
        </Dialog>

        <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Filtrar por Estado
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {estadosConfig.map((e) => (
                  <Chip
                    key={e.key}
                    label={`${e.label} (${e.count})`}
                    onClick={() => setFiltroEstado(e.key)}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "0.78rem",
                      height: 32,
                      borderRadius: "999px",
                      borderColor: e.textColor,
                      color: filtroEstado === e.key ? "#fff" : e.textColor,
                      bgcolor: filtroEstado === e.key ? e.textColor : "transparent",
                      "&:hover": {
                        bgcolor: filtroEstado === e.key ? e.textColor : `${e.textColor}15`,
                      },
                    }}
                    variant={filtroEstado === e.key ? "filled" : "outlined"}
                  />
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Filtrar por Prioridad
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {prioridadesConfig.map((p) => (
                  <Chip
                    key={p.key}
                    label={`${p.label} (${p.count})`}
                    onClick={() => setFiltroPrioridad(p.key)}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "0.78rem",
                      height: 32,
                      borderRadius: "999px",
                      borderColor: p.textColor,
                      color: filtroPrioridad === p.key ? "#fff" : p.textColor,
                      bgcolor: filtroPrioridad === p.key ? p.textColor : "transparent",
                      "&:hover": {
                        bgcolor: filtroPrioridad === p.key ? p.textColor : `${p.textColor}15`,
                      },
                    }}
                    variant={filtroPrioridad === p.key ? "filled" : "outlined"}
                  />
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Filtrar por Categoría
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {categoriasConfig.map((c) => (
                  <Chip
                    key={c.key}
                    label={`${c.label} (${c.count})`}
                    onClick={() => setFiltroCategoria(c.key)}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "0.78rem",
                      height: 32,
                      borderRadius: "999px",
                      borderColor: c.textColor,
                      color: filtroCategoria === c.key ? "#fff" : c.textColor,
                      bgcolor: filtroCategoria === c.key ? c.textColor : "transparent",
                      "&:hover": {
                        bgcolor: filtroCategoria === c.key ? c.textColor : `${c.textColor}15`,
                      },
                    }}
                    variant={filtroCategoria === c.key ? "filled" : "outlined"}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        </Paper>

        <Stack spacing={2}>
          {reclamosFiltrados.map((reclamo) => (
            <Card
              key={reclamo.id}
              sx={{
                "&:hover": {
                  boxShadow: 4,
                  transform: "translateY(-1px)",
                  transition: "all 0.2s ease-in-out",
                },
                border: "1px solid #f0f0f0",
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 1.5 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
                      {reclamo.titulo}
                    </Typography>
                    <Stack direction="row" spacing={0.8} sx={{ mb: 1.5 }}>
                      <Chip
                        label={reclamo.estado.replace("-", " ").toUpperCase()}
                        color={getEstadoColor(reclamo.estado) as any}
                        size="small"
                        variant="filled"
                        sx={{ fontSize: "0.7rem", height: 24 }}
                      />
                      <Chip
                        label={reclamo.prioridad.toUpperCase()}
                        color={getPrioridadColor(reclamo.prioridad) as any}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: "0.7rem", height: 24 }}
                      />
                      <Chip
                        label={reclamo.categoria}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: "0.7rem", height: 24 }}
                      />
                    </Stack>
                  </Box>
                </Box>

                <Typography variant="body2" sx={{ mb: 1.5, color: "text.secondary" }}>
                  {reclamo.descripcion}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                    {reclamo.autor}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                    Creado: {reclamo.fechaCreacion}
                  </Typography>
                </Box>

                {reclamo.archivos?.length ? (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                      📎 Archivos adjuntos ({reclamo.archivos.length})
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      {reclamo.archivos.map((archivo, i) => (
                        <Paper
                          key={i}
                          sx={{
                            p: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            cursor: "pointer",
                            "&:hover": { backgroundColor: "action.hover" },
                          }}
                        >
                          <AttachFileIcon fontSize="small" />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {archivo.nombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {archivo.size}
                            </Typography>
                          </Box>
                          <IconButton size="small">
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                ) : null}

                {/* Respuesta admin */}
                {reclamo.respuestaAdmin && (
                  <Paper
                    sx={{
                      p: 2,
                      backgroundColor: "action.hover",
                      borderLeft: 4,
                      borderLeftColor: "primary.main",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Respuesta de la Administración:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {reclamo.respuestaAdmin}
                    </Typography>
                  </Paper>
                )}
              </CardContent>
            </Card>
          ))}

          {reclamosFiltrados.length === 0 && (
            <Paper sx={{ p: 4, textAlign: "center", border: "1px solid #f0f0f0", borderRadius: 3 }}>
              <ErrorIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No se encontraron reclamos con los filtros aplicados
              </Typography>
            </Paper>
          )}
        </Stack>
      </Box>
    </Layout>
  );
};

export default Claims;
