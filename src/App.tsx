
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
// Si TENÉS esta página, dejala; si no existe, borrá import + ruta:
// import ReclamosPage from './pages/ReclamosPage';

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
          {/* Redirect raíz a login (ajustá si querés otro landing) */}
          <Route path="/" element={<Navigate to="/iniciarSesion" replace />} />

          {/* Auth / Perfil (del main) */}
          <Route path="/iniciarSesion" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recuperar" element={<RecoverPassword />} />
          <Route path="/actualizarInformacion" element={<UpdateData />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/editarInformacion" element={<ChangeData />} />
          {/* <Route path="/reclamos" element={<ReclamosPage />} /> */}

          {/* Nuevos módulos */}
          <Route path="/votaciones" element={<Votes />} />
          <Route path="/reuniones" element={<Meetings />} />
          <Route path="/documentos" element={<Documents />} />

          {/* catch-all */}
          <Route path="*" element={<Navigate to="/iniciarSesion" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
