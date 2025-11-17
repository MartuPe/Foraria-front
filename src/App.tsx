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
import ResetPassword from "./pages/ResetPassword";
import Layout from "./components/layout/Layout";
import UpdateData from "./pages/UpdateData";
import Profile from "./pages/Profile";
import ChangeData from "./pages/ChangeData";
import Votes from "./pages/Votes";
import Meetings from "./pages/Meetings";
// import Documents from "./pages/Documents";
import ExpensesPage from "./pages/Expenses";
import Claims from "./pages/Claims";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Forums from "./pages/Forums";
import Comentarios from "./pages/ThreadView";
import Configuration from "./pages/Configuration";
import SelectConsortium from "./pages/SelectConsortium";
// import AdminAudit from "./pages/admin/AdminAudit";
import AdminUserManagment from "./pages/admin/AdminUserManagement";
import AdminSuppliers from "./pages/admin/AdminSuppliers";
import AdminFactura from "./pages/admin/AdminExpenses";
// import AdminDocuments from "./pages/admin/AdminDocuments";

export default function App() {
  const isAdmin = storage.role === Role.ADMIN || storage.role === Role.CONSORCIO;
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Navigate to="/iniciarSesion" replace />} />
          <Route path="/iniciarSesion" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recuperar" element={<RecoverPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/actualizarInformacion" element={<UpdateData />} />
          <Route element={<RequireAuth><RequireRoles roles={RoleGroups.USER}><Layout /></RequireRoles></RequireAuth>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="perfil" element={<Profile />} />
            <Route path="editarInformacion" element={<ChangeData />} />
            <Route path="votaciones" element={<Votes />} />
            <Route path="reuniones" element={<Meetings />} />
            {/* <Route path="documentos" element={<Documents />} /> */}
            <Route path="expensas" element={<ExpensesPage />} />
            <Route path="reclamos" element={<Claims />} />
            <Route path="calendario" element={<Calendar />} />
            <Route path="configuracion" element={<Configuration />} />
            <Route path="select-consortium" element={<SelectConsortium />} />
            {["todas","general","administracion","seguridad","mantenimiento","espacios-comunes","garage-parking"]
            .map(f => <Route key={f} path={`forums/${f}`} element={<Forums />} />)}
            <Route path="forums/comentarios" element={<Comentarios />} />

          </Route>

          <Route path="/admin" element={<RequireAuth><RequireRoles roles={[Role.ADMIN, Role.CONSORCIO]}><Layout /></RequireRoles></RequireAuth>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="reclamos" element={<Claims />} />
            <Route path="eventos" element={<Calendar />} />
            <Route path="perfil" element={<Profile />} />
            <Route path="foros" element={<Forums />} />
            <Route path="reuniones" element={<Meetings />} />
            {/* <Route path="auditoria" element={<AdminAudit />} /> */}
            <Route path="gestionUsuario" element={<AdminUserManagment />} />
            <Route path="votaciones" element={<Votes />} />
            <Route path="provedores" element={<AdminSuppliers />} />
            <Route path="expensas" element={<AdminFactura />} />
            {/* <Route path="documents" element={<AdminDocuments />} /> */}
            <Route path="configuracion" element={<Configuration />} />
          </Route>
          <Route path="*" element={<Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
