
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
import ReclamosPage from './pages/ReclamosPage';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import NewReserve from './popups/NewEvent';
import Suppliers from './pages/Suppliers';
import NewSupplier from './popups/NewSupplier';

// Importar Forums
import Forums from './pages/Forums';

// Importar Configuration
import Configuration from './pages/Configuration';

// Importar Admin (reclamos + foros)
import AdminReclaims from './pages/admin/AdminReclaims';
import AdminForums from './pages/admin/AdminForums'; 

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
          <Route path="/perfil" element={<Profile />} /> {/* YA EXISTE */}
          <Route path="/editarInformacion" element={<ChangeData />} />

          {/* Funcionalidades */}
          <Route path="/votaciones" element={<Votes />} />
          <Route path="/reuniones" element={<Meetings />} />
          <Route path="/documentos" element={<Documents />} />
          <Route path="/expensas" element={<ExpensesPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reclamos" element={<ReclamosPage />} />
          <Route path="/calendario" element={<Calendar />} />
          <Route path="/nuevaReserva" element={<NewReserve />} />
          <Route path="/proveedores" element={<Suppliers />} />
          <Route path="/nuevoProveedor" element={<NewSupplier />} />

          {/* Rutas para Forums (usuario) */}
          <Route path="/forums/general" element={<Forums />} />
          <Route path="/forums/administracion" element={<Forums />} />
          <Route path="/forums/seguridad" element={<Forums />} />
          <Route path="/forums/mantenimiento" element={<Forums />} />
          <Route path="/forums/espacios-comunes" element={<Forums />} />
          <Route path="/forums/garage-parking" element={<Forums />} />

          {/* Configuración */}
          <Route path="/configuracion" element={<Configuration />} />

          {/* Rutas del Admin */}
          <Route path="/admin/reclaims" element={<AdminReclaims />} />
          <Route path="/admin/forums" element={<AdminForums />} /> {}

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
