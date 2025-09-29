import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import isotipoColor from '../assets/Isotipo-Color.png';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Email:', email);
    console.log('Contraseña:', password);
  };

  return (
    <Box className="foraria-login-page">  {}
      <Box 
        className="foraria-form-container"  
        component="form" 
        onSubmit={handleSubmit}
      >
        <Box component="img" src={isotipoColor} alt="Logo" className="foraria-logo" />  {}
        <Typography 
          variant="h5" 
          component="h1" 
          gutterBottom 
          className="foraria-form-title"
        >
          Recuperar Contraseña
        </Typography>

<Typography
>
    Ingresa tu email y te enviaremos un enlace para recuperar tu contraseña
</Typography>
<Box className="foraria-centered-link">  {}
    
<Link component={RouterLink} to="/iniciarSesion" underline="hover" className="foraria-form-link foraria-left-link">
            <ArrowBackIcon></ArrowBackIcon>
            Volver al login
          </Link>
        </Box>

        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu@email.com"
          InputLabelProps={{ className: 'foraria-form-label', shrink: true }}
        />
        
        <Button 
          type="submit" 
          variant="contained" 
          fullWidth 
          className="foraria-gradient-button"
        >
          Enviar enlace de recuperación
        </Button>
        
      </Box>
    </Box>
  );
};

export default Login;