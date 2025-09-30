import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack
} from '@mui/material';
import {
  BugReport,
  CheckCircle,
  Schedule,
  PriorityHigh
} from '@mui/icons-material';

export const MaterialUITest = () => {
  return (
    <Box sx={{ padding: 3, backgroundColor: 'background.default', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom>
        🎉 Material-UI configurado con éxito
      </Typography>
      
      <Stack spacing={3}>
        {/* Test de colores */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Colores de Foraria
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" color="primary">
                Primary (#083d77)
              </Button>
              <Button variant="contained" color="secondary">
                Secondary (#ee964b)
              </Button>
              <Button variant="contained" color="warning">
                Warning (#f4d35e)
              </Button>
              <Button variant="contained" color="error">
                Error (#f95738)
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Test de chips para estados */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Estados de Reclamos
            </Typography>
            <Stack direction="row" spacing={2}>
              <Chip 
                icon={<BugReport />} 
                label="Nuevo" 
                color="error" 
              />
              <Chip 
                icon={<Schedule />} 
                label="En Proceso" 
                color="warning" 
              />
              <Chip 
                icon={<CheckCircle />} 
                label="Resuelto" 
                color="primary" 
              />
              <Chip 
                icon={<PriorityHigh />} 
                label="Urgente" 
                color="secondary" 
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Test de tarjeta de reclamo */}
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box flex={1}>
                <Typography variant="h6" gutterBottom>
                  🚰 Gotera en el pasillo del 3er piso
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Hay una gotera constante en el pasillo que está causando humedad...
                </Typography>
                <Stack direction="row" spacing={1} mt={2}>
                  <Chip label="En Proceso" color="warning" size="small" />
                  <Chip label="Alta" color="secondary" size="small" />
                  <Chip label="Mantenimiento" size="small" />
                </Stack>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};
