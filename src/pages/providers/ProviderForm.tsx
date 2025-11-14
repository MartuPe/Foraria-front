import { FormEvent, useEffect, useState } from "react";
import { Box, TextField, Button, Typography, Stack } from "@mui/material";
import { useMutation } from "../../hooks/useMutation";
import { useGet } from "../../hooks/useGet";
import { Provider } from "../../models/Provider";
import { ForariaStatusModal } from "../../components/StatCardForms";

type Props = { id?: number };

export default function ProviderForm({ id }: Props) {
  const isEdit = !!id;

  const { data: existing } = useGet<Provider>(
    isEdit ? `/providers/${id}` : "",
    { enabled: isEdit }
  );

  const {
    mutate: create,
    loading: creating,
    error: createErr,
  } = useMutation<Provider, Partial<Provider>>("/providers", "post");

  const {
    mutate: update,
    loading: updating,
    error: updateErr,
  } = useMutation<Provider, Partial<Provider>>(`/providers/${id}`, "put");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [active, setActive] = useState(true);

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
  }>({});

  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: "success" | "error";
  }>({
    open: false,
    title: "",
    message: "",
    variant: "success",
  });

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setEmail(existing.email);
      setActive(existing.active);
    }
  }, [existing]);

  useEffect(() => {
    const apiError = createErr || updateErr;
    if (!apiError) return;

    setStatusModal({
      open: true,
      variant: "error",
      title: "No se pudo guardar el proveedor",
      message: "Ocurrió un error al comunicarse con el servidor. Intentá nuevamente.",
    });
  }, [createErr, updateErr]);

  const validate = () => {
    const errors: { name?: string; email?: string } = {};

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    const nameRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedName) {
      errors.name = "El nombre es obligatorio.";
    } else if (trimmedName.length < 3) {
      errors.name = "El nombre debe tener al menos 3 caracteres.";
    } else if (!nameRegex.test(trimmedName)) {
      errors.name = "El nombre solo puede contener letras y espacios.";
    }

    if (!trimmedEmail) {
      errors.email = "El email es obligatorio.";
    } else if (!emailRegex.test(trimmedEmail)) {
      errors.email = "Introduce un email válido.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const payload: Partial<Provider> = {
      name: name.trim(),
      email: email.trim(),
      active: isEdit ? active : true,
    };

    try {
      if (isEdit) {
        await update(payload);
        setStatusModal({
          open: true,
          variant: "success",
          title: "Proveedor actualizado",
          message: "Los datos del proveedor se guardaron correctamente.",
        });
      } else {
        await create(payload);
        setName("");
        setEmail("");
        setActive(true);
        setStatusModal({
          open: true,
          variant: "success",
          title: "Proveedor creado",
          message: "El proveedor se creó correctamente.",
        });
      }
    } catch (err) {
      console.error("Error en ProviderForm:", err);
    }
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{
          display: "grid",
          gap: 2,
          maxWidth: 420,
          p: 2,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {isEdit ? "Editar proveedor" : "Nuevo proveedor"}
        </Typography>

        <Stack spacing={0.5}>
          <Typography variant="subtitle2">Nombre</Typography>
          <TextField
            size="small"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!fieldErrors.name}
            helperText={fieldErrors.name ?? ""}
            placeholder="Nombre del proveedor"
          />
        </Stack>

        <Stack spacing={0.5}>
          <Typography variant="subtitle2">Email</Typography>
          <TextField
            size="small"
            fullWidth
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!fieldErrors.email}
            helperText={fieldErrors.email ?? ""}
            placeholder="email@proveedor.com"
          />
        </Stack>

        {isEdit && (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            <Typography variant="body2">Activo</Typography>
          </Stack>
        )}

        <Button
          type="submit"
          variant="contained"
          className="foraria-gradient-button"
          disabled={creating || updating}
          sx={{ mt: 1 }}
        > {creating || updating ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear"}
        </Button>
      </Box>

      <ForariaStatusModal
        open={statusModal.open}
        onClose={() =>
          setStatusModal((prev) => ({
            ...prev,
            open: false,
          }))
        }
        variant={statusModal.variant}
        title={statusModal.title}
        message={statusModal.message}
        primaryActionLabel="Aceptar"
      />
    </>
  );
}