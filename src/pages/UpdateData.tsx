// src/pages/UpdateData.tsx
import React, { useState } from "react";
import { Box, Button, TextField, Typography, InputAdornment, IconButton, Link } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import isotipoColor from "../assets/Isotipo-Color.png";
import { authService } from "../services/authService";

const UpdateData: React.FC = () => {
  const navigate = useNavigate();

  // Datos personales
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [dni, setDni]             = useState("");

  // Passwords (actual y nuevas)
  const [currentPassword, setCurrentPassword]     = useState("");
  const [newPassword, setNewPassword]             = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Foto
  const [photo, setPhoto] = useState<File | null>(null);

  // Mostrar/ocultar
  const [showNewPass, setShowNewPass]       = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [showCurrent, setShowCurrent]       = useState(false);

  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!firstName || !lastName || !dni || !currentPassword || !newPassword || !confirmNewPassword) {
      alert("Completá todos los campos.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      alert("Las contraseñas nuevas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      await authService.updateFirstTime({
        firstName,
        lastName,
        dni,
        currentPassword,
        newPassword,
        confirmNewPassword,
        photo,
      });

      // Si todo OK, al dashboard
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message ?? "No se pudo actualizar la información.");
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = {
    "& .MuiInputLabel-root": {
      color: "#ebebd3",
      transform: "translate(14px, -20px) scale(0.75)",
    },
  };

  return (
    <Box className="foraria-login-page foraria-wrapper">
      <Box className="foraria-form-container" component="form" onSubmit={handleSubmit}>
        <Box component="img" src={isotipoColor} alt="Logo" className="foraria-logo" />
        <Typography variant="h5" component="h1" gutterBottom className="foraria-form-title">
          Actualizar Datos
        </Typography>

        <Typography>Actualiza tu información personal para continuar</Typography>

        <Box className="foraria-centered-link" sx={{ mb: 1 }}>
          <Link component={RouterLink} to="/iniciarSesion" underline="hover" className="foraria-form-link foraria-left-link">
            <ArrowBackIcon sx={{ mr: 0.5 }} />
            Volver al login
          </Link>
        </Box>

        {/* Contraseña actual (temporal) */}
        <TextField
          label="Contraseña actual"
          variant="outlined"
          fullWidth
          margin="normal"
          sx={labelStyle}
          type={showCurrent ? "text" : "password"}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Tu contraseña temporal"
          InputLabelProps={{ className: "foraria-form-label", shrink: true }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowCurrent((s) => !s)} edge="end">
                  {showCurrent ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Nueva contraseña */}
        <TextField
          label="Nueva contraseña"
          variant="outlined"
          fullWidth
          margin="normal"
          sx={labelStyle}
          type={showNewPass ? "text" : "password"}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Ingresa tu nueva contraseña"
          InputLabelProps={{ className: "foraria-form-label", shrink: true }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowNewPass((s) => !s)} edge="end">
                  {showNewPass ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Confirmar contraseña */}
        <TextField
          label="Confirmar contraseña"
          variant="outlined"
          fullWidth
          margin="normal"
          sx={labelStyle}
          type={showConfirm ? "text" : "password"}
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          placeholder="Confirmá tu nueva contraseña"
          InputLabelProps={{ className: "foraria-form-label", shrink: true }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirm((s) => !s)} edge="end">
                  {showConfirm ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Datos personales */}
        <TextField
          label="Nombre"
          variant="outlined"
          fullWidth
          margin="normal"
          sx={labelStyle}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Tu nombre"
          InputLabelProps={{ className: "foraria-form-label", shrink: true }}
        />

        <TextField
          label="Apellido"
          variant="outlined"
          fullWidth
          margin="normal"
          sx={labelStyle}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Tu apellido"
          InputLabelProps={{ className: "foraria-form-label", shrink: true }}
        />

        <TextField
          label="DNI"
          variant="outlined"
          fullWidth
          margin="normal"
          sx={labelStyle}
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          placeholder="Tu número de DNI"
          InputLabelProps={{ className: "foraria-form-label", shrink: true }}
        />

        {/* Foto opcional */}
        <Button component="label" className="foraria-image-upload-button" startIcon={<PhotoCamera />} sx={{ mt: 1, mb: 2 }}>
          Seleccionar imagen
          <input type="file" hidden accept="image/*" onChange={handleImageChange} />
        </Button>

        {/* NO envuelvas el botón en <Link> para no saltearte el submit */}
        <Button type="submit" variant="contained" fullWidth className="foraria-gradient-button" disabled={loading}>
          {loading ? "Actualizando..." : "Actualizar información"}
        </Button>
      </Box>
    </Box>
  );
};

export default UpdateData;