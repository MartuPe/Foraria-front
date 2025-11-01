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

  clear() {
    localStorage.clear();
    sessionStorage.clear();
  },
};