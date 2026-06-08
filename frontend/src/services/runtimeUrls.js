/** Resolve API/socket URLs — production uses same origin (nginx /api proxy). */
function isLocalHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

export function resolveApiBaseUrl() {
  if (typeof window !== 'undefined' && import.meta.env.PROD) {
    const { hostname, origin } = window.location;
    if (!isLocalHost(hostname)) {
      return `${origin}/api/v1`;
    }
  }

  const envUrl = import.meta.env.VITE_API_URL?.trim();
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    if (!envUrl || envUrl.startsWith('http://')) {
      return `${window.location.origin}/api/v1`;
    }
  }
  return envUrl || 'http://localhost:5000/api/v1';
}

export function resolveSocketUrl() {
  if (typeof window !== 'undefined' && import.meta.env.PROD) {
    const { hostname, origin } = window.location;
    if (!isLocalHost(hostname)) {
      return origin;
    }
  }

  const envUrl = import.meta.env.VITE_SOCKET_URL?.trim();
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    if (!envUrl || envUrl.startsWith('http://')) {
      return window.location.origin;
    }
  }
  return envUrl || 'http://localhost:5000';
}
