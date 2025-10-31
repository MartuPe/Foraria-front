// src/App.tsx
import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./styles/muiStyle";
import { RequireAuth, RequireAnyRole } from "./routes/guards";

import Login from "./pages/Login";
import RecoverPassword from "./pages/RecoverPassword";
import UpdateData from "./pages/UpdateData";
import Profile from "./pages/Profile";
import ChangeData from "./pages/ChangeData";

import Votes from "./pages/Votes";
import Meetings from "./pages/Meetings";
import Documents from "./pages/Documents";
import ExpensesPage from "./pages/Expenses";
import Claims from "./pages/Claims";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import NewReserve from "./components/modals/NewEvent";
import Forums from "./pages/Forums";
import Comentarios from "./pages/ThreadView";
import Configuration from "./pages/Configuration";
import SelectConsortium from "./pages/SelectConsortium";
import CargaFacturas from "./components/modals/UploadInvoice";

import AdminLayout from "./components/layout/AdminLayout";
import AdminReclaims from "./pages/admin/AdminReclaims";
import AdminForums from "./pages/admin/AdminForums";
import AdminAudit from "./pages/admin/AdminAudit";
import AdminUserManagment from "./pages/admin/AdminUserManagement";
import AdminVotes from "./pages/admin/AdminVotes";
import AdminSuppliers from "./pages/admin/AdminSuppliers";
import AdminFactura from "./pages/admin/AdminExpenses";
import AdminDashboard from "./pages/admin/AdminDashboard";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Auth */}
          <Route path="/" element={<Navigate to="/iniciarSesion" replace />} />
          <Route path="/iniciarSesion" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recuperar" element={<RecoverPassword />} />

          {/* UpdateData SOLO para Propietario/Inquilino */}
          <Route
            path="/actualizarInformacion"
            element={
              <RequireAuth>
                <RequireAnyRole roles={["Propietario", "Inquilino"]}>
                  <UpdateData />
                </RequireAnyRole>
              </RequireAuth>
            }
          />

          {/* Rutas protegidas */}
          <Route path="/perfil" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/editarInformacion" element={<RequireAuth><ChangeData /></RequireAuth>} />
          <Route path="/votaciones" element={<RequireAuth><Votes /></RequireAuth>} />
          <Route path="/reuniones" element={<RequireAuth><Meetings /></RequireAuth>} />
          <Route path="/documentos" element={<RequireAuth><Documents /></RequireAuth>} />
          <Route path="/expensas" element={<RequireAuth><ExpensesPage /></RequireAuth>} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/reclamos" element={<RequireAuth><Claims /></RequireAuth>} />
          <Route path="/calendario" element={<RequireAuth><Calendar /></RequireAuth>} />
          <Route path="/nuevaReserva" element={<RequireAuth><NewReserve /></RequireAuth>} />
          <Route path="/factura" element={<RequireAuth><CargaFacturas /></RequireAuth>} />

          {/* Forums */}
          {["general","administracion","seguridad","mantenimiento","espacios-comunes","garage-parking"].map((f) => (
            <Route key={f} path={`/forums/${f}`} element={<RequireAuth><Forums /></RequireAuth>} />
          ))}
          <Route path="/forums/comentarios" element={<RequireAuth><Comentarios /></RequireAuth>} />

          {/* Configuración & Consorcio */}
          <Route path="/configuracion" element={<RequireAuth><Configuration /></RequireAuth>} />
          <Route path="/select-consortium" element={<RequireAuth><SelectConsortium /></RequireAuth>} />

          {/* Área Admin (solo Administrador) */}
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <RequireAnyRole roles={["Administrador"]}>
                  <AdminLayout />
                </RequireAnyRole>
              </RequireAuth>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="reclamos" element={<AdminReclaims />} />
            <Route path="foros" element={<AdminForums />} />
            <Route path="auditoria" element={<AdminAudit />} />
            <Route path="gestionUsuario" element={<AdminUserManagment />} />
            <Route path="votaciones" element={<AdminVotes />} />
            <Route path="provedores" element={<AdminSuppliers />} />
            <Route path="expensas" element={<AdminFactura />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
