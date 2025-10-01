// src/services/meetingService.ts
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
  date: string;      // yyyy-mm-dd
  time: string;      // hh:mm
  duration: string;  // "2 horas", "45 minutos"
  location: string;  // "Virtual" | "Sum" | etc
  organizer: string;
  participants: string[];
  status: MeetingStatus;
  tags: string[];
  hasRecording?: boolean;
  transcription?: TranscriptionLine[];
}

export const MEETINGS: Meeting[] = [
  {
    id: 1,
    title: "Asamblea Ordinaria Mensual",
    description:
      "Revisión de expensas, votación de mejoras y temas varios de la comunidad.",
    date: "2024-11-25",
    time: "19:00",
    duration: "2 horas",
    location: "Virtual",
    organizer: "Consejo de Administración",
    participants: [
      "María González",
      "Carlos Rodríguez",
      "Ana Martínez",
      "Luis Fernández",
      "Roberto Silva",
    ],
    status: "scheduled",
    tags: ["Programada", "Consorcio"],
  },
  {
    id: 2,
    title: "Reunión de Emergencia - Problema Eléctrico",
    description:
      "Discusión urgente sobre el corte de luz en el sector B y medidas a tomar.",
    date: "2024-11-20",
    time: "20:30",
    duration: "45 minutos",
    location: "Virtual",
    organizer: "Administrador",
    participants: ["Administrador", "Técnico Eléctrico", "Consejero 1"],
    status: "finished",
    tags: ["Finalizada", "Emergencia"],
    hasRecording: true,
    transcription: [
      {
        speaker: "Administrador",
        time: "20:30:15",
        text: "Buenas noches a todos. Comenzamos esta reunión de emergencia...",
      },
      {
        speaker: "Técnico Eléctrico",
        time: "20:32:45",
        text: "El problema se originó en el tablero principal...",
      },
      {
        speaker: "Consejero 1",
        time: "20:35:20",
        text: "Aprobamos el presupuesto de $15.000 para la reparación urgente.",
      },
    ],
  },
  {
    id: 3,
    title: "Planificación de Mantenimiento 2025",
    description:
      "Revisión del plan de mantenimiento preventivo para el próximo año.",
    date: "2024-11-18",
    time: "18:00",
    duration: "1.5 horas",
    location: "Sum",
    organizer: "Consejo de Administración",
    participants: ["Consejo", "Mantenimiento"],
    status: "finished",
    tags: ["Finalizada", "Mantenimiento"],
    hasRecording: false,
    transcription: [
      {
        speaker: "Mantenimiento",
        time: "18:05:02",
        text: "Se propone cronograma trimestral de inspecciones.",
      },
    ],
  },
  {
    id: 4,
    title: "Evento de Fin de Año",
    description:
      "Organización de la fiesta de fin de año y actividades navideñas.",
    date: "2024-11-30",
    time: "16:00",
    duration: "1 hora",
    location: "Sum",
    organizer: "Consejo de Administración",
    participants: ["Consejo", "Vecinos"],
    status: "scheduled",
    tags: ["Programada", "Social"],
  },
];

export function getMeetings(): Meeting[] {
  return MEETINGS;
}

export function getStats(meetings: Meeting[]) {
  const scheduled = meetings.filter((m) => m.status === "scheduled").length;
  const inProgress = meetings.filter((m) => m.status === "inProgress").length;
  const withTranscription = meetings.filter((m) => m.transcription?.length).length;
  const thisMonth = meetings.length; // mock simple
  return { scheduled, inProgress, withTranscription, thisMonth };
}
