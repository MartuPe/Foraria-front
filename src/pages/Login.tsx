import React, { useState } from 'react';
import { Box, Button, TextField, Link, Typography } from '@mui/material';  // Quita Container si interfiere
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import isotipoColor from '../assets/Isotipo-Color.png';

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
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        maxWidth: '320px', 
        mx: 'auto'  // Centrado horizontal
      }} 
      className="foraria-login-page"  // Clase exclusiva para margen vertical
    >
      <Box 
        className="foraria-form-container"  // Clase reutilizable (fondo gris, etc.)
        component="form" 
        onSubmit={handleSubmit} 
        sx={{ width: '100%' }}  // Mantén solo width
      >
        <Box component="img" src={isotipoColor} alt="Logo" sx={{ width: 50, mb: 2, mx: 'auto', display: 'block' }} />
        <Typography 
          variant="h5" 
          component="h1" 
          gutterBottom 
          className="foraria-form-title"  // Fixea color claro
        >
          Iniciar Sesión
        </Typography>
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu@email.com"
          InputLabelProps={{ className: 'foraria-form-label' }}  // Fixea etiquetas
        />
        <TextField
          label="Contraseña"
          variant="outlined"
          fullWidth
          margin="normal"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Tu contraseña"
          InputLabelProps={{ className: 'foraria-form-label' }}
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
        <Button 
          type="submit" 
          variant="contained" 
          fullWidth 
          className="foraria-gradient-button"  // Ahora con override
          sx={{ mt: 2 }}
        >
          Iniciar Sesión
        </Button>
        <Button 
          variant="contained" 
          fullWidth 
          className="foraria-white-button"
          sx={{ mt: 1 }}
        >
          Acceso Administrador
        </Button>
        <Button 
          variant="outlined" 
          fullWidth 
          className="foraria-outlined-white-button"
          sx={{ mt: 1 }}
        >
          Acceso Consejo
        </Button>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link href="#" underline="hover" className="foraria-form-link">
            Olvidé mi contraseña
          </Link>
        </Box>
      </Box>
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Link href="#" underline="hover" className="foraria-secondary-link">
          Acceso de demostración
        </Link>
      </Box>
    </Box>
  );
};

export default Login;