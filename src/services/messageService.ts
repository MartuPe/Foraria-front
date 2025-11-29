// src/services/messageService.ts
import { storage } from "../utils/storage";

export const API_BASE =
  process.env.REACT_APP_API_BASE || "https://localhost:7245";

export interface Message {
  id: number;
  thread_id: number;
  user_id: number;
  content: string;
  state?: string; // "Visible" | "Hidden" (o similar)
  createdAt?: string;
  optionalFile?: string | null;
}

// helper para armar headers con el token
function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {};
  const token = storage.token || localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `bearer ${token}`;
  }
  return headers;
}

/** GET /api/Message/thread/{threadId} */
export async function getMessagesByThread(
  threadId: number
): Promise<Message[]> {
  const res = await fetch(`${API_BASE}/Message/thread/${threadId}`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) throw new Error(`Error obteniendo mensajes (${res.status})`);
  return res.json();
}

/** POST /api/Message  (multipart/form-data: Content, Thread_id, User_id, [File]) */
export async function createMessage(
  threadId: number,
  userId: number,
  content: string,
  file?: File | null
): Promise<Message> {
  const fd = new FormData();
  fd.append("Content", content);
  fd.append("Thread_id", String(threadId));
  fd.append("User_id", String(userId));
  if (file) fd.append("File", file);

  const res = await fetch(`${API_BASE}/Message`, {
    method: "POST",
    body: fd,
    headers: {
      ...getAuthHeaders(),
      // NO seteamos Content-Type para dejar que el browser ponga el boundary
    },
  });
  if (!res.ok)
    throw new Error(
      (await res.text().catch(() => "")) || "Error creando mensaje"
    );
  return res.json();
}

/** PUT /api/Message/{id}  (multipart/form-data: Content, [File], [FilePathToUpdate], [RemoveFile]) */
export async function updateMessage(messageId: number, content: string): Promise<void> {
  const token = localStorage.getItem("accessToken");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const body = {
    userId: Number(localStorage.getItem("userId")),
    content: content,
    file: null,
    filePathToUpdate: null,
    removeFile: true
  };

  const response = await fetch(
    `${API_BASE}/Message/${messageId}`,
    {
      method: "PUT", // o "PATCH" dependiendo de tu API
      headers,
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    throw new Error("Error al actualizar el mensaje");
  }
}

/** DELETE /api/Message/{id}?userId={userId}  (Swagger indica userId en query) */
export async function deleteMessage(
  id: number,
  userId: number
): Promise<void> {
  const res = await fetch(`${API_BASE}/Message/${id}?userId=${userId}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(
      (await res.text().catch(() => "")) ||
        `Error eliminando mensaje (${res.status})`
    );
  }
}

/** PATCH /api/Message/{id}/hide */
export async function hideMessage(id: number): Promise<Message> {
  const res = await fetch(`${API_BASE}/Message/${id}/hide`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!res.ok)
    throw new Error(
      (await res.text().catch(() => "")) || "Error ocultando mensaje"
    );
  try {
    return await res.json();
  } catch {
    return {
      id,
      thread_id: 0,
      user_id: 0,
      content: "",
      state: "Hidden",
    } as Message;
  }
}
