import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import authService from '../services/authService';
import { setUnauthorizedHandler } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

// Lee el usuario guardado; si el JSON está corrupto, lo descarta.
function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [user, setUser] = useState(() => (localStorage.getItem(TOKEN_KEY) ? readStoredUser() : null));

  // Guarda la sesión en el estado y en localStorage (para no perderla al recargar).
  const saveSession = useCallback(({ accessToken, user: newUser }) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(accessToken);
    setUser(newUser);
    return newUser;
  }, []);

  const login = useCallback(
    async (credentials) => saveSession(await authService.login(credentials)),
    [saveSession],
  );

  const register = useCallback(
    async (userData) => saveSession(await authService.register(userData)),
    [saveSession],
  );

  // Actualiza los datos del usuario guardado (ej. al editar el perfil) sin tocar el token.
  // Solo guarda los campos de la sesión, para que el user mantenga la misma forma del login.
  const updateUser = useCallback((changes) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      ['name', 'email', 'role', 'career', 'campus'].forEach((key) => {
        if (changes[key] !== undefined) next[key] = changes[key];
      });
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // Si la API responde 401 con token (sesión expirada), se cierra la sesión.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
      updateUser,
    }),
    [user, token, login, register, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}

export default AuthContext;
