export enum Role {
  CONSORCIO = "Consorcio",
  ADMIN = "Administrador",
  OWNER = "Propietario",
  TENANT = "Inquilino",
}

export const RoleGroups = {
  USER: [Role.OWNER, Role.TENANT],
  ADMIN: [Role.ADMIN],
  ALL: [Role.ADMIN, Role.CONSORCIO, Role.OWNER, Role.TENANT],
};

export function hasRole(role: string | null, allowed: Role[]): boolean {
  return !!role && allowed.includes(role as Role);
}