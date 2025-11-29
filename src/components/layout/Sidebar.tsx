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
  // Description as DocumentosIcon,
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
import isotipoForaria from "../../assets/Isotipo-Color.png";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  path: string;
}
const token = localStorage.getItem("accessToken");
const menuItems: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { id: "reclamos", label: "Reclamos", icon: <ReclamosIcon />, path: "/reclamos" },
  { id: "expensas", label: "Expensas", icon: <ExpensasIcon />, path: "/expensas" },
  { id: "calendario", label: "Calendario", icon: <CalendarToday />, path: "/calendario" },
  { id: "votaciones", label: "Votaciones", icon: <VotacionesIcon />, path: "/votaciones" },
  { id: "reuniones", label: "Reuniones", icon: <ReunionesIcon />, path: "/reuniones" },
  // { id: "documentos", label: "Documentos", icon: <DocumentosIcon />, path: "/documentos" },
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
  variant?: "permanent" | "temporary";
  width?: number;
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

const STATIC_FORUM_LINKS = [
  { label: "General",          slug: "general" },
  { label: "Administración",   slug: "administracion" },
  { label: "Seguridad",        slug: "seguridad" },
  { label: "Mantenimiento",    slug: "mantenimiento" },
  { label: "Espacios Comunes", slug: "espacios-comunes" },
  { label: "Garage y Parking", slug: "garage-parking" },
];

export const Sidebar: React.FC<SidebarProps> = ({
  open = true,
  onClose,
  variant = "permanent",
  width = 240,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActiveRoute = (path: string) => location.pathname === path;
  const inForums = location.pathname.startsWith("/forums");

  // ⬇ colapsable de Foros sincronizado con la URL (sin warnings)
  const [forosOpen, setForosOpen] = useState<boolean>(() => inForums);
  useEffect(() => {
    setForosOpen(location.pathname.startsWith("/forums"));
  }, [location.pathname]);

  const [foros, setForos] = useState<ForumApiItem[] | null>(null);
  const [loadingForos, setLoadingForos] = useState(true);

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
    let mounted = true;
    const API_BASE = process.env.REACT_APP_API_URL || "https://localhost:7245";

    fetch(`${API_BASE}/Forum`, { headers: { Authorization: `bearer ${token}` }})
      .then(async (res) => {
        if (!mounted) return;
        if (!res.ok) { setForos([]); return; }
        const json = await res.json();
        if (Array.isArray(json)) {
          const activeForos = json.filter((f: any) => f.isActive !== false);
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
                isActive: f.isActive,
              });
            }
          });
          setForos(Array.from(uniqueCategories.values()));
        } else {
          setForos([]);
        }
      })
      .catch(() => setForos([]))
      .finally(() => { if (mounted) setLoadingForos(false); });

    return () => { mounted = false; };
  }, []);

  const handleNavigation = (path: string) => {
    navigate(path);
    if (onClose && !path.startsWith("/forums")) onClose();
  };

  const createSlug = (text: string) =>
    text
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

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
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem" }}>
            Sistema de Gestión
          </Typography>
        </Box>
      </Box>

      {/* Menú principal */}
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

        {/* Foros */}
        <ListItem disablePadding sx={{ mb: 0 }}>
          <ListItemButton
            onClick={() => setForosOpen((s) => !s)}
            sx={{
              borderRadius: 1.5,
              minHeight: 42,
              px: 1.5,
              py: 1,
              backgroundColor: inForums ? "#f97316" : "transparent",
              "&:hover": { backgroundColor: inForums ? "#f97316" : "rgba(255,255,255,0.08)" },
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
                  fontWeight: inForums ? 600 : 500,
                  lineHeight: 1.2,
                }}
              />
            </Box>
            {forosOpen ? <ExpandLess sx={{ fontSize: "1.1rem" }} /> : <ExpandMore sx={{ fontSize: "1.1rem" }} />}
          </ListItemButton>
        </ListItem>

        <Collapse in={forosOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ pl: 2 }}>
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

            {!loadingForos && (() => {
              // 1) base estática completa
              const base = STATIC_FORUM_LINKS.map(s => ({ label: s.label, slug: s.slug }));

              // 2) categorías traídas del API -> convertir a {label, slug}
              const apiCats = (foros || []).map((f) => {
                const name = f.categoryName || getCategoryName(f.category);
                return { label: name, slug: createSlug(name) };
              });

              // 3) fusionar evitando duplicados por slug (prioridad API para el nombre)
              const bySlug = new Map<string, {label: string; slug: string}>();
              [...base, ...apiCats].forEach(item => { bySlug.set(item.slug, item); });
              const finalList = Array.from(bySlug.values());

              return finalList.map(({ label, slug }) => {
                const path = `/forums/${slug}`;
                const active = isActiveRoute(path);
                return (
                  <ListItem key={`forum-${slug}`} disablePadding>
                    <ListItemButton
                      onClick={() => handleNavigation(path)}
                      sx={{
                        borderRadius: 1.5,
                        minHeight: 36,
                        px: 1.5,
                        py: 0.5,
                        backgroundColor: active ? "#f97316" : "transparent",
                        "&:hover": { backgroundColor: active ? "#f97316" : "rgba(255,255,255,0.08)" },
                        color: "white",
                      }}
                    >
                      <ListItemIcon sx={{ color: "white", minWidth: 16, "& .MuiSvgIcon-root": { fontSize: "1rem" } }}>
                        {iconForCategoryName(label)}
                      </ListItemIcon>
                      <ListItemText
                        primary={label}
                        primaryTypographyProps={{ fontSize: "0.8rem", fontWeight: active ? 600 : 500 }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              });
            })()}
          </List>
        </Collapse>
      </List>

      {/* Configuración */}
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

  {/* Perfil */}
      <Box sx={{ p: 1.5, borderTop: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}>
        {(() => {
          const stored = localStorage.getItem("user");
          const user = stored ? JSON.parse(stored) : null;

          const firstName = user?.firstName ?? "Usuario";
          const lastName = user?.lastName ?? "";
          const residence = user?.residences?.[0];

          // Ejemplo: Piso 4, Número 2 → "4B"
          let deptoLabel = "Sin residencia";
          if (residence) {
            const floor = residence.floor ?? "";
            const number = residence.number ?? "";
            const letter =
              typeof number === "number"
                ? String.fromCharCode(64 + number) // 1=A, 2=B...
                : number;

            deptoLabel = `Depto ${floor}${letter}`;
          }

          // Inicial del avatar
          const avatarLetter = firstName?.[0]?.toUpperCase?.() ?? "U";

          return (
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
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  backgroundColor: "#f97316",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "1rem",
                }}
              >
                {avatarLetter}
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
                  {firstName} {lastName}
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
                  {deptoLabel}
                </Typography>
              </Box>
            </Box>
          );
        })()}
      </Box>
    </Drawer>
  );
};
