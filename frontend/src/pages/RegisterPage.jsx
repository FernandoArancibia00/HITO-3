import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Campos del formulario: los mismos de RegisterDto en el backend.
const FIELDS = [
  { name: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 100, autoComplete: 'name' },
  { name: 'email', label: 'Correo', type: 'email', required: true, maxLength: 150, autoComplete: 'email', placeholder: 'nombre@unab.cl' },
  { name: 'password', label: 'Contraseña', type: 'password', required: true, autoComplete: 'new-password', help: 'Mínimo 8 caracteres.' },
  { name: 'career', label: 'Carrera', type: 'text', maxLength: 100, placeholder: 'Ej: Ingeniería Civil Informática' },
  { name: 'campus', label: 'Campus', type: 'text', maxLength: 100, placeholder: 'Ej: Casona de Las Condes' },
  { name: 'phone', label: 'Teléfono', type: 'tel', maxLength: 30, autoComplete: 'tel', placeholder: 'Ej: +56 9 1234 5678' },
];

// Validación en el cliente (el backend vuelve a validar con RegisterDto).
function validate({ name, email, password }) {
  const errors = {};
  if (!name.trim()) errors.name = 'El nombre es obligatorio';
  if (!email.trim()) errors.email = 'El correo es obligatorio';
  else if (!EMAIL_REGEX.test(email.trim())) errors.email = 'El correo no tiene un formato válido';
  if (!password) errors.password = 'La contraseña es obligatoria';
  else if (password.length < 8) errors.password = 'La contraseña debe tener al menos 8 caracteres';
  return errors;
}

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from
    ? `${location.state.from.pathname}${location.state.from.search || ''}`
    : '/';

  const [form, setForm] = useState({
    name: '', email: '', password: '', career: '', campus: '', phone: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

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
      // El backend responde { accessToken, user }: queda con la sesión iniciada.
      await register(form);
      navigate(from, { replace: true });
    } catch (err) {
      // Ej: 409 "correo ya registrado" o el primer mensaje de class-validator.
      setServerError(err.message || 'No se pudo crear la cuenta');
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-9 col-lg-6">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h2 className="fw-bold mb-1">Crear cuenta</h2>
              <p className="text-muted mb-4">
                Los campos con <span className="text-danger">*</span> son obligatorios.
              </p>

              {serverError && (
                <div className="alert alert-danger py-2" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  {FIELDS.map((field) => (
                    <div
                      key={field.name}
                      className={field.required ? 'col-12' : 'col-12 col-sm-6'}
                    >
                      <label htmlFor={field.name} className="form-label">
                        {field.label}
                        {field.required ? (
                          <span className="text-danger"> *</span>
                        ) : (
                          <span className="text-muted small"> (opcional)</span>
                        )}
                      </label>
                      <input
                        type={field.type}
                        id={field.name}
                        name={field.name}
                        className={`form-control ${errors[field.name] ? 'is-invalid' : ''}`}
                        value={form[field.name]}
                        onChange={handleChange}
                        maxLength={field.maxLength}
                        autoComplete={field.autoComplete}
                        placeholder={field.placeholder}
                        disabled={loading}
                      />
                      {errors[field.name] ? (
                        <div className="invalid-feedback">{errors[field.name]}</div>
                      ) : (
                        field.help && <div className="form-text">{field.help}</div>
                      )}
                    </div>
                  ))}
                </div>

                <button type="submit" className="btn btn-unab w-100 mt-4" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                      Creando cuenta...
                    </>
                  ) : (
                    'Crear cuenta'
                  )}
                </button>
              </form>

              <hr className="my-4" />
              <p className="text-center mb-2">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" state={location.state}>Iniciar sesión</Link>
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
