
import React from 'react';
import './App.css'; 
import Login from './pages/Login';
import RecoverPassword from './pages/RecoverPassword';
import UpdateData from './pages/UpdateData';
import Profile from './pages/Profile';
import ChangeData from './pages/ChangeData';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//import { ImportExportRounded } from '@mui/icons-material';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/iniciarSesion" element={<Login />} />
          <Route path="/recuperar" element={<RecoverPassword />} />
          <Route path="/actualizarInformacion" element={<UpdateData />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/editarInformacion" element={<ChangeData />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
