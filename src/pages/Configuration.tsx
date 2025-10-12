import React, { useState } from "react";
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
import { Layout } from "../components/layout";
import PageHeader from "../components/SectionHeader";

const Configuration: React.FC = () => {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);

  const [reclamosNotifications, setReclamosNotifications] = useState(true);
  const [expensasNotifications, setExpensasNotifications] = useState(true);
  const [reunionesNotifications, setReunionesNotifications] = useState(true);
  const [votacionesNotifications, setVotacionesNotifications] = useState(false);
  const [forosNotifications, setForosNotifications] = useState(true);
  const [mantenimientoNotifications, setMantenimientoNotifications] =
    useState(true);

  const handleSaveConfiguration = () => {
    // TODO: persistencia
    console.log("Configuración guardada");
  };

  const tipos = [
    {
      key: "reclamos",
      title: "Reclamos y Sugerencias",
      desc: "Nuevos reclamos y actualizaciones",
      checked: reclamosNotifications,
      set: setReclamosNotifications,
    },
    {
      key: "expensas",
      title: "Expensas",
      desc: "Vencimientos y recordatorios de pago",
      checked: expensasNotifications,
      set: setExpensasNotifications,
    },
    {
      key: "reuniones",
      title: "Reuniones",
      desc: "Convocatorias y recordatorios",
      checked: reunionesNotifications,
      set: setReunionesNotifications,
    },
    {
      key: "votaciones",
      title: "Votaciones",
      desc: "Nuevas votaciones disponibles",
      checked: votacionesNotifications,
      set: setVotacionesNotifications,
    },
    {
      key: "foros",
      title: "Actividad en Foros",
      desc: "Nuevos posts y respuestas",
      checked: forosNotifications,
      set: setForosNotifications,
    },
    {
      key: "mantenimiento",
      title: "Mantenimiento",
      desc: "Trabajos programados y avisos",
      checked: mantenimientoNotifications,
      set: setMantenimientoNotifications,
    },
  ];

  return (
    <Layout>
      <Box className="foraria-page-container">
        <PageHeader
          title="Configuración Personal"
          stats={[]}
          /*actions={
            <Button variant="contained" color="secondary" onClick={handleSaveConfiguration}>
              Guardar Configuración
            </Button>
          }*/ />

        <Paper elevation={0} variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
          <Stack spacing={2.5}>
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

              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                useFlexGap
                flexWrap="wrap"
              >
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
                    onChange={(val) => t.set(val)}
                  />
                ))}
              </Stack>
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
    </Layout>
  );
};

export default Configuration;

/* ---------- Subcomponentes locales para mantener consistencia ---------- */

function ChannelItem({
  icon,
  label,
  control,
}: {
  icon: React.ReactNode;
  label: string;
  control: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        p: 1,
        borderRadius: 2,
      }}
    >
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
      <FormControlLabel control={control as any} label={label} />
    </Box>
  );
}

function TypeRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
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

      <Switch
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        color="primary"
      />
    </Paper>
  );
}
