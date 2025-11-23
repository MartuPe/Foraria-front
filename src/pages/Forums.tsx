// src/pages/Forums.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Card, CardContent, Typography, Chip, Button, Stack, Dialog, DialogContent,
  CircularProgress, Avatar, TextField, Collapse, Divider, Paper, IconButton,
  DialogTitle, DialogActions
} from "@mui/material";

import {
  Add as AddIcon, ChatBubbleOutline as ChatIcon, Groups as GroupsIcon,
  TrendingUp as TrendingIcon, ThumbUp as ThumbUpIcon, ThumbDown as ThumbDownIcon,
  Reply as ReplyIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon,
  Send as SendIcon,
  EditOutlined, DeleteOutline,
} from "@mui/icons-material";

import PageHeader from "../components/SectionHeader";
import NewPost from "../components/modals/NewPost";
import EditThread from "../components/modals/EditThread";
import EditMessage from "../components/modals/EditMessage";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { useGet } from "../hooks/useGet";
import { useMutation } from "../hooks/useMutation";
import { storage } from "../utils/storage";
import { Role } from "../constants/roles";
import { deleteMessage as deleteMessageApi } from "../services/messageService";
import { ForariaStatusModal } from "../components/StatCardForms";

interface Thread {
  id: number;
  theme: string;
  description: string;
  createdAt: string;
  state: string;
  userId?: number;
  forumId?: number;
  userName: string;
  userLastName: string;
}

interface Forum {
  id: number;
  category: number;
  categoryName: string;
  countThreads: number;
  countResponses: number;
  countUserActives: number;
}

interface ReactionResponse {
  total: number;
  likes: number;
  dislikes: number;
  userReaction?: 1 | -1 | 0;
}

interface Message {
  id: number;
  content: string;
  createdAt: string;
  state: string;
  thread_id: number;
  user_id: number;
  optionalFile?: string | null;
}

function formatDateNumeric(dateString?: string | null) {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return Number.isNaN(d.getTime())
    ? dateString
    : d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}


function toCategorySlug(text: string): string {
  const normalized = text.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
  
  const categoryMap: Record<string, string> = {
    "garageeparking": "garageyparking",
    "garageyparking": "garageyparking",
    "espacioscomunes": "espacioscomunes",
    "administracion": "administracion",
    "administración": "administracion",
    "seguridad": "seguridad",
    "mantenimiento": "mantenimiento",
    "general": "general"
  };

  if (categoryMap[normalized]) {
    return categoryMap[normalized];
  }

  return normalized
    .replace(/[^a-z0-9]/g, "");
}

const ADMIN_TAB_COLORS: Record<string, string> = {
  General: "#1472c4ff",
  Administración: "#5caeffff",
  Seguridad: "#ef5350",
  Mantenimiento: "#ff9800",
  "Espacios Comunes": "#179e8cff",
  "Garage y Parking": "#7e57c2",
};

const CATEGORY_LABELS = [
  "General",
  "Administración",
  "Seguridad",
  "Mantenimiento",
  "Espacios Comunes",
  "Garage y Parking",
] as const;

const Forums: React.FC = () => {
  const {
    data: forumsRaw,
    loading: loadingForums,
    error: errorForums,
    refetch: refetchForums,
  } = useGet<Forum[]>("/Forum");
  const {
    data: threadsRaw,
    loading: loadingThreads,
    error: errorThreads,
    refetch: refetchThreads,
  } = useGet<Thread[]>("/Thread");

  const loading = loadingForums || loadingThreads;
  const [loadError, setLoadError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const isAdminRole =
    storage.role === Role.ADMIN || storage.role === Role.CONSORCIO;
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isAdmin = isAdminRole || isAdminRoute;

  const [open, setOpen] = useState(false);
  const currentUserId = Number(localStorage.getItem("userId") || 0);

  const { mutate: toggleMutate } =
    useMutation<ReactionResponse, { user_id: number; thread_id?: number; message_id?: number; reactionType: number }>("/Reactions/toggle", "post");

  const [enriched, setEnriched] = useState<Record<string, {
    likes: number; dislikes: number; totalReactions: number; commentsCount: number;
    comments?: Message[]; loading?: boolean; error?: boolean; reacting?: boolean;
    userReaction?: 1 | -1 | 0; pinned?: boolean;
  }>>({});

  const [forumStats, setForumStats] = useState<Forum | null>(null);
  const API_BASE =
    process.env.REACT_APP_API_URL || "https://foraria-api-e7dac8bpewbgdpbj.brazilsouth-01.azurewebsites.net/api";

  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    variant: "success" | "error";
    title: string;
    message: string;
  }>({
    open: false,
    variant: "error",
    title: "",
    message: "",
  });

  const [replyErrors, setReplyErrors] = useState<Record<number, string>>({});
  const [deleteCommentDialogOpen, setDeleteCommentDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<{
    threadId: number;
    messageId: number;
  } | null>(null);
  const [deletingComment, setDeletingComment] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState<number | null>(null);
  const [deletingThreadId, setDeletingThreadId] = useState<number | null>(null);
  const [closingThreadId, setClosingThreadId] = useState<number | null>(null);

  useEffect(() => {
    if ((forumsRaw && forumsRaw.length > 0) || (threadsRaw && threadsRaw.length > 0)) {
      setLoadError(null);
    }

    if (errorForums || errorThreads) {
      const errorMsg = String(errorForums || errorThreads);

      const is404 =
        errorMsg.toLowerCase().includes("404") ||
        errorMsg.toLowerCase().includes("not found") ||
        errorMsg.toLowerCase().includes("status code 404");

      const isNotFound =
        errorMsg.toLowerCase().includes("no se encontraron") ||
        errorMsg.toLowerCase().includes("no hay");

      if (is404 || isNotFound) {
        setLoadError(null);
      } else {
        setLoadError("No se pudo cargar el foro. Intentá nuevamente más tarde.");
      }
    }
  }, [forumsRaw, threadsRaw, errorForums, errorThreads]);

  const slugFromPath = useMemo(() => {
    const match = location.pathname.match(/\/forums\/([^/]+)/);
    return match ? match[1] : "general";
  }, [location.pathname]);

  const adminCategory =
    (searchParams.get("category") as keyof typeof ADMIN_TAB_COLORS | null) ||
    "General";
  const setAdminCategory = (cat: string) => setSearchParams({ category: cat });

  const currentCategoryName = useMemo(() => {
    const key = (isAdmin ? adminCategory : slugFromPath).toLowerCase();
    
    const slugToCategoryMap: Record<string, string> = {
      "general": "General",
      "administracion": "Administración",
      "administración": "Administración",
      "seguridad": "Seguridad",
      "mantenimiento": "Mantenimiento",
      "espacios-comunes": "Espacios Comunes",
      "espacios comunes": "Espacios Comunes",
      "garage-parking": "Garage y Parking",
      "garage y parking": "Garage y Parking"
    };
    
    if (slugToCategoryMap[key]) {
      return slugToCategoryMap[key];
    }
    
    if (forumsRaw) {
      const searchSlug = toCategorySlug(key);
      const found = forumsRaw.find((f) => toCategorySlug(f.categoryName) === searchSlug);
      if (found) return found.categoryName;
    }
    
    return "General";
  }, [forumsRaw, isAdmin, adminCategory, slugFromPath]);

  const forumIdsForCategory = useMemo(() => {
    if (!forumsRaw) return new Set<number>();
    
    const key = isAdmin ? adminCategory : slugFromPath;
    
    return new Set(
      forumsRaw
        .filter((f) => {
          const forumSlug = toCategorySlug(f.categoryName);
          const searchSlug = toCategorySlug(key);
          return forumSlug === searchSlug;
        })
        .map((f) => f.id)
    );
  }, [forumsRaw, isAdmin, adminCategory, slugFromPath]);

  const resolvedForumId = useMemo(() => {
    if (!forumsRaw || forumsRaw.length === 0) {
      const categoryToIdMap: Record<string, number> = {
        "General": 0,
        "Administración": 1,
        "Seguridad": 2,
        "Mantenimiento": 3,
        "Espacios Comunes": 4,
        "Garage y Parking": 5,
      };
      return categoryToIdMap[currentCategoryName] ?? 1;
    }
    
    const key = isAdmin ? adminCategory : slugFromPath;
    const searchSlug = toCategorySlug(key);
    
    const found = forumsRaw.find((f) => {
      const forumSlug = toCategorySlug(f.categoryName);
      return forumSlug === searchSlug;
    });
    
    return found ? found.id : null;
  }, [forumsRaw, isAdmin, adminCategory, slugFromPath, currentCategoryName]);

  const postsRaw = useMemo(() => {
    if (!threadsRaw) return [];
    if (!forumsRaw) return threadsRaw;
    return threadsRaw.filter((t) => forumIdsForCategory.has(t.forumId ?? -1));
  }, [threadsRaw, forumsRaw, forumIdsForCategory]);

  useEffect(() => {
    let mounted = true;
    if (!resolvedForumId) {
      setForumStats(null);
      return;
    }
    const controller = new AbortController();
    (async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const headers: Record<string,string> = {
          Accept: 'application/json',
        };
        if (token) headers.Authorization = `Bearer ${token}`;
        
        const res = await fetch(`${API_BASE}/Forum/${resolvedForumId}`, {
          signal: controller.signal,
          headers,
        });
        
        if (!res.ok) {
          console.error('Error en la respuesta:', res.status, res.statusText);
          setForumStats(null);
          return;
        }
        
        const json: Forum = await res.json();
        if (mounted) setForumStats(json);
      } catch (error) {
        console.error('Error fetching forum stats:', error);
        if (mounted) setForumStats(null);
      }
    })();
    return () => { mounted = false; controller.abort(); };
  }, [resolvedForumId, API_BASE]);

  useEffect(() => {
    if (!postsRaw || postsRaw.length === 0) {
      setEnriched({});
      return;
    }
    let mounted = true;
    const controllers: AbortController[] = [];
    const fetchForThread = async (threadId: number) => {
      const key = String(threadId);
      setEnriched((p) => ({
        ...p,
        [key]: { ...(p[key] ?? {}), loading: true, error: false },
      }));
      const ctl = new AbortController();
      controllers.push(ctl);

      let reactions: ReactionResponse = {
        total: 0,
        likes: 0,
        dislikes: 0,
        userReaction: 0,
      };
      try {
        const token = localStorage.getItem("accessToken");
        const headers: Record<string,string> = {
          'Content-Type': 'application/json',
        };
        if (token) headers.Authorization = `Bearer ${token}`;
        const r = await fetch(`${API_BASE}/Reactions/thread/${threadId}`, {
          signal: ctl.signal,
          headers,
        });
        if (r.ok) reactions = await r.json();
      } catch { }

      let messages: Message[] = [];
      try {
        const token = localStorage.getItem("accessToken");
        const headers: Record<string,string> = {
          'Content-Type': 'application/json',
        };
        if (token) headers.Authorization = `Bearer ${token}`;
        const m = await fetch(`${API_BASE}/Message/thread/${threadId}`, {
          signal: ctl.signal,
          headers,
        });
        if (m.ok) messages = await m.json();
      } catch { }

      if (!mounted) return;
      setEnriched((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          likes: reactions?.likes ?? 0,
          dislikes: reactions?.dislikes ?? 0,
          totalReactions: reactions?.total ?? ((reactions?.likes ?? 0) + (reactions?.dislikes ?? 0)),
          commentsCount: Array.isArray(messages) ? messages.length : 0,
          comments: Array.isArray(messages) ? messages : [],
          loading: false,
          error: false,
          reacting: false,
          userReaction: typeof reactions.userReaction === "number" ? reactions.userReaction as 1 | -1 | 0 : 0,
          pinned: prev[key]?.pinned ?? false,
        },
      }));
    };
    postsRaw.forEach((p) => fetchForThread(p.id));
    return () => { mounted = false; controllers.forEach(c => c.abort()); };
  }, [postsRaw, API_BASE]);

  const posts = useMemo(() => {
    if (!postsRaw) return [];
    return postsRaw.map((p) => ({
      id: String(p.id),
      threadId: p.id,
      title: p.theme ?? "Sin título",
      subtitle: `${p.userName ?? "-"} ${p.userLastName} · ${formatDateNumeric(
        p.createdAt
      )}`,
      description: p.description ?? "",
      state: p.state,
      chips: [
        {
          label:
            forumsRaw?.find((f) => f.id === p.forumId)?.categoryName ?? String(p.forumId ?? "-"),
          color:
            p.state === "Activo"
              ? "success"
              : p.state === "Pendiente"
                ? "warning"
                : "default",
        },
      ],
    }));
  }, [postsRaw, forumsRaw]);

  const computedStats = useMemo(() => {
    const totalPosts = posts.length;
    const activeUsers =
      new Set(postsRaw?.map((p) => p.userId).filter(Boolean)).size || 0;
    const totalResponses = Object.values(enriched).reduce(
      (acc, e) => acc + (e?.commentsCount ?? 0),
      0
    );
    const pinned = Object.values(enriched).filter((e) => e?.pinned).length;
    return { totalPosts, activeUsers, totalResponses, pinned };
  }, [posts, postsRaw, enriched]);

  const headerStats = useMemo(
    () => ({
      totalPosts: forumStats?.countThreads ?? computedStats.totalPosts,
      activeUsers: forumStats?.countUserActives ?? computedStats.activeUsers,
      totalResponses:
        forumStats?.countResponses ?? computedStats.totalResponses,
      pinned: computedStats.pinned,
    }),
    [forumStats, computedStats]
  );

  const [expandedThreads, setExpandedThreads] = useState<Set<number>>(new Set());
  const [replyText, setReplyText] = useState<Record<number, string>>({});
  const [sendingReply, setSendingReply] = useState<number | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [threadBeingEdited, setThreadBeingEdited] = useState<{
    id: number;
    title: string;
    description: string;
  } | null>(null);

  const toggleThread = (threadId: number) => {
    setExpandedThreads(prev => {
      const s = new Set(prev);
      s.has(threadId) ? s.delete(threadId) : s.add(threadId);
      return s;
    });
  };

  const togglePinLocal = (threadId: number) => {
    const key = String(threadId);
    setEnriched((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? {}), pinned: !prev[key]?.pinned },
    }));
  };

  const toggleReactionForThread = async (threadId: number, reactionType: 1 | -1) => {
    const key = String(threadId);
    const current =
      enriched[key] ?? {
        likes: 0,
        dislikes: 0,
        totalReactions: 0,
        reacting: false,
        userReaction: 0,
      };
    if (current.reacting) return;
    setEnriched((p) => ({
      ...p,
      [key]: { ...(p[key] ?? {}), reacting: true },
    }));
    const prevUser = current.userReaction ?? 0;
    const willRemove = prevUser === reactionType;
    const newUser = (willRemove ? 0 : reactionType) as 1 | -1 | 0;
    const optimistic = {
      likes: current.likes + (reactionType === 1 ? (willRemove ? -1 : 1) : 0),
      dislikes: current.dislikes + (reactionType === -1 ? (willRemove ? -1 : 1) : 0),
      totalReactions: current.totalReactions + (willRemove ? -1 : 1),
      userReaction: newUser,
    };
    setEnriched((p) => ({
      ...p,
      [key]: { ...(p[key] ?? {}), ...optimistic },
    }));
    try {
      const payload = {
        user_id: currentUserId,
        thread_id: threadId,
        reactionType,
      };
      const result = await toggleMutate(payload);
      if (result && typeof result.likes === "number") {
        setEnriched((p) => ({
          ...p,
          [key]: {
            ...(p[key] ?? {}),
            likes: result.likes,
            dislikes: result.dislikes,
            totalReactions: result.total ?? result.likes + result.dislikes,
            reacting: false,
            error: false,
            userReaction: typeof result.userReaction === "number" ? result.userReaction as 1 | -1 | 0 : newUser,
          },
        }));
        return;
      }
      const token = localStorage.getItem("accessToken");
      const headers: Record<string,string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const reacRes = await fetch(
        `${API_BASE}/Reactions/thread/${threadId}`, {headers}
      );
      if (!reacRes.ok) throw new Error("Reactions fallback failed");
      const reacJson: ReactionResponse = await reacRes.json();
      setEnriched((p) => ({
        ...p,
        [key]: {
          ...(p[key] ?? {}),
          likes: reacJson.likes ?? 0,
          dislikes: reacJson.dislikes ?? 0,
          totalReactions: reacJson.total ?? (reacJson.likes ?? 0) + (reacJson.dislikes ?? 0),
          reacting: false,
          error: false,
          userReaction: typeof reacJson.userReaction === "number" ? reacJson.userReaction as 1 | -1 | 0 : newUser,
        },
      }));
    } catch {
      try {
        const token = localStorage.getItem("accessToken");
        const headers: Record<string,string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const reacRes = await fetch(`${API_BASE}/Reactions/thread/${threadId}`, {headers});
        if (reacRes.ok) {
          const reacJson: ReactionResponse = await reacRes.json();
          setEnriched((p) => ({
            ...p,
            [key]: {
              ...(p[key] ?? {}),
              likes: reacJson.likes ?? 0,
              dislikes: reacJson.dislikes ?? 0,
              totalReactions: reacJson.total ?? (reacJson.likes ?? 0) + (reacJson.dislikes ?? 0),
              reacting: false,
              error: false,
              userReaction: typeof reacJson.userReaction === "number" ? reacJson.userReaction as 1 | -1 | 0 : prevUser,
            },
          }));
        } else {
          setEnriched((p) => ({
            ...p,
            [key]: {
              ...(p[key] ?? {}),
              reacting: false,
              error: true,
              userReaction: prevUser,
            },
          }));
        }
      } catch {
        setEnriched((p) => ({
          ...p,
          [key]: {
            ...(p[key] ?? {}),
            reacting: false,
            error: true,
            userReaction: prevUser,
          },
        }));
      }
    }
  };

  const reloadComments = async (threadId: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      const headers: Record<string,string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers.Authorization = `Bearer ${token}`;
      const listRes = await fetch(
        `${API_BASE}/Message/thread/${threadId}`,
        { headers }
      );

      if (listRes.ok) {
        const messages: Message[] = await listRes.json();
        const key = String(threadId);
        setEnriched((p) => ({
          ...p,
          [key]: {
            ...(p[key] ?? {}),
            commentsCount: messages.length,
            comments: messages,
          },
        }));
      }
    } catch (e) {
      console.error("Error recargando comentarios", e);
    }
  };

  const handleSendReply = async (threadId: number) => {
    const text = replyText[threadId]?.trim() || "";

    if (!text) {
      setReplyErrors((prev) => ({
        ...prev,
        [threadId]: "La respuesta no puede estar vacía.",
      }));
      return;
    }

    setSendingReply(threadId);
    setReplyErrors((prev) => ({
      ...prev,
      [threadId]: "",
    }));

    try {
      const token = localStorage.getItem("accessToken");
      const headers: Record<string,string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      
      const form = new FormData();
      form.append("Content", text);
      form.append("Thread_id", String(threadId));
      form.append("User_id", String(currentUserId));
      form.append("FilePath", "string");

      const fileInput = document.querySelector<HTMLInputElement>("#file");
      if (fileInput && fileInput.files && fileInput.files[0]) {
        form.append("File", fileInput.files[0], fileInput.files[0].name);
      } else {
        form.append("File", new Blob([], { type: "application/octet-stream" }), "empty.bin");
      }

      const res = await fetch(`${API_BASE}/Message`, {
        method: "POST",
        body: form,
        headers
      });

      if (!res.ok) throw new Error("Error al crear mensaje");
      
      setReplyText((p) => ({
        ...p,
        [threadId]: "",
      }));

      await reloadComments(threadId);
    } catch (e) {
      console.error("Error al enviar la respuesta", e);
      setStatusModal({
        open: true,
        variant: "error",
        title: "No se pudo enviar la respuesta",
        message: "No pudimos publicar tu respuesta. Intentá nuevamente más tarde.",
      });
    } finally {
      setSendingReply(null);
    }
  };

  const openDeleteCommentDialog = (threadId: number, messageId: number) => {
    if (!isAdmin && currentUserId === 0) return;
    setCommentToDelete({ threadId, messageId });
    setDeleteCommentDialogOpen(true);
  };

  const handleConfirmDeleteComment = async () => {
    if (!commentToDelete) return;
    const { threadId, messageId } = commentToDelete;

    try {
      setDeletingComment(true);
      await deleteMessageApi(messageId, currentUserId);
      await reloadComments(threadId);

      setStatusModal({
        open: true,
        variant: "success",
        title: "Respuesta eliminada",
        message: "La respuesta se eliminó correctamente.",
      });
    } catch (e) {
      console.error("Error eliminando mensaje", e);
      setStatusModal({
        open: true,
        variant: "error",
        title: "No se pudo eliminar la respuesta",
        message: "No se pudo eliminar la respuesta. Intentá nuevamente más tarde.",
      });
    } finally {
      setDeletingComment(false);
      setDeleteCommentDialogOpen(false);
      setCommentToDelete(null);
    }
  };

  const openDeleteDialog = (threadId: number) => {
    if (!isAdmin) return;
    setThreadToDelete(threadId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteThread = async () => {
    if (!isAdmin) return;
    if (threadToDelete == null) return;

    const threadId = threadToDelete;
    const key = String(threadId);
    const hasReplies = (enriched[key]?.commentsCount ?? 0) > 0;

    if (hasReplies) {
      setStatusModal({
        open: true,
        variant: "error",
        title: "No se puede eliminar el post",
        message:
          "No se puede eliminar un hilo que contiene respuestas. Eliminá primero las respuestas.",
      });
      setDeleteDialogOpen(false);
      setThreadToDelete(null);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      setDeletingThreadId(threadId);
      const headers: Record<string,string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/Thread/${threadId}`, {
        method: "DELETE",
        headers
      });

      if (res.status === 204) {
        const key = String(threadId);

        setEnriched((prev) => {
          const copy = { ...prev };
          delete copy[key];
          return copy;
        });

        setExpandedThreads((prev) => {
          const s = new Set(prev);
          s.delete(threadId);
          return s;
        });

        refetchThreads();

        setStatusModal({
          open: true,
          variant: "success",
          title: "Post eliminado",
          message: "El post se eliminó correctamente.",
        });
      } else if (res.status === 404) {
        refetchThreads();
        setStatusModal({
          open: true,
          variant: "error",
          title: "Post no disponible",
          message: "El post ya no existe o fue eliminado.",
        });
      } else if (res.status === 409) {
        setStatusModal({
          open: true,
          variant: "error",
          title: "No se puede eliminar el post",
          message: "No se puede eliminar un hilo que contiene mensajes.",
        });
      } else {
        console.error("Error al borrar el post:", await res.text());
        setStatusModal({
          open: true,
          variant: "error",
          title: "No se pudo eliminar el post",
          message: "No se pudo borrar el post. Probá de nuevo más tarde.",
        });
      }
    } catch (e) {
      console.error(e);
      setStatusModal({
        open: true,
        variant: "error",
        title: "No se pudo eliminar el post",
        message: "Ocurrió un error al borrar el post. Intentá nuevamente más tarde.",
      });
    } finally {
      setDeletingThreadId(null);
      setDeleteDialogOpen(false);
      setThreadToDelete(null);
    }
  };

  const handleCloseThread = async (threadId: number) => {
    if (!isAdmin) return;

    try {
      const token = localStorage.getItem("accessToken");
      setClosingThreadId(threadId);
      const headers: Record<string,string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/Thread/${threadId}/close`, {
        method: "PATCH",
        headers
      });

      if (res.status === 409) {
        setStatusModal({
          open: true,
          variant: "error",
          title: "Hilo ya cerrado",
          message: "Este hilo ya se encuentra cerrado.",
        });
        await refetchThreads();
        return;
      }

      if (!res.ok) {
        console.error("Error al cerrar el hilo:", await res.text());
        setStatusModal({
          open: true,
          variant: "error",
          title: "No se pudo cerrar el hilo",
          message: "No se pudo cerrar el hilo. Probá de nuevo más tarde.",
        });
        return;
      }

      setStatusModal({
        open: true,
        variant: "success",
        title: "Hilo cerrado",
        message: "El hilo se cerró correctamente.",
      });
      await refetchThreads();
    } catch (e) {
      console.error(e);
      setStatusModal({
        open: true,
        variant: "error",
        title: "No se pudo cerrar el hilo",
        message: "Ocurrió un error al cerrar el hilo. Intentá nuevamente más tarde.",
      });
    } finally {
      setClosingThreadId(null);
    }
  };

  const openEditDialog = (thread: {
    threadId: number;
    title: string;
    description: string;
  }) => {
    if (!isAdmin) return;
    setThreadBeingEdited({
      id: thread.threadId,
      title: thread.title,
      description: thread.description,
    });
    setEditOpen(true);
  };

  const renderThread = (thread: any) => {
    const key = String(thread.threadId);
    const meta =
      enriched[key] ?? {
        likes: 0,
        dislikes: 0,
        totalReactions: 0,
        commentsCount: 0,
        comments: [],
        userReaction: 0,
      };
    const isExpanded = expandedThreads.has(thread.threadId);
    const isClosed =
      typeof thread.state === "string" &&
      thread.state.toLowerCase() === "cerrado";
    const hasReplies = (meta.commentsCount ?? 0) > 0;

    return (
      <Card
        key={thread.id}
        variant="outlined"
        sx={{
          borderRadius: 3,
          transition: "all .2s",
          "&:hover": { boxShadow: 2, transform: "translateY(-1px)" },
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box sx={{ flex: 1 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ mb: 1 }}
                >
                  <Typography variant="h6" color="primary">
                    {thread.title}
                  </Typography>
                  {thread.chips.map((chip: any, i: number) => (
                    <Chip
                      key={`${chip.label}-${i}`}
                      label={chip.label}
                      color={chip.color}
                      size="small"
                    />
                  ))}

                  {isAdmin && meta.pinned && (
                    <Chip label="Fijado" size="small" color="warning" />
                  )}
                </Stack>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {thread.subtitle}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {thread.description}
                </Typography>
              </Box>

              {isAdmin && (
                <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
                  <IconButton
                    size="small"
                    onClick={() => {}}
                    sx={{ color: "primary.main" }}
                  >
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => togglePinLocal(thread.threadId)}
                    sx={{ color: "warning.main" }}
                  >
                    {meta.pinned ? (
                    ) : (
                    )}
                  </IconButton>

                  <IconButton
                    size="small"
                    onClick={() => handleCloseThread(thread.threadId)}
                    sx={{
                      color: isClosed ? "text.secondary" : "warning.main",
                    }}
                    disabled={
                      closingThreadId === thread.threadId || isClosed
                    }
                  >
                  </IconButton>

                  <IconButton
                    size="small"
                    onClick={() =>
                      openEditDialog({
                        threadId: thread.threadId,
                        title: thread.title,
                        description: thread.description,
                      })
                    }
                    sx={{ color: "info.main" }}
                  >
                    <EditOutlined fontSize="small" />
                  </IconButton>

                  <IconButton
                    size="small"
                    onClick={() => openDeleteDialog(thread.threadId)}
                    sx={{ color: "error.main" }}
                    disabled={
                      deletingThreadId === thread.threadId || hasReplies
                    }
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </Stack>
              )}
            </Stack>

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  size="small"
                  startIcon={
                    <ThumbUpIcon
                      sx={{
                        color:
                          meta.userReaction === 1 ? "success.main" : undefined,
                      }}
                    />
                  }
                  onClick={() =>
                    !meta.reacting && toggleReactionForThread(thread.threadId, 1)
                  }
                  disabled={!!meta.reacting}
                  sx={{ minWidth: "auto", px: 1 }}
                >
                  {meta.likes}
                </Button>
                <Button
                  size="small"
                  startIcon={
                    <ThumbDownIcon
                      sx={{
                        color:
                          meta.userReaction === -1
                            ? "error.main"
                            : undefined,
                      }}
                    />
                  }
                  onClick={() =>
                    !meta.reacting &&
                    toggleReactionForThread(thread.threadId, -1)
                  }
                  disabled={!!meta.reacting}
                  sx={{ minWidth: "auto", px: 1 }}
                >
                  {meta.dislikes}
                </Button>

                <Button
                  size="small"
                  startIcon={<ChatIcon />}
                  endIcon={
                    isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />
                  }
                  onClick={() => toggleThread(thread.threadId)}
                  sx={{ textTransform: "none" }}
                >
                  {meta.commentsCount}{" "}
                  {meta.commentsCount === 1 ? "respuesta" : "respuestas"}
                </Button>
              </Stack>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ReplyIcon />}
                onClick={() => toggleThread(thread.threadId)}
                sx={{ textTransform: "none" }}
              >
                Responder
              </Button>
            </Stack>

            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ mb: 2 }} />
                {meta.loading ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", py: 2 }}
                  >
                    <CircularProgress size={24} />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      Cargando mensajes...
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={1}>
                    {meta.comments && meta.comments.length > 0 ? (
                      <Box sx={{ position: "relative", pl: 2 }}>
                        <Box
                          sx={{
                            position: "absolute",
                            left: 20,
                            top: 40,
                            bottom:
                              meta.comments.length > 1 ? 60 : 40,
                            width: 3,
                            bgcolor: "primary.main",
                            opacity: 0.4,
                            borderRadius: 1.5,
                          }}
                        />
                        {meta.comments.map(
                          (comment: Message, index: number) => {
                            const canEdit =
                              isAdmin ||
                              comment.user_id === currentUserId;

                            return (
                              <Box
                                key={comment.id}
                                sx={{
                                  position: "relative",
                                  ml: index === 0 ? 0 : 3,
                                  mb: 2,
                                }}
                              >
                                {index > 0 && (
                                  <Box
                                    sx={{
                                      position: "absolute",
                                      left: -26,
                                      top: 24,
                                      width: 20,
                                      height: 3,
                                      bgcolor: "secondary.main",
                                      opacity: 0.6,
                                      borderRadius: 1.5,
                                    }}
                                  />
                                )}
                                {index > 0 && (
                                  <Box
                                    sx={{
                                      position: "absolute",
                                      left: -28,
                                      top: 22,
                                      width: 8,
                                      height: 8,
                                      bgcolor: "secondary.main",
                                      borderRadius: "50%",
                                      border: "2px solid white",
                                    }}
                                  />
                                )}

                                {canEdit && (
                                  <Stack
                                    direction="row"
                                    spacing={0.5}
                                    sx={{
                                      position: "absolute",
                                      top: 8,
                                      right: 8,
                                      zIndex: 1,
                                    }}
                                  >
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        setEditingMessage(comment)
                                      }
                                    >
                                      <EditOutlined fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        openDeleteCommentDialog(
                                          thread.threadId,
                                          comment.id
                                        )
                                      }
                                    >
                                      <DeleteOutline fontSize="small" />
                                    </IconButton>
                                  </Stack>
                                )}

                                <Paper
                                  variant="outlined"
                                  sx={{
                                    p: 2,
                                    bgcolor:
                                      comment.user_id === currentUserId
                                        ? "primary.50"
                                        : "grey.50",
                                    borderLeft:
                                      index === 0
                                        ? "4px solid"
                                        : "3px solid",
                                    borderLeftColor:
                                      index === 0
                                        ? "primary.main"
                                        : "secondary.main",
                                    borderRadius: 2,
                                  }}
                                >
                                  <Stack
                                    direction="row"
                                    spacing={2}
                                  >
                                    <Avatar
                                      sx={{
                                        width: 36,
                                        height: 36,
                                        bgcolor:
                                          comment.user_id ===
                                          currentUserId
                                            ? "secondary.main"
                                            : "primary.main",
                                      }}
                                    >
                                      U{comment.user_id}
                                    </Avatar>

                                    <Box sx={{ flex: 1 }}>
                                      <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                        sx={{ mb: 1 }}
                                      >
                                        <Typography
                                          variant="subtitle2"
                                          color="primary"
                                          sx={{ fontWeight: 600 }}
                                        >
                                          Usuario {comment.user_id}
                                        </Typography>

                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          {formatDateNumeric(
                                            comment.createdAt
                                          )}
                                        </Typography>
                                      </Stack>

                                      <Typography
                                        variant="body2"
                                        sx={{ lineHeight: 1.6 }}
                                      >
                                        {comment.content}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                </Paper>
                              </Box>
                            );
                          }
                        )}
                      </Box>
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          textAlign: "center",
                          py: 4,
                        }}
                      >
                        No hay respuestas aún. ¡Sé el primero en comentar!
                      </Typography>
                    )}

                    {isClosed ? (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ textAlign: "center", py: 3 }}
                      >
                        Este hilo está cerrado. No se pueden agregar
                        nuevas respuestas.
                      </Typography>
                    ) : (
                      <Box
                        sx={{
                          mt: 3,
                          ml: 5,
                          position: "relative",
                        }}
                      >
                        {meta.comments &&
                          meta.comments.length > 0 && (
                            <>
                              <Box
                                sx={{
                                  position: "absolute",
                                  left: -28,
                                  top: 24,
                                  width: 24,
                                  height: 3,
                                  bgcolor: "success.main",
                                  opacity: 0.7,
                                  borderRadius: 1.5,
                                }}
                              />
                              <Box
                                sx={{
                                  position: "absolute",
                                  left: -30,
                                  top: 22,
                                  width: 8,
                                  height: 8,
                                  bgcolor: "success.main",
                                  borderRadius: "50%",
                                  border: "2px solid white",
                                }}
                              />
                            </>
                          )}

                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            borderLeft: "3px solid",
                            borderLeftColor: "success.main",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="flex-start"
                          >
                            <Avatar
                              sx={{
                                width: 36,
                                height: 36,
                                bgcolor: "success.main",
                              }}
                            >
                              U{currentUserId}
                            </Avatar>

                            <Box sx={{ flex: 1 }}>
                              <TextField
                                fullWidth
                                multiline
                                minRows={2}
                                maxRows={6}
                                placeholder="Escribe tu respuesta..."
                                value={replyText[thread.threadId] || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setReplyText((p) => ({
                                    ...p,
                                    [thread.threadId]: value,
                                  }));
                                  if (replyErrors[thread.threadId]) {
                                    setReplyErrors((prev) => ({
                                      ...prev,
                                      [thread.threadId]: "",
                                    }));
                                  }
                                }}
                                variant="outlined"
                                size="small"
                                disabled={
                                  sendingReply === thread.threadId
                                }
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" &&
                                    (e.ctrlKey || e.metaKey)
                                  ) {
                                    e.preventDefault();
                                    handleSendReply(thread.threadId);
                                  }
                                }}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                  },
                                }}
                              />

                              {replyErrors[thread.threadId] && (
                                <Typography
                                  variant="caption"
                                  color="error"
                                  sx={{ mt: 0.5, display: "block" }}
                                >
                                  {replyErrors[thread.threadId]}
                                </Typography>
                              )}

                              <Stack
                                direction="row"
                                justifyContent="flex-end"
                                alignItems="center"
                                sx={{ mt: 1 }}
                              >
                                <Button
                                  variant="contained"
                                  color="success"
                                  endIcon={
                                    sendingReply === thread.threadId ? (
                                      <CircularProgress size={16} />
                                    ) : (
                                      <SendIcon />
                                    )
                                  }
                                  onClick={() =>
                                    handleSendReply(thread.threadId)
                                  }
                                  disabled={
                                    sendingReply === thread.threadId
                                  }
                                  sx={{
                                    borderRadius: 999,
                                    px: 3,
                                  }}
                                >
                                  {sendingReply === thread.threadId
                                    ? "Enviando..."
                                    : "Enviar"}
                                </Button>
                              </Stack>
                            </Box>
                          </Stack>
                        </Paper>
                      </Box>
                    )}
                  </Stack>
                )}
              </Box>
            </Collapse>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  const currentTabKey = isAdmin ? adminCategory : currentCategoryName;

  return (
    <Box className="foraria-page-container" sx={{ ml: 0 }}>
      <PageHeader
        title={`Foro - ${currentCategoryName}`}
        actions={
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            sx={{ borderRadius: 999, fontWeight: 600 }}
          >
            Nuevo Post
          </Button>
        }
        stats={[
          {
            icon: <ChatIcon color="action" />,
            title: "Posts Totales",
            value: String(headerStats.totalPosts),
            color: "primary",
          },
          {
            icon: <GroupsIcon color="action" />,
            title: "Participantes",
            value: String(headerStats.activeUsers),
            color: "success",
          },
          {
            icon: <TrendingIcon color="action" />,
            title: "Respuestas",
            value: String(headerStats.totalResponses),
            color: "secondary",
          },
        ]}
        tabs={CATEGORY_LABELS.map((c) => ({ label: c, value: c }))}
        selectedTab={currentTabKey}
        onTabChange={(v) => {
          if (isAdmin) {
            setAdminCategory(v);
          } else {
            const slug = toCategorySlug(v);
            navigate(`/forums/${slug}`);
          }
        }}
      />

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {loadError && !loading && (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            border: "1px dashed #d0d0d0",
            borderRadius: 3,
            backgroundColor: "#fafafa",
          }}
        >
          <ChatIcon
            sx={{ fontSize: 80, color: "text.disabled", mb: 2 }}
          />
          <Typography variant="h5" color="text.primary" gutterBottom>
            Error al cargar el foro
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            {loadError}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              refetchForums();
              refetchThreads();
            }}
            sx={{ mt: 1 }}
          >
            Reintentar
          </Button>
        </Paper>
      )}

      {!loading && !loadError && posts.length === 0 && (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            border: "1px dashed #d0d0d0",
            borderRadius: 3,
            backgroundColor: "#fafafa",
          }}
        >
          <ChatIcon
            sx={{ fontSize: 80, color: "text.disabled", mb: 2 }}
          />
          <Typography variant="h5" color="text.primary" gutterBottom>
            No hay posts en {currentCategoryName}
          </Typography>
          
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            Aún no se han creado posts en esta categoría.
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            ¡Sé el primero en crear un post!
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
          >
            Crear primer post
          </Button>
        </Paper>
      )}

      {!loading && !loadError && posts.length > 0 && (
        <Stack spacing={2}>{posts.map(renderThread)}</Stack>
      )}
     
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <NewPost
            onClose={() => setOpen(false)}
            forumId={resolvedForumId ?? 1}
            userId={currentUserId}
            onCreated={() => {
              refetchThreads();
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {threadBeingEdited ? (
            <EditThread
              onClose={() => setEditOpen(false)}
              threadId={threadBeingEdited.id}
              initialTitle={threadBeingEdited.title}
              initialDescription={threadBeingEdited.description}
              userId={currentUserId}
              onUpdated={() => {
                refetchThreads();
                setEditOpen(false);
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingMessage}
        onClose={() => setEditingMessage(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          {editingMessage ? (
            <EditMessage
              messageId={editingMessage.id}
              initialContent={editingMessage.content}
              onClose={() => setEditingMessage(null)}
              onUpdated={async () => {
                await reloadComments(editingMessage.thread_id);
                setEditingMessage(null);
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          if (!deletingThreadId) {
            setDeleteDialogOpen(false);
            setThreadToDelete(null);
          }
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Eliminar post</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 1 }}>
            ¿Seguro que querés eliminar este post?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Solo se pueden eliminar hilos que no tengan respuestas.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setThreadToDelete(null);
            }}
            disabled={!!deletingThreadId}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteThread}
            disabled={!!deletingThreadId}
            startIcon={
              deletingThreadId ? (
                <CircularProgress size={16} />
              ) : (
                <DeleteOutline />
              )
            }
          >
            {deletingThreadId ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteCommentDialogOpen}
        onClose={() => {
          if (!deletingComment) {
            setDeleteCommentDialogOpen(false);
            setCommentToDelete(null);
          }
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Eliminar respuesta</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 1 }}>
            ¿Seguro que querés eliminar esta respuesta?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setDeleteCommentDialogOpen(false);
              setCommentToDelete(null);
            }}
            disabled={deletingComment}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDeleteComment}
            disabled={deletingComment}
            startIcon={
              deletingComment ? ( <CircularProgress size={16} /> ) : ( <DeleteOutline /> )
            }
          >
            {deletingComment ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      <ForariaStatusModal
        open={statusModal.open}
        onClose={() =>
          setStatusModal((prev) => ({
            ...prev,
            open: false,
          }))
        }
        variant={statusModal.variant}
        title={statusModal.title}
        message={statusModal.message}
        primaryActionLabel="Aceptar"
      />
    </Box>
  );
};

export default Forums;