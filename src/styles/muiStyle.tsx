import {  createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    primary: {
      main: '#083d77',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ebebd3',
      contrastText: '#083d77',
    },
    error: {
      main: '#f95738',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f4d35e',
      contrastText: '#083d77',
    },
    info: {
      main: '#ee964b',
      contrastText: '#ffffff',
    },
    success: {
      main: '#4caf50', // opcional, podés usar otro color si querés
      contrastText: '#ffffff',
    },
    text: {
      primary: '#083d77',
      secondary: '#6c757d',
    },
    divider: 'rgba(8, 61, 119, 0.15)',
  },
  typography: {
    fontFamily: '"Montserrat", "Fredoka", sans-serif',
    fontSize: 16,
    fontWeightMedium: 500,
    fontWeightRegular: 400,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12, // equivalente a 0.75rem
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.75rem',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
        },
      },
    },
  },
});

export default theme;
