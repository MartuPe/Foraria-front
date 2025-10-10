import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Avatar,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Chip,
  Paper,
  IconButton,
} from '@mui/material';
import {
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon,
  Warning as WarningIcon,
  CheckCircleOutline as CheckCircleIcon,
  Schedule as ScheduleIcon,
  AttachFile as AttachFileIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { AdminLayout } from '../../components/layout/AdminLayout';

// Usar los mismos tipos que en ReclamosPage
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

// Datos mock ampliados para admin
const reclamosAdminMock: Reclamo[] = [
  {
    id: '1',
    titulo: 'Gotera en el pasillo del 3er piso',
    descripcion: 'Hay una gotera constante en el pasillo que está causando humedad y podría ser peligroso.',
    estado: 'nuevo',
    prioridad: 'alta',
    categoria: 'Mantenimiento',
    autor: 'María González - Depto 3A',
    fechaCreacion: '18 Nov 2024',
    archivos: [
      { nombre: 'gotera_pasillo.jpg', tipo: 'imagen', size: '2.5 MB' }
    ]
  },
  {
    id: '2',
    titulo: 'Ruidos molestos en horarios nocturnos',
    descripcion: 'Los vecinos del 2B realizan ruidos excesivos después de las 22hs, violando el reglamento.',
    estado: 'nuevo',
    prioridad: 'media',
    categoria: 'Convivencia',
    autor: 'Carlos Rodríguez - Depto 2A',
    fechaCreacion: '17 Nov 2024'
  },
  {
    id: '3',
    titulo: 'Luz quemada en el ascensor',
    descripcion: 'La luz del ascensor principal está quemada desde hace una semana.',
    estado: 'en-proceso',
    prioridad: 'media',
    categoria: 'Electricidad',
    autor: 'Ana Martínez - Depto 1B',
    fechaCreacion: '15 Nov 2024',
    respuestaAdmin: 'En proceso de reparación.'
  }
];

const AdminReclaims: React.FC = () => {
  const [estadoFilter, setEstadoFilter] = useState<string>('todos');
  const [prioridadFilter, setPrioridadFilter] = useState<string>('todas');

  const handleAcceptReclaim = (id: string) => {
    console.log(`Aceptar reclamo ${id}`);
    // Aquí iría la lógica para aceptar
  };

  const handleRejectReclaim = (id: string) => {
    console.log(`Rechazar reclamo ${id}`);
    // Aquí iría la lógica para rechazar
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'nuevo': return <ScheduleIcon fontSize="small" />;
      case 'en-proceso': return <WarningIcon fontSize="small" />;
      case 'resuelto': return <CheckCircleIcon fontSize="small" />;
      case 'cerrado': return <CheckCircleIcon fontSize="small" />;
      default: return <ScheduleIcon fontSize="small" />;
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'baja': return '#4caf50';
      case 'media': return '#ff9800';
      case 'alta': return '#f44336';
      case 'urgente': return '#d32f2f';
      default: return '#666666';
    }
  };

  // Filtrar reclamos
  const reclamosFiltrados = reclamosAdminMock.filter(reclamo => {
    const pasaEstado = estadoFilter === 'todos' || reclamo.estado === estadoFilter;
    const pasaPrioridad = prioridadFilter === 'todas' || reclamo.prioridad === prioridadFilter;
    return pasaEstado && pasaPrioridad;
  });

  return (
    <AdminLayout>
      <Box sx={{ 
        maxWidth: 1400, 
        mx: 'auto',
        backgroundColor: 'white',
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          p: 3,
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
            Gestión de Reclamos
          </Typography>

          {/* Stats Cards */}
          <Stack direction="row" spacing={2}>
            <Box sx={{ textAlign: 'center', px: 2 }}>
              <Typography variant="h6" sx={{ color: '#2196f3', fontWeight: 600 }}>3</Typography>
              <Typography variant="caption" color="text.secondary">Reclamos Nuevos</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', px: 2 }}>
              <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 600 }}>1</Typography>
              <Typography variant="caption" color="text.secondary">En Proceso</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', px: 2 }}>
              <Typography variant="h6" sx={{ color: '#f44336', fontWeight: 600 }}>0</Typography>
              <Typography variant="caption" color="text.secondary">Urgentes</Typography>
            </Box>
          </Stack>
        </Box>

        {/* Filtros */}
        <Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0' }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
              Filtros:
            </Typography>
            
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Todos los estados</InputLabel>
              <Select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                label="Todos los estados"
              >
                <MenuItem value="todos">Todos los estados</MenuItem>
                <MenuItem value="nuevo">Nuevos</MenuItem>
                <MenuItem value="en-proceso">En Proceso</MenuItem>
                <MenuItem value="resuelto">Resueltos</MenuItem>
                <MenuItem value="cerrado">Cerrados</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Todas las prioridades</InputLabel>
              <Select
                value={prioridadFilter}
                onChange={(e) => setPrioridadFilter(e.target.value)}
                label="Todas las prioridades"
              >
                <MenuItem value="todas">Todas las prioridades</MenuItem>
                <MenuItem value="baja">Baja</MenuItem>
                <MenuItem value="media">Media</MenuItem>
                <MenuItem value="alta">Alta</MenuItem>
                <MenuItem value="urgente">Urgente</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {/* Lista de Reclamos */}
        <Box sx={{ p: 3 }}>
          <Stack spacing={2}>
            {reclamosFiltrados.map((reclamo) => (
              <Card key={reclamo.id} sx={{ border: '1px solid #f0f0f0' }}>
                <CardContent sx={{ p: 2.5 }}>
                  {/* Header del reclamo */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {getEstadoIcon(reclamo.estado)}
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                          {reclamo.titulo}
                        </Typography>
                        <Chip
                          label={reclamo.estado.replace('-', ' ').toUpperCase()}
                          size="small"
                          variant="filled"
                          sx={{ 
                            fontSize: '0.7rem', 
                            height: 24,
                            backgroundColor: reclamo.estado === 'nuevo' ? '#2196f3' : 
                                           reclamo.estado === 'en-proceso' ? '#ff9800' : '#4caf50',
                            color: 'white'
                          }}
                        />
                        <Chip
                          label={reclamo.prioridad.toUpperCase()}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            fontSize: '0.7rem', 
                            height: 24,
                            borderColor: getPrioridadColor(reclamo.prioridad),
                            color: getPrioridadColor(reclamo.prioridad)
                          }}
                        />
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                        {reclamo.descripcion}
                      </Typography>

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
                          <Stack direction="row" spacing={2}>
                            {reclamo.archivos.map((archivo, index) => (
                              <Paper key={index} sx={{
                                p: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                cursor: 'pointer',
                                '&:hover': { backgroundColor: 'action.hover' }
                              }}>
                                <AttachFileIcon fontSize="small" />
                                <Typography variant="caption">{archivo.nombre}</Typography>
                                <IconButton size="small">
                                  <DownloadIcon fontSize="small" />
                                </IconButton>
                              </Paper>
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Box>

                    {/* Botones de acción */}
                    {reclamo.estado === 'nuevo' && (
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<AcceptIcon />}
                          onClick={() => handleAcceptReclaim(reclamo.id)}
                          sx={{ textTransform: 'none' }}
                        >
                          Aceptar
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<RejectIcon />}
                          onClick={() => handleRejectReclaim(reclamo.id)}
                          sx={{ textTransform: 'none' }}
                        >
                          Rechazar
                        </Button>
                      </Stack>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      </Box>
    </AdminLayout>
  );
};

export default AdminReclaims;
