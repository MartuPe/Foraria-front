import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Divider,
  Button,
  Stack,
  TextField,
  Dialog,
  IconButton,
  Tooltip,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbDownOutlinedIcon from "@mui/icons-material/ThumbDownOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import InfoCard from "../components/InfoCard";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation } from "../hooks/useMutation";

import { storage } from "../utils/storage";
import { Role, RoleGroups } from "../constants/roles";
import {
  Message,
  deleteMessage as deleteMessageApi,
} from "../services/messageService";
import EditMessage from "../components/modals/EditMessage";
import { ForariaStatusModal } from "../components/StatCardForms";

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

// OJO: este es el que ya usabas en ThreadView
const API_BASE = "https://localhost:7245/api";

const currentUserId = Number(localStorage.getItem("userId") || 0);
const currentRole = storage.role as Role | null;
const isAdmin = currentRole ? RoleGroups.ADMIN.includes(currentRole) : false;

const ThreadView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams<{ threadId?: string }>();

  const threadIdFromState = (location.state as any)?.threadId;
  const threadIdParam = params.threadId ? Number(params.threadId) : undefined;
  const threadId =
    typeof threadIdFromState === "number" ? threadIdFromState : threadIdParam;

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
  const [commentError, setCommentError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [reacting, setReacting] = useState(false);

  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [deletingMessage, setDeletingMessage] = useState(false);

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

  const { mutate: toggleMutate } =
    useMutation<
      ReactionResponse,
      {
        user_id: number;
        thread_id?: number;
        message_id?: number;
        reactionType: number;
      }
    >("/Reactions/toggle", "post");

  // recargar solo mensajes (para cuando edites o borres)
  const reloadMessages = async () => {
    if (!threadId) return;
    try {
      const res = await fetch(`${API_BASE}/Message/thread/${threadId}`);
      if (res.ok) {
        const msgs = await res.json();
        setMessages(Array.isArray(msgs) ? msgs : []);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error("Error recargando mensajes del hilo", err);
      setMessages([]);
    }
  };

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
        else
          setReactions({
            total: 0,
            likes: 0,
            dislikes: 0,
            userReaction: 0,
          });

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
          setReactions({
            total: 0,
            likes: 0,
            dislikes: 0,
            userReaction: 0,
          });
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

  const formattedDate = thread
    ? new Date(thread.createdAt).toLocaleDateString("es-AR")
    : "";

  const toggleReactionForThread = async (reactionType: 1 | -1) => {
    if (!thread || reacting) return;
    setReacting(true);

    const prevReactions = reactions;
    const prevUserReaction = reactions.userReaction ?? 0;
    const willRemove = prevUserReaction === reactionType;
    const newUserReaction = (willRemove ? 0 : reactionType) as 1 | -1 | 0;

    const optimistic: ReactionResponse = {
      likes:
        reactions.likes +
        (reactionType === 1 && !willRemove
          ? 1
          : reactionType === 1 && willRemove
          ? -1
          : 0),
      dislikes:
        reactions.dislikes +
        (reactionType === -1 && !willRemove
          ? 1
          : reactionType === -1 && willRemove
          ? -1
          : 0),
      total: reactions.total + (willRemove ? -1 : 1),
      userReaction: newUserReaction,
    };
    setReactions(optimistic);

    const payload = {
      user_id: currentUserId,
      thread_id: thread.id,
      reactionType,
    };

    try {
      const result = await toggleMutate(payload);

      if (
        result &&
        typeof result.likes === "number" &&
        typeof result.dislikes === "number"
      ) {
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
        const reacRes = await fetch(
          `${API_BASE}/Reactions/thread/${thread.id}`
        );
        if (!reacRes.ok) throw new Error("Reactions fallback failed");
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

      try {
        const reacRes = await fetch(
          `${API_BASE}/Reactions/thread/${thread.id}`
        );
        if (reacRes.ok) {
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
                : prevUserReaction,
          });
        } else {
          setReactions(prevReactions);
        }
      } catch {
        setReactions(prevReactions);
      }

      setStatusModal({
        open: true,
        variant: "error",
        title: "No se pudo registrar tu reacción",
        message: "No pudimos guardar tu reacción. Intentá nuevamente más tarde.",
      });
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
    if (!thread) return;

    const text = commentText.trim();
    if (!text) {
      setCommentError("El comentario no puede estar vacío.");
      return;
    }

    setSending(true);
    setCommentError(null);

    try {
      const form = new FormData();
      form.append("Content", text);
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
        console.error("Error al enviar comentario", await res.text());
        setStatusModal({
          open: true,
          variant: "error",
          title: "No se pudo publicar el comentario",
          message:
            "No pudimos guardar tu comentario. Intentá nuevamente más tarde.",
        });
      }
    } catch (err) {
      console.error("Error de red al comentar", err);
      setStatusModal({
        open: true,
        variant: "error",
        title: "No se pudo publicar el comentario",
        message:
          "Ocurrió un problema al enviar tu comentario. Intentá nuevamente más tarde.",
      });
    } finally {
      setSending(false);
    }
  };

  const canEditOrDelete = (msg: Message) =>
    isAdmin || msg.user_id === currentUserId;

  const handleDeleteMessage = (msg: Message) => {
    if (!canEditOrDelete(msg)) return;
    setMessageToDelete(msg);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDeleteMessage = async () => {
    if (!messageToDelete) return;

    try {
      setDeletingMessage(true);
      await deleteMessageApi(messageToDelete.id, currentUserId);
      setMessages((prev) => prev.filter((m) => m.id !== messageToDelete.id));

      setStatusModal({
        open: true,
        variant: "success",
        title: "Respuesta eliminada",
        message: "La respuesta se eliminó correctamente.",
      });
    } catch (err) {
      console.error("Error eliminando mensaje", err);
      setStatusModal({
        open: true,
        variant: "error",
        title: "No se pudo eliminar la respuesta",
        message:
          "No pudimos eliminar la respuesta. Intentá nuevamente más tarde.",
      });
    } finally {
      setDeletingMessage(false);
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
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
                sx={{
                  color:
                    reactions.userReaction === 1 ? "success.main" : undefined,
                }}
              />
            ),
            variant: "text",
            onClick: () => !reacting && toggleReactionForThread(1),
          },
          {
            label: String(reactions.dislikes ?? 0),
            icon: (
              <ThumbDownOutlinedIcon
                sx={{
                  color:
                    reactions.userReaction === -1 ? "error.main" : undefined,
                }}
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
            onChange={(e) => {
              setCommentText(e.target.value);
              if (commentError) setCommentError(null);
            }}
            disabled={sending}
            error={!!commentError}
            helperText={commentError ?? ""}
          />
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendComment}
              disabled={sending}
            >
              {sending ? "Enviando..." : "Enviar"}
            </Button>
            <Button
              variant="text"
              onClick={() => setShowCommentBox(false)}
              disabled={sending}
            >
              Cancelar
            </Button>
          </Stack>
        </Box>
      )}

      <Box>
        <Typography>Respuestas ({messages.length})</Typography>
        <Divider />
      </Box>

      {/* RESPUESTAS CON ICONOS DE EDITAR / ELIMINAR ARRIBA A LA DERECHA */}
      <Box>
        {messages.map((msg) => {
          const msgDate = msg.createdAt
            ? new Date(msg.createdAt).toLocaleDateString("es-AR")
            : "";
          const allowed = canEditOrDelete(msg);

          return (
            <Box
              key={msg.id}
              sx={{
                position: "relative",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                p: 2,
                mb: 1.5,
              }}
            >
              {/* Íconos tipo hilo, arriba a la derecha */}
              {allowed && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    display: "flex",
                    gap: 0.5,
                  }}
                >
                  <Tooltip title="Editar respuesta">
                    <IconButton
                      size="small"
                      onClick={() => setEditingMessage(msg)}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar respuesta">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteMessage(msg)}
                    >
                      <DeleteOutlineOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}

              {/* Contenido de la respuesta */}
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, mb: 0.2 }}
              >
                {`Usuario ${msg.user_id}`}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 0.5 }}
              >
                {msgDate}
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {msg.content}
              </Typography>

              {msg.optionalFile && (
                <Typography
                  component="a"
                  href={msg.optionalFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body2"
                  sx={{ mt: 0.5, display: "inline-block" }}
                >
                  Ver archivo adjunto
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Modal edición de respuesta */}
      <Dialog
        open={!!editingMessage}
        onClose={() => setEditingMessage(null)}
        fullWidth
        maxWidth="sm"
      >
        {editingMessage && (
          <EditMessage
            messageId={editingMessage.id}
            initialContent={editingMessage.content}
            onClose={() => setEditingMessage(null)}
            onUpdated={reloadMessages}
          />
        )}
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          if (!deletingMessage) {
            setDeleteDialogOpen(false);
            setMessageToDelete(null);
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
              setDeleteDialogOpen(false);
              setMessageToDelete(null);
            }}
            disabled={deletingMessage}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDeleteMessage}
            disabled={deletingMessage}
            startIcon={
              deletingMessage ? (
                <CircularProgress size={16} />
              ) : (
                <DeleteOutlineOutlinedIcon />
              )
            }
          >
            {deletingMessage ? "Eliminando..." : "Eliminar"}
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

export default ThreadView;
