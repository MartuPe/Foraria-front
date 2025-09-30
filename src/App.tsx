
import React from 'react';
import './App.css';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';

import theme from './styles/muiStyle';

// Páginas que ya estaban en main
import Login from './pages/Login';
import RecoverPassword from './pages/RecoverPassword';
import UpdateData from './pages/UpdateData';
import Profile from './pages/Profile';
import ChangeData from './pages/ChangeData';

// Tus páginas nuevas
import Votes from './pages/Votes';
import Meetings from './pages/Meetings';
import Documents from './pages/Documents';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Redirige raíz a login (o ajusta según definan) */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Auth + datos */}
          <Route path="/login" element={<Login />} />
          <Route path="/iniciarSesion" element={<Login />} />
          <Route path="/recuperar" element={<RecoverPassword />} />
          <Route path="/actualizarInformacion" element={<UpdateData />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/editarInformacion" element={<ChangeData />} />

          {/* Módulos nuevos */}
          <Route path="/votaciones" element={<Votes />} />
          <Route path="/reuniones" element={<Meetings />} />
          <Route path="/documentos" element={<Documents />} />

          {/* 404 simple */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
