import React from 'react';
import ReactDOM from 'react-dom/client';
 
import "./styles/index.css";


import App from './App';

//import reportWebVitals from './reportWebVitals';
import theme from './styles/muiStyle';  
import { ThemeProvider } from '@mui/material/styles';  

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <ThemeProvider theme={theme}>  {}
      <App />
    </ThemeProvider>
);
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then((reg) => console.log("SW registrado", reg))
    .catch((err) => console.log("Error registrando SW:", err));
}





