import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Button
} from "@mui/material";
import { api } from "../api/axios";

interface Props {
  open: boolean;
  onClose: () => void;
  notifications: any[];
  markAsRead: (id: number) => void;
}

export default function NotificationModal({
  open,
  onClose,
  notifications,
  markAsRead
}: Props) {

  async function sendTestNotification() {
    try {
      const fcmToken = localStorage.getItem("fcmToken");

      if (!fcmToken) {
        console.warn("No hay token FCM en localStorage todavía");
        return;
      }

      // 🔥 Esto dispara una PUSH REAL
      await api.post("/Notification/test", { fcmToken });

      console.log("Push enviada, esperá que aparezca en pantalla");
    } catch (err) {
      console.error("Error enviando push:", err);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Notificaciones</DialogTitle>

      <DialogContent dividers>
        {/* 🔥 BOTÓN DISPARADOR DE PUSH REAL */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mb: 2 }}
          onClick={sendTestNotification}
        >
          Enviarme notificación push
        </Button>

        {notifications.length === 0 ? (
          <Typography sx={{ textAlign: "center", py: 3 }}>
            No tenés notificaciones sin leer.
          </Typography>
        ) : (
          <List>
            {notifications.map((n) => (
              <ListItem key={n.id} disablePadding>
                <ListItemButton onClick={() => markAsRead(n.id)}>
                  <ListItemText
                    primary={n.title}
                    secondary={n.body}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
