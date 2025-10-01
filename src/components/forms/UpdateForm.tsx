import { Button } from "@mui/material";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";

interface UpdateFormProps {
  updateData: {
    nombre: string;
    apellido: string;
    dni: string;
    foto: string;
    nuevaPassword: string;
  };
  setUpdateData: (d: any) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export function UpdateForm({
  updateData,
  setUpdateData,
  isLoading,
  onSubmit,
  onBack,
}: UpdateFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          id="nombre"
          value={updateData.nombre}
          onChange={(e) =>
            setUpdateData({ ...updateData, nombre: e.target.value })
          }
          className="foraria-input"
        />
      </div>
      <div>
        <Label htmlFor="apellido">Apellido</Label>
        <Input
          id="apellido"
          value={updateData.apellido}
          onChange={(e) =>
            setUpdateData({ ...updateData, apellido: e.target.value })
          }
          className="foraria-input"
        />
      </div>
      <div>
        <Label htmlFor="dni">DNI</Label>
        <Input
          id="dni"
          value={updateData.dni}
          onChange={(e) =>
            setUpdateData({ ...updateData, dni: e.target.value })
          }
          className="foraria-input"
        />
      </div>
      <div>
        <Label htmlFor="foto">Foto URL</Label>
        <Input
          id="foto"
          value={updateData.foto}
          onChange={(e) =>
            setUpdateData({ ...updateData, foto: e.target.value })
          }
          className="foraria-input"
        />
      </div>
      <div>
        <Label htmlFor="nuevaPassword">Nueva contraseña</Label>
        <Input
          id="nuevaPassword"
          type="password"
          value={updateData.nuevaPassword}
          onChange={(e) =>
            setUpdateData({ ...updateData, nuevaPassword: e.target.value })
          }
          className="foraria-input"
        />
      </div>
      <Button type="submit" variant="contained" disabled={isLoading} fullWidth>
        {isLoading ? "Actualizando..." : "Actualizar"}
      </Button>
      <Button type="button" variant="outlined" onClick={onBack} fullWidth>
        Volver
      </Button>
    </form>
  );
}