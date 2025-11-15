import { FormEvent, useEffect, useState } from "react";
import { useMutation } from "../../hooks/useMutation";
import { useGet } from "../../hooks/useGet";
import { Provider } from "../../models/Provider";

type Props = { id?: number }; // si hay id => edición, si no => alta

export default function ProviderForm({ id }: Props) {
  const isEdit = !!id;

  const { data: existing } = useGet<Provider>(isEdit ? `/providers/${id}` : "", { enabled: isEdit });
  const { mutate: create, loading: creating, error: createErr } = useMutation<Provider, Partial<Provider>>("/providers", "post");
  const { mutate: update, loading: updating, error: updateErr } = useMutation<Provider, Partial<Provider>>(`/providers/${id}`, "put");

  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setEmail(existing.email);
      setActive(existing.active);
    }
  }, [existing]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      await update({ name, email, active });
      alert("Proveedor actualizado");
    } else {
      await create({ name, email, active: true });
      setName(""); setEmail(""); setActive(true);
      alert("Proveedor creado");
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 420, padding: 16 }}>
      <h3>{isEdit ? "Editar proveedor" : "Nuevo proveedor"}</h3>

      <label>
        Nombre
        <input value={name} onChange={(e)=>setName(e.target.value)} required />
      </label>

      <label>
        Email
        <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
      </label>

      {isEdit && (
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" checked={active} onChange={(e)=>setActive(e.target.checked)} />
          Activo
        </label>
      )}

      <button type="submit" disabled={creating || updating}>
        {isEdit ? "Guardar cambios" : "Crear"}
      </button>

      {(createErr || updateErr) && <p style={{ color: "crimson" }}>Error: {createErr || updateErr}</p>}
    </form>
  );
}
