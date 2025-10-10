import React, { useState } from 'react';
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
  Collapse,
} from '@mui/material';
import {
  BarChart as DashboardIcon,
  Warning as ReclamosIcon,
  Receipt as ExpensasIcon,
  CalendarToday,
  HowToVote as VotacionesIcon,
  Groups as ReunionesIcon,
  Description as DocumentosIcon,
  Chat as ChatbotIcon,
  Forum as ForosIcon,
  Settings,
  ChevronRight,
  ExpandLess,
  ExpandMore,
  AdminPanelSettings,
  Security,
  Build,
  Park,
  DirectionsCar,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

// Importar el logo
import logoForaria from '../../assets/Isotipo-Color.png';

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
  { id: 'calendario', label: 'Calendario', icon: <CalendarToday />, path: '/calendario' },
  { id: 'votaciones', label: 'Votaciones', icon: <VotacionesIcon />, path: '/votaciones' },
  { id: 'reuniones', label: 'Reuniones', icon: <ReunionesIcon />, path: '/reuniones' },
  { id: 'documentos', label: 'Documentos', icon: <DocumentosIcon />, path: '/documentos' },
  { id: 'chatbot', label: 'Chatbot', icon: <ChatbotIcon />, path: '/chatbot' },
];

// Nuevo: Submenu de Foros
const forosSubMenu = [
  { id: 'foros-general', label: 'General', icon: <ForosIcon />, path: '/forums/general' },
  { id: 'foros-administracion', label: 'Administración', icon: <AdminPanelSettings />, path: '/forums/administracion' },
  { id: 'foros-seguridad', label: 'Seguridad', icon: <Security />, path: '/forums/seguridad' },
  { id: 'foros-mantenimiento', label: 'Mantenimiento', icon: <Build />, path: '/forums/mantenimiento' },
  { id: 'foros-espacios-comunes', label: 'Espacios Comunes', icon: <Park />, path: '/forums/espacios-comunes' },
  { id: 'foros-garage-parking', label: 'Garage y Parking', icon: <DirectionsCar />, path: '/forums/garage-parking' },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open = true, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [forosOpen, setForosOpen] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    if (onClose) onClose();
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const isForosActive = () => {
    return location.pathname.startsWith('/forums');
  };

  const handleForosClick = () => {
    setForosOpen(!forosOpen);
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
      {/* Header con logo - ACTUALIZADO */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          flexShrink: 0,
          minHeight: 'auto',
        }}
      >
        <Box
          component="img"
          src={logoForaria}
          alt="Foraria Logo"
          sx={{
            width: 32,
            height: 32,
            objectFit: 'contain'
          }}
        />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', fontSize: '1.1rem' }}>
            Foraria
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>
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

        {/* Foros con submenu */}
        <ListItem disablePadding sx={{ mb: 0 }}>
          <ListItemButton
            onClick={handleForosClick}
            sx={{
              borderRadius: 1.5,
              minHeight: 42,
              px: 1.5,
              py: 1,
              backgroundColor: isForosActive() ? '#f97316' : 'transparent',
              '&:hover': {
                backgroundColor: isForosActive() ? '#f97316' : 'rgba(255,255,255,0.08)',
              },
              color: 'white',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <ListItemIcon
                sx={{
                  color: 'white',
                  minWidth: 20,
                  '& .MuiSvgIcon-root': {
                    fontSize: '1.1rem'
                  }
                }}
              >
                <ForosIcon />
              </ListItemIcon>
              <ListItemText
                primary="Foros"
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: isForosActive() ? 600 : 500,
                  lineHeight: 1.2,
                }}
              />
            </Box>
            {forosOpen ? <ExpandLess sx={{ fontSize: '1.1rem' }} /> : <ExpandMore sx={{ fontSize: '1.1rem' }} />}
          </ListItemButton>
        </ListItem>

        {/* Submenu de Foros */}
        <Collapse in={forosOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ pl: 2 }}>
            {forosSubMenu.map((subItem) => (
              <ListItem key={subItem.id} disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation(subItem.path)}
                  sx={{
                    borderRadius: 1.5,
                    minHeight: 36,
                    px: 1.5,
                    py: 0.5,
                    backgroundColor: isActiveRoute(subItem.path) ? '#f97316' : 'transparent',
                    '&:hover': {
                      backgroundColor: isActiveRoute(subItem.path) ? '#f97316' : 'rgba(255,255,255,0.08)',
                    },
                    color: 'white',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: 'white',
                      minWidth: 16,
                      '& .MuiSvgIcon-root': {
                        fontSize: '1rem'
                      }
                    }}
                  >
                    {subItem.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={subItem.label}
                    primaryTypographyProps={{
                      fontSize: '0.8rem',
                      fontWeight: isActiveRoute(subItem.path) ? 600 : 500,
                      lineHeight: 1.2,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>
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

      {/* Usuario en la parte inferior - ACTUALIZAR */}
      <Box sx={{ 
        p: 1.5,
        borderTop: '1px solid rgba(255,255,255,0.1)',
        flexShrink: 0,
      }}>
        <Box
          onClick={() => handleNavigation('/perfil')} // AGREGAR CLICK HANDLER
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            borderRadius: 1.5,
            backgroundColor: 'rgba(255,255,255,0.08)',
            cursor: 'pointer', // AGREGAR CURSOR
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.15)', // AGREGAR HOVER
            },
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              backgroundColor: '#f97316',
              color: 'white',
              fontWeight: 700,
              fontSize: '1rem'
            }}
          >
            U
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
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