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
          padding: '16.5px 14px',
          '&.foraria-edit-button': {
            minWidth: 'auto',
            padding: '4px 8px',
            fontSize: '0.875rem',
            textTransform: 'none',
          },
          '&.foraria-submit-button': {  
            background: 'linear-gradient(135deg, #f4d35e, #ee964b)',
            color: '#083d77',
            borderRadius: '0.5rem',
          },
          '&.foraria-cancel-button': {  
            borderColor: '#083d77',
            color: '#083d77',
            background: 'transparent',
            borderRadius: '0.5rem',
          },
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
        color: '#083D77',
        transform: 'translate(14px, -20px) scale(0.75)',
      },
      '& .MuiOutlinedInput-root': {
        backgroundColor: '#F2F5F8',
        borderRadius: '8px',
        '& fieldset': {
          borderColor: 'rgba(0, 0, 0, 0.2)',
        },
        '&:hover fieldset': {
          borderColor: '#f4d35e',
        },
        '&.Mui-focused': {
          backgroundColor: '#FEFBEF', 
        },
        '&.Mui-focused fieldset': {
          borderColor: '#f4d35e',
          boxShadow: '0 0 0 3px rgba(244, 211, 94, 0.2)',
        },
        '& .MuiInputBase-input': {
          color: '#083D77', 
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
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderRadius: '0.75rem',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          width: 150,
          height: 150, 
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '1rem',
          '&.foraria-role-chip': {
            backgroundColor: 'transparent',
            color: '#f4d35e',
          },
          '&.foraria-status-chip': {
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            color: '#4caf50',
          },
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: '#f0f4f8',
          borderRadius: '0.5rem',
          '& fieldset': {
            borderColor: 'transparent',
          },
        },
      },
    },
  },
});

export default theme;