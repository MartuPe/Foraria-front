// src/popups/NewSupplier.tsx
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { TextField, Button, MenuItem } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useGet } from "../hooks/useGet";
import { useMutation } from "../hooks/useMutation";
import "../styles/spent.css";

type SupplierPayload = {
  commercialName: string;
  businessName: string;
  cuit: string;                // lo vamos a normalizar (solo dígitos)
  supplierCategory: string;
  phone?: string;
  email?: string;
  address?: string;
  contactPerson?: string;
  observations?: string;
  active?: boolean;
};

type Props = { onSuccess?: () => void | Promise<void> };

type Errors = Partial<Record<keyof SupplierPayload, string>>;

export default function NewSupplier({ onSuccess }: Props) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<SupplierPayload>({
    commercialName: "",
    businessName: "",
    cuit: "",
    supplierCategory: "",
    phone: "",
    email: "",
    address: "",
    contactPerson: "",
    observations: "",
  });

  const [errors, setErrors] = useState<Errors>({});

  // Cargar datos si es edición
  const { data: existing } = useGet<SupplierPayload>(
    isEdit ? `/Supplier/${id}` : "",
    { enabled: isEdit }
  );

  useEffect(() => {
    if (existing) setForm(existing);
  }, [existing]);

  const { mutate: createSupplier, loading: creating } =
    useMutation<any, SupplierPayload>("/Supplier", "post");
  const { mutate: updateSupplier, loading: updating } =
    useMutation<any, Partial<SupplierPayload>>(`/Supplier/${id}`, "put");

  // Utils
  const digitsCUIT = useMemo(() => form.cuit.replace(/\D/g, ""), [form.cuit]);
  const emailRegex = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    []
  );

  // Validaciones por campo (live)
  const validateField = (name: keyof SupplierPayload, value: string) => {
    let msg = "";

    if (name === "commercialName" && !value.trim()) msg = "Requerido";
    if (name === "businessName" && !value.trim()) msg = "Requerido";
    if (name === "supplierCategory" && !value.trim()) msg = "Elegí una categoría";

    if (name === "cuit") {
      const onlyDigits = value.replace(/\D/g, "");
      if (!onlyDigits) msg = "Requerido";
      else if (onlyDigits.length !== 11) msg = "Debe tener 11 dígitos";
    }

    if (name === "email" && value) {
      if (!emailRegex.test(value)) msg = "Formato de email inválido";
    }

    setErrors((prev) => ({ ...prev, [name]: msg }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target as { name: keyof SupplierPayload; value: string };
    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const formHasErrors = useMemo(() => {
    // forzamos validaciones mínimas
    const requiredOk =
      form.commercialName.trim() &&
      form.businessName.trim() &&
      form.supplierCategory.trim() &&
      digitsCUIT.length === 11;

    const anyError = Object.values(errors).some(Boolean);
    return !requiredOk || anyError;
  }, [form, errors, digitsCUIT]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validación final
    validateField("commercialName", form.commercialName);
    validateField("businessName", form.businessName);
    validateField("supplierCategory", form.supplierCategory);
    validateField("cuit", form.cuit);
    if (form.email) validateField("email", form.email);

    // si hay errores, no mando
    const anyError = Object.values(errors).some(Boolean);
    if (anyError || digitsCUIT.length !== 11 || !form.commercialName || !form.businessName || !form.supplierCategory) {
      return;
    }

    const payload: SupplierPayload = {
      ...form,
      cuit: digitsCUIT,  // normalizamos para el backend
      active: true,
    };

    try {
      if (isEdit) {
        await updateSupplier(payload);
        alert("Proveedor actualizado ✅");
      } else {
        await createSupplier(payload);
        alert("Proveedor creado ✅");
      }
      if (onSuccess) await onSuccess();
      else navigate("/proveedores");
    } catch (err: any) {
      console.error("Server error:", err?.response?.status, err?.response?.data);
      alert(err?.response?.data?.message || "Error al guardar el proveedor");
    }
  };

  const submitting = creating || updating;

  return (
    <form className="foraria-form" onSubmit={handleSubmit}>
      <h2 className="foraria-form-title">
        {isEdit ? "Editar Proveedor" : "Nuevo Proveedor"}
      </h2>

      <div className="foraria-form-group container-items">
        <TextField
          fullWidth
          name="commercialName"
          label="Nombre Comercial"
          value={form.commercialName}
          onChange={handleChange}
          onBlur={(e) => validateField("commercialName", e.target.value)}
          error={!!errors.commercialName}
          helperText={errors.commercialName}
          required
        />
        <TextField
          fullWidth
          name="businessName"
          label="Razón Social"
          value={form.businessName}
          onChange={handleChange}
          onBlur={(e) => validateField("businessName", e.target.value)}
          error={!!errors.businessName}
          helperText={errors.businessName}
          required
        />
      </div>

      <div className="foraria-form-group container-items">
        <TextField
          fullWidth
          name="cuit"
          label="CUIT (11 dígitos, sin guiones)"
          value={form.cuit}
          onChange={handleChange}
          onBlur={(e) => validateField("cuit", e.target.value)}
          error={!!errors.cuit}
          helperText={errors.cuit || `${digitsCUIT.length}/11 dígitos`}
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 14 }}
          required
        />
        <TextField
          select
          fullWidth
          name="supplierCategory"
          label="Categoría"
          value={form.supplierCategory}
          onChange={handleChange}
          onBlur={(e) => validateField("supplierCategory", e.target.value)}
          error={!!errors.supplierCategory}
          helperText={errors.supplierCategory}
          required
        >
          <MenuItem value="Mantenimiento">Mantenimiento</MenuItem>
          <MenuItem value="Limpieza">Limpieza</MenuItem>
          <MenuItem value="Seguridad">Seguridad</MenuItem>
          <MenuItem value="Jardinería">Jardinería</MenuItem>
        </TextField>
      </div>

      <div className="foraria-form-group container-items">
        <TextField
          fullWidth
          name="phone"
          label="Teléfono"
          value={form.phone}
          onChange={handleChange}
          inputProps={{ inputMode: "tel" }}
        />
        <TextField
          fullWidth
          name="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          onBlur={(e) => validateField("email", e.target.value)}
          error={!!errors.email}
          helperText={errors.email}
        />
      </div>

      <TextField
        fullWidth
        name="address"
        label="Dirección"
        value={form.address}
        onChange={handleChange}
      />

      <TextField
        fullWidth
        name="contactPerson"
        label="Persona de Contacto"
        value={form.contactPerson}
        onChange={handleChange}
      />

      <TextField
        fullWidth
        multiline
        minRows={3}
        name="observations"
        label="Observaciones"
        value={form.observations}
        onChange={handleChange}
      />

      <div className="foraria-form-actions">
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          disabled={submitting || formHasErrors}
        >
          {isEdit ? "Guardar cambios" : "Crear proveedor"}
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => (onSuccess ? onSuccess() : navigate("/proveedores"))}
          disabled={submitting}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
