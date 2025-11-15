import { api } from "../api/axios";
import { storage } from "../utils/storage";
import { Role } from "../constants/roles";
import { initSessionFromToken, getCurrentUser } from "./userService";

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
    role?: string;     
    residenceId?: number ;
    consortiumId?: number; 
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

        // 3) Guardar usuario/IDs (lo nuevo)
    if (data.user) {
      // user básico desde la respuesta
      const u = {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.firstName ?? "",
        lastName: data.user.lastName ?? "",
        role: (data.user.roleName ?? data.user.role ?? storage.role) || "",
        // si el back ya manda consorcio/residencia, los usamos
        consortiumId: data.user.consortiumId ?? null,
        residences: data.user.residenceId
          ? [{ id: data.user.residenceId, floor: null, number: null, consortiumId: data.user.consortiumId ?? 0 }]
          : [],
      };

      // persistimos en storage de forma consistente
      storage.user = u;
      storage.userId = u.id ?? null;
      storage.consortiumId = (u.consortiumId as number | null) ?? null;
      storage.residenceId = data.user.residenceId ?? null;
    }

    // 3.b) Fallback: si no vino consortium/residence en la respuesta, intentar sacarlo del JWT
    if (!storage.consortiumId || !storage.userId) {
      const fromToken = initSessionFromToken(); // decodifica y persiste lo que encuentre
      // si aún falta info y el rol lo permite, se puede enriquecer (opcional, no rompe)
      if (fromToken?.id) {
        try {
          await getCurrentUser(); // intenta /User?id=... para completar datos de admin/consorcio
        } catch {/* ignore */}
      }
    }

    const requires = data.requiresPasswordChange === true;
    if (requires && (role === Role.OWNER || role === Role.TENANT)) {
      localStorage.setItem("requiresPasswordChange", "true");
    } else {
      localStorage.setItem("requiresPasswordChange", "false");
    }
   
    if (data.user?.id) localStorage.setItem("userId", String(data.user.id));
if (data.user?.email) localStorage.setItem("email", data.user.email);

if (data.user?.residenceId !== undefined && data.user?.residenceId !== null) {
  localStorage.setItem("residenceId", String(data.user.residenceId));
} else {
  localStorage.removeItem("residenceId");
}
if (data.user?.consortiumId !== undefined && data.user?.consortiumId !== null) {
  localStorage.setItem("consortiumId", String(data.user.consortiumId));
} else {
  localStorage.removeItem("consortiumId");
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
    try { initSessionFromToken(); } catch {}
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