import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Stack,
  Dialog,
  DialogContent,
  CircularProgress,
  Avatar,
  TextField,
  Collapse,
  Divider,
  Paper,
} from "@mui/material";
import {
  Add as AddIcon,
  ChatBubbleOutline as ChatIcon,
  Groups as GroupsIcon,
  TrendingUp as TrendingIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Reply as ReplyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { Layout } from "../components/layout";
import PageHeader from "../components/SectionHeader";
import NewPost from "../components/modals/NewPost";
import { useLocation } from "react-router-dom";
import { useGet } from "../hooks/useGet";
import { useMutation } from "../hooks/useMutation";

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
  if (Number.isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function toSlug(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, ""); // escape removed
}

const Forums: React.FC = () => {
  const { data: forumsRaw, loading: loadingForums, error: errorForums, refetch: refetchForums } =
    useGet<Forum[]>("/Forum");
  const { data: threadsRaw, loading: loadingThreads, error: errorThreads, refetch: refetchThreads } =
    useGet<Thread[]>("/Thread");

  const loading = loadingForums || loadingThreads;
  const error = !!errorForums || !!errorThreads;

  const [open, setOpen] = useState(false);
  const location = useLocation();

  const currentUserId = Number(localStorage.getItem("userId")); // reemplazar por auth real cuando esté disponible

  const { mutate: toggleMutate } =
    useMutation<
      ReactionResponse,
      { user_id: number; thread_id?: number; message_id?: number; reactionType: number }
    >("/Reactions/toggle", "post");

  const [enriched, setEnriched] = useState<Record<string, {
    likes: number;
    dislikes: number;
    totalReactions: number;
    commentsCount: number;
    comments?: Message[];
    loading?: boolean;
    error?: boolean;
    reacting?: boolean;
    userReaction?: 1 | -1 | 0;
  }>>({});

  const [forumStats, setForumStats] = useState<Forum | null>(null);
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:7245/api";

  // extrae slug actual desde la ruta /forums/:slug o /forums (fallback "general")
  const currentSlug = useMemo(() => {
    const path = location.pathname;
    const match = path.match(/\/forums\/([^/]+)/); // escape removed
    return match ? match[1] : "general";
  }, [location.pathname]);

  // resuelve el nombre de la categoría para mostrar en header (opcional)
  const currentCategory = useMemo(() => {
    if (!forumsRaw) {
      switch (currentSlug) {
        case "administracion": return "Administración";
        case "seguridad": return "Seguridad";
        case "mantenimiento": return "Mantenimiento";
        case "espacios-comunes": return "Espacios Comunes";
        case "garage-parking": return "Garage y Parking";
        default: return "General";
      }
    }
    const found = forumsRaw.find((f) => toSlug(f.categoryName) === currentSlug);
    return found ? found.categoryName : (() => {
      switch (currentSlug) {
        case "administracion": return "Administración";
        case "seguridad": return "Seguridad";
        case "mantenimiento": return "Mantenimiento";
        case "espacios-comunes": return "Espacios Comunes";
        case "garage-parking": return "Garage y Parking";
        default: return "General";
      }
    })();
  }, [forumsRaw, currentSlug]);

  // resuelve set de forum ids que pertenecen a la categoría actual
  const forumIdsForCategory = useMemo(() => {
    if (!forumsRaw) return new Set<number>();
    return new Set(
      forumsRaw
        .filter((f) => toSlug(f.categoryName) === currentSlug)
        .map((f) => f.id)
    );
  }, [forumsRaw, currentSlug]);

  const postsRaw = useMemo(() => {
    if (!threadsRaw) return [];
    if (!forumsRaw) return threadsRaw;
    return threadsRaw.filter((t) => forumIdsForCategory.has(t.forumId ?? -1));
  }, [threadsRaw, forumsRaw, forumIdsForCategory]);

  // forumId resuelto (si hay múltiples foros para el mismo slug, toma el primero)
  const resolvedForumId = useMemo(() => {
    if (!forumsRaw) return null;
    const found = forumsRaw.find((f) => toSlug(f.categoryName) === currentSlug);
    return found ? found.id : null;
  }, [forumsRaw, currentSlug]);

  // fetch stats for the resolved forum id (uses the API that returns the forum object with counts)
  useEffect(() => {
    let mounted = true;
    if (!resolvedForumId) {
      setForumStats(null);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/Forum/${resolvedForumId}`, { signal });
        if (!res.ok) {
          setForumStats(null);
          return;
        }
        const json: Forum = await res.json();
        if (!mounted) return;
        setForumStats(json);
      } catch {
        if (!mounted) return;
        setForumStats(null);
      }
    })();

    return () => {
      mounted = false;
      try { controller.abort(); } catch {}
    };
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
      setEnriched((prev) => ({ ...prev, [key]: { ...(prev[key] ?? {}), loading: true, error: false } }));

      const controller = new AbortController();
      controllers.push(controller);
      const signal = controller.signal;

      try {
        // Fetch reactions for thread - manejar 404
        let reactions: ReactionResponse = { total: 0, likes: 0, dislikes: 0, userReaction: 0 };
        try {
          const reactionsRes = await fetch(`${API_BASE}/Reactions/thread/${threadId}`, { 
            signal,
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          if (reactionsRes.ok) {
            reactions = await reactionsRes.json();
          } else if (reactionsRes.status === 404) {
            console.log(`No reactions found for thread ${threadId} (404 - normal)`);
            // Mantener valores por defecto
          } else {
            console.warn(`Failed to fetch reactions for thread ${threadId}: ${reactionsRes.status}`);
          }
        } catch (reactionError) {
          console.warn(`Failed to parse reactions for thread ${threadId}:`, reactionError);
        }

        // Fetch messages for thread - manejar 404
        let messages: Message[] = [];
        try {
          const messagesRes = await fetch(`${API_BASE}/Message/thread/${threadId}`, { 
            signal,
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          if (messagesRes.ok) {
            messages = await messagesRes.json();
          } else if (messagesRes.status === 404) {
            console.log(`No messages found for thread ${threadId} (404 - normal)`);
            // Mantener array vacío
          } else {
            console.warn(`Failed to fetch messages for thread ${threadId}: ${messagesRes.status}`);
          }
        } catch (messageError) {
          console.warn(`Failed to parse messages for thread ${threadId}:`, messageError);
        }

        if (!mounted) return;

        console.log(`Thread ${threadId}:`, { reactions, messages }); // Debug log

        setEnriched((prev) => ({
          ...prev,
          [key]: {
            likes: reactions?.likes ?? 0,
            dislikes: reactions?.dislikes ?? 0,
            totalReactions: reactions?.total ?? ((reactions?.likes ?? 0) + (reactions?.dislikes ?? 0)),
            commentsCount: Array.isArray(messages) ? messages.length : 0,
            comments: Array.isArray(messages) ? messages : [],
            loading: false,
            error: false,
            reacting: false,
            userReaction: typeof reactions.userReaction === "number" ? (reactions.userReaction as 1 | -1 | 0) : 0,
          },
        }));
      } catch (err: any) {
        if (err?.name === "AbortError" || err?.name === "CanceledError") return;
        if (!mounted) return;
        console.error(`Error fetching data for thread ${threadId}:`, err);
        setEnriched((prev) => ({
          ...prev,
          [key]: { ...(prev[key] ?? {}), loading: false, error: true, reacting: false },
        }));
      }
    };

    postsRaw.forEach((p) => fetchForThread(p.id));
    return () => {
      mounted = false;
      controllers.forEach((c) => {
        try { c.abort(); } catch {}
      });
    };
  }, [postsRaw, API_BASE]);

  const posts = useMemo(() => {
    if (!postsRaw) return [];
    return postsRaw.map((p) => {
      const formattedDate = formatDateNumeric(p.createdAt);
      return {
        id: String(p.id),
        threadId: p.id,
        title: p.theme ?? "Sin título",
        subtitle: `Usuario ${p.userId ?? "-"} · ${formattedDate}`,
        description: p.description ?? "",
        chips: [
          {
            label: (forumsRaw?.find((f) => f.id === p.forumId)?.categoryName) ?? String(p.forumId ?? "-"),
            color: p.state === "Activo" ? "success" : p.state === "Pendiente" ? "warning" : "default",
          },
        ],
      };
    });
  }, [postsRaw, forumsRaw]);

  const computedStats = useMemo(() => {
    const totalPosts = posts.length;
    const activeUsers = new Set(postsRaw?.map((p) => p.userId).filter(Boolean)).size || 0;
    const totalResponses = Object.values(enriched).reduce((acc, e) => acc + (e?.commentsCount ?? 0), 0);
    const pinned = posts.filter((p) => (p as any).isPinned).length;
    return { totalPosts, activeUsers, totalResponses, pinned };
  }, [posts, postsRaw, enriched]);

  // Prefer authoritative counts from forumStats if available
  const headerStats = useMemo(() => {
    return {
      totalPosts: forumStats?.countThreads ?? computedStats.totalPosts,
      activeUsers: forumStats?.countUserActives ?? computedStats.activeUsers,
      totalResponses: forumStats?.countResponses ?? computedStats.totalResponses,
      pinned: computedStats.pinned,
    };
  }, [forumStats, computedStats]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const toggleReactionForThread = async (threadId: number, reactionType: 1 | -1) => {
    const key = String(threadId);
    const current = enriched[key] ?? { likes: 0, dislikes: 0, totalReactions: 0, reacting: false, userReaction: 0 };
    if (current.reacting) return;

    setEnriched((prev) => ({ ...prev, [key]: { ...(prev[key] ?? {}), reacting: true } }));

    // infer new userReaction: toggle behavior (same reaction => remove, different => set)
    const prevUserReaction = current.userReaction ?? 0;
    const willRemove = prevUserReaction === reactionType;
    const newUserReaction = willRemove ? 0 : reactionType;

    // adjust counts optimistically
    const optimistic = {
      likes: current.likes + (reactionType === 1 && !willRemove ? 1 : reactionType === 1 && willRemove ? -1 : 0),
      dislikes: current.dislikes + (reactionType === -1 && !willRemove ? 1 : reactionType === -1 && willRemove ? -1 : 0),
      totalReactions:
        current.totalReactions + (willRemove ? -1 : 1),
      userReaction: newUserReaction as 1 | -1 | 0,
    };

    setEnriched((prev) => ({ ...prev, [key]: { ...(prev[key] ?? {}), ...optimistic } }));

    const payload = { user_id: currentUserId, thread_id: threadId, reactionType };

    try {
      const result = await toggleMutate(payload);

      if (result && typeof result.likes === "number" && typeof result.dislikes === "number") {
        setEnriched((prev) => ({
          ...prev,
          [key]: {
            ...(prev[key] ?? {}),
            likes: result.likes,
            dislikes: result.dislikes,
            totalReactions: result.total ?? result.likes + result.dislikes,
            reacting: false,
            error: false,
            userReaction: typeof result.userReaction === "number" ? (result.userReaction as 1 | -1 | 0) : newUserReaction,
          },
        }));
        return;
      }

      // fallback: fetch authoritative reactions
      const reacRes = await fetch(`${API_BASE}/Reactions/thread/${threadId}`);
      const ct = reacRes.headers.get("content-type") || "";
      if (!reacRes.ok || !ct.includes("application/json")) throw new Error("Reactions fallback failed");
      const reacJson: ReactionResponse = await reacRes.json();

      setEnriched((prev) => ({
        ...prev,
        [key]: {
          ...(prev[key] ?? {}),
          likes: reacJson.likes ?? 0,
          dislikes: reacJson.dislikes ?? 0,
          totalReactions: reacJson.total ?? (reacJson.likes ?? 0) + (reacJson.dislikes ?? 0),
          reacting: false,
          error: false,
          userReaction: typeof reacJson.userReaction === "number" ? (reacJson.userReaction as 1 | -1 | 0) : newUserReaction,
        },
      }));
    } catch (err: any) {
      // On error, revert to server state if possible, otherwise mark error and revert reacting flag
      try {
        const reacRes = await fetch(`${API_BASE}/Reactions/thread/${threadId}`);
        const ct = reacRes.headers.get("content-type") || "";
        if (reacRes.ok && ct.includes("application/json")) {
          const reacJson: ReactionResponse = await reacRes.json();
          setEnriched((prev) => ({
            ...prev,
            [key]: {
              ...(prev[key] ?? {}),
              likes: reacJson.likes ?? 0,
              dislikes: reacJson.dislikes ?? 0,
              totalReactions: reacJson.total ?? (reacJson.likes ?? 0) + (reacJson.dislikes ?? 0),
              reacting: false,
              error: false,
              userReaction: typeof reacJson.userReaction === "number" ? (reacJson.userReaction as 1 | -1 | 0) : prevUserReaction,
            },
          }));
        } else {
          setEnriched((prev) => ({ ...prev, [key]: { ...(prev[key] ?? {}), reacting: false, error: true, userReaction: prevUserReaction } }));
        }
      } catch {
        setEnriched((prev) => ({ ...prev, [key]: { ...(prev[key] ?? {}), reacting: false, error: true, userReaction: prevUserReaction } }));
      }
    }
  };

  const [expandedThreads, setExpandedThreads] = useState<Set<number>>(new Set());
  const [replyText, setReplyText] = useState<Record<number, string>>({});
  const [sendingReply, setSendingReply] = useState<number | null>(null);

  const { mutate: sendReply } = useMutation("/Message", "post");

  const toggleThread = (threadId: number) => {
    setExpandedThreads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(threadId)) {
        newSet.delete(threadId);
      } else {
        newSet.add(threadId);
      }
      return newSet;
    });
  };

  const handleSendReply = async (threadId: number) => {
    const text = replyText[threadId]?.trim();
    if (!text || sendingReply === threadId) return;

    setSendingReply(threadId);
    try {
      // Usar exactamente el formato del CreateMessageRequest DTO
      const messageData = {
        Content: text,           // string - requerido
        Thread_id: threadId,     // int - requerido  
        User_id: currentUserId,  // int - requerido
        // NO incluir optionalFile si es null
      };

      console.log('Enviando mensaje con formato correcto:', messageData);

      const newMessage = await sendReply(messageData);
      console.log('Mensaje creado:', newMessage);
      
      setReplyText(prev => ({ ...prev, [threadId]: "" }));
      
      // Refresh messages for this specific thread
      const key = String(threadId);
      setEnriched((prev) => ({ ...prev, [key]: { ...(prev[key] ?? {}), loading: true } }));
      
      // Refetch messages después de un pequeño delay
      setTimeout(async () => {
        try {
          const messagesRes = await fetch(`${API_BASE}/Message/thread/${threadId}`, {
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          if (messagesRes.ok) {
            const messages: Message[] = await messagesRes.json();
            console.log('Mensajes actualizados:', messages);
            
            setEnriched((prev) => ({
              ...prev,
              [key]: {
                ...(prev[key] ?? {}),
                commentsCount: messages.length,
                comments: messages,
                loading: false,
              },
            }));
          } else {
            console.error('Error fetching updated messages:', messagesRes.status);
            setEnriched((prev) => ({ ...prev, [key]: { ...(prev[key] ?? {}), loading: false } }));
          }
        } catch (fetchError) {
          console.error('Error refetching messages:', fetchError);
          setEnriched((prev) => ({ ...prev, [key]: { ...(prev[key] ?? {}), loading: false } }));
        }
      }, 1000);
      
    } catch (error) {
      console.error("Error sending reply:", error);
      
      // Mostrar error más detallado
      let errorMessage = 'Error desconocido';
      if (error && typeof error === 'object') {
        if ('message' in error) {
          errorMessage = (error as any).message;
        } else if ('error' in error) {
          errorMessage = (error as any).error;
        }
      }
      
      alert(`Error al enviar la respuesta: ${errorMessage}`);
    } finally {
      setSendingReply(null);
    }
  };

  const renderThread = (thread: any) => {
    const meta = enriched[String(thread.threadId)] ?? {
      likes: 0,
      dislikes: 0,
      totalReactions: 0,
      commentsCount: 0,
      comments: [],
      loading: false,
      error: false,
      reacting: false,
      userReaction: 0,
    };

    const isExpanded = expandedThreads.has(thread.threadId);

    return (
      <Card 
        key={thread.id} 
        variant="outlined" 
        sx={{ 
          borderRadius: 3,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: 2,
            transform: 'translateY(-1px)',
          }
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            {/* Header del Thread */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Typography variant="h6" color="primary">
                    {thread.title}
                  </Typography>
                  {thread.chips.map((chip: any, index: number) => (
                    <Chip 
                      key={`${chip.label}-${index}`}
                      label={chip.label} 
                      color={chip.color} 
                      size="small" 
                    />
                  ))}
                </Stack>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {thread.subtitle}
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {thread.description}
                </Typography>
              </Box>
            </Stack>

            {/* Acciones del Thread */}
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={2} alignItems="center">
                {/* Likes/Dislikes */}
                <Button
                  size="small"
                  startIcon={<ThumbUpIcon sx={{ color: meta.userReaction === 1 ? "success.main" : undefined }} />}
                  onClick={() => !meta.reacting && toggleReactionForThread(thread.threadId, 1)}
                  disabled={meta.reacting}
                  sx={{ minWidth: 'auto', px: 1 }}
                >
                  {meta.likes}
                </Button>
                
                <Button
                  size="small"
                  startIcon={<ThumbDownIcon sx={{ color: meta.userReaction === -1 ? "error.main" : undefined }} />}
                  onClick={() => !meta.reacting && toggleReactionForThread(thread.threadId, -1)}
                  disabled={meta.reacting}
                  sx={{ minWidth: 'auto', px: 1 }}
                >
                  {meta.dislikes}
                </Button>

                {/* Mostrar respuestas siempre, no solo si hay */}
                <Button
                  size="small"
                  startIcon={<ChatIcon />}
                  endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  onClick={() => toggleThread(thread.threadId)}
                  sx={{ textTransform: 'none' }}
                >
                  {meta.commentsCount} {meta.commentsCount === 1 ? 'respuesta' : 'respuestas'}
                </Button>
              </Stack>

              {/* Botón responder */}
              <Button
                variant="outlined"
                size="small"
                startIcon={<ReplyIcon />}
                onClick={() => toggleThread(thread.threadId)}
                sx={{ textTransform: 'none' }}
              >
                Responder
              </Button>
            </Stack>

            {/* Hilo de conversación expandible */}
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ mb: 2 }} />
                
                {/* Respuestas existentes */}
                {meta.loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      Cargando mensajes...
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={1}>
                    {meta.comments && meta.comments.length > 0 ? (
                      <Box sx={{ position: 'relative', pl: 2 }}>
                        {/* Línea vertical principal del hilo - más visible */}
                        <Box
                          sx={{
                            position: 'absolute',
                            left: 20,
                            top: 40,
                            bottom: meta.comments.length > 1 ? 60 : 40,
                            width: 3,
                            backgroundColor: 'primary.main',
                            opacity: 0.4,
                            borderRadius: 1.5,
                            zIndex: 1
                          }}
                        />
                        
                        {meta.comments.map((comment: Message, index: number) => (
                          <Box
                            key={comment.id}
                            sx={{
                              position: 'relative',
                              ml: index === 0 ? 0 : 3, // Menos indentación
                              mb: 2
                            }}
                          >
                            {/* Línea de conexión horizontal para respuestas */}
                            {index > 0 && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  left: -26,
                                  top: 24,
                                  width: 20,
                                  height: 3,
                                  backgroundColor: 'secondary.main',
                                  opacity: 0.6,
                                  borderRadius: 1.5,
                                  zIndex: 2
                                }}
                              />
                            )}
                            
                            {/* Punto de conexión en la línea vertical */}
                            {index > 0 && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  left: -28,
                                  top: 22,
                                  width: 8,
                                  height: 8,
                                  backgroundColor: 'secondary.main',
                                  borderRadius: '50%',
                                  border: '2px solid white',
                                  zIndex: 3
                                }}
                              />
                            )}
                            
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 2,
                                backgroundColor: comment.user_id === currentUserId ? 'primary.50' : 'grey.50',
                                borderLeft: index === 0 ? '4px solid' : '3px solid',
                                borderLeftColor: index === 0 ? 'primary.main' : 'secondary.main',
                                borderRadius: 2,
                                position: 'relative',
                                boxShadow: index === 0 ? 2 : 1,
                                '&:hover': {
                                  backgroundColor: comment.user_id === currentUserId ? 'primary.100' : 'grey.100',
                                  transform: 'translateX(2px)',
                                  transition: 'all 0.2s ease'
                                }
                              }}
                            >
                              <Stack direction="row" spacing={2}>
                                <Avatar sx={{ 
                                  width: 36, 
                                  height: 36, 
                                  bgcolor: comment.user_id === currentUserId ? 'secondary.main' : 'primary.main',
                                  fontSize: '0.9rem',
                                  border: '2px solid white',
                                  boxShadow: 1
                                }}>
                                  U{comment.user_id}
                                </Avatar>
                                
                                <Box sx={{ flex: 1 }}>
                                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                    <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                                      Usuario {comment.user_id}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatDateNumeric(comment.createdAt)}
                                    </Typography>
                                    {comment.user_id === currentUserId && (
                                      <Chip label="Tú" size="small" color="secondary" sx={{ height: 20, fontSize: '0.7rem' }} />
                                    )}
                                    {index === 0 && (
                                      <Chip label="OP" size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                    )}
                                  </Stack>
                                  
                                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                                    {comment.content}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                        No hay respuestas aún. ¡Sé el primero en comentar!
                      </Typography>
                    )}

                    {/* Campo para nueva respuesta */}
                    <Box sx={{ mt: 3, ml: 5, position: 'relative' }}>
                      {/* Línea de conexión para nueva respuesta - más visible */}
                      {meta.comments && meta.comments.length > 0 && (
                        <>
                          {/* Línea horizontal de conexión */}
                          <Box
                            sx={{
                              position: 'absolute',
                              left: -28,
                              top: 24,
                              width: 24,
                              height: 3,
                              backgroundColor: 'success.main',
                              opacity: 0.7,
                              borderRadius: 1.5,
                              zIndex: 2
                            }}
                          />
                          {/* Punto de conexión */}
                          <Box
                            sx={{
                              position: 'absolute',
                              left: -30,
                              top: 22,
                              width: 8,
                              height: 8,
                              backgroundColor: 'success.main',
                              borderRadius: '50%',
                              border: '2px solid white',
                              zIndex: 3
                            }}
                          />
                        </>
                      )}
                      
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          backgroundColor: 'background.paper', 
                          borderRadius: 2,
                          borderLeft: '3px solid',
                          borderLeftColor: 'success.main',
                          boxShadow: 1
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                          <Avatar sx={{ 
                            width: 36, 
                            height: 36, 
                            bgcolor: 'success.main', 
                            fontSize: '0.9rem',
                            border: '2px solid white',
                            boxShadow: 1
                          }}>
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
                              onChange={(e) => setReplyText(prev => ({ 
                                ...prev, 
                                [thread.threadId]: e.target.value 
                              }))}
                              variant="outlined"
                              size="small"
                              disabled={sendingReply === thread.threadId}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                  e.preventDefault();
                                  handleSendReply(thread.threadId);
                                }
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  backgroundColor: 'grey.25'
                                }
                              }}
                            />
                            
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Tip: Ctrl + Enter para enviar rápidamente
                              </Typography>
                              
                              <Button
                                variant="contained"
                                color="success"
                                endIcon={sendingReply === thread.threadId ? <CircularProgress size={16} /> : <SendIcon />}
                                onClick={() => handleSendReply(thread.threadId)}
                                disabled={!replyText[thread.threadId]?.trim() || sendingReply === thread.threadId}
                                sx={{ borderRadius: 999, px: 3 }}
                              >
                                {sendingReply === thread.threadId ? 'Enviando...' : 'Enviar'}
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

  return (
    <Layout>
      <Box className="foraria-page-container">
        <PageHeader
          title={`Foro - ${currentCategory}`}
          tabs={[
            { label: "Todos", value: "todos" },
            { label: "Populares", value: "populares" },
            { label: "Recientes", value: "recientes" },
          ]}
          selectedTab="todos"
          onTabChange={() => {}}
          actions={
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={handleOpen}
              sx={{ borderRadius: 999, fontWeight: 600 }}
            >
              Nuevo Post
            </Button>
          }
        />

        {/* Stats Cards */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
          <Card variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <ChatIcon color="primary" />
                <Box>
                  <Typography variant="overline" color="text.secondary">Posts Totales</Typography>
                  <Typography variant="h6">{headerStats.totalPosts}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
          
          <Card variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <GroupsIcon color="success" />
                <Box>
                  <Typography variant="overline" color="text.secondary">Participantes</Typography>
                  <Typography variant="h6" color="success.main">{headerStats.activeUsers}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
          
          <Card variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <TrendingIcon color="secondary" />
                <Box>
                  <Typography variant="overline" color="text.secondary">Respuestas</Typography>
                  <Typography variant="h6" color="secondary.main">{headerStats.totalResponses}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        {/* Loading/Error States */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {error && !loading && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" color="error">
              Error cargando el foro
            </Typography>
            <Button onClick={() => { refetchForums(); refetchThreads(); }} sx={{ mt: 2 }}>
              Reintentar
            </Button>
          </Box>
        )}

        {/* Empty State */}
        {!loading && !error && posts.length === 0 && (
          <Card variant="outlined" sx={{ textAlign: "center", py: 6, borderRadius: 3 }}>
            <Typography variant="h6" color="text.secondary">
              No hay posts en {currentCategory} aún
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
              ¡Sé el primero en crear un post en esta categoría!
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
              Crear primer post
            </Button>
          </Card>
        )}

        {/* Lista de Threads */}
        <Stack spacing={2}>
          {posts.map(renderThread)}
        </Stack>

        {/* Modal para nuevo post */}
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogContent>
            {!resolvedForumId ? (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                  No se pudo identificar el foro destino.
                </Typography>
                <Button onClick={() => { refetchForums(); }} variant="outlined">
                  Reintentar
                </Button>
              </Box>
            ) : (
              <NewPost
                onClose={handleClose}
                forumId={resolvedForumId}
                userId={currentUserId}
                onCreated={() => {
                  refetchThreads();
                  handleClose();
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Forums;
