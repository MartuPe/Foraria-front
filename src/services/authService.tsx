// src/services/authService.ts
import { api } from "../api/axios";

export type LoginResponse = {
  success: boolean;
  message?: string;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  requiresPasswordChange?: boolean;
  user?: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    roleId?: number;
    roleName?: string; // "Administrador" | "Consorcio" | "Propietario" | "Inquilino"
    role?: string;     // tolerante a otra propiedad
  };
};

export const authService = {
  // LOGIN: guarda tokens/rol y SOLO marca requiresPasswordChange para Propietario/Inquilino
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/User/login", { email, password });

    // tokens
    const access = data.accessToken ?? data.token;
    if (access) localStorage.setItem("accessToken", access);
    if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);

    // rol (tolerante a roleName o role)
    const role = data.user?.roleName ?? data.user?.role ?? localStorage.getItem("role");
    if (role) localStorage.setItem("role", role);

    // user id / email (opcional)
    if (data.user?.id) localStorage.setItem("userId", String(data.user.id));
    if (data.user?.email) localStorage.setItem("email", data.user.email);

    // bandera de primer ingreso: SOLO para Owner/Tenant
    const requires = data.requiresPasswordChange === true;
    if (requires && (role === "Propietario" || role === "Inquilino")) {
      localStorage.setItem("requiresPasswordChange", "true");
    } else {
      localStorage.setItem("requiresPasswordChange", "false");
    }

    return data;
  },

  // UPDATE FIRST TIME: envía multipart/form-data, pisa tokens y apaga bandera
  async updateFirstTime(payload: {
    firstName: string;
    lastName: string;
    dni: string;
    currentPassword: string;   // contraseña temporal/actual
    newPassword: string;
    confirmNewPassword: string;
    photo?: File | null;
  }) {
    const form = new FormData();
    form.append("firstName", payload.firstName);
    form.append("lastName", payload.lastName);
    form.append("dni", payload.dni);
    form.append("currentPassword", payload.currentPassword);
    form.append("newPassword", payload.newPassword);
    form.append("confirmNewPassword", payload.confirmNewPassword);
    if (payload.photo) form.append("photo", payload.photo);

    const r = await api.post("/User/update-first-time", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // guardar nuevos tokens y apagar bandera
    const access = r.data?.accessToken ?? r.data?.token;
    if (access) localStorage.setItem("accessToken", access);
    if (r.data?.refreshToken) localStorage.setItem("refreshToken", r.data.refreshToken);
    localStorage.setItem("requiresPasswordChange", "false");

    return r.data;
  },

  // LOGOUT real: intenta invalidar refresh server-side y limpia storage
  async logout() {
    try {
      const rt = localStorage.getItem("refreshToken");
      if (rt) await api.post("/User/logout", { refreshToken: rt });
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("role");
      localStorage.removeItem("requiresPasswordChange");
      localStorage.removeItem("userId");
      localStorage.removeItem("email");
      sessionStorage.removeItem("foraria.consortium");
    }
  },
};
