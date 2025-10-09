// src/pages/NewSupplier.tsx
import { useState, type FormEvent } from "react";
import { TextField, Button, MenuItem } from "@mui/material";
import "../styles/spent.css";

export default function NewSupplier() {
  const [commercialName, setCommercialName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [cuit, setCuit] = useState("");
  const [category, setCategory] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Acá iría el POST a tu API
    console.log({
      commercialName,
      businessName,
      cuit,
      category,
      phone,
      email,
      address,
      contactPerson,
      notes,
    });
  };

  return (
    <form className="foraria-form" onSubmit={handleSubmit}>
      <h2 className="foraria-form-title">Nuevo Proveedor</h2>

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
        <Button type="submit" className="foraria-gradient-button boton-crear-reclamo">
          Crear Proveedor
        </Button>
        <Button className="foraria-outlined-white-button">Cancelar</Button>
      </div>
    </form>
  );
}
