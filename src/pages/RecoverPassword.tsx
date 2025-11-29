import React, { useState } from "react";
import {  Box, Button, TextField, Typography, CircularProgress, Link, } from "@mui/material";
import isotipoColor from "../assets/Isotipo-Color.png";
import { Link as RouterLink } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ForariaStatusModal } from "../components/StatCardForms"; 

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: "success" | "error";
  }>({
    open: false,
    title: "",
    message: "",
    variant: "success",
  });

  const validateEmail = (value: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setEmailError(null);

    if (!email) {
      setEmailError("El email es requerido");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("Introduce un email válido");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "https://localhost:7245/User/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.message || "No se pudo enviar el correo.";
        setStatusModal({
          open: true,
          variant: "error",
          title: "Error",
          message: msg,
        });
      } else {
        const msg =
          data?.message || "Si el email es válido, recibirás un enlace.";
        setStatusModal({
          open: true,
          variant: "success",
          title: "Correo enviado",
          message: msg,
        });
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setStatusModal({
        open: true,
        variant: "error",
        title: "Error de conexión",
        message: "No se pudo conectar con el servidor.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="foraria-login-page foraria-wrapper">
      <Box
        className="foraria-form-container"
        component="form"
        onSubmit={handleSubmit}
        noValidate
      >
        <Box
          component="img"
          src={isotipoColor}
          alt="Logo"
          className="foraria-logo"
        />

        <Typography variant="h5" className="foraria-form-title">
          Recuperar Contraseña
        </Typography>

        <Typography sx={{ mb: 2 }}>
          Ingresa tu email y te enviaremos un enlace para recuperar tu
          contraseña.
        </Typography>

        <Box className="foraria-centered-link" sx={{ mb: 1 }}>
          <Link
            component={RouterLink}
            to="/iniciarSesion"
            underline="hover"
            className="foraria-form-link foraria-left-link"
          >
            <ArrowBackIcon sx={{ mr: 0.5 }} />
            Volver al login
          </Link>
        </Box>

        <TextField
          label="Email"
          fullWidth
          variant="outlined"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          InputLabelProps={{ shrink: true }}
          error={!!emailError}
          helperText={emailError ?? ""}
          disabled={loading}
          autoComplete="email"
          type="email"
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          className="foraria-gradient-button"
          disabled={loading}
          sx={{ position: "relative" }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              Enviando...
            </>
          ) : (
            "Enviar enlace de recuperación"
          )}
        </Button>
      </Box>

      <ForariaStatusModal
        open={statusModal.open}
        onClose={() => setStatusModal((s) => ({ ...s, open: false }))}
        variant={statusModal.variant}
        title={statusModal.title}
        message={statusModal.message}
        primaryActionLabel="Aceptar"
      />
    </Box>
  );
};

export default ForgotPassword;
