// src/services/voteService.ts
export type VoteStatus = "active" | "closed" | "upcoming";
export type VoteAction = "favor" | "against";

export type VoteItem = {
  id: string;
  title: string;
  description: string;
  status: VoteStatus;
  startDate: string;
  endDate: string;
  inFavor: number;
  against: number;
  totalOwners: number;
  hasVoted?: boolean;
};

const STORAGE_KEY = "foraria:votes";

export const DEFAULT_VOTES: VoteItem[] = [
  {
    id: "1",
    title: "Renovación de la Pileta",
    description:
      "Propuesta para renovar el sistema de filtrado y revestimiento de la pileta común.",
    status: "active",
    startDate: "15 Nov 2024",
    endDate: "30 Nov 2024",
    inFavor: 45,
    against: 12,
    totalOwners: 85,
    hasVoted: false,
  },
  {
    id: "2",
    title: "Instalación de Cámaras de Seguridad",
    description:
      "Colocación de sistema de videovigilancia en accesos principales y espacios comunes.",
    status: "active",
    startDate: "10 Nov 2024",
    endDate: "25 Nov 2024",
    inFavor: 52,
    against: 18,
    totalOwners: 85,
    hasVoted: true,
  },
  {
    id: "3",
    title: "Cambio de Horarios SUM",
    description:
      "Modificación de horarios de reserva del SUM para eventos los fines de semana.",
    status: "closed",
    startDate: "5 Nov 2024",
    endDate: "20 Nov 2024",
    inFavor: 52,
    against: 18,
    totalOwners: 85,
    hasVoted: true,
  },
  {
    id: "4",
    title: "Mejoras en el Playground",
    description:
      "Renovación de juegos infantiles e instalación de piso de goma.",
    status: "upcoming",
    startDate: "1 Dic 2024",
    endDate: "15 Dic 2024",
    inFavor: 0,
    against: 0,
    totalOwners: 85,
    hasVoted: false,
  },
];

export function getVotes(): VoteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as VoteItem[];
  } catch {}
  // seed initial data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_VOTES));
  return DEFAULT_VOTES;
}

export function setVotes(votes: VoteItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
}

export function applyVote(
  votes: VoteItem[],
  voteId: string,
  action: VoteAction
): VoteItem[] {
  return votes.map((v) =>
    v.id === voteId && !v.hasVoted
      ? {
          ...v,
          inFavor: action === "favor" ? v.inFavor + 1 : v.inFavor,
          against: action === "against" ? v.against + 1 : v.against,
          hasVoted: true,
        }
      : v
  );
}
