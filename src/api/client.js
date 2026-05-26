import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { attachCsrfHeader, fetchCsrfToken, needsCsrf } from './security';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  config.headers = config.headers || {};
  config.headers['X-Portal'] = 'admin';

  const method = (config.method || 'get').toUpperCase();

  if (needsCsrf(method) && !config.url?.includes('/auth/csrf-token')) {
    if (!attachCsrfHeader(config).headers['X-CSRF-Token']) {
      await fetchCsrfToken();
      attachCsrfHeader(config);
    }
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

let sessionExpiredHandled = false;
let refreshPromise = null;

const refreshSession = () => {
  if (!refreshPromise) {
    refreshPromise = api.post('/auth/refresh').finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      try {
        await refreshSession();
        return api(original);
      } catch {
        if (!sessionExpiredHandled) {
          sessionExpiredHandled = true;
          useAuthStore.getState().logout();
          window.dispatchEvent(new CustomEvent('ksa:session-expired'));
        }
      }
    }
    if (
      error.response?.status === 403
      && error.response?.data?.message?.includes('CSRF')
      && original
      && !original._csrfRetry
    ) {
      original._csrfRetry = true;
      const { fetchCsrfToken: refreshCsrf, clearCsrfToken } = await import('./security');
      clearCsrfToken();
      await refreshCsrf();
      attachCsrfHeader(original);
      return api(original);
    }
    return Promise.reject(error);
  }
);

export const uploadsUrl = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:5000/uploads';
export const getUploadUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${uploadsUrl}/${path}`;
};
