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
          <Route path="/" element={<Navigate to="/iniciarSesion" replace />} />
          <Route path="/iniciarSesion" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recuperar" element={<RecoverPassword />} />

          <Route path="/actualizarInformacion" element={<RequireAuth><RequireAnyRole roles={["Propietario", "Inquilino"]}><UpdateData /></RequireAnyRole></RequireAuth>} />
          <Route path="/dashboard" element={ <RequireAuth> <RequireAnyRole roles={["Propietario", "Inquilino"]}> <Dashboard /> </RequireAnyRole> </RequireAuth>} />
          <Route path="/perfil" element={<RequireAuth><RequireAnyRole roles={["Propietario","Inquilino"]}><Profile /></RequireAnyRole></RequireAuth>} />
          <Route path="/editarInformacion" element={<RequireAuth><RequireAnyRole roles={["Propietario","Inquilino"]}><ChangeData /></RequireAnyRole></RequireAuth>} />
          <Route path="/votaciones" element={<RequireAuth><RequireAnyRole roles={["Propietario","Inquilino"]}><Votes /></RequireAnyRole></RequireAuth>} />
          <Route path="/reuniones" element={<RequireAuth><RequireAnyRole roles={["Propietario","Inquilino"]}><Meetings /></RequireAnyRole></RequireAuth>} />
          <Route path="/documentos" element={<RequireAuth><RequireAnyRole roles={["Propietario","Inquilino"]}><Documents /></RequireAnyRole></RequireAuth>} />
          <Route path="/expensas" element={<RequireAuth><RequireAnyRole roles={["Propietario","Inquilino"]}><ExpensesPage /></RequireAnyRole></RequireAuth>} />
          <Route path="/reclamos" element={<RequireAuth><RequireAnyRole roles={["Propietario","Inquilino"]}><Claims /></RequireAnyRole></RequireAuth>} />
          <Route path="/calendario" element={<RequireAuth><RequireAnyRole roles={["Propietario","Inquilino"]}><Calendar /></RequireAnyRole></RequireAuth>} />
          <Route path="/nuevaReserva" element={<RequireAuth><RequireAnyRole roles={["Propietario","Inquilino"]}><NewReserve /></RequireAnyRole></RequireAuth>} />
          <Route path="/factura" element={<RequireAuth><RequireAnyRole roles={["Propietario","Inquilino"]}><CargaFacturas /></RequireAnyRole></RequireAuth>} />
          {["general","administracion","seguridad","mantenimiento","espacios-comunes","garage-parking"].map((f) => (
            <Route key={f} path={`/forums/${f}`} element={
              <RequireAuth><RequireAnyRole roles={["Propietario","Inquilino"]}><Forums /></RequireAnyRole></RequireAuth>
            } />
          ))}
          <Route path="/forums/comentarios" element={
            <RequireAuth><RequireAnyRole roles={["Propietario","Inquilino"]}><Comentarios /></RequireAnyRole></RequireAuth>
          } />
          <Route path="/configuracion" element={<RequireAuth><RequireAnyRole roles={["Propietario","Inquilino"]}><Configuration /></RequireAnyRole></RequireAuth>} />
          <Route path="/select-consortium" element={<RequireAuth><RequireAnyRole roles={["Propietario","Inquilino"]}><SelectConsortium /></RequireAnyRole></RequireAuth>} />

          <Route path="/admin" element={ <RequireAuth> <RequireAnyRole roles={["Administrador"]}> <AdminLayout /> </RequireAnyRole> </RequireAuth> }>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="reclamos" element={<AdminReclaims />} />
            <Route path="foros" element={<AdminForums />} />
            <Route path="auditoria" element={<AdminAudit />} />
            <Route path="gestionUsuario" element={<AdminUserManagment />} />
            <Route path="votaciones" element={<AdminVotes />} />
            <Route path="provedores" element={<AdminSuppliers />} />
            <Route path="expensas" element={<AdminFactura />} />
          </Route>

          <Route path="*" element={<Navigate to={localStorage.getItem("role") === "Administrador" ? "/admin/dashboard" : "/dashboard"} replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}