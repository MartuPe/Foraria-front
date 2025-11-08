// src/pages/Forums.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Card, CardContent, Typography, Chip, Button, Stack, Dialog, DialogContent,
  CircularProgress, Avatar, TextField, Collapse, Divider, Paper, IconButton, Tabs, Tab
} from "@mui/material";
import {
  Add as AddIcon, ChatBubbleOutline as ChatIcon, Groups as GroupsIcon,
  TrendingUp as TrendingIcon, ThumbUp as ThumbUpIcon, ThumbDown as ThumbDownIcon,
  Reply as ReplyIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon,
  Send as SendIcon, VisibilityOutlined, PushPinOutlined, PushPin,
  EditOutlined, DeleteOutline, FilterList as FilterListIcon
} from "@mui/icons-material";
import PageHeader from "../components/SectionHeader";
import NewPost from "../components/modals/NewPost";
import { useLocation, useSearchParams } from "react-router-dom";
import { useGet } from "../hooks/useGet";
import { useMutation } from "../hooks/useMutation";
import { storage } from "../utils/storage";
import { Role } from "../constants/roles";

interface Thread {
  id: number;
  theme: string;
  description: string;
  createdAt: string;
  state: string;
  userId?: number;
  forumId?: number;
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

function toSlug(text: string) {
  return text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

const ADMIN_TAB_COLORS: Record<string, string> = {
  Todas: "#666666",
  General: "#1472c4ff",
  Administración: "#5caeffff",
  Seguridad: "#ef5350",
  Mantenimiento: "#ff9800",
  "Espacios Comunes": "#179e8cff",
  "Garage y Parking": "#7e57c2",
};

const Forums: React.FC = () => {
  const { data: forumsRaw, loading: loadingForums, error: errorForums, refetch: refetchForums } = useGet<Forum[]>("/Forum");
  const { data: threadsRaw, loading: loadingThreads, error: errorThreads, refetch: refetchThreads } = useGet<Thread[]>("/Thread");
  const loading = loadingForums || loadingThreads;
  const error = !!errorForums || !!errorThreads;

  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isAdminRole = storage.role === Role.ADMIN || storage.role === Role.CONSORCIO;
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
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:7245/api";

  // ====== CATEGORÍA por URL (usuario) o por tabs (admin) ======
  const slugFromPath = useMemo(() => {
    const match = location.pathname.match(/\/forums\/([^/]+)/);
    return match ? match[1] : "general";
  }, [location.pathname]);

  const adminCategory = (searchParams.get("category") as keyof typeof ADMIN_TAB_COLORS | null) || "Todas";
  const setAdminCategory = (cat: string) => setSearchParams({ category: cat });

  const currentCategoryName = useMemo(() => {
    if (!forumsRaw) {
      switch ((isAdmin ? adminCategory : slugFromPath)) {
        case "administracion": case "Administración": return "Administración";
        case "seguridad": case "Seguridad": return "Seguridad";
        case "mantenimiento": case "Mantenimiento": return "Mantenimiento";
        case "espacios-comunes": case "Espacios Comunes": return "Espacios Comunes";
        case "garage-parking": case "Garage y Parking": return "Garage y Parking";
        case "Todas": return "Todas";
        default: return "General";
      }
    }
    const key = isAdmin ? adminCategory : slugFromPath;
    if (key === "Todas") return "Todas";
    const found = forumsRaw.find((f) => toSlug(f.categoryName) === toSlug(key));
    return found?.categoryName ?? "General";
  }, [forumsRaw, isAdmin, adminCategory, slugFromPath]);

  // ids de foros para la categoría actual
  const forumIdsForCategory = useMemo(() => {
    if (!forumsRaw) return new Set<number>();
    if (isAdmin && adminCategory === "Todas") {
      return new Set(forumsRaw.map(f => f.id));
    }
    const key = isAdmin ? adminCategory : slugFromPath;
    return new Set(
      forumsRaw.filter((f) => toSlug(f.categoryName) === toSlug(key)).map((f) => f.id)
    );
  }, [forumsRaw, isAdmin, adminCategory, slugFromPath]);

  // resolved forumId (para crear post): primer foro de la categoría actual
  const resolvedForumId = useMemo(() => {
    if (!forumsRaw) return null;
    if (isAdmin && adminCategory === "Todas") return forumsRaw[0]?.id ?? null;
    const key = isAdmin ? adminCategory : slugFromPath;
    const found = forumsRaw.find((f) => toSlug(f.categoryName) === toSlug(key));
    return found ? found.id : null;
  }, [forumsRaw, isAdmin, adminCategory, slugFromPath]);

  // threads filtrados por categoría actual
  const postsRaw = useMemo(() => {
    if (!threadsRaw) return [];
    if (!forumsRaw) return threadsRaw;
    return threadsRaw.filter((t) => forumIdsForCategory.has(t.forumId ?? -1));
  }, [threadsRaw, forumsRaw, forumIdsForCategory]);

  // ====== Stats del foro (si hay forum resuelto) ======
  useEffect(() => {
    let mounted = true;
    if (!resolvedForumId) { setForumStats(null); return; }
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/Forum/${resolvedForumId}`, { signal: controller.signal });
        if (!res.ok) { setForumStats(null); return; }
        const json: Forum = await res.json();
        if (mounted) setForumStats(json);
      } catch { if (mounted) setForumStats(null); }
    })();
    return () => { mounted = false; controller.abort(); };
  }, [resolvedForumId, API_BASE]);

  // ====== Reacciones + mensajes por thread ======
  useEffect(() => {
    if (!postsRaw || postsRaw.length === 0) { setEnriched({}); return; }
    let mounted = true;
    const controllers: AbortController[] = [];
    const fetchForThread = async (threadId: number) => {
      const key = String(threadId);
      setEnriched((p) => ({ ...p, [key]: { ...(p[key] ?? {}), loading: true, error: false } }));
      const ctl = new AbortController(); controllers.push(ctl);
      // reactions
      let reactions: ReactionResponse = { total: 0, likes: 0, dislikes: 0, userReaction: 0 };
      try {
        const r = await fetch(`${API_BASE}/Reactions/thread/${threadId}`, { signal: ctl.signal, headers: { "Content-Type": "application/json" } });
        if (r.ok) reactions = await r.json();
      } catch {}
      // messages
      let messages: Message[] = [];
      try {
        const m = await fetch(`${API_BASE}/Message/thread/${threadId}`, { signal: ctl.signal, headers: { "Content-Type": "application/json" } });
        if (m.ok) messages = await m.json();
      } catch {}
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

  // ====== Proyección de posts para UI ======
  const posts = useMemo(() => {
    if (!postsRaw) return [];
    return postsRaw.map((p) => ({
      id: String(p.id),
      threadId: p.id,
      title: p.theme ?? "Sin título",
      subtitle: `Usuario ${p.userId ?? "-"} · ${formatDateNumeric(p.createdAt)}`,
      description: p.description ?? "",
      chips: [{
        label: (forumsRaw?.find((f) => f.id === p.forumId)?.categoryName) ?? String(p.forumId ?? "-"),
        color: p.state === "Activo" ? "success" : p.state === "Pendiente" ? "warning" : "default",
      }],
    }));
  }, [postsRaw, forumsRaw]);

  // ====== KPIs ======
  const computedStats = useMemo(() => {
    const totalPosts = posts.length;
    const activeUsers = new Set(postsRaw?.map((p) => p.userId).filter(Boolean)).size || 0;
    const totalResponses = Object.values(enriched).reduce((acc, e) => acc + (e?.commentsCount ?? 0), 0);
    const pinned = Object.values(enriched).filter(e => e?.pinned).length;
    return { totalPosts, activeUsers, totalResponses, pinned };
  }, [posts, postsRaw, enriched]);

  const headerStats = useMemo(() => ({
    totalPosts: forumStats?.countThreads ?? computedStats.totalPosts,
    activeUsers: forumStats?.countUserActives ?? computedStats.activeUsers,
    totalResponses: forumStats?.countResponses ?? computedStats.totalResponses,
    pinned: computedStats.pinned,
  }), [forumStats, computedStats]);

  // ====== Reacciones ======
  const [expandedThreads, setExpandedThreads] = useState<Set<number>>(new Set());
  const [replyText, setReplyText] = useState<Record<number, string>>({});
  const [sendingReply, setSendingReply] = useState<number | null>(null);
  const { mutate: sendReply } = useMutation("/Message", "post");

  const toggleThread = (threadId: number) => {
    setExpandedThreads(prev => {
      const s = new Set(prev);
      s.has(threadId) ? s.delete(threadId) : s.add(threadId);
      return s;
    });
  };

  const togglePinLocal = (threadId: number) => {
    const key = String(threadId);
    setEnriched(prev => ({ ...prev, [key]: { ...(prev[key] ?? {}), pinned: !prev[key]?.pinned } }));
  };

  const toggleReactionForThread = async (threadId: number, reactionType: 1 | -1) => {
    const key = String(threadId);
    const current = enriched[key] ?? { likes: 0, dislikes: 0, totalReactions: 0, reacting: false, userReaction: 0 };
    if (current.reacting) return;
    setEnriched((p) => ({ ...p, [key]: { ...(p[key] ?? {}), reacting: true } }));
    const prevUser = current.userReaction ?? 0;
    const willRemove = prevUser === reactionType;
    const newUser = (willRemove ? 0 : reactionType) as 1 | -1 | 0;
    const optimistic = {
      likes: current.likes + (reactionType === 1 ? (willRemove ? -1 : 1) : 0),
      dislikes: current.dislikes + (reactionType === -1 ? (willRemove ? -1 : 1) : 0),
      totalReactions: current.totalReactions + (willRemove ? -1 : 1),
      userReaction: newUser,
    };
    setEnriched((p) => ({ ...p, [key]: { ...(p[key] ?? {}), ...optimistic } }));
    try {
      const payload = { user_id: currentUserId, thread_id: threadId, reactionType };
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
      const reacRes = await fetch(`${API_BASE}/Reactions/thread/${threadId}`);
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
        const reacRes = await fetch(`${API_BASE}/Reactions/thread/${threadId}`);
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
          setEnriched((p) => ({ ...p, [key]: { ...(p[key] ?? {}), reacting: false, error: true, userReaction: prevUser } }));
        }
      } catch {
        setEnriched((p) => ({ ...p, [key]: { ...(p[key] ?? {}), reacting: false, error: true, userReaction: prevUser } }));
      }
    }
  };

  const handleSendReply = async (threadId: number) => {
    const text = replyText[threadId]?.trim();
    if (!text || sendingReply === threadId) return;
    setSendingReply(threadId);
    try {
      const messageData = { Content: text, Thread_id: threadId, User_id: currentUserId };
      await sendReply(messageData);
      setReplyText((p) => ({ ...p, [threadId]: "" }));
      const key = String(threadId);
      setEnriched((p) => ({ ...p, [key]: { ...(p[key] ?? {}), loading: true } }));
      setTimeout(async () => {
        try {
          const res = await fetch(`${API_BASE}/Message/thread/${threadId}`, { headers: { "Content-Type": "application/json" } });
          if (res.ok) {
            const messages: Message[] = await res.json();
            setEnriched((p) => ({
              ...p,
              [key]: { ...(p[key] ?? {}), commentsCount: messages.length, comments: messages, loading: false },
            }));
          } else {
            setEnriched((p) => ({ ...p, [key]: { ...(p[key] ?? {}), loading: false } }));
          }
        } catch {
          setEnriched((p) => ({ ...p, [key]: { ...(p[key] ?? {}), loading: false } }));
        }
      }, 800);
    } catch (e: any) {
      alert(`Error al enviar la respuesta: ${e?.message || "desconocido"}`);
    } finally {
      setSendingReply(null);
    }
  };

  // ====== Render de cada thread ======
  const renderThread = (thread: any) => {
    const key = String(thread.threadId);
    const meta = enriched[key] ?? { likes: 0, dislikes: 0, totalReactions: 0, commentsCount: 0, comments: [], userReaction: 0 };
    const isExpanded = expandedThreads.has(thread.threadId);

    return (
      <Card key={thread.id} variant="outlined" sx={{ borderRadius: 3, transition: "all .2s", "&:hover": { boxShadow: 2, transform: "translateY(-1px)" } }}>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Typography variant="h6" color="primary">{thread.title}</Typography>
                  {thread.chips.map((chip: any, i: number) => (
                    <Chip key={`${chip.label}-${i}`} label={chip.label} color={chip.color} size="small" />
                  ))}
                  {isAdmin && (meta.pinned ? <Chip label="Fijado" size="small" color="warning" /> : null)}
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{thread.subtitle}</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{thread.description}</Typography>
              </Box>

              {isAdmin && (
                <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
                  <IconButton size="small" onClick={() => {/* vista detalle */}} sx={{ color: "primary.main" }}>
                    <VisibilityOutlined fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => togglePinLocal(thread.threadId)} sx={{ color: "warning.main" }}>
                    {meta.pinned ? <PushPin fontSize="small" /> : <PushPinOutlined fontSize="small" />}
                  </IconButton>
                  <IconButton size="small" onClick={() => {/* editar */}} sx={{ color: "info.main" }}>
                    <EditOutlined fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => {/* borrar */}} sx={{ color: "error.main" }}>
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </Stack>
              )}
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={2} alignItems="center">
                <Button size="small" startIcon={<ThumbUpIcon sx={{ color: meta.userReaction === 1 ? "success.main" : undefined }} />}
                        onClick={() => !meta.reacting && toggleReactionForThread(thread.threadId, 1)} disabled={!!meta.reacting} sx={{ minWidth: "auto", px: 1 }}>
                  {meta.likes}
                </Button>
                <Button size="small" startIcon={<ThumbDownIcon sx={{ color: meta.userReaction === -1 ? "error.main" : undefined }} />}
                        onClick={() => !meta.reacting && toggleReactionForThread(thread.threadId, -1)} disabled={!!meta.reacting} sx={{ minWidth: "auto", px: 1 }}>
                  {meta.dislikes}
                </Button>
                <Button size="small" startIcon={<ChatIcon />} endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        onClick={() => toggleThread(thread.threadId)} sx={{ textTransform: "none" }}>
                  {meta.commentsCount} {meta.commentsCount === 1 ? "respuesta" : "respuestas"}
                </Button>
              </Stack>
              <Button variant="outlined" size="small" startIcon={<ReplyIcon />} onClick={() => toggleThread(thread.threadId)} sx={{ textTransform: "none" }}>
                Responder
              </Button>
            </Stack>

            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ mb: 2 }} />
                {meta.loading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" sx={{ ml: 1 }}>Cargando mensajes...</Typography>
                  </Box>
                ) : (
                  <Stack spacing={1}>
                    {meta.comments && meta.comments.length > 0 ? (
                      <Box sx={{ position: "relative", pl: 2 }}>
                        <Box sx={{ position: "absolute", left: 20, top: 40, bottom: meta.comments.length > 1 ? 60 : 40, width: 3, bgcolor: "primary.main", opacity: .4, borderRadius: 1.5 }} />
                        {meta.comments.map((comment: Message, index: number) => (
                          <Box key={comment.id} sx={{ position: "relative", ml: index === 0 ? 0 : 3, mb: 2 }}>
                            {index > 0 && (<Box sx={{ position: "absolute", left: -26, top: 24, width: 20, height: 3, bgcolor: "secondary.main", opacity: .6, borderRadius: 1.5 }} />)}
                            {index > 0 && (<Box sx={{ position: "absolute", left: -28, top: 22, width: 8, height: 8, bgcolor: "secondary.main", borderRadius: "50%", border: "2px solid white" }} />)}
                            <Paper variant="outlined" sx={{ p: 2, bgcolor: comment.user_id === currentUserId ? "primary.50" : "grey.50",
                              borderLeft: index === 0 ? "4px solid" : "3px solid", borderLeftColor: index === 0 ? "primary.main" : "secondary.main", borderRadius: 2 }}>
                              <Stack direction="row" spacing={2}>
                                <Avatar sx={{ width: 36, height: 36, bgcolor: comment.user_id === currentUserId ? "secondary.main" : "primary.main" }}>
                                  U{comment.user_id}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                    <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>Usuario {comment.user_id}</Typography>
                                    <Typography variant="caption" color="text.secondary">{formatDateNumeric(comment.createdAt)}</Typography>
                                    {comment.user_id === currentUserId && <Chip label="Tú" size="small" color="secondary" sx={{ height: 20, fontSize: ".7rem" }} />}
                                    {index === 0 && <Chip label="OP" size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: ".7rem" }} />}
                                  </Stack>
                                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{comment.content}</Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                        No hay respuestas aún. ¡Sé el primero en comentar!
                      </Typography>
                    )}

                    {/* Nueva respuesta */}
                    <Box sx={{ mt: 3, ml: 5, position: "relative" }}>
                      {meta.comments && meta.comments.length > 0 && (
                        <>
                          <Box sx={{ position: "absolute", left: -28, top: 24, width: 24, height: 3, bgcolor: "success.main", opacity: .7, borderRadius: 1.5 }} />
                          <Box sx={{ position: "absolute", left: -30, top: 22, width: 8, height: 8, bgcolor: "success.main", borderRadius: "50%", border: "2px solid white" }} />
                        </>
                      )}
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderLeft: "3px solid", borderLeftColor: "success.main" }}>
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                          <Avatar sx={{ width: 36, height: 36, bgcolor: "success.main" }}>U{currentUserId}</Avatar>
                          <Box sx={{ flex: 1 }}>
                            <TextField
                              fullWidth multiline minRows={2} maxRows={6} placeholder="Escribe tu respuesta..."
                              value={replyText[thread.threadId] || ""}
                              onChange={(e) => setReplyText((p) => ({ ...p, [thread.threadId]: e.target.value }))}
                              variant="outlined" size="small"
                              disabled={sendingReply === thread.threadId}
                              onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSendReply(thread.threadId); } }}
                              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                            />
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                              <Typography variant="caption" color="text.secondary">Tip: Ctrl + Enter para enviar</Typography>
                              <Button variant="contained" color="success"
                                endIcon={sendingReply === thread.threadId ? <CircularProgress size={16} /> : <SendIcon />}
                                onClick={() => handleSendReply(thread.threadId)}
                                disabled={!replyText[thread.threadId]?.trim() || sendingReply === thread.threadId}
                                sx={{ borderRadius: 999, px: 3 }}>
                                {sendingReply === thread.threadId ? "Enviando..." : "Enviar"}
                              </Button>
                            </Stack>
                          </Box>
                        </Stack>
                      </Paper>
                    </Box>
                  </Stack>
                )}
              </Box>
            </Collapse>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  // ====== UI ======
  return (
    <Box className="foraria-page-container" sx={{ ml: 0 }}>
      <PageHeader
        title={`Foro ${currentCategoryName !== "Todas" ? `- ${currentCategoryName}` : ""}`}
        tabs={!isAdmin ? [
          { label: "Todos", value: "todos" },
          { label: "Populares", value: "populares" },
          { label: "Recientes", value: "recientes" },
        ] : undefined}
        selectedTab={!isAdmin ? "todos" : undefined}
        onTabChange={!isAdmin ? () => {} : undefined}
        actions={
          <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => setOpen(true)} sx={{ borderRadius: 999, fontWeight: 600 }}>
            Nuevo Post
          </Button>
        }
      />

      {/* KPIs (solo admin) */}
      {isAdmin && (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
          <Card variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
            <CardContent><Stack direction="row" alignItems="center" spacing={1}>
              <ChatIcon color="primary" /><Box><Typography variant="overline" color="text.secondary">Posts Totales</Typography><Typography variant="h6">{headerStats.totalPosts}</Typography></Box>
            </Stack></CardContent>
          </Card>
          <Card variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
            <CardContent><Stack direction="row" alignItems="center" spacing={1}>
              <GroupsIcon color="success" /><Box><Typography variant="overline" color="text.secondary">Participantes</Typography><Typography variant="h6" color="success.main">{headerStats.activeUsers}</Typography></Box>
            </Stack></CardContent>
          </Card>
          <Card variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
            <CardContent><Stack direction="row" alignItems="center" spacing={1}>
              <TrendingIcon color="secondary" /><Box><Typography variant="overline" color="text.secondary">Respuestas</Typography><Typography variant="h6" color="secondary.main">{headerStats.totalResponses}</Typography></Box>
            </Stack></CardContent>
          </Card>
        </Stack>
      )}

      {/* Filtros (solo admin) */}
      {isAdmin && (
        <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
          <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
            <FilterListIcon color="primary" sx={{ fontSize: 20 }} />
            <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 600 }}>Filtros</Typography>
          </Stack>
          <Tabs
            value={adminCategory}
            onChange={(_, v) => setAdminCategory(v)}
            variant="scrollable" scrollButtons="auto"
            sx={{
              "& .MuiTab-root": { textTransform: "none", fontWeight: 600, minHeight: 36, px: 2, mr: 1, border: "1px solid", borderColor: "divider", borderRadius: 2, color: "text.primary",
                "&:hover": { backgroundColor: "action.hover" } },
              "& .Mui-selected": { color: "white !important", backgroundColor: (t) => ADMIN_TAB_COLORS[adminCategory] || t.palette.primary.main,
                borderColor: (t) => ADMIN_TAB_COLORS[adminCategory] || t.palette.primary.main, boxShadow: "0 2px 8px rgba(8,61,119,0.25)" },
              "& .MuiTabs-indicator": { display: "none" },
            }}
          >
            <Tab label="Todas" value="Todas" />
            {["General","Administración","Seguridad","Mantenimiento","Espacios Comunes","Garage y Parking"].map((c) => (
              <Tab key={c} label={c} value={c} />
            ))}
          </Tabs>
        </Paper>
      )}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {error && !loading && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="error">Error cargando el foro</Typography>
          <Button onClick={() => { refetchForums(); refetchThreads(); }} sx={{ mt: 2 }}>Reintentar</Button>
        </Box>
      )}

      {!loading && !error && posts.length === 0 && (
        <Card variant="outlined" sx={{ textAlign: "center", py: 6, borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary">No hay posts en {currentCategoryName} aún</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            ¡Sé el primero en crear un post en esta categoría!
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Crear primer post</Button>
        </Card>
      )}

      <Stack spacing={2}>{posts.map(renderThread)}</Stack>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogContent>
          {!resolvedForumId ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>No se pudo identificar el foro destino.</Typography>
              <Button onClick={() => { refetchForums(); }} variant="outlined">Reintentar</Button>
            </Box>
          ) : (
            <NewPost
              onClose={() => setOpen(false)}
              forumId={resolvedForumId}
              userId={currentUserId}
              onCreated={() => { refetchThreads(); setOpen(false); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Forums;
