const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Cliente HTTP centralizado para comunicarse con el backend NestJS.
 * Adjunta automáticamente el token JWT si existe en localStorage.
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  if (config.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const response = await fetch(`${BASE_URL}${cleanEndpoint}`, config);

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
    }

    const errorMessage =
      (data && (Array.isArray(data.message) ? data.message.join(', ') : data.message)) ||
      `Error HTTP ${response.status}: ${response.statusText}`;

    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (endpoint, options = {}) =>
    request(endpoint, { ...options, method: 'GET' }),

  post: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: 'POST', body }),

  put: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: 'PUT', body }),

  patch: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: 'PATCH', body }),

  delete: (endpoint, options = {}) =>
    request(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
