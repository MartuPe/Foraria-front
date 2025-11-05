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
  Warning as ReclamosIcon,
  Receipt as ExpensasIcon,
  CalendarToday,
  HowToVote as VotacionesIcon,
  Groups as ReunionesIcon,
  Description as DocumentosIcon,
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
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import logoForaria from "../../assets/Isotipo-Color.png";

const DRAWER_WIDTH = 240;

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  path: string;
}

const menuItems: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { id: "reclamos", label: "Reclamos", icon: <ReclamosIcon />, path: "/reclamos" },
  { id: "expensas", label: "Expensas", icon: <ExpensasIcon />, path: "/expensas" },
  { id: "calendario", label: "Calendario", icon: <CalendarToday />, path: "/calendario" },
  { id: "votaciones", label: "Votaciones", icon: <VotacionesIcon />, path: "/votaciones" },
  { id: "reuniones", label: "Reuniones", icon: <ReunionesIcon />, path: "/reuniones" },
  { id: "documentos", label: "Documentos", icon: <DocumentosIcon />, path: "/documentos" },
];

interface ForumApiItem {
  id: number;
  category: number;
  categoryName?: string; 
  countThreads?: number;
  countResponses?: number;
  countUserActives?: number;
  isActive?: boolean;
}

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

const iconForCategoryName = (name: string) => {
  const key = name?.toLowerCase?.() ?? "";
  if (key.includes("administr")) return <AdminPanelSettings />;
  if (key.includes("segur")) return <Security />;
  if (key.includes("manten")) return <Build />;
  if (key.includes("espacios")) return <Park />;
  if (key.includes("garage") || key.includes("parking")) return <DirectionsCar />;
  return <ForosIcon />;
};

export const Sidebar: React.FC<SidebarProps> = ({ open = true, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [forosOpen, setForosOpen] = useState(false);
  const [foros, setForos] = useState<ForumApiItem[] | null>(null);
  const [loadingForos, setLoadingForos] = useState(true); // Empezar en true
  const [forosError, setForosError] = useState(false);

  // Mapeo de números de categoría a nombres
  const getCategoryName = (categoryNumber: number): string => {
    switch (categoryNumber) {
      case 1: return "Administración";
      case 2: return "Seguridad"; 
      case 3: return "Mantenimiento";
      case 4: return "Espacios Comunes";
      case 5: return "Garage y Parking";
      default: return "General";
    }
  };

  useEffect(() => {
    // Cargar foros solo una vez al montar
    let mounted = true;
    
    const API_BASE = process.env.REACT_APP_API_URL || "https://localhost:7245/api";
    
    console.log('Cargando foros desde:', API_BASE + '/Forum');
    
    fetch(`${API_BASE}/Forum`)
      .then(async (res) => {
        if (!mounted) return;
        if (!res.ok) {
          console.error("Error fetching forums", await res.text());
          setForos([]);
          setForosError(true);
          return;
        }
        const json = await res.json();
        console.log('Foros cargados desde API (raw):', json);
        
        // Procesar los foros para agregar categoryName y filtrar duplicados
        if (Array.isArray(json)) {
          // Filtrar solo los activos y eliminar duplicados por categoría
          const activeForos = json.filter((f: any) => f.isActive !== false);
          console.log('Foros activos:', activeForos);
          
          // Agrupar por categoría y tomar uno por cada categoría
          const uniqueCategories = new Map<number, ForumApiItem>();
          
          activeForos.forEach((f: any) => {
            if (!uniqueCategories.has(f.category)) {
              uniqueCategories.set(f.category, {
                id: f.id,
                category: f.category,
                categoryName: getCategoryName(f.category),
                countThreads: f.countThreads || 0,
                countResponses: f.countResponses || 0,
                countUserActives: f.countUserActives || 0,
                isActive: f.isActive
              });
            }
          });
          
          const processedForos = Array.from(uniqueCategories.values());
          console.log('Foros procesados:', processedForos);
          
          setForos(processedForos);
        } else {
          setForos([]);
        }
        setForosError(false);
      })
      .catch((err) => {
        console.error("Error fetching forums", err);
        if (mounted) {
          setForos([]);
          setForosError(true);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingForos(false);
        }
      });
      
    return () => {
      mounted = false;
    };
  }, []); // Sin dependencias - solo cargar una vez

  // Auto-abrir foros si estamos en una ruta de foros
  useEffect(() => {
    if (location.pathname.startsWith("/forums")) {
      setForosOpen(true);
    }
  }, [location.pathname]);

  const handleNavigation = (path: string) => {
    navigate(path);
    // NO cerrar el sidebar cuando se navega entre categorías de foros
    if (onClose && !path.startsWith("/forums")) {
      onClose();
    }
  };

  const isActiveRoute = (path: string) => location.pathname === path;
  const isForosActive = () => location.pathname.startsWith("/forums");

  const handleForosClick = () => setForosOpen((s) => !s);

  // Función para crear slug de forma consistente
  const createSlug = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          backgroundColor: "#083e77ff",
          color: "white",
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
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
        <Box component="img" src={logoForaria} alt="Foraria Logo" sx={{ width: 32, height: 32, objectFit: "contain" }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "white", fontSize: "1.1rem" }}>
            Foraria
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem" }}>
            Sistema de Gestión
          </Typography>
        </Box>
      </Box>

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
                backgroundColor: isActiveRoute(item.path) ? "#f97316" : "transparent",
                "&:hover": {
                  backgroundColor: isActiveRoute(item.path) ? "#f97316" : "rgba(255,255,255,0.08)",
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

        <ListItem disablePadding sx={{ mb: 0 }}>
          <ListItemButton
            onClick={handleForosClick}
            sx={{
              borderRadius: 1.5,
              minHeight: 42,
              px: 1.5,
              py: 1,
              backgroundColor: isForosActive() ? "#f97316" : "transparent",
              "&:hover": { backgroundColor: isForosActive() ? "#f97316" : "rgba(255,255,255,0.08)" },
              color: "white",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <ListItemIcon sx={{ color: "white", minWidth: 20, "& .MuiSvgIcon-root": { fontSize: "1.1rem" } }}>
                <ForosIcon />
              </ListItemIcon>
              <ListItemText
                primary="Foros"
                primaryTypographyProps={{
                  fontSize: "0.875rem",
                  fontWeight: isForosActive() ? 600 : 500,
                  lineHeight: 1.2,
                }}
              />
            </Box>
            {forosOpen ? <ExpandLess sx={{ fontSize: "1.1rem" }} /> : <ExpandMore sx={{ fontSize: "1.1rem" }} />}
          </ListItemButton>
        </ListItem>

        <Collapse in={forosOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ pl: 2 }}>
            {/* Mostrar loading solo mientras está cargando */}
            {loadingForos && (
              <ListItem disablePadding>
                <ListItemButton disabled sx={{ minHeight: 36, px: 1.5, py: 0.5 }}>
                  <ListItemText 
                    primary="Cargando..." 
                    primaryTypographyProps={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)" }} 
                  />
                </ListItemButton>
              </ListItem>
            )}

            {/* Mostrar categorías si no está cargando */}
            {!loadingForos && (
              <>
                {/* SI la API funcionó Y hay datos, mostrar SOLO los de la API */}
                {!forosError && foros && foros.length > 0 ? (
                  foros.map((f) => {
                    const categoryName = f.categoryName || getCategoryName(f.category);
                    const slug = createSlug(categoryName);
                    const path = `/forums/${slug}`;
                    const isActive = isActiveRoute(path);
                    
                    return (
                      <ListItem key={`api-forum-${f.id}`} disablePadding>
                        <ListItemButton
                          onClick={() => handleNavigation(path)}
                          sx={{
                            borderRadius: 1.5,
                            minHeight: 36,
                            px: 1.5,
                            py: 0.5,
                            backgroundColor: isActive ? "#f97316" : "transparent",
                            "&:hover": { backgroundColor: isActive ? "#f97316" : "rgba(255,255,255,0.08)" },
                            color: "white",
                          }}
                        >
                          <ListItemIcon sx={{ color: "white", minWidth: 16, "& .MuiSvgIcon-root": { fontSize: "1rem" } }}>
                            {iconForCategoryName(categoryName)}
                          </ListItemIcon>
                          <ListItemText
                            primary={categoryName}
                            primaryTypographyProps={{ 
                              fontSize: "0.8rem", 
                              fontWeight: isActive ? 600 : 500 
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })
                ) : (
                  /* SI la API falló O no hay datos, mostrar SOLO categorías fallback */
                  <>
                    <ListItem disablePadding>
                      <ListItemButton 
                        onClick={() => handleNavigation("/forums/administracion")} 
                        sx={{ 
                          borderRadius: 1.5,
                          minHeight: 36, 
                          px: 1.5, 
                          py: 0.5,
                          backgroundColor: isActiveRoute("/forums/administracion") ? "#f97316" : "transparent",
                          "&:hover": { backgroundColor: isActiveRoute("/forums/administracion") ? "#f97316" : "rgba(255,255,255,0.08)" },
                        }}
                      >
                        <ListItemIcon sx={{ color: "white", minWidth: 16 }}>
                          <AdminPanelSettings />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Administración" 
                          primaryTypographyProps={{ 
                            fontSize: "0.8rem",
                            fontWeight: isActiveRoute("/forums/administracion") ? 600 : 500
                          }} 
                        />
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton 
                        onClick={() => handleNavigation("/forums/seguridad")} 
                        sx={{ 
                          borderRadius: 1.5,
                          minHeight: 36, 
                          px: 1.5, 
                          py: 0.5,
                          backgroundColor: isActiveRoute("/forums/seguridad") ? "#f97316" : "transparent",
                          "&:hover": { backgroundColor: isActiveRoute("/forums/seguridad") ? "#f97316" : "rgba(255,255,255,0.08)" },
                        }}
                      >
                        <ListItemIcon sx={{ color: "white", minWidth: 16 }}>
                          <Security />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Seguridad" 
                          primaryTypographyProps={{ 
                            fontSize: "0.8rem",
                            fontWeight: isActiveRoute("/forums/seguridad") ? 600 : 500
                          }} 
                        />
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton 
                        onClick={() => handleNavigation("/forums/mantenimiento")} 
                        sx={{ 
                          borderRadius: 1.5,
                          minHeight: 36, 
                          px: 1.5, 
                          py: 0.5,
                          backgroundColor: isActiveRoute("/forums/mantenimiento") ? "#f97316" : "transparent",
                          "&:hover": { backgroundColor: isActiveRoute("/forums/mantenimiento") ? "#f97316" : "rgba(255,255,255,0.08)" },
                        }}
                      >
                        <ListItemIcon sx={{ color: "white", minWidth: 16 }}>
                          <Build />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Mantenimiento" 
                          primaryTypographyProps={{ 
                            fontSize: "0.8rem",
                            fontWeight: isActiveRoute("/forums/mantenimiento") ? 600 : 500
                          }} 
                        />
                      </ListItemButton>
                    </ListItem>
                  </>
                )}
              </>
            )}
          </List>
        </Collapse>
      </List>

      <Box sx={{ px: 1.5, pb: 0.5, flexShrink: 0 }}>
        <ListItemButton
          onClick={() => handleNavigation("/configuracion")}
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

      <Box sx={{ p: 1.5, borderTop: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}>
        <Box
          onClick={() => handleNavigation("/perfil")}
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
          <Avatar sx={{ width: 36, height: 36, backgroundColor: "#f97316", color: "white", fontWeight: 700, fontSize: "1rem" }}>
            U
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
              Usuario
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
              Depto 4B
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};
