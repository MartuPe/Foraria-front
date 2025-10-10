import React, { useState } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Stack,
  Button,
  Divider,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Smartphone as SmartphoneIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
} from '@mui/icons-material';
import { Layout } from '../components/layout';

const Configuration: React.FC = () => {
  // Estados para los switches de canales
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);

  // Estados para los tipos de notificaciones
  const [reclamosNotifications, setReclamosNotifications] = useState(true);
  const [expensasNotifications, setExpensasNotifications] = useState(true);
  const [reunionesNotifications, setReunionesNotifications] = useState(true);
  const [votacionesNotifications, setVotacionesNotifications] = useState(false);
  const [forosNotifications, setForosNotifications] = useState(true);
  const [mantenimientoNotifications, setMantenimientoNotifications] = useState(true);

  const handleSaveConfiguration = () => {
    console.log('Configuración guardada');
    // Aquí iría la lógica para guardar la configuración
  };

  return (
    <Layout>
      <Box 
        sx={{ 
          maxWidth: 1400, 
          mx: 'auto',
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          p: 3,
          borderBottom: '1px solid #f0f0f0'
        }}>
          <SettingsIcon sx={{ color: '#1976d2', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
            Configuración Personal
          </Typography>
        </Box>

        {/* Contenido */}
        <Box sx={{ p: 3 }}>
          {/* Sección de Notificaciones */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <NotificationsIcon sx={{ color: '#1976d2', fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                Configuración de Notificaciones
              </Typography>
            </Box>

            <Stack spacing={3}>
              {/* Canales de Notificación */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
                  Canales de Notificación
                </Typography>
                
                <Stack direction="row" spacing={4} sx={{ mb: 2 }}>
                  {/* Push Notifications */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SmartphoneIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={pushNotifications}
                          onChange={(e) => setPushNotifications(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Notificaciones Push"
                      sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.9rem' } }}
                    />
                  </Box>

                  {/* Email */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={emailNotifications}
                          onChange={(e) => setEmailNotifications(e.target.checked)}
                          color="success"
                        />
                      }
                      label="Email"
                      sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.9rem' } }}
                    />
                  </Box>

                  {/* SMS */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SmsIcon sx={{ color: '#9c27b0', fontSize: 20 }} />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={smsNotifications}
                          onChange={(e) => setSmsNotifications(e.target.checked)}
                          color="secondary"
                        />
                      }
                      label="SMS"
                      sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.9rem' } }}
                    />
                  </Box>
                </Stack>
              </Box>

              <Divider />

              {/* Tipos de Notificaciones */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
                  Tipos de Notificaciones
                </Typography>

                <Stack spacing={2}>
                  {/* Reclamos y Sugerencias */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Reclamos y Sugerencias
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Nuevos reclamos y actualizaciones
                      </Typography>
                    </Box>
                    <Switch
                      checked={reclamosNotifications}
                      onChange={(e) => setReclamosNotifications(e.target.checked)}
                      color="primary"
                    />
                  </Box>

                  {/* Expensas */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Expensas
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Vencimientos y recordatorios de pago
                      </Typography>
                    </Box>
                    <Switch
                      checked={expensasNotifications}
                      onChange={(e) => setExpensasNotifications(e.target.checked)}
                      color="primary"
                    />
                  </Box>

                  {/* Reuniones */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Reuniones
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Convocatorias y recordatorios
                      </Typography>
                    </Box>
                    <Switch
                      checked={reunionesNotifications}
                      onChange={(e) => setReunionesNotifications(e.target.checked)}
                      color="primary"
                    />
                  </Box>

                  {/* Votaciones */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Votaciones
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Nuevas votaciones disponibles
                      </Typography>
                    </Box>
                    <Switch
                      checked={votacionesNotifications}
                      onChange={(e) => setVotacionesNotifications(e.target.checked)}
                      color="primary"
                    />
                  </Box>

                  {/* Actividad en Foros */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Actividad en Foros
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Nuevos posts y respuestas
                      </Typography>
                    </Box>
                    <Switch
                      checked={forosNotifications}
                      onChange={(e) => setForosNotifications(e.target.checked)}
                      color="primary"
                    />
                  </Box>

                  {/* Mantenimiento */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Mantenimiento
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Trabajos programados y avisos
                      </Typography>
                    </Box>
                    <Switch
                      checked={mantenimientoNotifications}
                      onChange={(e) => setMantenimientoNotifications(e.target.checked)}
                      color="primary"
                    />
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Box>

        {/* Botón Guardar */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          p: 3, 
          borderTop: '1px solid #f0f0f0',
          backgroundColor: '#fafafa'
        }}>
          <Button
            variant="contained"
            onClick={handleSaveConfiguration}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0'
              }
            }}
          >
            Guardar Configuración
          </Button>
        </Box>
      </Box>
    </Layout>
  );
};

export default Configuration;


