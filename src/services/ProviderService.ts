import { api } from "../api/axios";
import { Provider } from "../models/Provider";

const base = "/providers";

export const ProviderService = {
  list: (q?: string) => api.get<Provider[]>(base, { params: { q } }).then(r => r.data),
  get:  (id: number) => api.get<Provider>(`${base}/${id}`).then(r => r.data),
  create: (p: Omit<Provider, "id" | "createdAt" | "updatedAt">) => api.post<Provider>(base, p).then(r => r.data),
  update: (id: number, p: Partial<Provider>) => api.put<Provider>(`${base}/${id}`, p).then(r => r.data),
  remove: (id: number) => api.delete<void>(`${base}/${id}`).then(() => {}),
};
