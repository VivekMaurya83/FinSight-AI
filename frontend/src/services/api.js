import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('finsight_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('finsight_token');
      localStorage.removeItem('finsight_user');
      localStorage.removeItem('finsight_active_conv');
      
      const currentPath = window.location.pathname;
      const isPublicPath = currentPath === '/login' || currentPath === '/signup' || currentPath === '/';
      const isAuthEndpoint = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/signup') || error.config?.url?.includes('/auth/register');
      
      if (!isPublicPath && !isAuthEndpoint) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
