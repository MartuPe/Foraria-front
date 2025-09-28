import { Button } from "../ui/Button"; 
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";

interface LoginFormProps {
  username: string;
  password: string;
  errors: { username?: string; password?: string };
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onAdminLogin: () => void;
  onConsejoLogin: () => void;
  onRecovery: () => void;
}

export function LoginForm({
  username,
  password,
  errors,
  isLoading,
  onSubmit,
  onAdminLogin,
  onConsejoLogin,
  onRecovery,
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="username">Usuario</Label>
        <Input id="username" name="username" defaultValue={username} className="foraria-input" />
        {errors.username && (
          <p className="text-red-500 text-sm">{errors.username}</p>
        )}
      </div>
      <div>
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" type="password" defaultValue={password} className="foraria-input" />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password}</p>
        )}
      </div>
      <Button type="submit" variant="foraria" disabled={isLoading}>
        {isLoading ? "Cargando..." : "Ingresar"}
      </Button>
      <div className="flex justify-between text-sm">
        <button type="button" onClick={onAdminLogin} className="text-blue-500">
          Login Admin
        </button>
        <button type="button" onClick={onConsejoLogin} className="text-blue-500">
          Login Consejo
        </button>
        <button type="button" onClick={onRecovery} className="text-blue-500">
          Recuperar contraseña
        </button>
      </div>
    </form>
  );
}