// src/services/api.ts (o donde lo tengas)

import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosHeaders,
} from "axios";

const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5205/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
});

// ==== Interceptor REQUEST: agrega Authorization si hay accessToken ====

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  if (!config.headers) {
    config.headers = new AxiosHeaders();
  } else if (!(config.headers instanceof AxiosHeaders)) {
    config.headers = new AxiosHeaders(config.headers as any);
  }

  if (token) {
    (config.headers as AxiosHeaders).set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  return config;
});

// ==== Interceptor RESPONSE: refresco de token en 401 ====

let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  pendingRequests.forEach((cb) => cb(token));
  pendingRequests = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
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

          const newAccess =
            data.accessToken ?? data.AccessToken ?? data.token;
          const newRefresh = data.refreshToken ?? data.RefreshToken;

          if (newAccess) localStorage.setItem("accessToken", newAccess);
          if (newRefresh) localStorage.setItem("refreshToken", newRefresh);

          isRefreshing = false;
          onRefreshed(newAccess);

          original.headers = original.headers || {};
          (original.headers as any).Authorization = `Bearer ${newAccess}`;
          return api(original);
        } catch (e) {
          isRefreshing = false;
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/iniciarSesion";
          return Promise.reject(e);
        }
      }

      // mientras se refresca el token
      return new Promise((resolve) => {
        pendingRequests.push((token: string) => {
          original.headers = original.headers || {};
          (original.headers as any).Authorization = `Bearer ${token}`;
          resolve(api(original));
        });
      });
    }

    return Promise.reject(error);
  }
);
