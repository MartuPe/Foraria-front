import { api } from "../api/axios";
import { jwtDecode } from "jwt-decode";
import { storage } from "../utils/storage";

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
  role: "Consorcio" | "Administrador" | "Propietario" | "Inquilino" | string;
  dni?: string | number | null;
  consortiumId?: number | null;
  hasPermission?: boolean;
  photo?: string | null;
  residences?: ResidenceDto[];
};

function normalizeRole(r: any): string | undefined {
  if (Array.isArray(r) && r.length) return String(r[0]);
  if (typeof r === "string") return r;
  return undefined;
}

function claimsToUserProfile(token: string): Partial<UserProfile> {
  try {
    const c = jwtDecode<any>(token);
    return {
      id: Number(c?.nameid ?? c?.sid ?? c?.sub ?? 0) || undefined,
      email: c?.email,
      role: normalizeRole(c?.role) as any,
      consortiumId: c?.consortiumId != null ? Number(c?.consortiumId) : undefined,
      hasPermission: c?.hasPermission === "True" || c?.hasPermission === true,
      firstName: c?.given_name,
      lastName: c?.family_name,
    };
  } catch {
    return {};
  }
}

function saveUserToStorage(u: UserProfile | Partial<UserProfile>) {
  const userId = Number(u.id ?? storage.userId ?? 0) || null;
  const consortiumId =
    (u.consortiumId != null ? Number(u.consortiumId) : null) ??
    (u.residences && u.residences[0]?.consortiumId ? Number(u.residences[0].consortiumId) : null) ??
    storage.consortiumId;

  const role = (u as any).role ?? storage.role ?? "";

  storage.user = {
    ...(storage.user ?? {}),
    ...u,
    id: userId ?? 0,
    role,
    consortiumId: consortiumId ?? null,
  };
  storage.userId = userId;
  storage.role = role || null;
  storage.consortiumId = consortiumId ?? null;

  if (Array.isArray(u.residences) && u.residences[0]?.id) {
    storage.residenceId = Number(u.residences[0].id);
  }
}

export function initSessionFromToken(): UserProfile | null {
  const token = storage.token;
  if (!token) return null;
  const base = claimsToUserProfile(token);

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
  saveUserToStorage(prof);
  return prof;
}

export async function getCurrentUser(): Promise<UserProfile> {
  const raw = localStorage.getItem("user");
  const token = storage.token;

  let base: Partial<UserProfile> = raw ? JSON.parse(raw) : {};
  if (token) {
    base = { ...claimsToUserProfile(token), ...base };
  }

  const userId = Number(base.id ?? storage.userId ?? 0);

  if (userId > 0) {
    try {
      const { data } = await api.get<any>("/User", { params: { id: userId } });

      const residences: ResidenceDto[] = [];
      if (data.residenceId) {
        residences.push({
          id: data.residenceId,
          floor: data.floor ?? null,
          number: data.numberFloor ?? null,
          consortiumId: data.consortiumId,
        });
      }

      const merged: UserProfile = {
        id: data.id ?? userId,
        firstName: data.firstName ?? base.firstName ?? "",
        lastName: data.lastName ?? base.lastName ?? "",
        email: data.email ?? base.email ?? "",
        phoneNumber: data.phoneNumber ?? base.phoneNumber ?? null,
        role: (data.roleDescription as any) ?? (base.role as any) ?? "",
        consortiumId: data.consortiumId ?? base.consortiumId ?? null,
        hasPermission: base.hasPermission,
        dni: data.dni ?? (base as any).dni ?? null,
        residences: residences.length ? residences : (base as any).residences ?? [],
        photo: data.photo ?? (base as any).photo ?? null,
      };

      saveUserToStorage(merged);
      return merged;
    } catch (e) {
      console.warn("Fallo GET /User, usando solo claims/token", e);
    }
  }

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

  saveUserToStorage(prof);
  return prof;
}

export async function getEffectiveIds(): Promise<{ userId: number; consortiumId: number }> {
  const prof = storage.user ?? initSessionFromToken() ?? (await getCurrentUser());
  const userId = Number(prof?.id ?? storage.userId ?? 0);
  const consortiumId = Number(
    prof?.consortiumId ??
      prof?.residences?.[0]?.consortiumId ??
      storage.consortiumId ??
      0
  );
  if (!userId || !consortiumId) {
    throw new Error("No pude resolver userId/consortiumId desde el token/storage.");
  }

  storage.userId = userId;
  storage.consortiumId = consortiumId;
  return { userId, consortiumId };
}