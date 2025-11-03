import axios from 'axios';

// CORREGIR: Usar HTTPS y puerto 7245
const BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:7245';

console.log('🔗 Backend URL desde .env:', process.env.REACT_APP_API_URL);
console.log('🔗 BASE_URL final:', BASE_URL);

// Crear instancia de Axios
export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    console.log('📡 Haciendo petición a:', config.url);
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Respuesta exitosa:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ Error en la petición:', error);
    
    // Si es error CORS o de red, mostrar mensaje específico
    if (!error.response) {
      console.error('💥 Error de red/CORS:', error.message);
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
