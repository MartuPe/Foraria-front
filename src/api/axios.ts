// src/api/axios.ts
import axios from "axios";

const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5205/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
});



// Interceptor para agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Acá podés centralizar manejo de 401, 403, 500, etc.
    console.error("API error:", error);
    return Promise.reject(error);
  }
);
