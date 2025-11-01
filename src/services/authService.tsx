import { api } from "../api/axios";
import { storage } from "../utils/storage";
import { Role } from "../constants/roles";

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
    roleName?: string;
    role?: string;     // tolerante a otra propiedad
  };
};

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/User/login", { email, password });

    const access = data.accessToken ?? data.token;
    if (access) storage.token = access;
    if (data.refreshToken) storage.refresh = data.refreshToken;

    const role = data.user?.roleName ?? data.user?.role ?? storage.role;
    if (role) storage.role = role as Role;

    if (data.user?.id) localStorage.setItem("userId", String(data.user.id));
    if (data.user?.email) localStorage.setItem("email", data.user.email);

    const requires = data.requiresPasswordChange === true;
    if (requires && (role === Role.OWNER || role === Role.TENANT)) {
      localStorage.setItem("requiresPasswordChange", "true");
    } else {
      localStorage.setItem("requiresPasswordChange", "false");
    }

    return data;
  },

  async updateFirstTime(payload: {
    firstName: string;
    lastName: string;
    dni: string;
    currentPassword: string;
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

    const access = r.data?.accessToken ?? r.data?.token;
    if (access) storage.token = access;
    if (r.data?.refreshToken) storage.refresh = r.data.refreshToken;
    localStorage.setItem("requiresPasswordChange", "false");
    return r.data;
  },

  async logout() {
    try {
      const rt = storage.refresh;
      if (rt) await api.post("/User/logout", { refreshToken: rt });
    } catch {
      console.warn("No se pudo cerrar sesión");
    } finally {
      storage.clear();
    }
  },
};