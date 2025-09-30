import { Button } from "@mui/material";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";

interface RecoveryFormProps {
  recoveryEmail: string;
  setRecoveryEmail: (v: string) => void;
  errors: { recoveryEmail?: string };
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export function RecoveryForm({
  recoveryEmail,
  setRecoveryEmail,
  errors,
  isLoading,
  onSubmit,
  onBack,
}: RecoveryFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={recoveryEmail}
          onChange={(e) => setRecoveryEmail(e.target.value)}
          className="foraria-input"
        />
        {errors.recoveryEmail && (
          <p className="text-red-500 text-sm">{errors.recoveryEmail}</p>
        )}
      </div>
      <Button type="submit" variant="contained" disabled={isLoading} fullWidth>
        {isLoading ? "Enviando..." : "Recuperar contraseña"}
      </Button>
      <Button type="button" variant="outlined" onClick={onBack} fullWidth>
        Volver
      </Button>
    </form>
  );
}