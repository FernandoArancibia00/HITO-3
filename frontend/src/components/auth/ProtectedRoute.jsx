import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Protege rutas que requieren sesión (T15).
 * - Sin sesión: redirige a /login guardando en state.from la ruta pedida,
 *   para que LoginPage vuelva ahí después de iniciar sesión.
 * - Con sesión: muestra children o, si se usa como ruta padre, el <Outlet />.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children ?? <Outlet />;
}
