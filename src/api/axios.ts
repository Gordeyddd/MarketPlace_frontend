import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// URL бэкенда по умолчанию.
// Если в Vercel для Production окружения не была прописана VITE_API_URL,
// приложение автоматически обращается напрямую к реальному бэкенду ngrok,
// предотвращая ошибки пустого baseURL и сбои Vercel rewrites.
const DEFAULT_BACKEND_URL = 'https://stubborn-utilize-stunning.ngrok-free.dev';
const rawBaseURL = import.meta.env.VITE_API_URL || DEFAULT_BACKEND_URL;
export const baseURL = rawBaseURL.replace(/\/+$/, '');

const api = axios.create({
  baseURL,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Гарантируем Django APPEND_SLASH совместимость:
    // если URL не оканчивается на '/', не содержит '?' и не является файлом со схемой, добавляем слеш.
    // Это предотвращает 301 Redirect со стороны Django, который сбрасывает CORS в браузерах.
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

    // Обработка 401 Unauthorized (например, истекший или невалидный токен в localStorage)
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              if (token) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              } else {
                delete originalRequest.headers.Authorization;
              }
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;

      // Если refresh token отсутствует (например, устаревший сеанс или мусорный токен)
      if (!refreshToken) {
        useAuthStore.getState().logout();
        isRefreshing = false;

        // Для GET запросов (публичный просмотр каталога, категорий, услуг)
        // повторяем запрос как гость без невалидного заголовка Authorization.
        // Это предотвращает падение главной страницы в ошибку при устаревших токенах в браузере.
        if (originalRequest.method?.toLowerCase() === 'get' && originalRequest.headers) {
          delete originalRequest.headers.Authorization;
          return api(originalRequest);
        }
        return Promise.reject(error);
      }

      try {
        const refreshUrl = `${baseURL}/api/token/refresh/`;
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

        // Если refresh token отклонен (истек), очищаем сессию и пробуем загрузить GET-запрос публично
        if (originalRequest.method?.toLowerCase() === 'get' && originalRequest.headers) {
          delete originalRequest.headers.Authorization;
          return api(originalRequest);
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
