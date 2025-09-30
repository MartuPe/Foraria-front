import React from 'react';
import { Box, Typography, Avatar, Button, Chip, Grid, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';  
import profilePhoto from '../assets/profile-photo.jpg';  

const Profile: React.FC = () => {
  return (
    <Box className="foraria-page-container">  {}
      
      <Box className="foraria-profile-section" position="relative">  {}
        <Typography variant="h4" component="h1" className="foraria-page-title">
        Mi Perfil
      </Typography>
      <Typography variant="body2" className="foraria-page-subtitle">
        Administra tu información personal y configuración de cuenta
      </Typography>
        
        <Box className="foraria-profile-header">
          <Avatar src={profilePhoto} className="foraria-profile-avatar" />
          <Typography className="foraria-profile-name">
            Leandro Paredes
          </Typography>
          <Typography className="foraria-profile-name">
            Depto. 4B
          </Typography>
          <Chip label="Propietario" variant="outlined" color="info" />
        </Box>
        <Box className="foraria-profile-section">
        <Box className="foraria-profile-info-header">
        <Typography variant="h6" className="foraria-section-title">
          Información Personal
        </Typography>
        </Box>
        <Box className="foraria-profile-edit-button-container">
             <Link component={RouterLink} to="/editarInformacion">
        <Button  startIcon={<EditIcon />} className="foraria-edit-button">
          Editar
        </Button>
        </Link>
        </Box>
        <Grid container spacing={2} className="foraria-profile-info">
          <Grid size={6} className="foraria-profile-label foraria-profile-row ">Nombre</Grid>
          <Grid size={6} className="foraria-profile-label foraria-profile-row">Apellido</Grid>
          <Grid size={6} className="foraria-profile-value">Leandro</Grid>
          <Grid size={6} className="foraria-profile-value">Paredes</Grid>
          <Grid size={6} className="foraria-profile-label foraria-profile-row">DNI</Grid>
          <Grid size={6} className="foraria-profile-label foraria-profile-row">Piso/Departamento</Grid>
          <Grid size={6} className="foraria-profile-value">12.345.678</Grid>
          <Grid size={6} className="foraria-profile-value">Depto. 4B</Grid>
          <Grid size={6} className="foraria-profile-label foraria-profile-row">Teléfono</Grid>
          <Grid size={6} className="foraria-profile-label foraria-profile-row">Email</Grid>
          <Grid size={6} className="foraria-profile-value ">+54 11 1234-5678</Grid>
          <Grid size={6} className="foraria-profile-value">admin@foraria.com</Grid>
        </Grid>
      </Box>
</Box>
      
      <Box className="foraria-profile-section">
        <Typography variant="h6" className="foraria-section-title">
          Información del Consorcio
        </Typography>
         <Box className="foraria-profile-edit-button-container">
        <Button startIcon={<EditIcon />} className="foraria-edit-button">
          Editar
        </Button>
        </Box>
        <Grid container spacing={2} className="foraria-profile-info">
          <Grid size={6} className="foraria-profile-label foraria-profile-row">Edificio</Grid>
          <Grid size={6} className="foraria-profile-label foraria-profile-row">Dirección</Grid>
          <Grid size={6} className="foraria-profile-value">Torres del Parque</Grid>
          <Grid size={6} className="foraria-profile-value">Av. Libertad 1234</Grid>
          <Grid size={6} className="foraria-profile-label foraria-profile-row">Fecha de ingreso</Grid>
          <Grid size={6} className="foraria-profile-label foraria-profile-row">Estado de Cuenta</Grid>
          <Grid size={6} className="foraria-profile-value">Enero 2020</Grid>
          <Grid size={6} className="foraria-profile-value-status">Al dia</Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Profile;