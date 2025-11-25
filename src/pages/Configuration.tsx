// src/pages/Configuration.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Divider,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Smartphone as SmartphoneIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
} from "@mui/icons-material";
import PageHeader from "../components/SectionHeader";
import { api } from "../api/axios";

const Configuration: React.FC = () => {
  // ----------- NOTIFICACIONES ORIGINALES -----------
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);

  const [reclamosNotifications, setReclamosNotifications] = useState(true);
  const [expensasNotifications, setExpensasNotifications] = useState(true);
  const [reunionesNotifications, setReunionesNotifications] = useState(true);
  const [votacionesNotifications, setVotacionesNotifications] = useState(false);
  const [forosNotifications, setForosNotifications] = useState(true);
  const [mantenimientoNotifications, setMantenimientoNotifications] = useState(true);

  // ----------- NUEVO: PERMISOS INQUILINO -----------
  const [tenantData, setTenantData] = useState<any>(null);
  const [loadingTenant, setLoadingTenant] = useState(true);
  const [tenantPermission, setTenantPermission] = useState(false);

 useEffect(() => {
  const consortiumId = localStorage.getItem("consortiumId");
  const residenceId = localStorage.getItem("residenceId");

  if (!consortiumId || !residenceId) {
    console.warn("No hay consortiumId o residenceId en localStorage");
    setLoadingTenant(false);
    return;
  }

  const fetchUsers = async () => {
    try {
      setLoadingTenant(true);
      // usa axios (api) para respetar headers/autorización que ya tenés configurados
      const { data } = await api.get(`/User/consortium/${consortiumId}`);

      if (!Array.isArray(data)) {
        console.warn("Respuesta inesperada de /User/consortium:", data);
        setTenantData(null);
        return;
      }

      // comparar role case-insensitive y comparar ids como strings
      const tenant = data.find((u: any) => {
        const role = (u.role ?? "").toString().toLowerCase();
        const isTenant = role === "inquilino";
        const hasResidence = Array.isArray(u.residences)
          && u.residences.some((r: any) => String(r.id) === String(residenceId));
        return isTenant && hasResidence;
      });

      if (!tenant) {
        console.info("No se encontró inquilino para residenceId =", residenceId);
        setTenantData(null);
      } else {
        setTenantData(tenant);
        // si el backend devuelve hasPermission en el objeto, lo usamos
        setTenantPermission(Boolean(tenant.hasPermission));
      }
    } catch (err: any) {
      console.error("Error obteniendo usuarios del consorcio:", err?.response ?? err);
      setTenantData(null);
    } finally {
      setLoadingTenant(false);
    }
  };

  fetchUsers();
}, []);

 const handleTogglePermission = async (val: boolean) => {
  if (!tenantData) return;

  const endpoint = val ? "/Permission/transfer" : "/Permission/revoke";

  try {
    // body según tu API
    const body = { tenantId: tenantData.id };

    const { data } = await api.post(endpoint, body);

    // si el call fue exitoso, actualizar estado local
    setTenantPermission(val);
    setTenantData((t: any) => ({ ...(t ?? {}), hasPermission: val }));
    console.info(`${val ? "Otorgado" : "Revocado"} permiso a tenant ${tenantData.id}`, data);
  } catch (err: any) {
    console.error("Error al cambiar permisos:", err?.response ?? err);
    // opcional: mostrar snackbar / alert con err.response.data?.message
  }
};

  const handleSaveConfiguration = () => {
    console.log("Configuración guardada");
  };

  const tipos = [
    { key: "reclamos", title: "Reclamos y Sugerencias", desc: "Nuevos reclamos y actualizaciones", checked: reclamosNotifications, set: setReclamosNotifications },
    { key: "expensas", title: "Expensas", desc: "Vencimientos y recordatorios de pago", checked: expensasNotifications, set: setExpensasNotifications },
    { key: "reuniones", title: "Reuniones", desc: "Convocatorias y recordatorios", checked: reunionesNotifications, set: setReunionesNotifications },
    { key: "votaciones", title: "Votaciones", desc: "Nuevas votaciones disponibles", checked: votacionesNotifications, set: setVotacionesNotifications },
    { key: "foros", title: "Actividad en Foros", desc: "Nuevos posts y respuestas", checked: forosNotifications, set: setForosNotifications },
    { key: "mantenimiento", title: "Mantenimiento", desc: "Trabajos programados y avisos", checked: mantenimientoNotifications, set: setMantenimientoNotifications },
  ];

  return (
    <Box className="foraria-page-container" sx={{ ml: 0 }}>
      <PageHeader title="Configuración Personal" stats={[]} />

      <Paper elevation={0} variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
        <Stack spacing={2.5}>

          {/* ----------------- NOTIFICACIONES ----------------- */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <NotificationsIcon color="primary" />
            <Typography variant="h6" fontWeight={600} color="primary">
              Configuración de Notificaciones
            </Typography>
          </Stack>

          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
              Canales de Notificación
            </Typography>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2} useFlexGap flexWrap="wrap">
              <ChannelItem
                icon={<SmartphoneIcon fontSize="small" />}
                label="Notificaciones Push"
                control={
                  <Switch
                    checked={pushNotifications}
                    onChange={(e) => setPushNotifications(e.target.checked)}
                    color="primary"
                  />
                }
              />
              <ChannelItem
                icon={<EmailIcon fontSize="small" />}
                label="Email"
                control={
                  <Switch
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    color="success"
                  />
                }
              />
              <ChannelItem
                icon={<SmsIcon fontSize="small" />}
                label="SMS"
                control={
                  <Switch
                    checked={smsNotifications}
                    onChange={(e) => setSmsNotifications(e.target.checked)}
                    color="secondary"
                  />
                }
              />
            </Stack>
          </Box>

          <Divider />

          {/* ----------------- TIPOS DE NOTIFICACIÓN ----------------- */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
              Tipos de Notificaciones
            </Typography>

            <Stack spacing={1.2}>
              {tipos.map((t) => (
                <TypeRow
                  key={t.key}
                  title={t.title}
                  description={t.desc}
                  checked={t.checked}
                  onChange={(val: boolean) => t.set(val)}
                />
              ))}
            </Stack>
          </Box>

          <Divider />

          {/* ----------------- NUEVO: PERMISOS DE INQUILINO ----------------- */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
              Otorgar Permisos al Inquilino
            </Typography>

            {loadingTenant ? (
              <Typography>Cargando inquilino...</Typography>
            ) : tenantData ? (
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography fontWeight={600}>
                  {tenantData.firstName} {tenantData.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {tenantData.mail}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tel: {tenantData.phoneNumber}
                </Typography>

                <Box mt={1}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={tenantPermission}
                        onChange={(e) => handleTogglePermission(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Permitir al inquilino gestionar la unidad"
                  />
                </Box>
              </Paper>
            ) : (
              <Typography>No se encontró un inquilino asociado.</Typography>
            )}
          </Box>

        </Stack>
      </Paper>

      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          justifyContent: "flex-end",
          mt: 2,
        }}
      >
        <Button variant="contained" color="secondary" onClick={handleSaveConfiguration}>
          Guardar Configuración
        </Button>
      </Box>
    </Box>
  );
};

export default Configuration;

/* ---------- SUBCOMPONENTES ORIGINALES ---------- */

function ChannelItem({ icon, label, control }: any) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1, borderRadius: 2 }}>
      <Box
        sx={(t) => ({
          width: 28,
          height: 28,
          display: "grid",
          placeItems: "center",
          borderRadius: 1,
          bgcolor: t.palette.action.hover,
          color: t.palette.primary.main,
          flexShrink: 0,
        })}
      >
        {icon}
      </Box>
      <FormControlLabel control={control} label={label} />
    </Box>
  );
}

function TypeRow({ title, description, checked, onChange }: any) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
      <Switch checked={checked} onChange={(e) => onChange(e.target.checked)} color="primary" />
    </Paper>
  );
}
