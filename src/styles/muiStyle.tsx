import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#ebebd3',  
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
      main: '#4caf50',
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
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.75rem',
          textTransform: 'none',
          padding: '16.5px 14px'
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          },
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
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            color: '#ebebd3 !important',  
            transform: 'translate(14px, -20px) scale(0.75)',  
          },
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#ebebd3 !important', 
            borderRadius: '8px',
            '& fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: '#f4d35e',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#f4d35e',
              boxShadow: '0 0 0 3px rgba(244, 211, 94, 0.2)',
            },
          },
          '& .MuiInputBase-input::placeholder': {
            color: 'rgba(108, 117, 125, 0.7)',
          },
          '& .MuiInputAdornment-root .MuiIconButton-root': {
            color: '#000000 !important',  
          },
          
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#ffffffff !important', 
          textDecoration: 'underline',
          '&:hover': {
            color: '#f4d35e',
          },
        },
      },
    },
  },
});

export default theme;