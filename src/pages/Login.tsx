
import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import isotipoColor from '../assets/Isotipo-Color.png';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from '@mui/material';



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
    <Box className="foraria-login-page foraria-wrapper">  {}
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
          Iniciar Sesión
        </Typography>
        <TextField
          label="Email"
          
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
        <TextField
          label="Contraseña"
          variant="outlined"
          fullWidth
          margin="normal"
           sx={{
    '& .MuiInputLabel-root': {
      color: '#ebebd3',
      transform: 'translate(14px, -20px) scale(0.75)',
    },
  }}
          type={showPassword ? 'text' : 'password'}
          value={password}
          
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Tu contraseña"
          
          InputLabelProps={{ className: 'foraria-form-label', shrink: true }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Link component={RouterLink} to="/actualizarInformacion" underline="hover" className="foraria-form-link">
        <Button 
          type="submit" 
          variant="contained" 
          fullWidth 
          className="foraria-gradient-button"
        >
          Iniciar Sesión
        </Button>
        </Link>
        <Link component={RouterLink} to="/admin/votaciones" underline="hover" className="foraria-form-link">
        <Button 
          type="submit" 
          variant="contained" 
          fullWidth 
          className="foraria-gradient-button"
        >
          Iniciar Sesión Administrador
        </Button>
        </Link>
        <Box className="foraria-centered-link">  {}
          <Link component={RouterLink} to="/recuperar" underline="hover" className="foraria-form-link">
            Olvidé mi contraseña
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
