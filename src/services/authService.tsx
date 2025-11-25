import { api } from "../api/axios";
import { storage } from "../utils/storage";
import { Role } from "../constants/roles";

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
      const consortiumId = data.consortiumId ?? null;
      const residenceId = firstResidence?.id ?? null;

      const u = {
        id: data.user.id,
        email: data.user.mail ?? email,
        firstName: data.user.name ?? "",
        lastName: data.user.lastName ?? "",
        role: roleDescription ?? "",
        consortiumId: consortiumId,
        residences: data.user.residences ?? [],
        hasPermission: data.user.hasPermission ?? false,
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

      localStorage.setItem("hasPermission", String(u.hasPermission));
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

    console.log("Update first time response:", r.data);

    // 1) Guardar tokens
    const access = r.data?.token ?? r.data?.accessToken;
    if (access) storage.token = access;
    if (r.data?.refreshToken) storage.refresh = r.data.refreshToken;

    // 2) Decodificar el nuevo JWT para extraer TODA la información
    if (access) {
      try {
        const decoded: any = JSON.parse(atob(access.split(".")[1]));
        console.log("JWT decodificado:", decoded);

        // Extraer todos los claims del JWT
        const userId = decoded["sub"] || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        const email = decoded["email"];
        const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        const roleId = decoded["roleId"];
        const hasPermission = decoded["hasPermission"] === "True" || decoded["hasPermission"] === true;
        const requiresPasswordChange = decoded["requiresPasswordChange"] === "True" || decoded["requiresPasswordChange"] === true;
        const consortiumId = decoded["consortiumId"];

        // 3) Guardar toda la información en storage
        if (role) {
          storage.role = role as Role;
          localStorage.setItem("role", role);
        }

        if (userId) {
          storage.userId = Number(userId);
          localStorage.setItem("userId", userId);
        }

        if (email) {
          localStorage.setItem("email", email);
        }

        if (consortiumId) {
          storage.consortiumId = Number(consortiumId);
          localStorage.setItem("consortiumId", consortiumId);
        }

        if (roleId) {
          localStorage.setItem("roleId", roleId);
        }

        localStorage.setItem("hasPermission", String(hasPermission));
        localStorage.setItem("requiresPasswordChange", String(requiresPasswordChange));

        // 4) Actualizar el objeto user en storage
        const currentUser = storage.user || {};
        storage.user = {
          ...currentUser,
          id: Number(userId),
          email: email || currentUser.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          role: role,
          consortiumId: Number(consortiumId),
          hasPermission: hasPermission,
        };

        console.log("Storage actualizado:", {
          role: storage.role,
          userId: storage.userId,
          consortiumId: storage.consortiumId,
          user: storage.user,
        });
      } catch (err) {
        console.error("Error al decodificar JWT:", err);
      }
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

  async getCurrentUser() {
    const res = await api.get("/auth/me");
    return res.data;
  }
};