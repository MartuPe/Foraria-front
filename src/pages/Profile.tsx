import React, { useEffect, useMemo, useState } from "react";
import "../styles/profile.css";
import { Box, Typography, Avatar, Button, Chip, Divider, CircularProgress, Grid, } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";
import ApartmentIcon from "@mui/icons-material/Apartment";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";
import PhoneIcon from "@mui/icons-material/Phone";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import { useNavigate, Link as RouterLink, useLocation } from "react-router-dom";
import { authService } from "../services/authService";
import type { UserProfile } from "../services/userService";
import { profileService } from "../services/profileService";

const roleColor: Record<UserProfile["role"], "info" | "success" | "warning" | "default"> = {
  Administrador: "warning",
  Consorcio: "success",
  Propietario: "info",
  Inquilino: "default",
};

function initials(n?: string, l?: string) {
  const a = (n ?? "").trim().charAt(0);
  const b = (l ?? "").trim().charAt(0);
  const out = (a + b).toUpperCase();
  return out || "U";
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fullName = useMemo(
    () => (user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : ""),
    [user]
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const u = await profileService.getProfile();
        if (mounted) setUser(u);
      } catch (e) {
        console.error("Error cargando perfil", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    navigate("/iniciarSesion", { replace: true });
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight={320}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="foraria-page-container" sx={{ ml: 0 }}>
      <Box className="foraria-profile-section" position="relative">
        <Typography variant="h4" component="h1" className="foraria-page-title">
          {isAdminRoute ? "Perfil (Administración)" : "Mi Perfil"}
        </Typography>
        <Typography variant="body2" className="foraria-page-subtitle">
          {isAdminRoute ? "Datos de la cuenta con permisos administrativos" : "Administra tu información personal y configuración de cuenta"}
        </Typography>

        <Box className="foraria-profile-header">
          <Avatar
            src={user?.photo || undefined}
            className="foraria-profile-avatar"
            alt={fullName || "Usuario"}
          >
            {initials(user?.firstName, user?.lastName)}
          </Avatar>

          <Typography className="foraria-profile-name" sx={{ fontWeight: 600 }}>
            {fullName || "Usuario"}
          </Typography>

          <Chip
            label={user?.role ?? "—"}
            variant="outlined"
            color={ user ? roleColor[user.role as keyof typeof roleColor] ?? "default" : "default" }
            sx={{ mt: 1 }}
          />
        </Box>

        <Box display="flex" gap={1} flexWrap="wrap" justifyContent="flex-end" mt={-5}>
          <Button
            component={RouterLink}
            to={isAdminRoute ? "/admin/editarInformacion" : "/editarInformacion"}
            startIcon={<EditIcon />}
            className="foraria-edit-button"
            variant="outlined"
            size="small"
          > Editar
          </Button>
          <Button
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            color="secondary"
            variant="contained"
            size="small"
          >
            Cerrar sesión
          </Button>
        </Box>
      </Box>

      <Box className="foraria-profile-section" sx={{ mt: 2 }}>
        <Typography variant="h6" className="foraria-section-title">
          Información Personal
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Grid container spacing={2} className="foraria-profile-info">
          <Grid size={{ xs: 12, md: 6 }}>
            <Box display="flex" gap={1} alignItems="center">
              <AssignmentIndIcon fontSize="small" />
              <Typography className="foraria-profile-label">Nombre</Typography>
            </Box>
            <Typography className="foraria-profile-value">{user?.firstName ?? "—"}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box display="flex" gap={1} alignItems="center">
              <AssignmentIndIcon fontSize="small" />
              <Typography className="foraria-profile-label">Apellido</Typography>
            </Box>
            <Typography className="foraria-profile-value">{user?.lastName ?? "—"}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box display="flex" gap={1} alignItems="center">
              <BadgeIcon fontSize="small" />
              <Typography className="foraria-profile-label">DNI</Typography>
            </Box>
            <Typography className="foraria-profile-value">{user?.dni ?? "—"}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box display="flex" gap={1} alignItems="center">
              <PhoneIcon fontSize="small" />
              <Typography className="foraria-profile-label">Teléfono</Typography>
            </Box>
            <Typography className="foraria-profile-value">
              {user?.phoneNumber ?? "—"}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box display="flex" gap={1} alignItems="center">
              <EmailIcon fontSize="small" />
              <Typography className="foraria-profile-label">Email</Typography>
            </Box>
            <Typography className="foraria-profile-value">{user?.email ?? "—"}</Typography>
          </Grid>
        </Grid>
      </Box>

      <Box className="foraria-profile-section" sx={{ mt: 2 }}>
        <Typography variant="h6" className="foraria-section-title">
          Información del Consorcio
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box display="flex" gap={1} alignItems="center">
              <ApartmentIcon fontSize="small" />
              <Typography className="foraria-profile-label">Consorcio activo</Typography>
            </Box>
            <Typography className="foraria-profile-value">
              {user?.consortiumId ?? "—"}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography className="foraria-profile-label" sx={{ mb: 0.5 }}>
              Residencias
            </Typography>
            {user?.residences?.length ? (
              <Box display="grid" gap={0.5}>
                {user.residences.map((r) => (
                  <Typography key={r.id} className="foraria-profile-value">
                    Torre/Consorcio: {r.consortiumId} — Piso: {r.floor ?? "—"} — Depto:{" "}
                    {r.number ?? "—"}
                  </Typography>
                ))}
              </Box>
            ) : (
              <Typography className="foraria-profile-value">—</Typography>
            )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Profile;
