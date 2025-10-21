// src/pages/ThreadView.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Divider,
  Button,
  Stack,
  TextField,
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoCard from "../components/InfoCard";
import { Layout } from "../components/layout";
import { useLocation, useNavigate, useParams } from "react-router-dom";

interface Thread {
  id: number;
  theme: string;
  description: string;
  createdAt: string;
  state: string;
  forum_id: number;
  user_id: number;
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

const API_BASE = "https://localhost:7245/api";
const currentUserId = 1;

const ThreadView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams<{ threadId?: string }>();

  // threadId: prefer location.state.threadId, fallback to route param
  const threadIdFromState = (location.state as any)?.threadId;
  const threadIdParam = params.threadId ? Number(params.threadId) : undefined;
  const threadId = typeof threadIdFromState === "number" ? threadIdFromState : threadIdParam;

  const [thread, setThread] = useState<Thread | null>(null);
  const [reactions, setReactions] = useState<ReactionResponse | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!threadId) {
      setLoading(false);
      setThread(null);
      return;
    }

    let mounted = true;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [threadRes, reactionsRes, messagesRes] = await Promise.all([
          fetch(`${API_BASE}/Thread/${threadId}`),
          fetch(`${API_BASE}/Reactions/thread/${threadId}`),
          fetch(`${API_BASE}/Message/thread/${threadId}`),
        ]);

        if (!mounted) return;

        if (threadRes.ok) setThread(await threadRes.json());
        else setThread(null);

        if (reactionsRes.ok) setReactions(await reactionsRes.json());
        else setReactions(null);

        if (messagesRes.ok) {
          const msgs = await messagesRes.json();
          setMessages(Array.isArray(msgs) ? msgs : []);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error("Error cargando datos del hilo", err);
        if (mounted) {
          setThread(null);
          setReactions(null);
          setMessages([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      mounted = false;
    };
  }, [threadId]);

  const formattedDate = thread ? new Date(thread.createdAt).toLocaleDateString("es-AR") : "";

  const onToggleThreadReaction = (type: 1 | -1) => {
    console.log("Toggle reaction thread", thread?.id, type);
  };

  const goBackToForum = () => {
    // intento de volver a la página anterior; si no hay historial, navegar a general
    if (location.key) {
      navigate(-1);
    } else {
      navigate("/forums/general");
    }
  };

  const onCommentThread = () => {
    setShowCommentBox((prev) => !prev);
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !thread) return;
    setSending(true);
    try {
      const form = new FormData();
      // usar las keys que espera el backend; ajustá si tu API usa otro casing
      form.append("Content", commentText);
      form.append("Thread_id", String(thread.id));
      form.append("User_id", String(currentUserId));

      const res = await fetch(`${API_BASE}/Message`, {
        method: "POST",
        body: form,
      });

      if (res.ok) {
        const newMessage: Message = await res.json();
        setMessages((prev) => [...prev, newMessage]);
        setCommentText("");
        setShowCommentBox(false);
      } else {
        const txt = await res.text();
        console.error("Error al enviar comentario", txt);
      }
    } catch (err) {
      console.error("Error de red al comentar", err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ py: 6, textAlign: "center" }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!threadId) {
    return (
      <Layout>
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Typography variant="h6" color="error">
            No se recibió el ID del hilo
          </Typography>
          <Button sx={{ mt: 2 }} onClick={() => navigate("/forums/general")}>
            Volver a foros
          </Button>
        </Box>
      </Layout>
    );
  }

  if (!thread) {
    return (
      <Layout>
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Typography variant="h6" color="error">
            No se encontró el hilo
          </Typography>
          <Button sx={{ mt: 2 }} onClick={goBackToForum}>
            Volver
          </Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ px: 2, py: 3, display: "grid", gap: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button variant="outlined" onClick={goBackToForum}>
            <ArrowBackIcon />
            Volver al foro
          </Button>
        </Stack>

        <InfoCard
          title={thread.theme}
          subtitle={`Usuario ${thread.user_id} · ${formattedDate}`}
          description={thread.description}
          extraActions={[
            {
              label: String(reactions?.likes ?? 0),
              icon: <ThumbUpIcon />,
              variant: "text",
              onClick: () => onToggleThreadReaction(1),
            },
            {
              label: String(reactions?.dislikes ?? 0),
              icon: <ThumbDownIcon />,
              variant: "text",
              onClick: () => onToggleThreadReaction(-1),
            },
            {
              label: `${messages.length} Respuestas`,
              icon: <ChatBubbleOutlineIcon />,
              variant: "text",
              onClick: () => console.log("Ir a respuestas"),
            },
            {
              label: "Comentar",
              variant: "outlined",
              color: "secondary",
              onClick: onCommentThread,
            },
          ]}
          showDivider
        />

        {showCommentBox && (
          <Box sx={{ px: 1, py: 2 }}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Escribí tu comentario"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={sending}
            />
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSendComment}
                disabled={sending || !commentText.trim()}
              >
                Enviar
              </Button>
              <Button variant="text" onClick={() => setShowCommentBox(false)}>
                Cancelar
              </Button>
            </Stack>
          </Box>
        )}

        <Box>
          <Typography>Respuestas ({messages.length})</Typography>
          <Divider />
        </Box>

        <Box>
          {messages.map((msg) => {
            const msgDate = new Date(msg.createdAt).toLocaleDateString("es-AR");
            return (
              <InfoCard
                key={msg.id}
                title={`Usuario ${msg.user_id}`}
                subtitle={`${msgDate}`}
                description={msg.content}
              />
            );
          })}
        </Box>
      </Box>
    </Layout>
  );
};

export default ThreadView;
