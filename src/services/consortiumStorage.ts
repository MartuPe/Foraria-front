export type ActiveConsortium = {
  id: number;       // consortiumId
  name?: string;    // opcional, para mostrar en el header
  tower?: string;   // opcional, último seleccionado
};

const KEY = "foraria.consortium";

export function setActiveConsortium(c: ActiveConsortium) {
  sessionStorage.setItem(KEY, JSON.stringify(c));
}
export function getActiveConsortium(): ActiveConsortium | null {
  const raw = sessionStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}
export function clearActiveConsortium() {
  sessionStorage.removeItem(KEY);
}
