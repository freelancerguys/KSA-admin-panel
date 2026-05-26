import { api } from './client';

let csrfToken = '';
let csrfPromise = null;

export const fetchCsrfToken = async () => {
  if (csrfToken) return csrfToken;
  if (csrfPromise) return csrfPromise;

  csrfPromise = api
    .get('/auth/csrf-token')
    .then(({ data }) => {
      csrfToken = data.data.csrfToken;
      return csrfToken;
    })
    .finally(() => {
      csrfPromise = null;
    });

  return csrfPromise;
};

export const getCsrfToken = () => csrfToken;

export const clearCsrfToken = () => {
  csrfToken = '';
  csrfPromise = null;
};

export const attachCsrfHeader = (config) => {
  if (csrfToken) {
    config.headers = config.headers || {};
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
};

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const needsCsrf = (method = 'GET') => MUTATING_METHODS.has(String(method).toUpperCase());
