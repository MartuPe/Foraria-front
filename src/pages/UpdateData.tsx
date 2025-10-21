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
import PhotoCamera from '@mui/icons-material/PhotoCamera';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
 // const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Email:', email);
    console.log('Contraseña:', password);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
     // setSelectedImage(event.target.files[0]);
    }
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
          Actualizar Datos
        </Typography>

<Typography
>
    Actualiza tu información personal para continuar
</Typography>
<Box className="foraria-centered-link">  {}
    
<Link component={RouterLink} to="/iniciarSesion" underline="hover" className="foraria-form-link foraria-left-link">
            <ArrowBackIcon></ArrowBackIcon>
            Volver al login
          </Link>
        </Box>

<TextField
          label="Nueva Contraseña"
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
          placeholder="Ingresa tu nueva contraseña"
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

        <TextField
          label="Confirmar Contraseña"
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
          placeholder="Confirma tu nueva contraseña"
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

        <TextField
          label="Nombre"
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
          placeholder="Tu nombre"
          InputLabelProps={{ className: 'foraria-form-label', shrink: true }}
        />

        <TextField
          label="Apellido"
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
          placeholder="Tu apellido"
          InputLabelProps={{ className: 'foraria-form-label', shrink: true }}
        />
        
        <TextField
          label="DNI"
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
          placeholder="Tu numero de DNI"
          InputLabelProps={{ className: 'foraria-form-label', shrink: true }}
        />

<Button
  component="label"
  className="foraria-image-upload-button"
  startIcon={<PhotoCamera />}
>
  Seleccionar imagen
  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
</Button>
<Link component={RouterLink} to="/dashboard" underline="hover" className="foraria-form-link">
        <Button 
          type="submit" 
          variant="contained" 
          fullWidth 
          className="foraria-gradient-button"
        >
          Actualizar informacion
        </Button>
        </Link>
      </Box>
    </Box>
  );
};

export default Login;