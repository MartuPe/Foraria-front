import { useMemo, useState } from "react";
import { useGet } from "../../hooks/useGet";
import { useMutation } from "../../hooks/useMutation";
import { Provider } from "../../models/Provider";

export default function ProvidersList() {
  const [q, setQ] = useState("");
  const { data, loading, error, refetch, setData } = useGet<Provider[]>("/providers", { params: { q } });
  const { mutate: toggleActive, loading: saving } = useMutation<Provider, Partial<Provider>>("/providers/toggle", "patch");

  const providers = useMemo(() => data ?? [], [data]);

  const onToggle = async (p: Provider) => {
    const updated = await toggleActive({ id: p.id, active: !p.active });
    // Optimistic UI simple
    setData((prev) =>
      (prev ?? []).map(x => x.id === p.id ? { ...x, active: (updated as Provider).active } : x) as any
    );
  };

  if (loading) return <p>Cargando…</p>;
  if (error)   return <p>Error: {error}</p>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Proveedores</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Buscar por nombre o email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button onClick={refetch} disabled={loading}>Buscar</button>
      </div>

      {providers.length === 0 ? (
        <p>No hay proveedores.</p>
      ) : (
        <table cellPadding={8} style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Nombre</th>
              <th align="left">Email</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {providers.map(p => (
              <tr key={p.id} style={{ borderTop: "1px solid #eee" }}>
                <td>{p.name}</td>
                <td>{p.email}</td>
                <td align="center">{p.active ? "✅" : "⛔"}</td>
                <td align="center">
                  <button onClick={() => onToggle(p)} disabled={saving}>
                    {p.active ? "Desactivar" : "Activar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
