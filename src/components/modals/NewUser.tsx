import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  TextField,
  MenuItem,
  Button,
  Stack,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddAlt1Outlined from "@mui/icons-material/PersonAddAlt1Outlined";
import { registerUser } from "../../services/userManagementService";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: (payload: any) => void;
};

const ROLES = [
  { id: 1, label: "Propietario" },
  { id: 2, label: "Inquilino" },
  { id: 3, label: "Admin" },
];

export default function NewUser({ open, onClose, onCreated }: Props) {
  const [form, setForm] = React.useState({
    fullName: "",
    email: "",
    phone: "",
    residenceId: "",
    roleId: 1,
  });

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<{
    id?: number;
    email?: string;
    temporaryPassword?: string;
  } | null>(null);

  React.useEffect(() => {
    if (!open) {
      setForm({ fullName: "", email: "", phone: "", residenceId: "", roleId: 1 });
      setError(null);
      setSuccess(null);
      setSubmitting(false);
    }
  }, [open]);

  /** 🔹 Helpers para sanitizar inputs */
  function splitFullName(full: string) {
    const parts = full.trim().split(/\s+/);
    const first = parts.shift() ?? "";
    const last = parts.join(" ") || "-";
    return { first, last };
  }

  function sanitizePhone(p: string) {
    const digits = (p || "").replace(/\D+/g, ""); // deja solo números
    return digits.length ? Number(digits) : NaN;
  }

  /** 🔹 Envío al backend */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validaciones
    if (!form.fullName.trim()) return setError("Ingresá el nombre completo.");
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      return setError("Ingresá un email válido.");
    if (form.residenceId === "" || Number.isNaN(Number(form.residenceId)))
      return setError("Ingresá un ID de unidad (ResidenceId) válido.");

    const { first, last } = splitFullName(form.fullName);
    const phone = sanitizePhone(form.phone);

    if (Number.isNaN(phone)) {
      setError("Ingresá un teléfono válido (solo números).");
      return;
    }

    const payload = {
      FirstName: first,
      LastName: last,
      Email: form.email.trim(),
      PhoneNumber: phone,
      RoleId: Number(form.roleId),
      ResidenceId: Number(form.residenceId),
    };

    setSubmitting(true);
    try {
      const resp = await registerUser(payload);
      setSuccess({
        id: resp?.Id,
        email: resp?.Email,
        temporaryPassword: resp?.TemporaryPassword,
      });
      onCreated?.(resp);
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        JSON.stringify(err?.response?.data || {}) ||
        "No se pudo crear el usuario.";
      setError(serverMsg);
      console.error("Register error:", err?.response || err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1 }}
      >
        <PersonAddAlt1Outlined sx={{ color: "primary.main" }} />
        Nuevo Usuario
        <IconButton aria-label="close" onClick={onClose} sx={{ ml: "auto" }} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6}}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Nombre completo
              </Typography>
              <TextField
                fullWidth
                placeholder="Nombre completo"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                autoFocus
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6}}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Email
              </Typography>
              <TextField
                type="email"
                fullWidth
                placeholder="email@ejemplo.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6}}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Teléfono
              </Typography>
              <TextField
                fullWidth
                placeholder="+54 11 1234-5678"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6}}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Unidad (ID de residencia)
              </Typography>
              <TextField
                fullWidth
                placeholder="Ej: 12"
                value={form.residenceId}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^\d]/g, "");
                  setForm({ ...form, residenceId: v === "" ? "" : v });
                }}
                helperText="Este valor se envía como ResidenceId al backend"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6}}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Rol
              </Typography>
              <TextField
                select
                fullWidth
                value={form.roleId}
                onChange={(e) => setForm({ ...form, roleId: Number(e.target.value) })}
              >
                {ROLES.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {success?.temporaryPassword && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  <Stack>
                    <strong>Usuario creado correctamente.</strong>
                    <span>
                      <b>Email:</b> {success.email}
                    </span>
                    <span>
                      <b>Contraseña temporal:</b>{" "}
                      <Typography component="span" sx={{ fontFamily: "monospace" }}>
                        {success.temporaryPassword}
                      </Typography>
                    </span>
                  </Stack>
                </Alert>
              </Grid>
            )}

            {error && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {error}
                </Alert>
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <Stack direction="row" spacing={2} justifyContent="flex-start" sx={{ mt: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  disabled={submitting}
                  startIcon={!submitting ? <PersonAddAlt1Outlined /> : undefined}
                  sx={{
                    px: 2.5,
                    fontWeight: 700,
                    textTransform: "none",
                    boxShadow: "0 6px 16px rgba(245,158,11,.25)",
                  }}
                >
                  {submitting ? (
                    <Stack direction="row" alignItems="center" gap={1}>
                      <CircularProgress size={18} />
                      Creando…
                    </Stack>
                  ) : (
                    "Crear Usuario"
                  )}
                </Button>

                <Button variant="outlined" onClick={onClose} disabled={submitting}>
                  Cancelar
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  );
}
