import { useState } from "react";
import { LoginForm } from "../components/forms/LoginForm";
import { RecoveryForm } from "../components/forms/RecoveryForm";
import { UpdateForm } from "../components/forms/UpdateForm";
import { authService } from "../services/authService";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import "../styles/index.css";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md bg-[rgba(44,62,80,0.85)] shadow-2xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white text-center text-2xl font-bold">
            {!isRecoveryMode && !isUpdateMode
              ? "Iniciar Sesión"
              : isRecoveryMode
              ? "Recuperar Contraseña"
              : "Actualizar Datos"}
          </CardTitle>
          <CardDescription className="text-white/80 text-sm text-center px-4">
            {!isRecoveryMode && !isUpdateMode
              ? "Ingresa tus credenciales para acceder a tu cuenta"
              : isRecoveryMode
              ? "Ingresa tu email y te enviaremos un enlace para recuperar tu contraseña"
              : "Actualiza tus datos personales para continuar"}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4 px-6">
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
        </CardContent>
      </Card>
    </div>
  );
}