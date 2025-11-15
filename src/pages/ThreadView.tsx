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
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbDownOutlinedIcon from "@mui/icons-material/ThumbDownOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoCard from "../components/InfoCard";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation } from "../hooks/useMutation";

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

const API_BASE = "https://localhost:7245/api";
const currentUserId = Number(localStorage.getItem("userId"));

const ThreadView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams<{ threadId?: string }>();

  const threadIdFromState = (location.state as any)?.threadId;
  const threadIdParam = params.threadId ? Number(params.threadId) : undefined;
  const threadId = typeof threadIdFromState === "number" ? threadIdFromState : threadIdParam;

  const [thread, setThread] = useState<Thread | null>(null);
  const [reactions, setReactions] = useState<ReactionResponse>({
    total: 0,
    likes: 0,
    dislikes: 0,
    userReaction: 0,
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);
  const [reacting, setReacting] = useState(false);
  const [/*error*/, setError] = useState(false);

  const { mutate: toggleMutate } =
    useMutation<
      ReactionResponse,
      { user_id: number; thread_id?: number; message_id?: number; reactionType: number }
    >("/Reactions/toggle", "post");

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
        else setReactions({ total: 0, likes: 0, dislikes: 0, userReaction: 0 });

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
          setReactions({ total: 0, likes: 0, dislikes: 0, userReaction: 0 });
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

  const toggleReactionForThread = async (reactionType: 1 | -1) => {
    if (!thread || reacting) return;
    setReacting(true);
    setError(false);

    const prevUserReaction = reactions.userReaction ?? 0;
    const willRemove = prevUserReaction === reactionType;
    const newUserReaction = willRemove ? 0 : reactionType;

    // Actualización optimista
    const optimistic = {
      likes:
        reactions.likes +
        (reactionType === 1 && !willRemove ? 1 : reactionType === 1 && willRemove ? -1 : 0),
      dislikes:
        reactions.dislikes +
        (reactionType === -1 && !willRemove ? 1 : reactionType === -1 && willRemove ? -1 : 0),
      total:
        reactions.total +
        (willRemove ? -1 : 1),
      userReaction: newUserReaction as 1 | -1 | 0,
    };
    setReactions(optimistic);

    const payload = { user_id: currentUserId, thread_id: thread.id, reactionType };

    try {
      const result = await toggleMutate(payload);

      if (result && typeof result.likes === "number" && typeof result.dislikes === "number") {
        setReactions({
          likes: result.likes,
          dislikes: result.dislikes,
          total: result.total ?? result.likes + result.dislikes,
          userReaction:
            typeof result.userReaction === "number"
              ? (result.userReaction as 1 | -1 | 0)
              : newUserReaction,
        });
      } else {
        // fallback: obtener desde API
        const reacRes = await fetch(`${API_BASE}/Reactions/thread/${thread.id}`);
        const reacJson: ReactionResponse = await reacRes.json();
        setReactions({
          likes: reacJson.likes ?? 0,
          dislikes: reacJson.dislikes ?? 0,
          total:
            reacJson.total ??
            (reacJson.likes ?? 0) + (reacJson.dislikes ?? 0),
          userReaction:
            typeof reacJson.userReaction === "number"
              ? (reacJson.userReaction as 1 | -1 | 0)
              : newUserReaction,
        });
      }
    } catch (err) {
      console.error("Error al enviar reacción", err);
      setError(true);
    } finally {
      setReacting(false);
    }
  };

  const goBackToForum = () => {
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
      <Box sx={{ py: 6, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!threadId) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          No se recibió el ID del hilo
        </Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate("/forums/general")}>
          Volver a foros
        </Button>
      </Box>
    );
  }

  if (!thread) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          No se encontró el hilo
        </Typography>
        <Button sx={{ mt: 2 }} onClick={goBackToForum}>
          Volver
        </Button>
      </Box>
    );
  }

  return (
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
            label: String(reactions.likes ?? 0),
            icon: (
              <ThumbUpOutlinedIcon
                sx={{ color: reactions.userReaction === 1 ? "success.main" : undefined }}
              />
            ),
            variant: "text",
            onClick: () => !reacting && toggleReactionForThread(1),
          },
          {
            label: String(reactions.dislikes ?? 0),
            icon: (
              <ThumbDownOutlinedIcon
                sx={{ color: reactions.userReaction === -1 ? "error.main" : undefined }}
              />
            ),
            variant: "text",
            onClick: () => !reacting && toggleReactionForThread(-1),
          },
          {
            label: `${messages.length} Respuestas`,
            icon: <ChatBubbleOutlineOutlinedIcon />,
            variant: "text",
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
  );
};

export default ThreadView;
