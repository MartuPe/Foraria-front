import React, { useState } from "react";
import { Box, Button, TextField, Typography, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import isotipoColor from "../assets/Isotipo-Color.png";

const ChangeData: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dni, setDni] = useState("");
  const [apartment, setApartment] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ emptyInputError?: string }>({});
  const [errorFields, setErrorFields] = useState<Record<string, boolean>>({});

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setPhoto(event.target.files[0]);
    }
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[+\d][\d\s-]{5,}$/;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMsg({});
    setErrorFields({});

    const fields = { firstName, lastName, dni, apartment, phone, email };
    const empty: Record<string, boolean> = {};
    Object.entries(fields).forEach(([k, v]) => {
      if (!v.trim()) empty[k] = true;
    });

    if (Object.keys(empty).length > 0) {
      setMsg({ emptyInputError: "No puede haber campos vacíos." });
      setErrorFields(empty);
      return;
    }

    if (firstName.trim().length < 3 || lastName.trim().length < 3) {
      setMsg({ emptyInputError: "El nombre y el apellido deben tener al menos 3 letras." });
      const err: Record<string, boolean> = {};
      if (firstName.trim().length < 3) err.firstName = true;
      if (lastName.trim().length < 3) err.lastName = true;
      setErrorFields(err);
      return;
    }

    if (isNaN(Number(dni)) || !/^\d+$/.test(dni)) {
      setMsg({ emptyInputError: "El DNI es inválido." });
      setErrorFields({ dni: true });
      return;
    }

    if (!emailRegex.test(email.trim())) {
      setMsg({ emptyInputError: "El email es inválido." });
      setErrorFields({ email: true });
      return;
    }

    if (!phoneRegex.test(phone.trim())) {
      setMsg({ emptyInputError: "El teléfono es inválido." });
      setErrorFields({ phone: true });
      return;
    }

    setLoading(true);
    try {
      // await profileService.update({ firstName, lastName, dni, apartment, phone, email, photo });
      console.log("Perfil listo para enviar:", {
        firstName,
        lastName,
        dni,
        apartment,
        phone,
        email,
        photo,
      });
      // Mostrar un success / notify("Perfil actualizado", "success");
    } catch (err: any) {
      console.error(err);
      const raw =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "";
      const low = (raw || "").toString().toLowerCase();

      if (low.includes("dni")) {
        setMsg({ emptyInputError: "El DNI es inválido." });
        setErrorFields({ dni: true });
      } else if (low.includes("email") || low.includes("correo")) {
        setMsg({ emptyInputError: "El email es inválido." });
        setErrorFields({ email: true });
      } else if (low.includes("tel")) {
        setMsg({ emptyInputError: "El teléfono es inválido." });
        setErrorFields({ phone: true });
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
    <Box className="foraria-login-page">
      <Box className="foraria-form-container" component="form" onSubmit={handleSubmit}>
        <Box component="img" src={isotipoColor} alt="Logo" className="foraria-logo" />
        <Typography variant="h5" component="h1" gutterBottom className="foraria-form-title">
          Actualizar Datos
        </Typography>

        <Typography>Actualiza tu información personal para continuar</Typography>

        <Box className="foraria-centered-link" sx={{ mb: 1 }}>
          <Link component={RouterLink} to="/perfil" underline="hover" className="foraria-form-link foraria-left-link">
            <ArrowBackIcon sx={{ mr: 0.5 }} />
            Volver al Perfil
          </Link>
        </Box>

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
          error={Boolean(errorFields.lastName)}
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
          error={Boolean(errorFields.dni)}
          InputLabelProps={{ className: "foraria-form-label", shrink: true }}
        />

        <TextField
          label="Piso/Departamento"
          variant="outlined"
          fullWidth
          margin="normal"
          sx={labelStyle}
          value={apartment}
          onChange={(e) => setApartment(e.target.value)}
          placeholder="Ej: 4B"
          error={Boolean(errorFields.apartment)}
          InputLabelProps={{ className: "foraria-form-label", shrink: true }}
        />
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          sx={labelStyle}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          error={Boolean(errorFields.email)}
          InputLabelProps={{ className: "foraria-form-label", shrink: true }}
        />

        <TextField
          label="Teléfono"
          variant="outlined"
          fullWidth
          margin="normal"
          sx={labelStyle}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Ej: +54 11 5555-5555"
          error={Boolean(errorFields.phone)}
          InputLabelProps={{ className: "foraria-form-label", shrink: true }}
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
          > {msg.emptyInputError}
          </div>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          className="foraria-gradient-button"
          disabled={loading}
          sx={{ mt: 2 }}
        > {loading ? "Actualizando..." : "Actualizar información"}
        </Button>
      </Box>
    </Box>
  );
};

export default ChangeData;