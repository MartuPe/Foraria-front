import React from "react";
import { Navigate } from "react-router-dom";
import { Role, hasRole } from "../constants/roles";

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");
  const mustUpdate = localStorage.getItem("requiresPasswordChange") === "true";

  if (!token) return <Navigate to="/iniciarSesion" replace />;
  if (mustUpdate && hasRole(role, [Role.OWNER, Role.TENANT])) {
    return <Navigate to="/actualizarInformacion" replace />;
  }

  return <>{children}</>;
};

export const RequireRoles: React.FC<{ roles: Role[]; children: React.ReactNode }> = ({ roles, children }) => {
  const role = localStorage.getItem("role");
  return hasRole(role, roles) ? <>{children}</> : <Navigate to="/dashboard" replace />;
};