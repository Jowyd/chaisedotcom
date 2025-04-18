import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { authService } from '@/services/AuthService';
import router from '@/router';
import config from '@/config';

const API_URL = config.API_URL;

const httpHelper = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpHelper.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['Content-Type'] = 'application/json';
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

    if (error.response?.status === 401 && !originalRequest.headers['X-Retry-After-Refresh']) {
      try {
        const newAccessToken = await authService.refreshAccessToken();

        originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
        originalRequest.headers.set('X-Retry-After-Refresh', 'true');

        return httpHelper(originalRequest);
      } catch (refreshError) {
        authService.logout();
        router.push('/login');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default httpHelper;
