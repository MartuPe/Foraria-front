import React, { useState } from "react";
import { Box, Button, TextField, Typography, InputAdornment, IconButton, Link } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { authService } from "../services/authService";
import isotipoColor from "../assets/Isotipo-Color.png";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await authService.login(email, password);
    if (!res.success) throw new Error(res.message ?? "Login inválido");

    const requires =
      res.requiresPasswordChange === true ||
      (res.user as any)?.mustUpdatePassword === true;
    const role =
      res.user?.roleName ??
      (res.user as any)?.role ??
      localStorage.getItem("role");

    if (role) localStorage.setItem("role", role);

    if (requires && (role === "Propietario" || role === "Inquilino")) { 
      navigate("/actualizarInformacion"); 
    return; }

    const target = role === "Administrador" || role === "Consorcio" ? "/admin/dashboard" : "/dashboard";

    navigate(target);
  } catch (err) {
    alert("Error al iniciar sesión.");
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  return (
    <Box className="foraria-login-page foraria-wrapper">
      <Box className="foraria-form-container" component="form" onSubmit={handleSubmit}>
        <Box component="img" src={isotipoColor} alt="Logo" className="foraria-logo" />
        <Typography variant="h5" component="h1" gutterBottom className="foraria-form-title">
          Iniciar Sesión
        </Typography>

        <TextField
          label="Email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Contraseña"
          fullWidth
          margin="normal"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Tu contraseña"
          InputLabelProps={{ shrink: true }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button type="submit" variant="contained" fullWidth disabled={loading} className="foraria-gradient-button">
          {loading ? "Ingresando..." : "Iniciar Sesión"}
        </Button>

        <Box className="foraria-centered-link" sx={{ mt: 2 }}>
          <Link component={RouterLink} to="/recuperar" underline="hover" className="foraria-form-link">
            Olvidé mi contraseña
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
