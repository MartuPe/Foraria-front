import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { forariaTheme } from './styles/muiTheme';
import { Login } from "./pages/Login";
import ReclamosPage from "./pages/ReclamosPage";
import { MaterialUITest } from './components/MaterialUITest';

function App() {
  return (
    <ThemeProvider theme={forariaTheme}>
      <CssBaseline />
      <Router>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reclamos" element={<ReclamosPage />} />
          <Route path="/test" element={<MaterialUITest />} />
          <Route path="/" element={<Navigate to="/reclamos" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>

  );
}

export default App;