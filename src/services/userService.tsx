import { api } from "../api/axios";
import { jwtDecode } from "jwt-decode";

export type ResidenceDto = {
  id: number;
  floor: string | number | null;
  number: string | number | null;
  consortiumId: number;
};

export type UserProfile = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  role: "Consorcio" | "Administrador" | "Propietario" | "Inquilino";
  dni?: string | number | null;
  consortiumId?: number | null;
  hasPermission?: boolean;
  photo?: string | null;       // ruta de tu back si guardaste foto
  residences?: ResidenceDto[];
};

function claimsToUserProfile(token: string): Partial<UserProfile> {
  try {
    const c = jwtDecode<any>(token);
    return {
      id: Number(c?.nameid ?? c?.sid ?? c?.sub ?? 0) || undefined,
      email: c?.email,
      role: c?.role,
      consortiumId: c?.consortiumId ? Number(c?.consortiumId) : undefined,
      hasPermission: c?.hasPermission === "True" || c?.hasPermission === true,
      firstName: c?.given_name,
      lastName: c?.family_name,
    };
  } catch {
    return {};
  }
}

// Intenta /User/me; si no existe, cae a localStorage, y si sos Admin/Consorcio prueba /User?id=<userId>
export async function getCurrentUser(): Promise<UserProfile> {
  // 1) si existe endpoint /User/me (recomendado)
  try {
    const { data } = await api.get<UserProfile>("/User/me");
    return data;
  } catch (e: any) {
    // 404 o no implementado: continuamos
  }

  // 2) localStorage (lo que guardaste en el login)
  const raw = localStorage.getItem("user");
  const token = localStorage.getItem("accessToken");
  let base: Partial<UserProfile> = raw ? JSON.parse(raw) : {};
  if (token) base = { ...claimsToUserProfile(token), ...base };

  // 3) si sos Admin/Consorcio y hay userId, traé desde /User?id
  const role = (base.role as string) || localStorage.getItem("role") || "";
  const userId = Number((base.id as number) || localStorage.getItem("userId") || 0);
  if ((role === "Administrador" || role === "Consorcio") && userId > 0) {
    try {
      const { data } = await api.get("/User", { params: { id: userId } });
      // El DTO de tu endpoint /User?id devuelve { id, firstName, lastName, email, phoneNumber, roleId, success }
      const merged: UserProfile = {
        id: data.id ?? userId,
        firstName: data.firstName ?? base.firstName ?? "",
        lastName: data.lastName ?? base.lastName ?? "",
        email: data.email ?? base.email ?? "",
        phoneNumber: data.phoneNumber ?? base.phoneNumber ?? null,
        role: (base.role as any) || "Administrador",
        consortiumId: base.consortiumId ?? null,
        hasPermission: base.hasPermission,
        dni: (base as any).dni ?? null,
        residences: (base as any).residences ?? [],
        photo: (base as any).photo ?? null,
      };
      return merged;
    } catch {
      // seguimos con base
    }
  }

  // 4) saneo final
  const prof: UserProfile = {
    id: Number(base.id) || 0,
    firstName: base.firstName ?? "",
    lastName: base.lastName ?? "",
    email: base.email ?? "",
    phoneNumber: base.phoneNumber ?? null,
    role: (base.role as any) ?? "Inquilino",
    consortiumId: base.consortiumId ?? null,
    hasPermission: base.hasPermission,
    dni: (base as any).dni ?? null,
    residences: (base as any).residences ?? [],
    photo: (base as any).photo ?? null,
  };
  return prof;
}
