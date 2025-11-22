import { api } from "../api/axios";

export interface CallDto {
  id: number;
  createdByUserId: number;
  title: string;
  description: string;
  meetingType: string;
  startedAt: string | null;
  status: string;
}

export interface CallListItemDto {
  id: number;
  title: string;
  description: string;
  meetingType: string;
  status: string;
  startedAt: string;
  participantsCount: number;
  location: string;
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
  sentAt: Date;
}

export interface CallStateDto {
  participants: CallParticipantDto[];
  messages: CallMessageDto[];
}

export const callService = {
  create: (payload: {
    userId: number;
    title: string;
    description: string;
    meetingType: string;
    consortiumId: number;
  }) => api.post<CallDto>("/calls", payload).then((r) => r.data),

  getByConsortium: (consortiumId: number, status?: string) =>
    api
      .get<CallListItemDto[]>(`/calls/consortium/${consortiumId}`, {
        params: status ? { status } : undefined,
      })
      .then((r) => r.data),

  join: (callId: number, userId: number) =>
    api.post(`/calls/${callId}/join`, { userId }),

  end: (callId: number) => api.post(`/calls/${callId}/end`),

  getDetails: (callId: number) =>
    api.get<CallDto>(`/calls/${callId}`).then((r) => r.data),

  getParticipants: (callId: number) =>
    api
      .get<CallParticipantDto[]>(`/calls/${callId}/participants`)
      .then((r) => r.data),

  getState: (callId: number) =>
    api.get<CallStateDto>(`/calls/${callId}/state`).then((r) => r.data),

  uploadRecording: (callId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post(`/calls/${callId}/recording`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};