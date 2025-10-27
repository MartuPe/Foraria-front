import React from "react";
import "./App.css";

import { BrowserRouter as Router, Routes, Route, Navigate, /**Outlet**/ } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./styles/muiStyle";
//import { getActiveConsortium } from "./services/consortiumStorage";

// Rutas “main” (auth / perfil)
import Login from "./pages/Login";
import RecoverPassword from "./pages/RecoverPassword";
import UpdateData from "./pages/UpdateData";
import Profile from "./pages/Profile";
import ChangeData from "./pages/ChangeData";

// Funcionalidades
import Votes from "./pages/Votes";
import Meetings from "./pages/Meetings";
import Documents from "./pages/Documents";
import ExpensesPage from "./pages/Expenses";
import Claims from "./pages/Claims";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import NewReserve from "./components/modals/NewEvent";

// Proveedores (listado con popup interno)
import AdminSuppliers from "./pages/admin/AdminSuppliers";

// Forums (usuario)
import Forums from "./pages/Forums";
import Comentarios from "./pages/ThreadView"

// Configuración
import Configuration from "./pages/Configuration";

// Admin + layout
import AdminLayout from "./components/layout/AdminLayout";
import AdminReclaims from "./pages/admin/AdminReclaims";
import AdminForums from "./pages/admin/AdminForums";
import AdminAudit from "./pages/admin/AdminAudit";
import AdminUserManagment from "./pages/admin/AdminUserManagement";
import AdminVotes from "./pages/admin/AdminVotes";
import AdminFactura from "./pages/admin/AdminExpenses";

import CargaFacturas from "./components/modals/CargaFactura"

// Nueva pantalla: selección de consorcio
import SelectConsortium from "./pages/SelectConsortium";
import AdminDashboard from "./pages/admin/AdminDashboard";


function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          {/* Redirección inicial */}
          <Route path="/" element={<Navigate to="/iniciarSesion" replace />} />

          {/* Auth */}
          <Route path="/iniciarSesion" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recuperar" element={<RecoverPassword />} />
          <Route path="/actualizarInformacion" element={<UpdateData />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/editarInformacion" element={<ChangeData />} />

          {/* Funcionalidades (usuario normal) */}
          <Route path="/votaciones" element={<Votes />} />
          <Route path="/reuniones" element={<Meetings />} />
          <Route path="/documentos" element={<Documents />} />
          <Route path="/expensas" element={<ExpensesPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reclamos" element={<Claims />} />
          <Route path="/calendario" element={<Calendar />} />
          <Route path="/nuevaReserva" element={<NewReserve />} />
          <Route path="/factura" element={<CargaFacturas />} />

          {/* Forums (usuario) */}
          <Route path="/forums/general" element={<Forums />} />
          <Route path="/forums/administracion" element={<Forums />} />
          <Route path="/forums/seguridad" element={<Forums />} />
          <Route path="/forums/mantenimiento" element={<Forums />} />
          <Route path="/forums/espacios-comunes" element={<Forums />} />
          <Route path="/forums/garage-parking" element={<Forums />} />
          <Route path="/forums/comentarios" element={<Comentarios />} />

          {/* Configuración */}
          <Route path="/configuracion" element={<Configuration />} />
{/* 🔹 Selección de consorcio (pre-dashboard) */}
          <Route path="/select-consortium" element={<SelectConsortium />} />

          {/* Admin (layout con sidebar + <Outlet/>) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="reclaims" element={<AdminReclaims />} />
            <Route path="forums" element={<AdminForums />} />
            <Route path="audit" element={<AdminAudit />} />
            <Route path="gestionUsuario" element={<AdminUserManagment />} />
            <Route path="votaciones" element={<AdminVotes />} />
            <Route path="suppliers" element={<AdminSuppliers />} />
            <Route path="expensas" element={<AdminFactura />} />

          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
