import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import theme from './styles/muiStyle';  
import { ThemeProvider } from '@mui/material/styles';  

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>  {/* Wrappea toda la app con el theme */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);





