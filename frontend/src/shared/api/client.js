

import axios from 'axios';

const BASE_URL = '/api/v1';

export const apiPublic = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

const apiProtected = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

apiProtected.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiProtected.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    if (
    error?.response?.status === 401 &&
    originalRequest?.url !== '/auth/refresh' &&
    !originalRequest._retry)
    {
      originalRequest._retry = true;
      try {
        console.log('[Interceptor] Перехвачена ошибка 401. Пытаемся обновить токен...');
        const csrfCookie = document.cookie.
        split(';').
        map((c) => c.trim()).
        find((c) => c.startsWith('csrf_token='));
        const csrfToken = csrfCookie ? decodeURIComponent(csrfCookie.split('=')[1]) : null;

        if (!csrfToken) {
          console.error('[Interceptor] Не найден CSRF-токен для обновления. Выход из системы.');
          setAccessToken(null);
          return Promise.reject(error);
        }

        const { data } = await apiPublic.post(
          '/auth/refresh',
          {},
          {
            headers: { 'X-CSRF-Token': csrfToken },
            withCredentials: true
          }
        );

        const newAccessToken = data?.access_token;
        if (newAccessToken) {
          console.log('[Interceptor] Токен успешно обновлен. Повторяем исходный запрос.');
          setAccessToken(newAccessToken);
          originalRequest.headers = {
            ...(originalRequest.headers || {}),
            Authorization: `Bearer ${newAccessToken}`
          };
          return apiProtected(originalRequest);
        }
      } catch (refreshError) {

        console.error('[Interceptor] КРИТИЧЕСКАЯ ОШИБКА: Не удалось обновить токен. Выход из системы.', refreshError);
        setAccessToken(null);
      }
    }
    return Promise.reject(error);
  }
);

export default apiProtected;