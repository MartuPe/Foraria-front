import React, { useState } from "react";
import { Box, Button, TextField, Typography, InputAdornment, IconButton, Link } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { Link as RouterLink } from "react-router-dom";
import isotipoColor from "../assets/Isotipo-Color.png";
import { authService } from "../services/authService";
import { storage } from "../utils/storage"; 
import { Role } from "../constants/roles";

const UpdateData: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [dni, setDni]             = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ emptyInputError?: string }>({});
  const [errorFields, setErrorFields] = useState<Record<string, boolean>>({});

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMsg({});
    setErrorFields({});

    const fields = {
      firstName,
      lastName,
      dni,
      currentPassword,
      newPassword,
      confirmNewPassword,
    };

    // Validar vacíos
    const empty: Record<string, boolean> = {};
    Object.entries(fields).forEach(([key, value]) => {
      if (!value.trim()) empty[key] = true;
    });

    if (Object.keys(empty).length > 0) {
      setMsg({ emptyInputError: "No puede haber campos vacíos." });
      setErrorFields(empty);
      return;
    }

    // Validar coincidencia
    if (newPassword !== confirmNewPassword) {
      setMsg({ emptyInputError: "Las contraseñas nuevas no coinciden." });
      setErrorFields({ newPassword: true, confirmNewPassword: true });
      return;
    }

    // Validar fortaleza
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,;:\-_])[A-Za-z\d@$!%*?&.,;:\-_]{8,}$/;

    if (!strongPasswordRegex.test(newPassword)) {
      setMsg({
        emptyInputError:
          "La nueva contraseña debe tener al menos una mayúscula, una minúscula, un número y un caracter especial.",
      });
      setErrorFields({ newPassword: true, confirmNewPassword: true });
      return;
    }

    // Validar nombre y apellido
    if (firstName.trim().length < 3 || lastName.trim().length < 3) {
      setMsg({
        emptyInputError:
          "El nombre y el apellido deben tener al menos 3 letras.",
      });
      const err: Record<string, boolean> = {};
      if (firstName.trim().length < 3) err.firstName = true;
      if (lastName.trim().length < 3) err.lastName = true;
      setErrorFields(err);
      return;
    }

    // Validar DNI
    if (isNaN(Number(dni)) || !/^\d+$/.test(dni)) {
      setMsg({ emptyInputError: "El DNI es inválido." });
      setErrorFields({ dni: true });
      return;
    }

    setLoading(true);

    try {
      // 1) Llamar al servicio de actualización
      const res = await authService.updateFirstTime({
        firstName,
        lastName,
        dni,
        currentPassword,
        newPassword,
        confirmNewPassword,
        photo,
      });

      console.log("Update response:", res);

      // 2) El authService ya guardó todo, solo necesitamos redirigir
      // Leer el rol actualizado desde storage
      const role = storage.role;

      console.log("Rol después de actualizar:", role);

      // 3) Pequeño delay para asegurar que todo se guardó
      await new Promise(resolve => setTimeout(resolve, 150));

      // 4) Redirigir según rol con recarga completa
      if (role === Role.ADMIN || role === Role.CONSORCIO) {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      console.error("Error en actualización:", err);
      const raw =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "";
      const low = (raw || "").toString().toLowerCase();

      if (low.includes("contraseña") || low.includes("password")) {
        setMsg({ emptyInputError: "La contraseña actual es incorrecta." });
        setErrorFields({ currentPassword: true });
      } else {
        setMsg({ emptyInputError: "No se pudo actualizar la información." });
      }
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
          label="Contraseña actual"
          variant="outlined"
          fullWidth
          margin="normal"
          sx={labelStyle}
          type={showCurrent ? "text" : "password"}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Tu contraseña temporal"
          error={Boolean(errorFields.currentPassword)}
          InputLabelProps={{ shrink: true }}
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
          error={Boolean(errorFields.newPassword)}
          InputLabelProps={{ shrink: true }}
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
          error={Boolean(errorFields.confirmNewPassword)}
          InputLabelProps={{ shrink: true }}
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

        <TextField
          label="Nombre"
          variant="outlined"
          fullWidth
          margin="normal"
          sx={labelStyle}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Tu nombre"
          error={Boolean(errorFields.firstName)}
          InputLabelProps={{ shrink: true }}
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
          error={Boolean(errorFields.lastName)}
          InputLabelProps={{ shrink: true }}
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
          error={Boolean(errorFields.dni)}
          InputLabelProps={{ shrink: true }}
        />

        <Button
          component="label"
          className="foraria-image-upload-button"
          startIcon={<PhotoCamera />}
          sx={{ mt: 1, mb: 2 }}
        >
          Seleccionar imagen
          <input type="file" hidden accept="image/*" onChange={handleImageChange} />
        </Button>

        {msg.emptyInputError && (
          <div
            className="field-message field-message--error field-message--emptyInputError"
            role="alert"
            aria-live="polite"
          >
            {msg.emptyInputError}
          </div>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          className="foraria-gradient-button"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? "Actualizando..." : "Actualizar información"}
        </Button>
      </Box>
    </Box>
  );
};

export default UpdateData;