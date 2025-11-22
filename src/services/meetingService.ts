import { callService, CallDto, CallListItemDto } from "./callService";

export interface TranscriptionLine {
  speaker: string;
  time: string;
  text: string;
}

export type MeetingStatus = "scheduled" | "inProgress" | "finished";

export interface Meeting {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;  // "2 horas", "45 minutos" (por ahora placeholder)
  location: string;
  organizer: string;
  participants: string[]; // por ahora sólo usamos length
  status: MeetingStatus;
  tags: string[];
  hasRecording?: boolean;
  transcription?: TranscriptionLine[];
}

let meetingsStore: Meeting[] = [];

function toLocalDateTimeParts(iso: string | null): { date: string; time: string } {
  if (!iso) {
    const now = new Date();
    return {
      date: now.toISOString().split("T")[0],
      time: now.toTimeString().slice(0, 5),
    };
  }
  const d = new Date(iso);
  return {
    date: d.toISOString().split("T")[0],
    time: d.toTimeString().slice(0, 5),
  };
}

function mapBackendStatusToMeetingStatus(
  status: string,
  startedAt: string | null,
  endedAt?: string | null
): MeetingStatus {
  const now = new Date();
  const start = startedAt ? new Date(startedAt) : null;

  if (status === "Finished" || endedAt) return "finished";
  if (start && start > now) return "scheduled";
  return "inProgress";
}

function buildTags(meetingStatus: MeetingStatus, meetingType?: string): string[] {
  const tags: string[] = [];
  if (meetingStatus === "scheduled") tags.push("Programada");
  if (meetingStatus === "finished") tags.push("Finalizada");
  if (meetingStatus === "inProgress") tags.push("En curso");
  if (meetingType) tags.push(meetingType);
  return tags;
}

function mapCallListItemToMeeting(item: CallListItemDto): Meeting {
  const { date, time } = toLocalDateTimeParts(item.startedAt);
  const status = mapBackendStatusToMeetingStatus(item.status, item.startedAt);

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    date,
    time,
    duration: "-",                // por ahora sin duración real
    location: item.location,
    organizer: "Administrador",   // revisar
    participants: Array(item.participantsCount).fill("Participante"),
    status,
    tags: buildTags(status, item.meetingType),
    hasRecording: false,
    transcription: [],
  };
}

export function mapCallToMeeting(call: CallDto): Meeting {
  const { date, time } = toLocalDateTimeParts(call.startedAt);
  const status = mapBackendStatusToMeetingStatus(call.status, call.startedAt);

  return {
    id: call.id,
    title: call.title,
    description: call.description,
    date,
    time,
    duration: "-",
    location: "Virtual",
    organizer: "Administrador",
    participants: [],
    status,
    tags: buildTags(status, call.meetingType),
    hasRecording: false,
    transcription: [],
  };
}

export async function fetchMeetingsByConsortium(consortiumId: number): Promise<Meeting[]> {
  const calls = await callService.getByConsortium(consortiumId);
  meetingsStore = calls
    .sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    )
    .map(mapCallListItemToMeeting);
  return meetingsStore;
}

// Mantener helpers para stats/filtros
export function getMeetings(): Meeting[] {
  return meetingsStore;
}

export function getMeetingById(id: number): Meeting | undefined {
  return meetingsStore.find((m) => m.id === id);
}

export function filterMeetingsByStatus(
  status: MeetingStatus | "all"
): Meeting[] {
  if (status === "all") return meetingsStore;
  return meetingsStore.filter((m) => m.status === status);
}

export function getStats(meetings: Meeting[]) {
  const scheduled = meetings.filter((m) => m.status === "scheduled").length;
  const inProgress = meetings.filter((m) => m.status === "inProgress").length;
  const withTranscription = meetings.filter((m) => m.transcription?.length).length;
  const thisMonth = meetings.length;
  return { scheduled, inProgress, withTranscription, thisMonth };
}

export function addMeeting(meeting: Meeting) {
  meetingsStore = [meeting, ...meetingsStore];
}