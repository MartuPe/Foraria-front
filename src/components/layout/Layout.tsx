import React from "react";
import { useEffect } from "react";
import { storage } from "../../utils/storage";

import {
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
  Badge,
  Snackbar,
  Alert as MuiAlert
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
  const [pushToast, setPushToast] = React.useState<{ open: boolean; title: string; body: string }>({
    open: false,
    title: "",
    body: ""
  });

  const isBrowser = typeof window !== "undefined" && typeof navigator !== "undefined"; // nuevo
  const isTestEnv = process.env.NODE_ENV === "test";                                   // nuevo

  // Listener push foreground (carga diferida)
  React.useEffect(() => {
    if (!isBrowser || isTestEnv) return; // evita ejecución en tests
    let unsub: (() => void) | undefined;

    (async () => {
      try {
        const [{ onMessage }, { messaging }] = await Promise.all([
          import("firebase/messaging"),
          import("../../firebase") // debe exportar messaging (puede ser undefined si se protege allí)
        ]);

        if (!messaging) {
          console.warn("[Layout] messaging no disponible, se omite listener.");
          return;
        }

        unsub = onMessage(messaging, (payload) => {
          load();
          const title = payload.notification?.title || "Nueva notificación";
            const body = payload.notification?.body || "Tienes una actualización.";
          setPushToast({ open: true, title, body });

          if ("Notification" in window) {
            if (Notification.permission === "granted") {
              new Notification(title, { body, icon: "/favicon.ico" });
            } else if (Notification.permission === "default") {
              Notification.requestPermission().then((perm) => {
                if (perm === "granted") {
                  new Notification(title, { body, icon: "/favicon.ico" });
                }
              });
            }
          }
        });
      } catch (e) {
        console.warn("[Layout] Error inicializando listener de mensajes:", e);
      }
    })();

    return () => {
      if (unsub) unsub();
    };
  }, [load, isBrowser, isTestEnv]);

  // Registrar token Firebase (diferido y omitido en test)
  useEffect(() => {
    if (!isBrowser || isTestEnv) return;
    const jwt = storage.token;
    if (!jwt) return;
    (async () => {
      try {
        const mod = await import("../../notifications/registerToken");
        await mod.registerFirebaseToken();
        console.log("Token Firebase registrado OK");
      } catch (err) {
        console.error("Error registrando token Firebase:", err);
      }
    })();
  }, [isBrowser, isTestEnv]);

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
