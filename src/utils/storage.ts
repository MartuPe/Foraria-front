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

  get user(): any | null {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  },
  set user(u: any | null) {
    if (u) localStorage.setItem("user", JSON.stringify(u));
    else localStorage.removeItem("user");
  },

  get userId(): number | null {
    const v = localStorage.getItem("userId");
    if (!v) return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  },
  set userId(id: number | null) {
    if (id && id > 0) localStorage.setItem("userId", String(id));
    else localStorage.removeItem("userId");
  },

  get consortiumId(): number | null {
    const v = localStorage.getItem("consortiumId");
    if (!v) return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  },
  set consortiumId(id: number | null) {
    if (id && id > 0) localStorage.setItem("consortiumId", String(id));
    else localStorage.removeItem("consortiumId");
  },
  get hasPermission(): boolean {
  const v = localStorage.getItem("hasPermission");
  return v === "true"; // convierto a boolean
},
set hasPermission(v: boolean) {
  localStorage.setItem("hasPermission", String(v));
},

  clear() {
    localStorage.clear();
    sessionStorage.clear();
  },
};