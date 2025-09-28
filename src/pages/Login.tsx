import { useState } from "react";
import { LoginForm } from "../components/forms/LoginForm";
import { RecoveryForm } from "../components/forms/RecoveryForm";
import { UpdateForm } from "../components/forms/UpdateForm";
import { authService } from "../services/authService";

export function Login() {
  const [isRecoveryMode, setRecoveryMode] = useState(false);
  const [isUpdateMode, setUpdateMode] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [updateData, setUpdateData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    foto: "",
    nuevaPassword: "",
  });

  const [errors, setErrors] = useState<any>({});

  // login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await authService.login(username, password);
    setLoading(false);
    alert("Login exitoso ✅");
  };

  // recovery handler
  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await authService.recoverPassword(recoveryEmail);
    setLoading(false);
    alert("Email enviado ✅");
    setRecoveryMode(false);
  };

  // update handler
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await authService.updateUser(updateData);
    setLoading(false);
    alert("Datos actualizados ✅");
    setUpdateMode(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow rounded p-6 w-full max-w-md">
        {!isRecoveryMode && !isUpdateMode && (
          <LoginForm
            username={username}
            password={password}
            errors={errors}
            isLoading={isLoading}
            onSubmit={handleLogin}
            onAdminLogin={() => alert("Login admin")}
            onConsejoLogin={() => alert("Login consejo")}
            onRecovery={() => setRecoveryMode(true)}
          />
        )}

        {isRecoveryMode && (
          <RecoveryForm
            recoveryEmail={recoveryEmail}
            setRecoveryEmail={setRecoveryEmail}
            errors={errors}
            isLoading={isLoading}
            onSubmit={handleRecovery}
            onBack={() => setRecoveryMode(false)}
          />
        )}

        {isUpdateMode && (
          <UpdateForm
            updateData={updateData}
            setUpdateData={setUpdateData}
            isLoading={isLoading}
            onSubmit={handleUpdate}
            onBack={() => setUpdateMode(false)}
          />
        )}
      </div>
    </div>
  );
}