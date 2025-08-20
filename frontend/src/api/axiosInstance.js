import axios from 'axios';

const BASE_URL = 'https://backend-auto-spare-parts.fly.dev/api/v1';

export const apiPublic = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

let accessToken = null;

export const setAccessToken = (token) => {
    accessToken = token;
};

export const getAccessToken = () => accessToken;

const apiProtected = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
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
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            try {
                const csrfCookie = document.cookie
                    .split(';')
                    .map((c) => c.trim())
                    .find((c) => c.startsWith('csrf_token='));
                const csrfToken = csrfCookie ? decodeURIComponent(csrfCookie.split('=')[1]) : null;

                const { data } = await apiPublic.post(
                    '/auth/refresh',
                    {},
                    {
                        headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : {},
                        withCredentials: true,
                    }
                );

                const newAccessToken = data?.access_token;
                if (newAccessToken) {
                    setAccessToken(newAccessToken);
                    originalRequest.headers = {
                        ...(originalRequest.headers || {}),
                        Authorization: `Bearer ${newAccessToken}`,
                    };
                    return apiProtected(originalRequest);
                }
            } catch {
                setAccessToken(null);
            }
        }
        return Promise.reject(error);
    }
);

export default apiProtected;