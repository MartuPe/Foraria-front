import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  ChatBubbleOutline as ChatIcon,
  PushPin as PinIcon,
  Groups as GroupsIcon,
  TrendingUp as TrendingIcon,
} from "@mui/icons-material";
import { Layout } from "../components/layout";
import PageHeader from "../components/SectionHeader";
import NewPost from "../components/modals/NewPost";
import InfoCard from "../components/InfoCard";
import { useLocation, useNavigate } from "react-router-dom";
import { useGet } from "../hooks/useGet";
import { useMutation } from "../hooks/useMutation";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbDownOutlinedIcon from "@mui/icons-material/ThumbDownOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";

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

const Forums: React.FC = () => {
  const { data: forumsRaw, loading: loadingForums, error: errorForums, refetch: refetchForums } =
    useGet<Forum[]>("/Forum");
  const { data: threadsRaw, loading: loadingThreads, error: errorThreads, refetch: refetchThreads } =
    useGet<Thread[]>("/Thread");

  const loading = loadingForums || loadingThreads;
  const error = !!errorForums || !!errorThreads;

  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentUserId = 1;

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
  }>>({});

  const currentCategory = useMemo(() => {
    const path = location.pathname;
    if (path.includes("/forums/administracion")) return "Administración";
    if (path.includes("/forums/seguridad")) return "Seguridad";
    if (path.includes("/forums/mantenimiento")) return "Mantenimiento";
    if (path.includes("/forums/espacios-comunes")) return "Espacios Comunes";
    if (path.includes("/forums/garage-parking")) return "Garage y Parking";
    return "General";
  }, [location.pathname]);

  const forumIdsForCategory = useMemo(() => {
    if (!forumsRaw) return new Set<number>();
    return new Set(
      forumsRaw
        .filter((f) => f.categoryName?.toLowerCase() === currentCategory.toLowerCase())
        .map((f) => f.id)
    );
  }, [forumsRaw, currentCategory]);

  const postsRaw = useMemo(() => {
    if (!threadsRaw) return [];
    if (!forumsRaw) return threadsRaw;
    return threadsRaw.filter((t) => forumIdsForCategory.has(t.forumId ?? -1));
  }, [threadsRaw, forumsRaw, forumIdsForCategory]);

  useEffect(() => {
    if (!postsRaw || postsRaw.length === 0) {
      setEnriched({});
      return;
    }

    let mounted = true;
    const controllers: AbortController[] = [];
    const API_BASE = process.env.REACT_APP_API_BASE || "https://localhost:7245/api";

    const fetchForThread = async (threadId: number) => {
      const key = String(threadId);
      setEnriched((prev) => ({ ...prev, [key]: { ...(prev[key] ?? {}), loading: true, error: false } }));

      const controller = new AbortController();
      controllers.push(controller);
      const signal = controller.signal;

      try {
        const reactionsRes = await fetch(`${API_BASE}/Reactions/thread/${threadId}`, { signal });
        if (!reactionsRes.ok) throw new Error(`Reactions ${reactionsRes.status}`);
        const reactions: ReactionResponse = await reactionsRes.json();

        const messagesRes = await fetch(`${API_BASE}/Message/thread/${threadId}`, { signal });
        if (!messagesRes.ok) throw new Error(`Messages ${messagesRes.status}`);
        const messages: Message[] = await messagesRes.json();

        if (!mounted) return;

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
          },
        }));
      } catch (err: any) {
        if (err?.name === "AbortError" || err?.name === "CanceledError") return;
        if (!mounted) return;
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
  }, [postsRaw]);

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
        fields: [
          { label: "Fecha", value: formattedDate },
          { label: "Foro id", value: String(p.forumId ?? "-") },
        ],
        optionalFields: [{ label: `ID: ${p.id}` }],
        filesCount: 0,
        files: [],
        actions: [
          {
            label: "Comentar",
            variant: "outlined",
            onClick: () => console.log("Comentar", p.id),
          },
          { label: "Ver", variant: "contained", color: "primary", onClick: () => console.log("Ver", p.id) },
        ],
        extraActions: [],
        showDivider: true,
      } as React.ComponentProps<typeof InfoCard> & { threadId: number };
    });
  }, [postsRaw, forumsRaw]);

  const stats = useMemo(() => {
    const totalPosts = posts.length;
    const activeUsers = new Set(postsRaw?.map((p) => p.userId).filter(Boolean)).size || 0;
    const totalResponses = Object.values(enriched).reduce((acc, e) => acc + (e?.commentsCount ?? 0), 0);
    const pinned = posts.filter((p) => (p as any).isPinned).length;
    return { totalPosts, activeUsers, totalResponses, pinned };
  }, [posts, postsRaw, enriched]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const toggleReactionForThread = async (threadId: number, reactionType: 1 | -1) => {
    const key = String(threadId);
    const current = enriched[key] ?? { likes: 0, dislikes: 0, totalReactions: 0, reacting: false };
    if (current.reacting) return;

    setEnriched((prev) => ({ ...prev, [key]: { ...(prev[key] ?? {}), reacting: true } }));

    const optimistic = {
      likes: current.likes + (reactionType === 1 ? 1 : 0),
      dislikes: current.dislikes + (reactionType === -1 ? 1 : 0),
      totalReactions: current.totalReactions + 1,
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
          },
        }));
        return;
      }

      const API_BASE = process.env.REACT_APP_API_BASE || "https://localhost:7245/api";
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
        },
      }));
    } catch (err: any) {
      try {
        const API_BASE = process.env.REACT_APP_API_BASE || "https://localhost:7245/api";
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
            },
          }));
        } else {
          setEnriched((prev) => ({ ...prev, [key]: { ...(prev[key] ?? {}), reacting: false, error: true } }));
        }
      } catch {
        setEnriched((prev) => ({ ...prev, [key]: { ...(prev[key] ?? {}), reacting: false, error: true } }));
      }
    }
  };

  return (
    <Layout>
      <Box className="foraria-page-container" sx={{ px: 2, py: 3 }}>
        <PageHeader
          title={`Foro - ${currentCategory}`}
          stats={[
            { icon: <ChatIcon />, title: `Posts en ${currentCategory}`, value: stats.totalPosts, color: "primary" },
            { icon: <GroupsIcon />, title: "Participantes Activos", value: stats.activeUsers, color: "success" },
            { icon: <TrendingIcon />, title: "Total Respuestas", value: stats.totalResponses, color: "secondary" },
            { icon: <PinIcon />, title: "Posts Fijados", value: stats.pinned, color: "warning" },
          ]}
          actions={
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={handleOpen}
              sx={{ textTransform: "none" }}
            >
              Nuevo Post
            </Button>
          }
        />

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {error && !loading && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" color="error">
              Error cargando posts o foros
            </Typography>
            <Button onClick={() => { refetchForums(); refetchThreads(); }} sx={{ mt: 2 }}>
              Reintentar
            </Button>
          </Box>
        )}

        {!loading && !error && posts.length === 0 && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No hay posts en {currentCategory} aún
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              ¡Sé el primero en crear un post en esta categoría!
            </Typography>
          </Box>
        )}

        <Box sx={{ display: "grid", gap: 2, mt: 2 }}>
          {posts.map((p: any) => {
            const meta = enriched[String(p.threadId)] ?? {
              likes: 0,
              dislikes: 0,
              totalReactions: 0,
              commentsCount: 0,
              loading: false,
              error: false,
              reacting: false,
            };

            return (
              <InfoCard
                key={p.id}
                title={p.title}
                subtitle={p.subtitle}
                description={p.description}
                image=""
                chips={p.chips}
                actions={p.actions}
                extraActions={[
                  {
                    label: String(meta.likes || 0),
                    onClick: () => (meta.reacting ? undefined : toggleReactionForThread(p.threadId, 1)),
                    variant: "text",
                    icon: <ThumbUpOutlinedIcon />,
                  },
                  {
                    label: String(meta.dislikes || 0),
                    onClick: () => (meta.reacting ? undefined : toggleReactionForThread(p.threadId, -1)),
                    variant: "text",
                    icon: <ThumbDownOutlinedIcon />,
                  },
                  {
                    label: ` ${meta.commentsCount ?? 0} Respuestas`,
                    onClick: () => {
                      // Navega a la pantalla de comentarios enviando threadId en location.state
                      navigate("/forums/comentarios", { state: { threadId: p.threadId } });
                    },
                    variant: "text",
                    icon: <ChatBubbleOutlineOutlinedIcon />,
                  },
                ]}
                sx={{}}
                showDivider={p.showDivider}
              />
            );
          })}
        </Box>

        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogContent>
            <NewPost onClose={handleClose} />
          </DialogContent>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Forums;
