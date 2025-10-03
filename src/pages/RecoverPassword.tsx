import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import isotipoColor from '../assets/Isotipo-Color.png';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Email:', email);
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
           sx={{
    '& .MuiInputLabel-root': {
      color: '#ebebd3',
      transform: 'translate(14px, -20px) scale(0.75)',
    },
  }}
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