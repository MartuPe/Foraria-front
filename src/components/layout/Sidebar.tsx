import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Avatar,
} from '@mui/material';
import {
  BarChart as DashboardIcon,
  Warning as ReclamosIcon,
  Receipt as ExpensasIcon,
  Assignment as ProcedimientosIcon,
  CalendarToday,
  HowToVote as VotacionesIcon,
  Groups as ReunionesIcon,
  Description as DocumentosIcon,
  Chat as ChatbotIcon,
  Forum as ForosIcon,
  Settings,
  Home,
  ChevronRight,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

const DRAWER_WIDTH = 240;

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  path: string;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { id: 'reclamos', label: 'Reclamos', icon: <ReclamosIcon />, path: '/reclamos' },
  { id: 'expensas', label: 'Expensas', icon: <ExpensasIcon />, path: '/expensas' },
  { id: 'procedimientos', label: 'Procedimientos', icon: <ProcedimientosIcon />, path: '/procedimientos' },
  { id: 'calendario', label: 'Calendario', icon: <CalendarToday />, path: '/calendario' },
  { id: 'votaciones', label: 'Votaciones', icon: <VotacionesIcon />, path: '/votaciones' },
  { id: 'reuniones', label: 'Reuniones', icon: <ReunionesIcon />, path: '/reuniones' },
  { id: 'documentos', label: 'Documentos', icon: <DocumentosIcon />, path: '/documentos' },
  { id: 'chatbot', label: 'Chatbot', icon: <ChatbotIcon />, path: '/chatbot' },
  { id: 'foros', label: 'Foros', icon: <ForosIcon />, path: '/foros' },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open = true, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (onClose) onClose();
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: '#083e77ff',
          color: 'white',
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header con logo */}
      <Box
        sx={{
          p: 2, // Reducido padding
          display: 'flex',
          alignItems: 'center',
          gap: 1.5, // Reducido gap
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          flexShrink: 0,
          minHeight: 'auto', // Permitir altura mínima
        }}
      >
        <Home sx={{ fontSize: 28, color: '#f97316' }} /> {/* Icono más pequeño */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', fontSize: '1.1rem' }}> {/* Texto más pequeño */}
            Foraria
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}> {/* Más pequeño */}
            Sistema de Gestión
          </Typography>
        </Box>
      </Box>

      {/* Menu Items */}
      <List sx={{ 
        px: 1.5, // Reducido padding horizontal
        py: 1, // Reducido padding vertical
        flexGrow: 1,
        overflow: 'auto',
        // Remover maxHeight fijo y usar flex para distribución automática
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5, // Espacio entre items
      }}>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ mb: 0 }}> {/* Sin margen bottom */}
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 1.5, // Reducido border radius
                minHeight: 42, // Reducida altura mínima
                px: 1.5, // Reducido padding horizontal
                py: 1, // Reducido padding vertical
                position: 'relative',
                backgroundColor: isActiveRoute(item.path) 
                  ? '#f97316' 
                  : 'transparent',
                '&:hover': {
                  backgroundColor: isActiveRoute(item.path)
                    ? '#f97316'
                    : 'rgba(255,255,255,0.08)',
                },
                color: 'white',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}> {/* Reducido gap */}
                <ListItemIcon
                  sx={{
                    color: 'white',
                    minWidth: 20, // Reducido ancho mínimo
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.1rem' // Iconos más pequeños
                    }
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.875rem', // Texto más pequeño
                    fontWeight: isActiveRoute(item.path) ? 600 : 500,
                    lineHeight: 1.2, // Altura de línea reducida
                  }}
                />
              </Box>
              {isActiveRoute(item.path) && (
                <ChevronRight sx={{ fontSize: '1.1rem', color: 'white' }} />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Configuración */}
      <Box sx={{ px: 1.5, pb: 0.5, flexShrink: 0 }}> {/* Reducido padding */}
        <ListItemButton
          onClick={() => handleNavigation('/configuracion')}
          sx={{
            borderRadius: 1.5,
            color: 'white',
            minHeight: 42, // Reducida altura
            px: 1.5,
            py: 1,
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.08)',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'white', minWidth: 20 }}>
            <Settings sx={{ fontSize: '1.1rem' }} />
          </ListItemIcon>
          <ListItemText
            primary="Configuración"
            primaryTypographyProps={{
              fontSize: '0.875rem',
              fontWeight: 500,
              lineHeight: 1.2,
            }}
          />
        </ListItemButton>
      </Box>

      {/* Usuario en la parte inferior */}
      <Box sx={{ 
        p: 1.5, // Reducido padding
        borderTop: '1px solid rgba(255,255,255,0.1)',
        flexShrink: 0,
      }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5, // Reducido gap
            p: 1.5, // Reducido padding interno
            borderRadius: 1.5,
            backgroundColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <Avatar
            sx={{
              width: 36, // Más pequeño
              height: 36,
              backgroundColor: '#f97316',
              color: 'white',
              fontWeight: 700,
              fontSize: '1rem' // Texto más pequeño
            }}
          >
            U
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}> {/* minWidth: 0 para permitir truncado */}
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600, 
                color: 'white', 
                fontSize: '0.875rem',
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              Usuario
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255,255,255,0.7)', 
                fontSize: '0.75rem',
                lineHeight: 1.1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              Depto 4B
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};