import api from './api';

/**
 * Servicio de autenticación (T15).
 * Ambos endpoints responden { accessToken, user: { id, name, email, role, career, campus } }.
 */

// Quita los campos opcionales vacíos para no enviar "" al backend.
function cleanOptional(data) {
  const result = {};
  Object.entries(data).forEach(([key, value]) => {
    const trimmed = typeof value === 'string' ? value.trim() : value;
    if (trimmed !== '' && trimmed !== undefined && trimmed !== null) {
      result[key] = trimmed;
    }
  });
  return result;
}

// POST /api/auth/register  body: { name, email, password, career?, campus?, phone? }
export function register({ name, email, password, career, campus, phone }) {
  const body = cleanOptional({ name, email, career, campus, phone });
  body.password = password; // la contraseña se envía tal cual, sin trim
  return api.post('/auth/register', body);
}

// POST /api/auth/login  body: { email, password }
export function login({ email, password }) {
  return api.post('/auth/login', { email: email.trim(), password });
}

const authService = { register, login };
export default authService;
