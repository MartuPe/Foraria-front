import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import theme from "./styles/muiStyle";
import Votes from "./pages/Votes";
import Meetings from "./pages/Meetings";
import Documents from "./pages/Documents";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/meetings" replace />} />
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/votes" element={<Votes />} />
          <Route path="/documents" element={<Documents />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
