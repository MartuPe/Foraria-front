
import React from 'react';
import './App.css'; 
import Login from './pages/Login';
import RecoverPassword from './pages/RecoverPassword';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/iniciarSesion" element={<Login />} />
          <Route path="/recuperar" element={<RecoverPassword />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
