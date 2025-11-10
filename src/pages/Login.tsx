import React, { useState } from "react";
import {
  Box, Button, TextField, Typography, InputAdornment, IconButton, Link, useTheme,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { authService } from "../services/authService";
import { storage } from "../utils/storage";
import { Role } from "../constants/roles";
import isotipoColor from "../assets/Isotipo-Color.png";

const Login: React.FC = () => {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<{ email?: string; password?: string; general?: string }>({});
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const ErrorBox: React.FC<{ text?: string }> = ({ text }) =>
    !text ? null : (
      <Box
        sx={{
          mt: 0.5,
          p: 1,
          border: `1px solid ${theme.palette.error.main}`,
          borderRadius: 1,
          bgcolor: theme.palette.background.paper,
          color: theme.palette.error.main,
          fontSize: "0.8rem",
          lineHeight: 1.3,
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        {text}
      </Box>
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr({});

    if (!email.trim() || !password.trim()) {
      setErr({ general: "No puede haber campos vacíos." });
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setErr({ email: "El email es inválido." });
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login(email.trim(), password);
      if (!res.success) throw new Error(res.message ?? "Login inválido");

      const role = storage.role as Role | null;
      const requires =
        res.requiresPasswordChange === true ||
        localStorage.getItem("requiresPasswordChange") === "true";

      if (requires && (role === Role.OWNER || role === Role.TENANT)) {
        navigate("/actualizarInformacion");
        return;
      }

      const target =
        role === Role.ADMIN || role === Role.CONSORCIO ? "/admin/dashboard" : "/dashboard";
      navigate(target);
    } catch (error: any) {
      const raw =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "";

      const low = (raw || "").toString().toLowerCase();
      if (low.includes("password") || low.includes("contraseña") || low.includes("credenciales")) {
        setErr({ password: "La contraseña es inválida." });
      } else if (low.includes("email") || low.includes("correo")) {
        setErr({ email: "El email es inválido." });
      } else {
        setErr({ general: "Hubo un error al iniciar sesión." });
      }
      console.error(error);
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
          error={Boolean(err.email)}
        />
        <ErrorBox text={err.email} />

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
          error={Boolean(err.password)}
        />
        <ErrorBox text={err.password} />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          className="foraria-gradient-button"
          sx={{ mt: 1 }}
        >
          {loading ? "Ingresando..." : "Iniciar Sesión"}
        </Button>

        <ErrorBox text={err.general} />

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
