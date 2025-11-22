import { messaging } from "../firebase";
import { getToken } from "firebase/messaging";
import { api } from "../api/axios";
export async function registerFirebaseToken() {
  try {
    const token = await getToken(messaging, {
      vapidKey: "BDAT3p1I04DFBp8414IcCeDz66GIYTaMxK4qu_1bOKQdKWVcsKdY2AOTyGnpG30KBNhlWliwMkV9ozr7W55u42U",
    });

    if (!token) {
      console.warn("No se pudo obtener el token Firebase");
      return;
    }
    
    localStorage.setItem("fcmToken", token);
    console.log("TOKEN REAL:", token);

    await api.post("/Notification/register-token", { token });

    console.log("Token registrado:", token);
    

  } catch (err) {
    console.error("Error obteniendo token Firebase:", err);
  }
}
