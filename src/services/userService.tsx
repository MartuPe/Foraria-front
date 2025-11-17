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
  const prev: any = storage.user ?? {};
  const userId = Number(u.id ?? storage.userId ?? prev.id ?? 0) || null;
  const consortiumId = (u.consortiumId != null ? Number(u.consortiumId) : null) ?? storage.consortiumId ?? prev.consortiumId ?? null;
  const role = (u as any).role ?? storage.role ?? prev.role ?? "";
  const minimal = {
    id: userId ?? 0,
    role,
    consortiumId: consortiumId ?? null,
    firstName: (u as any).firstName ?? prev.firstName ?? "",
    lastName: (u as any).lastName ?? prev.lastName ?? "",
    email: (u as any).email ?? prev.email ?? "",
  };

  storage.user = minimal;
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
  const token = storage.token;
  const base = token ? claimsToUserProfile(token) : {};

  const prev: any = storage.user ?? {};
  const id = Number(base.id ?? storage.userId ?? prev.id ?? 0) || 0;
  const role = (base.role as any) ?? storage.role ?? prev.role ?? "Inquilino";
  const consortiumId =
    base.consortiumId ??
    storage.consortiumId ??
    prev.consortiumId ??
    null;

  const prof: UserProfile = {
    id,
    firstName: base.firstName ?? prev.firstName ?? "",
    lastName: base.lastName ?? prev.lastName ?? "",
    email: base.email ?? prev.email ?? "",
    phoneNumber: base.phoneNumber ?? null,
    role,
    consortiumId,
    hasPermission: base.hasPermission,
    dni: (base as any).dni ?? null,
    residences: [],
    photo: (base as any).photo ?? null,
  };

  saveUserToStorage(prof);
  return prof;
}

export async function getEffectiveIds(): Promise<{ userId: number; consortiumId: number }> {
  const prof = storage.user ?? initSessionFromToken() ?? (await getCurrentUser());
  const userId = Number((prof as any)?.id ?? storage.userId ?? 0);
  const consortiumId = Number(
    (prof as any)?.consortiumId ??
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
