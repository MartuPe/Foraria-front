import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography
} from "@mui/material";

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

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Notificaciones</DialogTitle>

      <DialogContent dividers>
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
