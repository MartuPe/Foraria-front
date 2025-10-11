
import React from 'react';
import './App.css';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './styles/muiStyle';

// Rutas “main” (auth / perfil)
import Login from './pages/Login';
import RecoverPassword from './pages/RecoverPassword';
import UpdateData from './pages/UpdateData';
import Profile from './pages/Profile';
import ChangeData from './pages/ChangeData';

import Votes from './pages/Votes';
import Meetings from './pages/Meetings';
import Documents from './pages/Documents';
import ExpensesPage from './pages/Expenses';
import Claims from './pages/Claims';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import NewReserve from './popups/NewEvent';
import Suppliers from './pages/Suppliers';
import NewSupplier from './popups/NewSupplier';
import UserManagment from './pages/UserManagement';

// Forums (usuario)
import Forums from './pages/Forums';

// Configuración
import Configuration from './pages/Configuration';

// Admin + layout
import AdminLayout from './components/layout/AdminLayout';
import AdminReclaims from './pages/admin/AdminReclaims';
import AdminForums from './pages/admin/AdminForums';
import AdminAudit from './pages/admin/AdminAudit'; 

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Redirección inicial - CAMBIAR TEMPORALMENTE */}
          <Route path="/" element={<Navigate to="/iniciarSesion" replace />} />

          {/* Auth */}
          <Route path="/iniciarSesion" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recuperar" element={<RecoverPassword />} />
          <Route path="/actualizarInformacion" element={<UpdateData />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/editarInformacion" element={<ChangeData />} />

          {/* Funcionalidades */}
          <Route path="/votaciones" element={<Votes />} />
          <Route path="/reuniones" element={<Meetings />} />
          <Route path="/documentos" element={<Documents />} />
          <Route path="/expensas" element={<ExpensesPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reclamos" element={<Claims />} />
          <Route path="/calendario" element={<Calendar />} />
          <Route path="/nuevaReserva" element={<NewReserve />} />
          <Route path="/proveedores" element={<Suppliers />} />
          <Route path="/nuevoProveedor" element={<NewSupplier />} />
           <Route path="/gestionUsuario" element={<UserManagment />} />

          {/* Forums (usuario) */}
          <Route path="/forums/general" element={<Forums />} />
          <Route path="/forums/administracion" element={<Forums />} />
          <Route path="/forums/seguridad" element={<Forums />} />
          <Route path="/forums/mantenimiento" element={<Forums />} />
          <Route path="/forums/espacios-comunes" element={<Forums />} />
          <Route path="/forums/garage-parking" element={<Forums />} />

          {/* Configuración */}
          <Route path="/configuracion" element={<Configuration />} />

          {/* Rutas del Admin con layout (sidebar + outlet) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="reclaims" element={<AdminReclaims />} />
            <Route path="forums" element={<AdminForums />} />
            <Route path="audit" element={<AdminAudit />} />   
          </Route>


          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
