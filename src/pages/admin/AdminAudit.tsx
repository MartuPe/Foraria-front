import React from "react";
import {
  Paper,
  Stack,
  TextField,
  MenuItem,
  Button,
  Chip,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Typography,
} from "@mui/material";
import { DownloadOutlined, FilterListOutlined } from "@mui/icons-material";
import PageHeader from "../../components/SectionHeader";

// Tipos
type ActionKind =
  | "CREO_VOTACION"
  | "ACTUALIZO_PERFIL"
  | "ELIMINO_DOCUMENTO"
  | "LOGIN_OK"
  | "CREO_EVENTO"
  | "VIO_EXPENSAS"
  | "LOGIN_FAIL"
  | "ACTUALIZO_RECLAMO"
  | "RESERVO_ESPACIO";

type LogRow = {
  id: string;
  timestamp: string; // ISO
  user: string;
  action: ActionKind;
  entityType: string;
  entityId: string;
  description: string;
  ip: string;
};

// Mock (reemplazar por service real)
const MOCK: LogRow[] = [
  {
    id: "1",
    timestamp: "2024-01-15T14:30:25",
    user: "admin@foraria.com",
    action: "CREO_VOTACION",
    entityType: "Votación",
    entityId: "VOT-001",
    description: "Votación “Reforma del reglamento de mascotas”…",
    ip: "192.168.1.100",
  },
  {
    id: "2",
    timestamp: "2024-01-15T14:25:18",
    user: "maria.rodriguez@consorcio.com",
    action: "ACTUALIZO_PERFIL",
    entityType: "Usuario",
    entityId: "USR-045",
    description: "Cambió número de teléfono de contacto",
    ip: "192.168.1.105",
  },
  {
    id: "3",
    timestamp: "2024-01-15T14:20:42",
    user: "admin@foraria.com",
    action: "ELIMINO_DOCUMENTO",
    entityType: "Documento",
    entityId: "DOC-123",
    description: "Documento “Reglamento antiguo.pdf” eliminado",
    ip: "192.168.1.100",
  },
  {
    id: "4",
    timestamp: "2024-01-15T14:15:33",
    user: "carlos.lopez@consorcio.com",
    action: "LOGIN_OK",
    entityType: "Sistema",
    entityId: "SYS-001",
    description: "Login exitoso desde dispositivo móvil",
    ip: "192.168.1.112",
  },
  {
    id: "5",
    timestamp: "2024-01-15T14:10:15",
    user: "admin@foraria.com",
    action: "CREO_EVENTO",
    entityType: "Evento",
    entityId: "EVT-015",
    description: "Reunión de consorcio – Enero 2024 programada",
    ip: "192.168.1.100",
  },
  {
    id: "6",
    timestamp: "2024-01-15T14:05:28",
    user: "ana.garcia@consorcio.com",
    action: "VIO_EXPENSAS",
    entityType: "Expensa",
    entityId: "EXP-2024-01",
    description: "Consultó expensas del período enero 2024",
    ip: "192.168.1.118",
  },
  {
    id: "7",
    timestamp: "2024-01-15T14:00:45",
    user: "unknown_user",
    action: "LOGIN_FAIL",
    entityType: "Sistema",
    entityId: "SYS-001",
    description: "Intento de acceso con credenciales incorrectas",
    ip: "192.168.1.200",
  },
  {
    id: "8",
    timestamp: "2024-01-15T13:55:10",
    user: "admin@foraria.com",
    action: "ACTUALIZO_RECLAMO",
    entityType: "Reclamo",
    entityId: "REC-089",
    description: "Estado de ‘Pendiente’ a ‘En proceso’",
    ip: "192.168.1.100",
  },
  {
    id: "9",
    timestamp: "2024-01-15T13:50:33",
    user: "pedro.martinez@consorcio.com",
    action: "RESERVO_ESPACIO",
    entityType: "Reserva",
    entityId: "RES-020",
    description: "Reservó SUM para 20/01/2024 18:00–22:00",
    ip: "192.168.1.125",
  },
];

// Helpers UI
function actionChip(kind: ActionKind) {
  const map: Record<
    ActionKind,
    { label: string; color: "success" | "warning" | "error" | "info" }
  > = {
    CREO_VOTACION: { label: "Creó votación", color: "success" },
    ACTUALIZO_PERFIL: { label: "Actualizó perfil", color: "info" },
    ELIMINO_DOCUMENTO: { label: "Eliminó documento", color: "error" },
    LOGIN_OK: { label: "Inicio sesión", color: "success" },
    CREO_EVENTO: { label: "Creó evento", color: "success" },
    VIO_EXPENSAS: { label: "Visualizó expensas", color: "info" },
    LOGIN_FAIL: { label: "Intento de login fallido", color: "error" },
    ACTUALIZO_RECLAMO: { label: "Actualizó reclamo", color: "info" },
    RESERVO_ESPACIO: { label: "Reservó espacio común", color: "success" },
  };
  const c = map[kind];
  return <Chip size="small" label={c.label} color={c.color} />;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function toCSV(rows: LogRow[]) {
  const header = [
    "Fecha/Hora",
    "Usuario",
    "Acción",
    "Entidad",
    "ID",
    "Descripción",
    "IP",
  ];
  const body = rows.map((r) => [
    formatDateTime(r.timestamp),
    r.user,
    r.action,
    r.entityType,
    r.entityId,
    r.description.replace(/\n/g, " "),
    r.ip,
  ]);
  return [header, ...body]
    .map((arr) => arr.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

export default function AdminAudit() {
  // Filtros
  const [q, setQ] = React.useState("");
  const [user, setUser] = React.useState<string>("ALL");
  const [type, setType] = React.useState<ActionKind | "ALL">("ALL");
  const [from, setFrom] = React.useState<string>(""); // yyyy-mm-dd

  const users = Array.from(new Set(MOCK.map((m) => m.user)));
  const types: { value: ActionKind | "ALL"; label: string }[] = [
    { value: "ALL", label: "Todas las acciones" },
    { value: "CREO_VOTACION", label: "Creó votación" },
    { value: "ACTUALIZO_PERFIL", label: "Actualizó perfil" },
    { value: "ELIMINO_DOCUMENTO", label: "Eliminó documento" },
    { value: "LOGIN_OK", label: "Inicio sesión" },
    { value: "CREO_EVENTO", label: "Creó evento" },
    { value: "VIO_EXPENSAS", label: "Visualizó expensas" },
    { value: "LOGIN_FAIL", label: "Intento de login fallido" },
    { value: "ACTUALIZO_RECLAMO", label: "Actualizó reclamo" },
    { value: "RESERVO_ESPACIO", label: "Reservó espacio común" },
  ];

  const filtered = MOCK.filter((r) => {
    const matchesQ =
      !q ||
      r.user.toLowerCase().includes(q.toLowerCase()) ||
      r.description.toLowerCase().includes(q.toLowerCase()) ||
      r.entityType.toLowerCase().includes(q.toLowerCase());
    const matchesUser = user === "ALL" ? true : r.user === user;
    const matchesType = type === "ALL" ? true : r.action === type;
    const matchesFrom = from ? r.timestamp >= `${from}T00:00:00` : true;
    return matchesQ && matchesUser && matchesType && matchesFrom;
  });

  const exportCSV = () => {
    const csv = toCSV(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `auditoria_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page">
      <PageHeader
        title="Registro de Auditoría"
        actions={
          <Button
            variant="contained"
            color="secondary"
            startIcon={<DownloadOutlined />}
            onClick={exportCSV}
            size="small"
          >
            Exportar CSV
          </Button>
        }
      />

      {/* Subtitle más compacto */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Monitoreo de actividades en la plataforma
        </Typography>
      </Box>

      {/* Panel de filtros más compacto */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{ p: 2, borderRadius: 2, mb: 2 }}
      >
        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
          <FilterListOutlined color="primary" sx={{ fontSize: 20 }} />
          <Typography
            variant="subtitle1"
            color="primary"
            sx={{ fontWeight: 600 }}
          >
            Filtros
          </Typography>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "2fr 1.5fr 1.5fr 1fr",
            },
          }}
        >
          <TextField
            size="small"
            label="Buscar"
            placeholder="usuario, acción, descripción…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            fullWidth
          />
          <TextField
            select
            size="small"
            label="Usuario"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            fullWidth
          >
            <MenuItem value="ALL">Todos</MenuItem>
            {users.map((u) => (
              <MenuItem key={u} value={u}>
                {u.split("@")[0]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Acción"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            fullWidth
          >
            {types.map((t) => (
              <MenuItem key={t.value} value={t.value}>
                {t.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            label="Desde"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>
      </Paper>

      {/* Tabla más compacta y responsive */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{ borderRadius: 2, overflow: "hidden" }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "grey.50",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Registros ({filtered.length})
          </Typography>
        </Box>

        <TableContainer sx={{ maxHeight: { xs: 400, md: 500 } }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>
                  Fecha
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>
                  Usuario
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>
                  Acción
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    minWidth: 100,
                    display: { xs: "none", md: "table-cell" },
                  }}
                >
                  Entidad
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 200 }}>
                  Descripción
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    minWidth: 100,
                    display: { xs: "none", lg: "table-cell" },
                  }}
                >
                  IP
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((r) => (
                <TableRow
                  key={r.id}
                  hover
                  sx={{
                    "&:hover": { backgroundColor: "action.hover" },
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                      {new Date(r.timestamp).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, fontSize: "0.8rem" }}
                    >
                      {r.user.split("@")[0]}
                    </Typography>
                  </TableCell>
                  <TableCell>{actionChip(r.action)}</TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                      >
                        {r.entityType}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: "0.7rem" }}
                      >
                        {r.entityId}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: "0.75rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        maxWidth: { xs: 150, md: 300 },
                      }}
                      title={r.description}
                    >
                      {r.description}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace", fontSize: "0.7rem" }}
                    >
                      {r.ip}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: "center", py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      No hay registros para los filtros aplicados
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
}
