import * as React from "react";
import { Dialog, DialogTitle, DialogContent, IconButton, Grid, TextField, MenuItem, Button, Stack, Typography, Alert, CircularProgress, } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddAlt1Outlined from "@mui/icons-material/PersonAddAlt1Outlined";
import { registerUser } from "../../services/userManagementService";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: (payload: any) => void;
};

const ROLES = [
  { id: 1, label: "Consejo" },
  { id: 3, label: "Propietario" },
  { id: 4, label: "Inquilino" },
];

type FieldErrors = {
  fullName?: string;
  email?: string;
  phone?: string;
  residenceId?: string;
};

export default function NewUser({ open, onClose, onCreated }: Props) {
  const [form, setForm] = React.useState({
    fullName: "",
    email: "",
    phone: "",
    residenceId: "",
    roleId: 0,
  });

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<{
    id?: number;
    email?: string;
    temporaryPassword?: string;
  } | null>(null);

  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});

  React.useEffect(() => {
    if (!open) {
      setForm({
        fullName: "",
        email: "",
        phone: "",
        residenceId: "",
        roleId: 0,
      });
      setError(null);
      setSuccess(null);
      setSubmitting(false);
      setFieldErrors({});
    }
  }, [open]);

  function splitFullName(full: string) {
    const parts = full.trim().split(/\s+/);
    const first = parts.shift() ?? "";
    const last = parts.join(" ") || "-";
    return { first, last };
  }

  function sanitizePhone(p: string) {
    const digits = (p || "").replace(/\D+/g, "");
    return digits.length ? Number(digits) : NaN;
  }

  const validate = (): boolean => {
    const next: FieldErrors = {};

    if (!form.fullName.trim()) {
      next.fullName = "El nombre completo es obligatorio.";
    } else if (form.fullName.trim().length < 3) {
      next.fullName = "El nombre completo debe tener al menos 3 caracteres.";
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!form.email.trim()) {
      next.email = "El email es obligatorio.";
    } else if (!emailRegex.test(form.email.trim())) {
      next.email = "Ingresá un email válido.";
    }

    if (!form.phone.trim()) {
      next.phone = "El teléfono es obligatorio.";
    } else {
      const phone = sanitizePhone(form.phone);
      if (Number.isNaN(phone)) {
        next.phone = "Ingresá un teléfono válido (solo números).";
      }
    }

    if (!form.residenceId.trim()) {
      next.residenceId = "El ID de unidad (residencia) es obligatorio.";
    } else if (Number.isNaN(Number(form.residenceId))) {
      next.residenceId = "Ingresá un ID de unidad válido.";
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    if (!validate()) return;

    const { first, last } = splitFullName(form.fullName);
    const phone = sanitizePhone(form.phone);

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

      const normalized = {
        id: resp?.id ?? resp?.Id,
        email: resp?.email ?? resp?.Email,
        temporaryPassword: resp?.temporaryPassword ?? resp?.TemporaryPassword,
      };

      setSuccess(normalized);
      onCreated?.(normalized);
    } catch (err: any) {
      console.error("Register error:", err?.response || err);

      let userMessage = "No se pudo crear el usuario. Verificá los datos e intentá nuevamente.";

      const serverRaw =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message || "";
      const low = serverRaw.toString().toLowerCase();

      if (low.includes("email")) {
        userMessage = "El email ya está en uso o es inválido.";
      } else if (low.includes("residence") || low.includes("residencia")) {
        userMessage = "La unidad (residencia) no es válida.";
      }

      setError(userMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={(_e, reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") return;
        onClose();
      }}
      disableEscapeKeyDown
      keepMounted
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle
        sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1 }}
      >
        <PersonAddAlt1Outlined sx={{ color: "primary.main" }} />
        Nuevo Usuario
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ ml: "auto" }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Nombre completo
              </Typography>
              <TextField
                fullWidth
                placeholder="Nombre completo"
                value={form.fullName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, fullName: e.target.value }))
                }
                autoFocus
                error={Boolean(fieldErrors.fullName)}
              />
              {fieldErrors.fullName && (
                <div className="field-message field-message--error" role="alert" aria-live="polite" >
                  {fieldErrors.fullName}
                </div>
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Email
              </Typography>
              <TextField
                type="email"
                fullWidth
                placeholder="email@ejemplo.com"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                error={Boolean(fieldErrors.email)}
              />
              {fieldErrors.email && (
                <div className="field-message field-message--error" role="alert" aria-live="polite" >
                  {fieldErrors.email}
                </div>
              )}
            </Grid>

 <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Rol
              </Typography>
              <TextField
                select
                fullWidth
                value={form.roleId}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    roleId: Number(e.target.value),
                  }))
                }
              >
                {ROLES.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Teléfono
              </Typography>
              <TextField
                fullWidth
                placeholder="+54 11 1234-5678"
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, phone: e.target.value }))
                }
                error={Boolean(fieldErrors.phone)}
              />
           

              {fieldErrors.phone && (
                <div className="field-message field-message--error" role="alert" aria-live="polite" >
                  {fieldErrors.phone}
                </div>
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Unidad (ID de residencia)
              </Typography>
              <TextField
                fullWidth
                placeholder="Ej: 12"
                value={form.residenceId}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^\d]/g, "");
                  setForm((prev) => ({ ...prev, residenceId: v }));
                }}
                error={Boolean(fieldErrors.residenceId)}
              />
              {fieldErrors.residenceId && (
                <div className="field-message field-message--error" role="alert" aria-live="polite" >
                  {fieldErrors.residenceId}
                </div>
              )}
            </Grid>

           

            {success?.temporaryPassword && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  <Stack>
                    <strong>Usuario creado correctamente.</strong>
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
              <Stack
                direction="row"
                spacing={2}
                justifyContent="flex-start"
                sx={{ mt: 1 }}
              >
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
              </Stack>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  );
}