
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
// import ReclamosPage from './pages/ReclamosPage';

// Tus páginas nuevas
import Votes from './pages/Votes';
import Meetings from './pages/Meetings';
import Documents from './pages/Documents';
import ExpensesPage from './pages/Expenses';
import ReclamosPage from './pages/ReclamosPage';
import NewClaim from './pages/NewClaim';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {}
          <Route path="/" element={<Navigate to="/iniciarSesion" replace />} />

          {}
          <Route path="/iniciarSesion" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recuperar" element={<RecoverPassword />} />
          <Route path="/actualizarInformacion" element={<UpdateData />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/editarInformacion" element={<ChangeData />} />
          {/* <Route path="/reclamos" element={<ReclamosPage />} /> */}


          {}
          <Route path="/votaciones" element={<Votes />} />
          <Route path="/reuniones" element={<Meetings />} />
          <Route path="/documentos" element={<Documents />} />
          <Route path="/expensas" element={<ExpensesPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reclamos" element={<ReclamosPage />} />
          <Route path="/nuevoReclamo" element={<NewClaim />} />

          {}
          <Route path="*" element={<Navigate to="/iniciarSesion" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
