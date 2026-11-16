import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validación en el cliente (el backend vuelve a validar con LoginDto).
function validate({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = 'El correo es obligatorio';
  else if (!EMAIL_REGEX.test(email.trim())) errors.email = 'El correo no tiene un formato válido';
  if (!password) errors.password = 'La contraseña es obligatoria';
  return errors;
}

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Página desde donde venía el usuario (la deja ProtectedRoute en state.from).
  const from = location.state?.from
    ? `${location.state.from.pathname}${location.state.from.search || ''}`
    : '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  // Si ya hay sesión, no tiene sentido mostrar el formulario.
  if (isAuthenticated) return <Navigate to={from} replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.message || 'No se pudo iniciar sesión');
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-7 col-lg-5">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h2 className="fw-bold mb-1">Iniciar sesión</h2>
              <p className="text-muted mb-4">Ingresa con tu correo y contraseña.</p>

              {serverError && (
                <div className="alert alert-danger py-2" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Correo</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    placeholder="nombre@unab.cl"
                    disabled={loading}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label">Contraseña</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                <button type="submit" className="btn btn-unab w-100" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                      Ingresando...
                    </>
                  ) : (
                    'Iniciar sesión'
                  )}
                </button>
              </form>

              <hr className="my-4" />
              <p className="text-center mb-2">
                ¿No tienes cuenta?{' '}
                <Link to="/register" state={location.state}>Crear cuenta</Link>
              </p>
              <p className="text-center mb-0">
                <Link to="/" className="text-muted small">
                  <i className="bi bi-arrow-left me-1"></i>Volver al catálogo
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
