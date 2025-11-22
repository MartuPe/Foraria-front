import React from "react";
import { useEffect } from "react";
import { storage } from "../../utils/storage";
import { registerFirebaseToken } from "../../notifications/registerToken";

import {
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
  Badge,
  Snackbar,
  Alert as MuiAlert            // <-- añadido
} from "@mui/material";

import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon
} from "@mui/icons-material";

import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { AdminSidebar } from "./AdminSidebar";

// 📌 Agregados
import { useNotifications } from "../../notifications/useNotification";
import NotificationModal from "../../notifications/notificationModal";
import { onMessage } from "firebase/messaging";
import { messaging } from "../../firebase";
const DRAWER_WIDTH = 240;

export default function Layout() {
  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    setOpen(!isMobileOrTablet);
  }, [isMobileOrTablet, location.pathname]);

  const toggle = () => setOpen((s) => !s);
  const close = () => {
    if (isMobileOrTablet && !location.pathname.startsWith("/forums")) setOpen(false);
  };

  const SidebarComp = isAdminRoute ? AdminSidebar : Sidebar;

  // 📌 Notificaciones (hook)
  const { notifications, unread, markAsRead, load } = useNotifications();
  const [openNotif, setOpenNotif] = React.useState(false);

  // Estado para toast foreground
  const [pushToast, setPushToast] = React.useState<{ open: boolean; title: string; body: string }>({
    open: false,
    title: "",
    body: ""
  }); // <-- añadido

  // Listener push foreground
  React.useEffect(() => {
    const unsub = onMessage(messaging, (payload) => {
      console.log("Push recibida en foreground:", payload);
      load(); // refrescar listado

      const title = payload.notification?.title || "Nueva notificación";
      const body = payload.notification?.body || "Tienes una actualización.";

      // Mostrar toast interno
      setPushToast({ open: true, title, body });

      // Notificación nativa (si hay permiso)
      if (typeof Notification !== "undefined") {
        if (Notification.permission === "granted") {
          new Notification(title, {
            body,
            icon: "/favicon.ico"
          });
        } else if (Notification.permission === "default") {
          Notification.requestPermission().then((perm) => {
            if (perm === "granted") {
              new Notification(title, { body, icon: "/favicon.ico" });
            }
          });
        }
      }
    });
    return () => unsub();
  }, [load]); // <-- añadido dependencia load

  // 📌 Registrar token Firebase si hay sesión
  useEffect(() => {
    const jwt = storage.token;

    if (!jwt) {
      console.log("Usuario no logueado, no registro token.");
      return;
    }

    registerFirebaseToken()
      .then(() => console.log("Token Firebase registrado OK"))
      .catch((err) =>
        console.error("Error registrando token Firebase:", err)
      );
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: { xs: "block", md: "grid" },
        gridTemplateColumns: { md: `${DRAWER_WIDTH}px 1fr` },
        backgroundColor: theme.palette.background.default,
      }}
    >
      <SidebarComp
        open={open}
        onClose={close}
        variant={isMobileOrTablet ? "temporary" : "permanent"}
        width={DRAWER_WIDTH}
      />

      <Box component="main" sx={{ minWidth: 0 }}>
        {/* BOTÓN MENÚ MOBILE */}
        {isMobileOrTablet && (
          <Box
            sx={{
              position: "fixed",
              top: 16,
              left: 16,
              zIndex: theme.zIndex.drawer + 1,
            }}
          >
            <IconButton
              onClick={toggle}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: "white",
                "&:hover": { backgroundColor: theme.palette.primary.dark },
              }}
              aria-label="Abrir menú"
            >
              <MenuIcon />
            </IconButton>
          </Box>
        )}

        {/* ⭐ HEADER SUPERIOR (CAMPANITA) */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            p: { xs: 2, md: 3 },
            pb: 0,
          }}
        >
          <IconButton onClick={() => setOpenNotif(true)}>
            <Badge badgeContent={unread} color="error">
              <NotificationsIcon sx={{ color: theme.palette.text.primary }} />
            </Badge>
          </IconButton>
        </Box>

        {/* MODAL DE NOTIFICACIONES */}
        <NotificationModal
          open={openNotif}
          onClose={() => setOpenNotif(false)}
          notifications={notifications}
          markAsRead={markAsRead}
        />

        {/* CONTENIDO */}
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>

        {/* Snackbar para push en misma página */}
        <Snackbar
          open={pushToast.open}
          autoHideDuration={6000}
          onClose={() => setPushToast((p) => ({ ...p, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <MuiAlert
            onClose={() => setPushToast((p) => ({ ...p, open: false }))}
            severity="info"
            variant="filled"
            sx={{ width: '100%' }}
          >
            <strong>{pushToast.title}</strong>
            <br />
            {pushToast.body}
          </MuiAlert>
        </Snackbar>
      </Box>
    </Box>
  );
}
