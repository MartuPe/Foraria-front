
import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosHeaders } from "axios";


const baseURL = process.env.REACT_APP_API_URL || "https://localhost:7245/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
});



// Interceptor para agregar token automáticamente
/*api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `bearer ${token}`; 
  }
  return config;
});*/

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  if (!config.headers) {
    config.headers = new AxiosHeaders();
  } else if (!(config.headers instanceof AxiosHeaders)) {
    config.headers = new AxiosHeaders(config.headers as any);
  }
  if (token) {
    (config.headers as AxiosHeaders).set("Authorization", `bearer ${token}`);
  }
  return config;
});

let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  pendingRequests.forEach((cb) => cb(token));
  pendingRequests = [];
}

// Interceptor para manejar errores globales
/*api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Acá podés centralizar manejo de 401, 403, 500, etc.
    console.error("API error:", error);
    return Promise.reject(error);
  }
);*/

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        // sin refresh: logout
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/iniciarSesion";
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const { data } = await axios.post(`${baseURL}/user/refresh`, {
            refreshToken,
          });
          const newAccess = data.accessToken ?? data.AccessToken ?? data.token; // tolerante a nombres
          const newRefresh = data.refreshToken ?? data.RefreshToken;

          if (newAccess) localStorage.setItem("accessToken", newAccess);
          if (newRefresh) localStorage.setItem("refreshToken", newRefresh);

          isRefreshing = false;
          onRefreshed(newAccess);

          original.headers = original.headers || {};
          (original.headers as any).Authorization = `bearer ${newAccess}`;
          return api(original);
        } catch (e) {
          isRefreshing = false;
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/iniciarSesion";
          return Promise.reject(e);
        }
      }

      // mientras refresca
      return new Promise((resolve) => {
        pendingRequests.push((token: string) => {
          original.headers = original.headers || {};
          (original.headers as any).Authorization = `bearer ${token}`;
          resolve(api(original));
        });
      });
    }

    return Promise.reject(error);
  }
);