import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./styles/muiStyle";
import { RequireAuth, RequireRoles } from "./routes/guards";
import { Role, RoleGroups } from "./constants/roles";
import { storage } from "./utils/storage";

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


// Proveedores (listado con popup interno)

import AdminDocuments from "./pages/admin/AdminDocuments";

// Forums (usuario)

import Forums from "./pages/Forums";
import Comentarios from "./pages/ThreadView";
import Configuration from "./pages/Configuration";
import SelectConsortium from "./pages/SelectConsortium";

import AdminLayout from "./components/layout/AdminLayout";
import AdminReclaims from "./pages/admin/AdminReclaims";
import AdminForums from "./pages/admin/AdminForums";
import AdminAudit from "./pages/admin/AdminAudit";
import AdminUserManagment from "./pages/admin/AdminUserManagement";
import AdminVotes from "./pages/admin/AdminVotes";
import AdminSuppliers from "./pages/admin/AdminSuppliers";
import AdminFactura from "./pages/admin/AdminExpenses";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ResetPassword from "./pages/ResetPassword";

export default function App() {
  const isAdmin = storage.role === Role.ADMIN;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Navigate to="/iniciarSesion" replace />} />
          <Route path="/iniciarSesion" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recuperar" element={<RecoverPassword />} />

          
          <Route path="/actualizarInformacion" element={<RequireRoles roles={RoleGroups.USER}><UpdateData /></RequireRoles>} />
          <Route path="/dashboard" element={<RequireAuth><RequireRoles roles={RoleGroups.USER}><Dashboard /></RequireRoles></RequireAuth>} />
          <Route path="/perfil" element={<RequireAuth><RequireRoles roles={RoleGroups.USER}><Profile /></RequireRoles></RequireAuth>} />
          <Route path="/editarInformacion" element={<RequireAuth><RequireRoles roles={RoleGroups.USER}><ChangeData /></RequireRoles></RequireAuth>} />
          <Route path="/votaciones" element={<RequireAuth><RequireRoles roles={RoleGroups.USER}><Votes /></RequireRoles></RequireAuth>} />
          <Route path="/reuniones" element={<RequireAuth><RequireRoles roles={RoleGroups.USER}><Meetings /></RequireRoles></RequireAuth>} />
          <Route path="/documentos" element={<RequireAuth><RequireRoles roles={RoleGroups.USER}><Documents /></RequireRoles></RequireAuth>} />
          <Route path="/expensas" element={<RequireAuth><RequireRoles roles={RoleGroups.USER}><ExpensesPage /></RequireRoles></RequireAuth>} />
          <Route path="/reclamos" element={<RequireAuth><RequireRoles roles={RoleGroups.USER}><Claims /></RequireRoles></RequireAuth>} />
          <Route path="/calendario" element={<RequireAuth><RequireRoles roles={RoleGroups.USER}><Calendar /></RequireRoles></RequireAuth>} />
          <Route path="/nuevaReserva" element={<RequireAuth><RequireRoles roles={RoleGroups.USER}><NewReserve /></RequireRoles></RequireAuth>} />
          {["general","administracion","seguridad","mantenimiento","espacios-comunes","garage-parking"].map(f => <Route key={f} path={`/forums/${f}`} element={<RequireAuth><RequireRoles roles={RoleGroups.USER}><Forums /></RequireRoles></RequireAuth>} />)}
          <Route path="/forums/comentarios" element={<RequireAuth><RequireRoles roles={RoleGroups.USER}><Comentarios /></RequireRoles></RequireAuth>} />
          <Route path="/configuracion" element={<RequireAuth><RequireRoles roles={RoleGroups.USER}><Configuration /></RequireRoles></RequireAuth>} />
          <Route path="/select-consortium" element={<RequireAuth><RequireRoles roles={RoleGroups.USER}><SelectConsortium /></RequireRoles></RequireAuth>} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route path="/admin" element={<RequireAuth><RequireRoles roles={[Role.ADMIN, Role.CONSORCIO]}><AdminLayout /></RequireRoles></RequireAuth>}>
            <Route path="dashboard" element={<AdminDashboard />} />

            <Route path="reclamos" element={<AdminReclaims />} />
            <Route path="perfil" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="foros" element={<AdminForums />} />
            <Route path="auditoria" element={<AdminAudit />} />
            <Route path="gestionUsuario" element={<AdminUserManagment />} />
            <Route path="votaciones" element={<AdminVotes />} />
            <Route path="provedores" element={<AdminSuppliers />} />

          //  <Route path="expensas" element={<RequireAuth><RequireRoles roles={[Role.ADMIN, Role.CONSORCIO]}><AdminFactura /></RequireRoles></RequireAuth>} />

            <Route path="expensas" element={<AdminFactura />} />
            <Route path="documents" element={<AdminDocuments />} />

          </Route>
          <Route path="*" element={<Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
