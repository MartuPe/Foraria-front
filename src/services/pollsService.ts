import { apiClient } from './apiClient';

export interface Poll {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  deletedAt?: string | null;
  state: string;
  categoryPollId: number;
  userId?: number;
  pollOptions: PollOption[];
  pollResults: PollResult[];
}

export interface PollOption {
  id: number;
  text: string;
}

export interface PollResult {
  pollOptionId: number;
  votesCount: number;
}

export interface VoteRequest {
  userId: number;
  pollId: number;
  pollOptionId: number;
}

export const pollsService = {
  // Obtener todas las votaciones
  async getAll(): Promise<Poll[]> {
    const response = await apiClient.get('/polls'); // Ajustar endpoint según backend
    return response.data;
  },

  // Obtener votaciones con resultados
  async getAllWithResults(): Promise<Poll[]> {
    const response = await apiClient.get('/polls/with-results');
    return response.data;
  },

  // Crear nueva votación
  async create(poll: Omit<Poll, 'id' | 'createdAt' | 'pollResults'>): Promise<Poll> {
    const response = await apiClient.post('/polls', poll);
    return response.data;
  },

  // Votar
  async vote(vote: VoteRequest): Promise<void> {
    await apiClient.post('/votes', vote);
  },
};
