import { api } from "../api/axios";

export interface CallDto {
  id: number;
  createdByUserId: number;
  startedAt: string | null;
  status: string;
}

export interface CallParticipantDto {
  id: number;
  userId: number;
  joinedAt: string;
  leftAt?: string | null;
  isCameraOn?: boolean;
  isConnected?: boolean;
  isMuted?: boolean;
}

export interface CallMessageDto {
  id: number;
  userId: number;
  message: string;
  sentAt: string;
}

export interface CallStateDto {
  participants: CallParticipantDto[];
  messages: CallMessageDto[];
}

export const callService = {
  create: (userId: number) =>
    api.post<CallDto>("/api/calls", { userId }).then((r) => r.data),

  join: (callId: number, userId: number) =>
    api.post(`/api/calls/${callId}/join`, { userId }),

  end: (callId: number) => api.post(`/api/calls/${callId}/end`),

  getDetails: (callId: number) =>
    api.get<CallDto>(`/api/calls/${callId}`).then((r) => r.data),

  getParticipants: (callId: number) =>
    api
      .get<CallParticipantDto[]>(`/api/calls/${callId}/participants`)
      .then((r) => r.data),

  getState: (callId: number) =>
    api.get<CallStateDto>(`/api/calls/${callId}/state`).then((r) => r.data),

  uploadRecording: (callId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post(`/api/calls/${callId}/recording`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};