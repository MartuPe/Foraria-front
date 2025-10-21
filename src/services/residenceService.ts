import { api } from "../api/axios";

export type Residence = {
  id: number;
  number: number;
  floor: number;
  tower: string;
  consortiumId: number;
};

const LS_KEY = "foraria.residences";

// helpers de fallback
function lsGet(): Residence[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
}
function lsSet(data: Residence[]) { localStorage.setItem(LS_KEY, JSON.stringify(data)); }

// flag para activar fallback en dev cuando la API falla
const USE_FAKE = process.env.NODE_ENV !== "production";

export const residenceService = {
  async getAll(): Promise<Residence[]> {
    try {
      const { data } = await api.get<Residence[]>("/Residence/getAll");
      return data ?? [];
    } catch (err: any) {
      // Si el back tira 500 y estamos en dev: usamos localStorage
      if (USE_FAKE && (err?.response?.status >= 500 || !err?.response)) {
        return lsGet();
      }
      throw err;
    }
  },

  async create(payload: Omit<Residence, "id">): Promise<void> {
    try {
      await api.post("/Residence/create", payload);
    } catch (err: any) {
      if (USE_FAKE && (err?.response?.status >= 500 || !err?.response)) {
        const list = lsGet();
        const nextId = (list.at(-1)?.id ?? 0) + 1;
        list.push({ id: nextId, ...payload });
        lsSet(list);
        return;
      }
      throw err;
    }
  },
};

export default residenceService;
