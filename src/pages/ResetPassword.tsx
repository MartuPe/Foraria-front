// ResetPassword.tsx
import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Alert, CircularProgress } from '@mui/material';
import isotipoColor from '../assets/Isotipo-Color.png';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import Link from '@mui/material/Link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const tokenFromUrl = params.get('token') || '';

  const [token] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setServerError('Token ausente en la URL');
    }
  }, [token]);

  const validate = () => {
    let ok = true;
    setNewPasswordError(null);
    setConfirmPasswordError(null);

    if (!newPassword) {
      setNewPasswordError('La contraseña es requerida');
      ok = false;
    } else if (newPassword.length < 8) {
      setNewPasswordError('La contraseña debe tener al menos 8 caracteres');
      ok = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Confirma la contraseña');
      ok = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Las contraseñas no coinciden');
      ok = false;
    }

    return ok;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerMessage(null);
    setServerError(null);

    if (!validate()) return;
    if (!token) {
      setServerError('Token inválido o faltante');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('https://foraria-api-e7dac8bpewbgdpbj.brazilsouth-01.azurewebsites.net/api/User/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.message || `Error ${res.status}`;
        setServerError(msg);
      } else {
        const msg = data?.message || 'Contraseña actualizada correctamente';
        setServerMessage(msg);
        // opcional: redirigir al login después de un corto delay
        setTimeout(() => navigate('/iniciarSesion'), 1400);
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setServerError('No se pudo conectar con el servidor. Intenta más tarde.');
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
          Cambiar contraseña
        </Typography>

        <Typography sx={{ mb: 1 }}>
          Ingresa tu nueva contraseña. El token se toma automáticamente desde la URL
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
          label="Nueva contraseña"
          variant="outlined"
          fullWidth
          margin="normal"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Ingresa la nueva contraseña"
          InputLabelProps={{ className: 'foraria-form-label', shrink: true }}
          error={!!newPasswordError}
          helperText={newPasswordError ?? ''}
          disabled={loading}
          type="password"
          autoComplete="new-password"
        />

        <TextField
          label="Confirmar contraseña"
          variant="outlined"
          fullWidth
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repite la nueva contraseña"
          InputLabelProps={{ className: 'foraria-form-label', shrink: true }}
          error={!!confirmPasswordError}
          helperText={confirmPasswordError ?? ''}
          disabled={loading}
          type="password"
          autoComplete="new-password"
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          className="foraria-gradient-button"
          disabled={loading}
          sx={{ position: 'relative', mt: 1 }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              Actualizando...
            </>
          ) : (
            'Cambiar contraseña'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default ResetPassword;
