// src/services/messageService.ts
export const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5205/api";

export interface Message {
  id: number;
  thread_id: number;
  user_id: number;
  content: string;
  state?: string;        // "Visible" | "Hidden" (o similar)
  createdAt?: string;
  optionalFile?: string | null;
}

/** GET /api/Message/thread/{threadId} */
export async function getMessagesByThread(threadId: number): Promise<Message[]> {
  const res = await fetch(`${API_BASE}/Message/thread/${threadId}`);
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
  });
  if (!res.ok) throw new Error(await res.text().catch(() => "Error creando mensaje"));
  return res.json();
}

/** PUT /api/Message/{id}  (multipart/form-data: Content, [File], [FilePathToUpdate], [RemoveFile]) */
export async function updateMessage(
  id: number,
  content: string,
  opts?: {
    file?: File | null;
    filePathToUpdate?: string;
    removeFile?: boolean;
  }
): Promise<Message> {
  const fd = new FormData();
  fd.append("Content", content);
  if (opts?.file) fd.append("File", opts.file);
  if (opts?.filePathToUpdate) fd.append("FilePathToUpdate", opts.filePathToUpdate);
  if (typeof opts?.removeFile === "boolean") fd.append("RemoveFile", String(opts.removeFile));

  const res = await fetch(`${API_BASE}/Message/${id}`, {
    method: "PUT",
    body: fd,
  });
  if (!res.ok) throw new Error(await res.text().catch(() => "Error actualizando mensaje"));
  return res.json();
}

/** DELETE /api/Message/{id}?userId={userId}  (Swagger indica userId en query) */
export async function deleteMessage(id: number, userId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/Message/${id}?userId=${userId}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) {
    throw new Error(await res.text().catch(() => `Error eliminando mensaje (${res.status})`));
  }
}

/** PATCH /api/Message/{id}/hide */
export async function hideMessage(id: number): Promise<Message> {
  const res = await fetch(`${API_BASE}/Message/${id}/hide`, { method: "PATCH" });
  if (!res.ok) throw new Error(await res.text().catch(() => "Error ocultando mensaje"));
  try {
    return await res.json();
  } catch {
    return { id, thread_id: 0, user_id: 0, content: "", state: "Hidden" } as Message;
  }
}
