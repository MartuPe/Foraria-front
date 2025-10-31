// src/routes/guards.tsx
import React from "react";
import { Navigate } from "react-router-dom";

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem("accessToken");
  if (!token) return <Navigate to="/iniciarSesion" replace />;

  // Solo forzar UpdateData para Propietario/Inquilino
  const must = localStorage.getItem("requiresPasswordChange") === "true";
  const role = localStorage.getItem("role");

  if (must && (role === "Propietario" || role === "Inquilino")) {
    return <Navigate to="/actualizarInformacion" replace />;
  }

  return <>{children}</>;
};

export const RequireRole: React.FC<{ role: string; children: React.ReactNode }> = ({ role, children }) => {
  const currentRole = localStorage.getItem("role");
  return currentRole === role ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

export const RequireAnyRole: React.FC<{ roles: string[]; children: React.ReactNode }> = ({ roles, children }) => {
  const currentRole = localStorage.getItem("role");
  return currentRole && roles.includes(currentRole) ? <>{children}</> : <Navigate to="/dashboard" replace />;
};
