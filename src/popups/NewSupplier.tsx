import { useEffect, useState, FormEvent } from "react";
import { TextField, Button, MenuItem } from "@mui/material";
import { useGet } from "../hooks/useGet";
import { useMutation } from "../hooks/useMutation";

type SupplierPayload = {
  commercialName: string;
  businessName: string;
  cuit: string;
  supplierCategory: string;
  phone: string;
  email: string;
  address: string;
  contactPerson: string;
  observations: string;
  active?: boolean;
};

type Props = {
  id?: number;
  onSuccess?: () => void | Promise<void>;
};

export default function NewSupplier({ id, onSuccess }: Props) {
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

  const { data: existing } = useGet<SupplierPayload>(
    isEdit ? `/Supplier/${id}` : "",
    { enabled: isEdit }
  );

  useEffect(() => {
    if (existing) setForm(existing);
  }, [existing]);

  const { mutate: create, loading: creating } =
    useMutation("/Supplier", "post");
  const { mutate: update, loading: updating } =
    useMutation(`/Supplier/${id}`, "put");

  const handleChange = (field: keyof SupplierPayload) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit) await update(form);
      else await create({ ...form, active: true });
      if (onSuccess) await onSuccess();
    } catch (err) {
      console.error("Error al guardar proveedor", err);
    }
  };

  const submitting = creating || updating;

  return (
    <form className="foraria-form" onSubmit={handleSubmit}>
      <h2>{isEdit ? "Editar Proveedor" : "Nuevo Proveedor"}</h2>

      <div className="foraria-form-group container-items">
        <TextField fullWidth label="Nombre Comercial" value={form.commercialName} onChange={handleChange("commercialName")} required />
        <TextField fullWidth label="Razón Social" value={form.businessName} onChange={handleChange("businessName")} required />
      </div>

      <div className="foraria-form-group container-items">
        <TextField fullWidth label="CUIT (11 dígitos, sin guiones)" value={form.cuit} onChange={handleChange("cuit")} required inputProps={{ pattern: "\\d{11}" }} />
        <TextField select fullWidth label="Categoría" value={form.supplierCategory} onChange={handleChange("supplierCategory")} required>
          <MenuItem value="Mantenimiento">Mantenimiento</MenuItem>
          <MenuItem value="Limpieza">Limpieza</MenuItem>
          <MenuItem value="Seguridad">Seguridad</MenuItem>
          <MenuItem value="Jardinería">Jardinería</MenuItem>
        </TextField>
      </div>

      <div className="foraria-form-group container-items">
        <TextField fullWidth label="Teléfono" value={form.phone} onChange={handleChange("phone")} />
        <TextField fullWidth label="Email" type="email" value={form.email} onChange={handleChange("email")} />
      </div>

      <TextField fullWidth label="Dirección" value={form.address} onChange={handleChange("address")} sx={{ my: 1 }} />
      <TextField fullWidth label="Persona de Contacto" value={form.contactPerson} onChange={handleChange("contactPerson")} sx={{ my: 1 }} />
      <TextField fullWidth label="Observaciones" multiline minRows={3} value={form.observations} onChange={handleChange("observations")} />

      <div className="foraria-form-actions">
        <Button type="submit" variant="contained" color="secondary" disabled={submitting}>
          {isEdit ? "Guardar cambios" : "Crear proveedor"}
        </Button>
        <Button variant="outlined" onClick={onSuccess as any}>Cancelar</Button>
      </div>
    </form>
  );
}
