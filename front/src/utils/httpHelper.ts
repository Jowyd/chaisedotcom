import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { authService } from '@/services/AuthService';
import router from '@/router';

const httpHelper = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/',
  headers: {
    'Content-Type': 'application/json',
  },
});

httpHelper.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

httpHelper.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Si l'erreur est 401 et que ce n'est pas déjà une tentative de refresh
    if (error.response?.status === 401 && !originalRequest.headers['X-Retry-After-Refresh']) {
      try {
        // Tente de rafraîchir le token
        const newAccessToken = await authService.refreshAccessToken();

        // Ajoute le nouveau token à la requête originale
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers['X-Retry-After-Refresh'] = 'true';

        // Réessaie la requête originale
        return httpHelper(originalRequest);
      } catch (refreshError) {
        // Si le refresh échoue, déconnecte l'utilisateur
        authService.logout();
        router.push('/login');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default httpHelper;
