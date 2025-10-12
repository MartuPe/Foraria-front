import axios from "axios";

const getBaseUrl = () =>
  // Soporta Vite y CRA
  (import.meta as any)?.env?.VITE_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000";

export const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Centraliza 401/403/500, refresh token, toasts, etc.
    return Promise.reject(err);
  }
);
