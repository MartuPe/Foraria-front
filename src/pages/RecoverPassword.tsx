import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, CircularProgress } from '@mui/material';
import isotipoColor from '../assets/Isotipo-Color.png';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const validateEmail = (value: string) => {
    // validación simple; ajusta si necesitas más estricta
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setServerMessage(null);
    setServerError(null);

    if (!email) {
      setEmailError('El email es requerido');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Introduce un email válido');
      return;
    }
    setEmailError(null);

    setLoading(true);
    try {
      const res = await fetch('https://localhost:7245/api/User/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      // intenta parsear JSON aunque el status no sea 2xx
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        // si el servidor devuelve un mensaje de error en JSON, úsalo
        const msg = data?.message || `Error ${res.status}`;
        setServerError(msg);
      } else {
        const msg = data?.message || 'Revisa tu correo';
        setServerMessage(msg);
        // opcional: limpiar campo o mantenerlo según UX deseada
        // setEmail('');
      }
    } catch (err) {
      setServerError('No se pudo conectar con el servidor. Intenta más tarde.');
      console.error('Forgot password error:', err);
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
        <Box component="img" src={isotipoColor} alt="Logo" className="foraria-logo" />
        <Typography
          variant="h5"
          component="h1"
          gutterBottom
          className="foraria-form-title"
        >
          Recuperar Contraseña
        </Typography>

        <Typography>
          Ingresa tu email y te enviaremos un enlace para recuperar tu contraseña
        </Typography>

        <Box className="foraria-centered-link" sx={{ mb: 1 }}>
          <Link component={RouterLink} to="/iniciarSesion" underline="hover" className="foraria-form-link foraria-left-link">
            <ArrowBackIcon />
            Volver al login
          </Link>
        </Box>

        {serverMessage && <Alert severity="success" sx={{ mb: 2 }}>{serverMessage}</Alert>}
        {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}

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
          placeholder="Tu@email.com"
          InputLabelProps={{ className: 'foraria-form-label', shrink: true }}
          error={!!emailError}
          helperText={emailError ?? ''}
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
          sx={{ position: 'relative' }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              Enviando...
            </>
          ) : (
            'Enviar enlace de recuperación'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default ForgotPassword;
