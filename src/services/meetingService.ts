import { callService, CallDto, CallListItemDto,} from "./callService";

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
  duration: string;
  location: string;
  organizer: string;
  participants: string[];
  status: MeetingStatus;
  tags: string[];
  hasRecording?: boolean;
  transcription?: TranscriptionLine[];
}

let meetingsStore: Meeting[] = [];

function toLocalDateTimeParts(iso: string | null): {
  date: string;
  time: string;
} {
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
  const normalized = (status || "").toLowerCase();
  if (normalized === "ended" || normalized === "finished" || endedAt) {
    return "finished";
  }
  if (start && start > now) return "scheduled";
  return "inProgress";
}

function buildTags(
  meetingStatus: MeetingStatus,
  meetingType?: string
): string[] {
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
    duration: "-",
    location: item.location,
    organizer: "Administrador",
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

export async function fetchMeetingsByConsortium(
  consortiumId: number
): Promise<Meeting[]> {
  const calls = await callService.getByConsortium(consortiumId);

  const meetings = await Promise.all(
    calls.map(async (call) => {
      let uniqueParticipantCount = call.participantsCount;

      try {
        const participants = await callService.getParticipants(call.id);
        const uniqueUserIds = Array.from(
          new Set(participants.map((p) => p.userId))
        );
        uniqueParticipantCount = uniqueUserIds.length;
      } catch (err) {
        console.error(`Error obteniendo participantes de la llamada ${call.id}:`, err);
      }

      const fixedCall: CallListItemDto = {
        ...call,
        participantsCount: uniqueParticipantCount,
      };

      return mapCallListItemToMeeting(fixedCall);
    })
  );

  meetingsStore = meetings
    .slice()
    .sort(
      (a, b) =>
        new Date(b.date + "T" + b.time).getTime() -
        new Date(a.date + "T" + a.time).getTime()
    );

  return meetingsStore;
}

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
  const finished = meetings.filter((m) => m.status === "finished").length;
  const inProgress = meetings.filter((m) => m.status === "inProgress").length;
  const withTranscription = meetings.filter(
    (m) => m.transcription?.length
  ).length;
  const thisMonth = meetings.length;
  return { finished, inProgress, withTranscription, thisMonth };
}

export function addMeeting(meeting: Meeting) {
  meetingsStore = [meeting, ...meetingsStore];
}