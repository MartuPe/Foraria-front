import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import {
  BarChart as DashboardIcon,
  SupervisorAccount as UsersIcon,
  Receipt as ExpensesIcon,
  Description as SuppliersIcon,
  AddBox as CreateVotesIcon,
  GroupAdd as CreateMeetingsIcon,
  Event as CreateEventsIcon,
  Assignment as ReclaimsIcon,
  // BarChart as StatsIcon,
  // VolumeUp as AuditIcon,
  Forum as ForumsIcon,
  Settings,
  ChevronRight,
  ExpandLess,
  ExpandMore,
  AdminPanelSettings,
  Security,
  Build,
  Park,
  DirectionsCar,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import isotipoForaria from "../../assets/Isotipo-Color.png";

const menuItems = [
  { id: "dashboard", label: "Dashboard",            icon: <DashboardIcon />,      path: "/admin/dashboard" },
  { id: "users",     label: "Gestión de Usuarios",  icon: <UsersIcon />,          path: "/admin/gestionUsuario" },
  { id: "expenses",  label: "Gastos y Facturas",    icon: <ExpensesIcon />,       path: "/admin/expensas" },
  { id: "suppliers", label: "Proveedores",          icon: <SuppliersIcon />,      path: "/admin/provedores" },
  { id: "votes",     label: "Crear Votaciones",     icon: <CreateVotesIcon />,    path: "/admin/votaciones" },
  { id: "meetings",  label: "Crear Reuniones",      icon: <CreateMeetingsIcon />, path: "/admin/reuniones" },
  { id: "events",    label: "Crear Eventos",        icon: <CreateEventsIcon />,   path: "/admin/eventos" },
  { id: "reclaims",  label: "Gestión Reclamos",     icon: <ReclaimsIcon />,       path: "/admin/reclamos" },
  // { id: "stats",     label: "Estadísticas",         icon: <StatsIcon />,          path: "/admin/estadisticas" },
  // { id: "audit",     label: "Auditoría",            icon: <AuditIcon />,          path: "/admin/auditoria" },
];

const forosSubMenu = [
  { id: "foros-todas",            label: "Todas",            icon: <ForumsIcon />,         path: "/admin/foros?category=Todas" },
  { id: "foros-general",          label: "General",          icon: <ForumsIcon />,         path: "/admin/foros?category=General" },
  { id: "foros-administracion",   label: "Administración",   icon: <AdminPanelSettings />, path: "/admin/foros?category=Administración" },
  { id: "foros-seguridad",        label: "Seguridad",        icon: <Security />,           path: "/admin/foros?category=Seguridad" },
  { id: "foros-mantenimiento",    label: "Mantenimiento",    icon: <Build />,              path: "/admin/foros?category=Mantenimiento" },
  { id: "foros-espacios-comunes", label: "Espacios Comunes", icon: <Park />,               path: "/admin/foros?category=Espacios Comunes" },
  { id: "foros-garage-parking",   label: "Garage y Parking", icon: <DirectionsCar />,      path: "/admin/foros?category=Garage y Parking" },
];

interface AdminSidebarProps {
  open?: boolean;
  onClose?: () => void;
  variant?: "permanent" | "temporary";
  width?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  open = true,
  onClose,
  variant = "permanent",
  width = 240,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActiveRoute = (path: string) => location.pathname === path;
  const inAdminForums = location.pathname.startsWith("/admin/foros");

// ⬇ colapsable de Foros sincronizado con la URL (sin warnings)
const [forosOpen, setForosOpen] = useState<boolean>(() => inAdminForums);
useEffect(() => {
  setForosOpen(location.pathname.startsWith("/admin/foros"));
}, [location.pathname, location.search]);


  const handleNavigation = (path: string) => {
    navigate(path);
    if (onClose) onClose();
  };

  const isForosCategoryActive = (path: string) => {
    if (!inAdminForums) return false;
    const currentParams = new URLSearchParams(location.search);
    const pathParams = new URLSearchParams(path.split("?")[1] || "");
    return (currentParams.get("category") || "") === (pathParams.get("category") || "");
  };

  const handleForosClick = () => setForosOpen((s) => !s);

  return (
    <Drawer
      variant={variant}
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      PaperProps={{
        sx: {
          width,
          boxSizing: "border-box",
          backgroundColor: "#083e77ff",
          color: "white",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          flexShrink: 0,
          minHeight: "auto",
        }}
      >
        <Box component="img" src={isotipoForaria} alt="Foraria Logo" sx={{ width: 32, height: 32, objectFit: "contain" }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "white", fontSize: "1.1rem" }}>
            Foraria
          </Typography>
          <Typography variant="body2" sx={{ color: "#f97316", fontSize: "0.75rem", fontWeight: 600 }}>
            Panel Administrativo
          </Typography>
        </Box>
      </Box>

      {/* Menú */}
      <List
        sx={{
          px: 1.5,
          py: 1,
          flexGrow: 1,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
        }}
      >
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ mb: 0 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 1.5,
                minHeight: 42,
                px: 1.5,
                py: 1,
                position: "relative",
                backgroundColor: isActiveRoute(item.path) ? "#F59E0B" : "transparent",
                "&:hover": {
                  backgroundColor: isActiveRoute(item.path) ? "#F59E0B" : "rgba(255,255,255,0.08)",
                },
                color: "white",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <ListItemIcon
                  sx={{
                    color: "white",
                    minWidth: 20,
                    "& .MuiSvgIcon-root": { fontSize: "1.1rem" },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: isActiveRoute(item.path) ? 600 : 500,
                    lineHeight: 1.2,
                  }}
                />
              </Box>
              {isActiveRoute(item.path) && <ChevronRight sx={{ fontSize: "1.1rem", color: "white" }} />}
            </ListItemButton>
          </ListItem>
        ))}

        {/* Foros con submenú */}
        <ListItem disablePadding sx={{ mb: 0 }}>
          <ListItemButton
            onClick={handleForosClick}
            sx={{
              borderRadius: 1.5,
              minHeight: 42,
              px: 1.5,
              py: 1,
              backgroundColor: inAdminForums ? "#F59E0B" : "transparent",
              "&:hover": { backgroundColor: inAdminForums ? "#F59E0B" : "rgba(255,255,255,0.08)" },
              color: "white",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <ListItemIcon
                sx={{
                  color: "white",
                  minWidth: 20,
                  "& .MuiSvgIcon-root": { fontSize: "1.1rem" },
                }}
              >
                <ForumsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Foros"
                primaryTypographyProps={{
                  fontSize: "0.875rem",
                  fontWeight: inAdminForums ? 600 : 500,
                  lineHeight: 1.2,
                }}
              />
            </Box>
            {forosOpen ? <ExpandLess sx={{ fontSize: "1.1rem" }} /> : <ExpandMore sx={{ fontSize: "1.1rem" }} />}
          </ListItemButton>
        </ListItem>

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
                    backgroundColor: isForosCategoryActive(subItem.path) ? "#F59E0B" : "transparent",
                    "&:hover": {
                      backgroundColor: isForosCategoryActive(subItem.path) ? "#F59E0B" : "rgba(255,255,255,0.08)",
                    },
                    color: "white",
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: "white",
                      minWidth: 16,
                      "& .MuiSvgIcon-root": { fontSize: "1rem" },
                    }}
                  >
                    {subItem.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={subItem.label}
                    primaryTypographyProps={{
                      fontSize: "0.8rem",
                      fontWeight: isForosCategoryActive(subItem.path) ? 600 : 500,
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
      <Box sx={{ px: 1.5, pb: 0.5, flexShrink: 0 }}>
        <ListItemButton
          onClick={() => handleNavigation("/admin/configuracion")}
          sx={{
            borderRadius: 1.5,
            color: "white",
            minHeight: 42,
            px: 1.5,
            py: 1,
            "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" },
          }}
        >
          <ListItemIcon sx={{ color: "white", minWidth: 20 }}>
            <Settings sx={{ fontSize: "1.1rem" }} />
          </ListItemIcon>
          <ListItemText
            primary="Configuración"
            primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500, lineHeight: 1.2 }}
          />
        </ListItemButton>
      </Box>

      {/* Perfil Admin */}
      <Box sx={{ p: 1.5, borderTop: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}>
        <Box
          onClick={() => handleNavigation("/admin/perfil")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1.5,
            borderRadius: 1.5,
            backgroundColor: "rgba(255,255,255,0.08)",
            cursor: "pointer",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              backgroundColor: "#F59E0B",
              color: "white",
              fontWeight: 700,
              fontSize: "1rem",
            }}
          >
            AD
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "white",
                fontSize: "0.875rem",
                lineHeight: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              Administrador
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.75rem",
                lineHeight: 1.1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              Admin Panel
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};
