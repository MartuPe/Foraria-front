
// src/App.tsx
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
import UserManagement from './pages/UserManagement';
import Calendar from './pages/Calendar'; 
import NewReserve from './pages/NewEvent';
import Suppliers from './pages/Suppliers'; 
import NewSupplier from './pages/NewSupplier';


function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
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
          <Route path="/gestionUsuarios" element={<UserManagement />} />


          {/* Fallback */}
          <Route path="*" element={<Navigate to="/iniciarSesion" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;