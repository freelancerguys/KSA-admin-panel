/**
 * Admin panel API base URL.
 * On admin.* production hosts, use the main site API when /api is not proxied on the admin vhost.
 */
export const resolveApiUrl = () => {
  if (typeof window !== 'undefined' && import.meta.env.PROD) {
    const { hostname, protocol } = window.location;
    if (hostname.startsWith('admin.')) {
      const apex = hostname.slice('admin.'.length);
      const fromEnv = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, '');
      // Built with VITE_API_URL=/api — that only works if Nginx proxies /api on the admin host
      if (!fromEnv || fromEnv === '/api') {
        return `${protocol}//${apex}/api`;
      }
      if (fromEnv.startsWith('http')) return fromEnv;
    }
  }

  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  return '/api';
};

export const resolveUploadsUrl = () => {
  const fromEnv = import.meta.env.VITE_UPLOADS_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  if (import.meta.env.DEV) {
    return '/uploads';
  }

  const apiBase = resolveApiUrl();
  if (apiBase.startsWith('http')) {
    return apiBase.replace(/\/api\/?$/i, '/uploads');
  }

  return '/uploads';
};
