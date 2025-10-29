import { api } from "../api/axios";

export type RegisterUserPayload = {
  FirstName: string;
  LastName: string;
  Email: string;
  PhoneNumber: number;
  RoleId: number;
  ResidenceId: number;
};

export type ResidenceDto = {
  id: number;
  floor: number | null;
  number: number | null;
  consortiumId: number;
};

export type UserListItem = {
  id: number;
  firstName: string;
  lastName: string;
  mail: string;
  phoneNumber: number | null;
  role: string;
  residences: ResidenceDto[];
  requiresPasswordChange?: boolean;
};

export async function getTotalOwners(consortiumId: number) {
  const { data } = await api.get(`/User/totalOwners`, { params: { consortiumId } });
  return data.totalOwners as number;
}

export async function getTotalTenants(consortiumId: number) {
  const { data } = await api.get(`/User/totalTenants`, { params: { consortiumId } });
  return data.totalTenants as number;
}

export async function getUsersByConsortium(consortiumId: number) {
  const { data } = await api.get<UserListItem[]>(`/User/consortium/${consortiumId}`);
  return data;
}

export const ROLE_META: Record<string, { label: string; chipColor: "primary" | "info" | "success" | "warning" | "default" }> = {
  Administrador: { label: "Administrador", chipColor: "warning" },
  Propietario:   { label: "Propietario",   chipColor: "success" },
  Inquilino:     { label: "Inquilino",     chipColor: "info" },
};

export async function registerUser(payload: RegisterUserPayload) {
  const { data } = await api.post("/User/register", payload);
  return data;
}