import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Нормализуем baseURL: удаляем завершающий слеш, чтобы пути вида /api/v1/... никогда не приводили к double-slash (//)
const rawBaseURL = import.meta.env.VITE_API_URL || '';
const baseURL = rawBaseURL.replace(/\/+$/, '');

const api = axios.create({
  baseURL,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Гарантируем Django APPEND_SLASH совместимость:
    // если URL не оканчивается на '/', не содержит '?' и не является статическим файлом, добавляем слеш.
    // Это исключает 301 Redirect со стороны Django, который ломает CORS в браузерах.
    if (config.url && !config.url.endsWith('/') && !config.url.includes('?') && !config.url.includes('.')) {
      config.url = `${config.url}/`;
    }

    if (config.headers) {
      config.headers['ngrok-skip-browser-warning'] = 'true';
    }

    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Если 401 и мы ещё не пытались обновить токен
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const refreshUrl = baseURL ? `${baseURL}/api/token/refresh/` : '/api/token/refresh/';
        // Обязательно передаем ngrok-skip-browser-warning и Content-Type, иначе ngrok отдаст HTML-заглушку без CORS
        const response = await axios.post(
          refreshUrl,
          { refresh: refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true',
            },
          }
        );

        const newAccessToken = response.data.access;
        const newRefreshToken = response.data.refresh || refreshToken;

        useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
