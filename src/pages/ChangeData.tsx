import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import isotipoColor from '../assets/Isotipo-Color.png';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  //const [selectedImage, setSelectedImage] = useState<File | null>(null);



  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Email:', email);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
    //  setSelectedImage(event.target.files[0]);
    }
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
          Actualizar Datos
        </Typography>

<Typography
>
    Actualiza tu información personal para continuar
</Typography>
<Box className="foraria-centered-link">  {}
    
<Link component={RouterLink} to="/perfil" underline="hover" className="foraria-form-link foraria-left-link">
            <ArrowBackIcon></ArrowBackIcon>
            Volver al Perfil
          </Link>
        </Box>

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

        <TextField
          label="Piso/Departamento"
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

         <TextField
          label="Telefono"
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
        <Button 
          type="submit" 
          variant="contained" 
          fullWidth 
          className="foraria-gradient-button"
        >
          Actualizar informacion
        </Button>
        
      </Box>
    </Box>
  );
};

export default Login;