import { createTheme } from '@mui/material/styles';

export const forariaTheme = createTheme({
  palette: {
    primary: {
      main: '#083d77', 
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ee964b', 
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f4d35e', 
      contrastText: '#083d77',
    },
    error: {
      main: '#f95738', 
      contrastText: '#ffffff',
    },
    background: {
      default: '#ebebd3',
      paper: '#ffffff',
    },
    text: {
      primary: '#083d77',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 500,
      color: '#083d77',
    },
    h5: {
      fontWeight: 500,
      color: '#083d77',
    },
    h6: {
      fontWeight: 500,
      color: '#083d77',
    },
  },
  shape: {
    borderRadius: 12, 
  },
  components: {
    
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', 
          borderRadius: 12,
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 500,
        },
       
        colorPrimary: {
          backgroundColor: '#083d77',
          color: '#ffffff',
        },
        colorSecondary: {
          backgroundColor: '#ee964b',
          color: '#ffffff',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0px 4px 16px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});
