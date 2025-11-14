import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Link,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { authService } from "../services/authService";
import { storage } from "../utils/storage";
import { Role } from "../constants/roles";
import isotipoColor from "../assets/Isotipo-Color.png";
import "../styles/messages.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [msg, setMsg] = useState<{ email?: string; password?: string; general?: string }>({});

  const navigate = useNavigate();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg({});

    if (!email.trim() || !password.trim()) {
      setMsg({ general: "No puede haber campos vacíos." });
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setMsg({ email: "El email es inválido." });
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login(email.trim(), password);

      // 🔴 IMPORTANTE: Antes tenías esto:
      // if (!res.success) throw new Error(res.message ?? "Login inválido");
      // Eso hacía que aunque el back devuelva 200, siempre tires error
      // si la propiedad "success" no viene definida.

      // Si llegamos acá sin que Axios explote, asumimos que el login fue OK.
      // (Si el back devuelve 401/500, Axios lanza error y cae en el catch).

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
        setMsg({ password: "La contraseña es inválida." });
      } else if (low.includes("email") || low.includes("correo")) {
        setMsg({ email: "El email es inválido." });
      } else {
        setMsg({ general: "Hubo un error al iniciar sesión." });
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
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          InputLabelProps={{ shrink: true }}
          error={Boolean(msg.email)}
        />
        {msg.email && (
          <div className="field-message field-message--error" role="alert" aria-live="polite">
            {msg.email}
          </div>
        )}

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
                <IconButton
                  onClick={() => setShowPassword((s) => !s)}
                  edge="end"
                  aria-label="mostrar/ocultar contraseña"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          error={Boolean(msg.password)}
        />
        {msg.password && (
          <div className="field-message field-message--error" role="alert" aria-live="polite">
            {msg.password}
          </div>
        )}

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

        {msg.general && (
          <div
            className="field-message field-message--error field-message--general"
            role="alert"
            aria-live="polite"
          >
            {msg.general}
          </div>
        )}

        <Box className="foraria-centered-link" sx={{ mt: 2 }}>
          <Link
            component={RouterLink}
            to="/recuperar"
            underline="hover"
            className="foraria-form-link"
          >
            Olvidé mi contraseña
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
