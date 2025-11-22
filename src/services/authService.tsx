import { api } from "../api/axios";
import { storage } from "../utils/storage";
import { Role } from "../constants/roles";
import { initSessionFromToken } from "./userService";

export type LoginResponse = {
  success: boolean;
  message?: string;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  consortiumId?: number;
  requiresPasswordChange?: boolean;
  user?: {
    id: number;
    name?: string;
    lastName?: string;
    mail?: string;
    phoneNumber?: number;
    dni?: number;
    photo?: string;
    role_id?: number;
    role?: {
      id: number;
      description: string;
    };
    residences?: Array<{
      id: number;
      floor?: number;
      number?: number;
      tower?: string;
      
    }>;
    requiresPasswordChange?: boolean;
    hasPermission?: boolean;
    consortiumId?: number;
  };
};

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/User/login", { email, password });
console.log("Login response data:", data);
    // 1) Guardar tokens
    const access = data.accessToken ?? data.token;
    if (access) storage.token = access;
    if (data.refreshToken) storage.refresh = data.refreshToken;

    // 2) Extraer el rol correctamente desde role.description
    const roleDescription = data.user?.role?.description;
    if (roleDescription) {
      storage.role = roleDescription as Role;
      localStorage.setItem("role", roleDescription);
    }

    // 3) Guardar datos del usuario
 if (data.user) {
  const firstResidence = data.user.residences?.[0];

  // EL consortiumId REAL viene del root del JSON
  const consortiumId =
    data.consortiumId ??
    null;

  const residenceId = firstResidence?.id ?? null;

  const u = {
    id: data.user.id,
    email: data.user.mail ?? email,
    firstName: data.user.name ?? "",
    lastName: data.user.lastName ?? "",
    role: roleDescription ?? "",
    consortiumId: consortiumId,
    residences: data.user.residences ?? [],
  };

  storage.user = u;
  storage.userId = u.id;
  storage.consortiumId = consortiumId;
  storage.residenceId = residenceId;

  localStorage.setItem("userId", String(u.id));
  localStorage.setItem("email", u.email);

  if (consortiumId != null) {
    localStorage.setItem("consortiumId", String(consortiumId));
  } else {
    localStorage.removeItem("consortiumId");
  }

  if (residenceId) {
    localStorage.setItem("residenceId", String(residenceId));
  } else {
    localStorage.removeItem("residenceId");
  }
}

    // 4) Manejar requiresPasswordChange
    const requires = data.requiresPasswordChange === true;
    localStorage.setItem("requiresPasswordChange", requires ? "true" : "false");

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

  // Guardamos solo el token, NO regeneramos rol
  const access = r.data?.accessToken ?? r.data?.token;
  if (access) storage.token = access;

  if (r.data?.refreshToken) storage.refresh = r.data.refreshToken;

 const currentRole = storage.role;

try { initSessionFromToken(); } catch {  localStorage.setItem("requiresPasswordChange", "false");}

// restaurar rol
storage.role = currentRole;
if (currentRole !== null) {
  localStorage.setItem("role", currentRole);
} else {
  localStorage.removeItem("role");
}



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