export const storage = {
  get token() {
    return localStorage.getItem("accessToken");
  },
  set token(v: string | null) {
    v ? localStorage.setItem("accessToken", v) : localStorage.removeItem("accessToken");
  },

  get role() {
    return localStorage.getItem("role");
  },
  set role(v: string | null) {
    v ? localStorage.setItem("role", v) : localStorage.removeItem("role");
  },

  get refresh() {
    return localStorage.getItem("refreshToken");
  },
  set refresh(v: string | null) {
    v ? localStorage.setItem("refreshToken", v) : localStorage.removeItem("refreshToken");
  },
  
 get residenceId(): number | null {
    const v = localStorage.getItem("residenceId");
    if (!v) return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  },
  set residenceId(id: number | null) {
    if (id && id > 0) localStorage.setItem("residenceId", String(id));
    else localStorage.removeItem("residenceId");
  },

  clear() {
    localStorage.clear();
    sessionStorage.clear();
  },
};