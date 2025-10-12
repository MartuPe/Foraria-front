import { useEffect, useState, type FormEvent } from "react";
import { TextField, Button, MenuItem } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useGet } from "../hooks/useGet";
import { useMutation } from "../hooks/useMutation";
import "../styles/spent.css";

type SupplierPayload = {
  commercialName: string;
  businessName: string;
  cuit: string;
  category: string;
  phone: string;
  email: string;
  address: string;
  contactPerson: string;
  notes: string;
  active?: boolean; // por si API lo usa
};

export default function NewSupplier() {
  const navigate = useNavigate();
  const { id } = useParams();                 // si existe => modo edición
  const isEdit = Boolean(id);

  // Estado del formulario
  const [commercialName, setCommercialName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [cuit, setCuit] = useState("");
  const [category, setCategory] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [notes, setNotes] = useState("");

  // Cargar datos si es edición
  const { data: existing, loading: loadingDetail } = useGet<SupplierPayload>(
    isEdit ? `/providers/${id}` : "",
    { enabled: isEdit }
  );

  useEffect(() => {
    if (!existing) return;
    setCommercialName(existing.commercialName ?? "");
    setBusinessName(existing.businessName ?? "");
    setCuit(existing.cuit ?? "");
    setCategory(existing.category ?? "");
    setPhone(existing.phone ?? "");
    setEmail(existing.email ?? "");
    setAddress(existing.address ?? "");
    setContactPerson(existing.contactPerson ?? "");
    setNotes(existing.notes ?? "");
  }, [existing]);

  // Mutaciones
  const { mutate: createSupplier, loading: creating, error: createErr } =
    useMutation<any, SupplierPayload>("/providers", "post");

  const { mutate: updateSupplier, loading: updating, error: updateErr } =
    useMutation<any, Partial<SupplierPayload>>(`/providers/${id}`, "put");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload: SupplierPayload = {
      commercialName,
      businessName,
      cuit,
      category,
      phone,
      email,
      address,
      contactPerson,
      notes,
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
      navigate("/proveedores"); // volvemos al listado
    } catch (err) {
      // el hook ya setea error; acá podés disparar toast si usás uno
      console.error(err);
    }
  };

  const submitting = creating || updating || loadingDetail;

  return (
    <form className="foraria-form" onSubmit={handleSubmit}>
      <h2 className="foraria-form-title">
        {isEdit ? "Editar Proveedor" : "Nuevo Proveedor"}
      </h2>

      <div className="foraria-form-group container-items">
        <div className="foraria-form-group group-size">
          <label className="foraria-form-label">Nombre Comercial</label>
          <TextField
            fullWidth
            placeholder="Ej: Ferretería El Tornillo"
            variant="outlined"
            className="foraria-form-input"
            value={commercialName}
            onChange={(e) => setCommercialName(e.target.value)}
            required
          />
        </div>

        <div className="foraria-form-group group-size">
          <label className="foraria-form-label">Razón Social</label>
          <TextField
            fullWidth
            placeholder="Ej: Juan Perez SRL"
            variant="outlined"
            className="foraria-form-input"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="foraria-form-group container-items">
        <div className="foraria-form-group group-size">
          <label className="foraria-form-label">CUIT</label>
          <TextField
            fullWidth
            placeholder="20-12345678-9"
            variant="outlined"
            className="foraria-form-input"
            value={cuit}
            onChange={(e) => setCuit(e.target.value)}
            required
          />
        </div>

        <div className="foraria-form-group group-size">
          <label className="foraria-form-label">Categoría</label>
          <TextField
            select
            fullWidth
            className="foraria-form-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <MenuItem value="Mantenimiento">Mantenimiento</MenuItem>
            <MenuItem value="Limpieza">Limpieza</MenuItem>
            <MenuItem value="Seguridad">Seguridad</MenuItem>
            <MenuItem value="Jardinería">Jardinería</MenuItem>
          </TextField>
        </div>
      </div>

      <div className="foraria-form-group container-items">
        <div className="foraria-form-group group-size">
          <label className="foraria-form-label">Teléfono</label>
          <TextField
            fullWidth
            placeholder="+54 11 3412-3456"
            variant="outlined"
            className="foraria-form-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="foraria-form-group group-size">
          <label className="foraria-form-label">Mail</label>
          <TextField
            fullWidth
            type="email"
            placeholder="contacto@proveedor.com"
            variant="outlined"
            className="foraria-form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="foraria-form-group">
        <label className="foraria-form-label">Dirección</label>
        <TextField
          fullWidth
          placeholder="Av. Siempre Viva 1234"
          variant="outlined"
          className="foraria-form-input"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      <div className="foraria-form-group">
        <label className="foraria-form-label">Persona de Contacto</label>
        <TextField
          fullWidth
          placeholder="Juan Pérez"
          variant="outlined"
          className="foraria-form-input"
          value={contactPerson}
          onChange={(e) => setContactPerson(e.target.value)}
        />
      </div>

      <div className="foraria-form-group">
        <label className="foraria-form-label">Observación</label>
        <TextField
          fullWidth
          multiline
          minRows={4}
          placeholder="Notas adicionales"
          className="foraria-form-textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="foraria-form-actions">
        <Button
          type="submit"
          className="foraria-gradient-button boton-crear-reclamo"
          disabled={submitting}
        >
          {isEdit ? "Guardar cambios" : "Crear Proveedor"}
        </Button>
        <Button
          className="foraria-outlined-white-button"
          onClick={() => navigate("/proveedores")}
          disabled={submitting}
        >
          Cancelar
        </Button>
      </div>

      {(createErr || updateErr) && (
        <p style={{ color: "crimson", marginTop: 8 }}>
          Error: {(createErr || updateErr) as string}
        </p>
      )}
    </form>
  );
}
