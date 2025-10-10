import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Card,
  CardContent,
  Stack,
  Avatar,
  IconButton,
  Paper,
  Dialog,
  DialogContent
} from '@mui/material';
import {
  Add as AddIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  AttachFile as AttachFileIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { Layout } from '../components/layout';
import NewClaim from '../popups/NewClaim';

// Tipos para los datos
interface Reclamo {
  id: string;
  titulo: string;
  descripcion: string;
  estado: 'nuevo' | 'en-proceso' | 'resuelto' | 'cerrado';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  categoria: string;
  autor: string;
  fechaCreacion: string;
  archivos?: { nombre: string; tipo: string; size: string }[];
  respuestaAdmin?: string;
}

// Datos de ejemplo
const reclamosMock: Reclamo[] = [
  {
    id: '1',
    titulo: 'Gotera en el pasillo del 3er piso',
    descripcion: 'Hay una gotera constante en el pasillo que está causando humedad y podría ser peligroso.',
    estado: 'en-proceso',
    prioridad: 'alta',
    categoria: 'Mantenimiento',
    autor: 'María González',
    fechaCreacion: '16 Nov 2024',
    archivos: [
      { nombre: 'gotera_pasillo.jpg', tipo: 'imagen', size: '2.5 MB' },
      { nombre: 'humedad_detalle.jpg', tipo: 'imagen', size: '1.8 MB' }
    ],
    respuestaAdmin: 'Hemos contactado al plomero y programamos la revisión para el viernes.'
  },
  {
    id: '2',
    titulo: 'Ruidos molestos en horarios nocturnos',
    descripcion: 'Los vecinos del 2B realizan ruidos excesivos después de las 22hs, violando el reglamento.',
    estado: 'nuevo',
    prioridad: 'media',
    categoria: 'Convivencia',
    autor: 'Carlos Rodríguez',
    fechaCreacion: '17 Nov 2024'
  },
  {
    id: '3',
    titulo: 'Luz quemada en el ascensor',
    descripcion: 'La luz del ascensor principal está quemada desde hace una semana.',
    estado: 'resuelto',
    prioridad: 'media',
    categoria: 'Electricidad',
    autor: 'Ana Martínez',
    fechaCreacion: '15 Nov 2024',
    respuestaAdmin: 'Se reemplazó la lámpara LED. El mantenimiento está solucionado.'
  },
  {
    id: '4',
    titulo: 'Problemas con la presión del agua',
    descripcion: 'La presión del agua en los últimos pisos es muy baja, especialmente por las mañanas.',
    estado: 'en-proceso',
    prioridad: 'alta',
    categoria: 'Plomería',
    autor: 'Luis González',
    fechaCreacion: '18 Nov 2024',
    respuestaAdmin: 'Estamos evaluando la instalación de un sistema de presurización.'
  },
  {
    id: '5',
    titulo: 'Basura acumulada en el patio',
    descripcion: 'Hay basura acumulada en el patio trasero que no se retiró en la última recolección.',
    estado: 'cerrado',
    prioridad: 'media',
    categoria: 'Limpieza',
    autor: 'Roberto Silva',
    fechaCreacion: '8 Nov 2024',
    respuestaAdmin: 'Se removió la basura acumulada, problema resuelto.'
  }
];

const ReclamosPage: React.FC = () => {
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>('todas');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  
const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);


  // Configuración de filtros con colores específicos
  const estadosConfig = [
    { key: 'todos', label: 'Todos', count: 5, color: 'default' as const, textColor: '#666666' },
    { key: 'nuevo', label: 'Nuevos', count: 1, color: 'info' as const, textColor: '#2196f3' },
    { key: 'en-proceso', label: 'En Proceso', count: 2, color: 'warning' as const, textColor: '#ff9800' },
    { key: 'resuelto', label: 'Resueltos', count: 1, color: 'success' as const, textColor: '#4caf50' },
    { key: 'cerrado', label: 'Cerrados', count: 1, color: 'default' as const, textColor: '#666666' }
  ];

  const prioridadesConfig = [
    { key: 'todas', label: 'Todas', count: 5, color: 'default' as const, textColor: '#666666' },
    { key: 'baja', label: 'Baja', count: 0, color: 'success' as const, textColor: '#4caf50' },
    { key: 'media', label: 'Media', count: 3, color: 'info' as const, textColor: '#ff9800' },
    { key: 'alta', label: 'Alta', count: 2, color: 'warning' as const, textColor: '#f44336' },
    { key: 'urgente', label: 'Urgente', count: 0, color: 'error' as const, textColor: '#d32f2f' }
  ];

  const categoriasConfig = [
    { key: 'todas', label: 'Todas', count: 5, textColor: '#666666' },
    { key: 'mantenimiento', label: 'Mantenimiento', count: 1, textColor: '#f97316' },
    { key: 'plomeria', label: 'Plomería', count: 1, textColor: '#f97316' },
    { key: 'electricidad', label: 'Electricidad', count: 1, textColor: '#f97316' },
    { key: 'limpieza', label: 'Limpieza', count: 1, textColor: '#f97316' },
    { key: 'seguridad', label: 'Seguridad', count: 0, textColor: '#f97316' },
    { key: 'convivencia', label: 'Convivencia', count: 1, textColor: '#f97316' },
    { key: 'administracion', label: 'Administración', count: 0, textColor: '#f97316' },
    { key: 'otros', label: 'Otros', count: 0, textColor: '#f97316' }
  ];

  // Funciones para obtener iconos y colores
  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'nuevo': return <ScheduleIcon fontSize="small" />;
      case 'en-proceso': return <WarningIcon fontSize="small" />;
      case 'resuelto': return <CheckCircleIcon fontSize="small" />;
      case 'cerrado': return <CheckCircleIcon fontSize="small" />;
      default: return <ScheduleIcon fontSize="small" />;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'nuevo': return 'info';
      case 'en-proceso': return 'warning';
      case 'resuelto': return 'success';
      case 'cerrado': return 'default';
      default: return 'default';
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'baja': return 'success';
      case 'media': return 'info';
      case 'alta': return 'warning';
      case 'urgente': return 'error';
      default: return 'default';
    }
  };

  // Filtrar reclamos
  const reclamosFiltrados = reclamosMock.filter(reclamo => {
    const pasaEstado = filtroEstado === 'todos' || reclamo.estado === filtroEstado;
    const pasaPrioridad = filtroPrioridad === 'todas' || reclamo.prioridad === filtroPrioridad;
    const pasaCategoria = filtroCategoria === 'todas' || 
      reclamo.categoria.toLowerCase() === filtroCategoria.toLowerCase();
    
    return pasaEstado && pasaPrioridad && pasaCategoria;
  });

  return (
    <Layout>
      {/* Contenedor principal con fondo blanco */}
      <Box sx={{ 
          maxWidth: 1400, 
          mx: 'auto',
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}
      >
        {/* Header dentro del contenedor blanco */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          p: 3,
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              width: 24,
              height: 24,
              backgroundColor: '#f97316',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 600
            }}>
              📋
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#333' }}>
              Reclamos y Sugerencias
            </Typography>
          </Box>
        
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpen}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
              backgroundColor: '#f97316',
              '&:hover': {
                backgroundColor: '#ea580c'
              }
            }}
          >
            Nuevo Reclamo
          </Button>

          <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogContent>
              <NewClaim />
            </DialogContent>
          </Dialog>

        </Box>

        {/* Filtros dentro del contenedor blanco */}
        <Box sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* Filtro por Estado */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: '0.9rem', color: '#333' }}>
                Filtrar por Estado
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {estadosConfig.map((estado) => (
                  <Chip
                    key={estado.key}
                    label={`${estado.label} (${estado.count})`}
                    onClick={() => setFiltroEstado(estado.key)}
                    variant={filtroEstado === estado.key ? 'filled' : 'outlined'}
                    size="small"
                    sx={{ 
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      height: 32,
                      backgroundColor: filtroEstado === estado.key ? estado.textColor : 'transparent',
                      color: filtroEstado === estado.key ? 'white' : estado.textColor,
                      borderColor: estado.textColor,
                      '&:hover': {
                        backgroundColor: filtroEstado === estado.key ? estado.textColor : `${estado.textColor}15`,
                      }
                    }}
                  />
                ))}
              </Stack>
            </Box>

            {/* Filtro por Prioridad */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: '0.9rem', color: '#333' }}>
                Filtrar por Prioridad
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {prioridadesConfig.map((prioridad) => (
                  <Chip
                    key={prioridad.key}
                    label={`${prioridad.label} (${prioridad.count})`}
                    onClick={() => setFiltroPrioridad(prioridad.key)}
                    variant={filtroPrioridad === prioridad.key ? 'filled' : 'outlined'}
                    size="small"
                    sx={{ 
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      height: 32,
                      backgroundColor: filtroPrioridad === prioridad.key ? prioridad.textColor : 'transparent',
                      color: filtroPrioridad === prioridad.key ? 'white' : prioridad.textColor,
                      borderColor: prioridad.textColor,
                      '&:hover': {
                        backgroundColor: filtroPrioridad === prioridad.key ? prioridad.textColor : `${prioridad.textColor}15`,
                      }
                    }}
                  />
                ))}
              </Stack>
            </Box>

            {/* Filtro por Categoría */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: '0.9rem', color: '#333' }}>
                Filtrar por Categoría
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {categoriasConfig.map((categoria) => (
                  <Chip
                    key={categoria.key}
                    label={`${categoria.label} (${categoria.count})`}
                    onClick={() => setFiltroCategoria(categoria.key)}
                    variant={filtroCategoria === categoria.key ? 'filled' : 'outlined'}
                    size="small"
                    sx={{ 
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      height: 32,
                      backgroundColor: filtroCategoria === categoria.key ? categoria.textColor : 'transparent',
                      color: filtroCategoria === categoria.key ? 'white' : categoria.textColor,
                      borderColor: categoria.textColor,
                      '&:hover': {
                        backgroundColor: filtroCategoria === categoria.key ? categoria.textColor : `${categoria.textColor}15`,
                      }
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* Lista de Reclamos */}
        <Box sx={{ p: 3, pt: 0 }}>
          <Stack spacing={2}>
            {reclamosFiltrados.map((reclamo) => (
              <Card 
                key={reclamo.id} 
                sx={{ 
                  '&:hover': { 
                    boxShadow: (theme) => theme.shadows[4],
                    transform: 'translateY(-1px)',
                    transition: 'all 0.2s ease-in-out'
                  },
                  border: '1px solid #f0f0f0'
                }}
              >
                <CardContent sx={{ p: 2.5 }}> {/* Reducido padding */}
                {/* Header del reclamo */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 1.5 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                      {getEstadoIcon(reclamo.estado)}
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                        {reclamo.titulo}
                      </Typography>
                    </Box>
                    
                    <Stack direction="row" spacing={0.8} sx={{ mb: 1.5 }}>
                      <Chip
                        label={reclamo.estado.replace('-', ' ').toUpperCase()}
                        color={getEstadoColor(reclamo.estado) as any}
                        size="small"
                        variant="filled"
                        sx={{ fontSize: '0.7rem', height: 24 }}
                      />
                      <Chip
                        label={reclamo.prioridad.toUpperCase()}
                        color={getPrioridadColor(reclamo.prioridad) as any}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 24 }}
                      />
                      <Chip
                        label={reclamo.categoria}
                        color="default"
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 24 }}
                      />
                    </Stack>
                  </Box>
                </Box>

                {/* Descripción */}
                <Typography 
                  variant="body2"
                  sx={{ mb: 1.5, color: 'text.secondary', lineHeight: 1.5, fontSize: '0.9rem' }}
                >
                  {reclamo.descripcion}
                </Typography>

                {/* Metadatos */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 20, height: 20, fontSize: '0.65rem' }}>
                      {reclamo.autor.charAt(0)}
                    </Avatar>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      {reclamo.autor}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    📅 Creado: {reclamo.fechaCreacion}
                  </Typography>
                </Box>

                {/* Archivos adjuntos */}
                {reclamo.archivos && reclamo.archivos.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                      📎 Archivos adjuntos ({reclamo.archivos.length})
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      {reclamo.archivos.map((archivo, index) => (
                        <Paper
                          key={index}
                          sx={{
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: 'action.hover' }
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
                )}

                {/* Respuesta de administración */}
                {reclamo.respuestaAdmin && (
                  <Paper
                    sx={{
                      p: 2,
                      backgroundColor: 'action.hover',
                      borderLeft: 4,
                      borderLeftColor: 'primary.main'
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      💬 Respuesta de la Administración:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {reclamo.respuestaAdmin}
                    </Typography>
                  </Paper>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>

        {/* Mensaje si no hay resultados */}
        {reclamosFiltrados.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center', border: '1px solid #f0f0f0' }}>
            <ErrorIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No se encontraron reclamos con los filtros aplicados
            </Typography>
          </Paper>
        )}
                    </Box>

      </Box>
    </Layout>
  );
};

export default ReclamosPage;