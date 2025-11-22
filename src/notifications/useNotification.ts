import { api } from "../api/axios";
import { useEffect, useState } from "react";

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  async function load() {
    const res = await api.get("/Notification/unread");
    setNotifications(res.data);
    setUnread(res.data.length);
  }

  async function markAsRead(id: number) {
    await api.put(`/Notification/${id}/read`);
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return { notifications, unread, markAsRead, load };
}
