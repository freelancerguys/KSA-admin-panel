import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { resolveApiUrl, resolveUploadsUrl } from './resolveApiUrl';

const API_URL = resolveApiUrl();

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  config.headers['X-Portal'] = 'admin';

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
    const { refreshToken } = useAuthStore.getState();
    if (!refreshToken) {
      return Promise.reject(new Error('No refresh token'));
    }
    refreshPromise = api
      .post('/auth/refresh', { refreshToken }, { skipAuthRefresh: true })
      .then(({ data }) => {
        const { accessToken, refreshToken: newRefresh } = data.data;
        useAuthStore.getState().setTokens(accessToken, newRefresh);
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && original && !original._retry && !original.skipAuthRefresh) {
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
    return Promise.reject(error);
  }
);

export const uploadsUrl = resolveUploadsUrl();
export const getUploadUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const clean = String(path).replace(/^\/+/, '');
  return `${uploadsUrl}/${clean}`;
};
