import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Navbar from '../components/layout/Navbar';
import activityService from '../services/activityService';
import userService from '../services/userService';

const ROLE_LABELS = {
  buyer: 'Comprador',
  seller: 'Vendedor',
  admin: 'Administrador',
};

const EMPTY_FORM = { name: '', career: '', campus: '', phone: '' };

// Pasa la respuesta de /users/me al formulario (null → '' para los inputs controlados).
function toForm(profile) {
  return {
    name: profile?.name ?? '',
    career: profile?.career ?? '',
    campus: profile?.campus ?? '',
    phone: profile?.phone ?? '',
  };
}

// Pestaña "Mis datos": GET /users/me para mostrar y PATCH /users/me para editar.
function MyDataTab() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getMe();
      setProfile(data);
      setForm(toForm(data));
      // Sincroniza la sesión (ej. el rol pasa a seller tras publicar el primer producto).
      updateUser(data);
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar tus datos.');
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSaveError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setSaveError('El nombre es obligatorio.');
      return;
    }
    setSaving(true);
    setSaveError(null);
    setSuccessMessage(null);
    try {
      const updated = await userService.updateMe(form);
      setProfile(updated);
      setForm(toForm(updated));
      // Actualiza el AuthContext y su localStorage: el Navbar muestra el nombre nuevo.
      updateUser(updated);
      setSuccessMessage('Tus datos fueron actualizados.');
    } catch (err) {
      setSaveError(err?.message || 'No se pudieron guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando datos...</span>
        </div>
        <p className="text-muted mt-2 mb-0">Cargando tus datos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
        <div>
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
        <button type="button" className="btn btn-sm btn-danger" onClick={loadProfile}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="row g-4">
      <div className="col-12 col-lg-5">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-body">
            <h5 className="fw-bold mb-3">
              <i className="bi bi-person-vcard me-2 text-primary"></i>
              Datos de la cuenta
            </h5>
            <dl className="row mb-0 small">
              <dt className="col-4 text-muted">Nombre</dt>
              <dd className="col-8">{profile?.name}</dd>
              <dt className="col-4 text-muted">Correo</dt>
              <dd className="col-8 text-break">{profile?.email}</dd>
              <dt className="col-4 text-muted">Rol</dt>
              <dd className="col-8">
                <span className="badge bg-secondary">
                  {ROLE_LABELS[profile?.role] || profile?.role}
                </span>
              </dd>
              <dt className="col-4 text-muted">Carrera</dt>
              <dd className="col-8">{profile?.career || '—'}</dd>
              <dt className="col-4 text-muted">Campus</dt>
              <dd className="col-8">{profile?.campus || '—'}</dd>
              <dt className="col-4 text-muted">Teléfono</dt>
              <dd className="col-8">{profile?.phone || '—'}</dd>
              <dt className="col-4 text-muted">Miembro desde</dt>
              <dd className="col-8 mb-0">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString('es-CL')
                  : '—'}
              </dd>
            </dl>
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-7">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h5 className="fw-bold mb-3">
              <i className="bi bi-pencil-square me-2 text-primary"></i>
              Editar mis datos
            </h5>

            {successMessage && (
              <div className="alert alert-success py-2" role="status">
                <i className="bi bi-check-circle-fill me-2"></i>
                {successMessage}
              </div>
            )}
            {saveError && (
              <div className="alert alert-danger py-2" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {saveError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="profileName" className="form-label small fw-semibold">
                  Nombre *
                </label>
                <input
                  id="profileName"
                  name="name"
                  type="text"
                  className="form-control"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={100}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="profileEmail" className="form-label small fw-semibold">
                  Correo
                </label>
                <input
                  id="profileEmail"
                  type="email"
                  className="form-control"
                  value={profile?.email || ''}
                  readOnly
                  disabled
                />
                <div className="form-text">El correo no se puede modificar.</div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="profileCareer" className="form-label small fw-semibold">
                    Carrera
                  </label>
                  <input
                    id="profileCareer"
                    name="career"
                    type="text"
                    className="form-control"
                    value={form.career}
                    onChange={handleChange}
                    maxLength={100}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="profileCampus" className="form-label small fw-semibold">
                    Campus
                  </label>
                  <input
                    id="profileCampus"
                    name="campus"
                    type="text"
                    className="form-control"
                    value={form.campus}
                    onChange={handleChange}
                    maxLength={100}
                  />
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="profilePhone" className="form-label small fw-semibold">
                  Teléfono
                </label>
                <input
                  id="profilePhone"
                  name="phone"
                  type="tel"
                  className="form-control"
                  value={form.phone}
                  onChange={handleChange}
                  maxLength={30}
                  placeholder="+56912345678"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-1"></i>
                    Guardar cambios
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const ACTIVITY_LABELS = {
  product_view: {
    label: 'Producto visto',
    icon: 'bi-eye-fill',
    badgeClass: 'bg-info text-dark',
  },
  search: {
    label: 'Búsqueda realizada',
    icon: 'bi-search',
    badgeClass: 'bg-secondary',
  },
  favorite_added: {
    label: 'Agregado a favoritos',
    icon: 'bi-heart-fill',
    badgeClass: 'bg-danger',
  },
  order_created: {
    label: 'Pedido creado',
    icon: 'bi-bag-check-fill',
    badgeClass: 'bg-success',
  },
  order_status_changed: {
    label: 'Cambio de estado de pedido',
    icon: 'bi-arrow-repeat',
    badgeClass: 'bg-warning text-dark',
  },
};

export default function ProfilePage() {
  const { user } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('data');
  const [typeFilter, setTypeFilter] = useState('');
  const [activities, setActivities] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadActivityData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [activityList, recentList] = await Promise.all([
        activityService.getMyActivity({
          type: typeFilter || undefined,
          limit: 30,
        }),
        activityService.getRecentProducts(),
      ]);
      setActivities(Array.isArray(activityList) ? activityList : []);
      setRecentProducts(Array.isArray(recentList) ? recentList : []);
    } catch (err) {
      setError(
        err?.message || 'No se pudo cargar tu historial de actividad.'
      );
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    loadActivityData();
  }, [loadActivityData]);

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar
        cartCount={totalItems}
        onOpenCart={() => navigate('/cart')}
        onOpenFavorites={() => navigate('/')}
        onOpenCreateProduct={() => navigate('/my-products')}
        onOpenBookSearch={() => navigate('/my-products')}
      />

    <main className="container py-4 flex-grow-1">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <i className="bi bi-person-circle text-primary me-2"></i>
            Mi Perfil
          </h2>
          <p className="text-muted mb-0">
            Datos de tu cuenta universitaria y registro de actividad en MongoDB
          </p>
        </div>
        <Link to="/" className="btn btn-outline-primary btn-sm">
          <i className="bi bi-shop me-1"></i>
          Volver al catálogo
        </Link>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h5 className="fw-bold mb-1">{user?.name || 'Estudiante UNAB'}</h5>
            <div className="text-muted small">
              <i className="bi bi-envelope me-1"></i>
              {user?.email || 'estudiante@uandresbello.edu'}
            </div>
            <div className="d-flex gap-2 mt-2">
              <span className="badge bg-primary">
                {user?.career || 'Ingeniería UNAB'}
              </span>
              <span className="badge bg-secondary">
                {user?.campus || 'Campus UNAB'}
              </span>
            </div>
          </div>
          <div className="d-flex gap-2">
            <Link to="/messages" className="btn btn-outline-primary btn-sm">
              <i className="bi bi-chat-dots me-1"></i>
              Mis Mensajes
            </Link>
            <Link to="/orders"className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-box-seam me-1"></i>
              Mis Pedidos
            </Link>
          </div>
        </div>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link fw-semibold ${
              activeTab === 'data' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('data')}
          >
            <i className="bi bi-person-vcard me-1"></i>
            Mis datos
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link fw-semibold ${
              activeTab === 'activity' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('activity')}
          >
            <i className="bi bi-activity me-1"></i>
            Mi actividad
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link fw-semibold ${
              activeTab === 'recent' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('recent')}
          >
            <i className="bi bi-clock-history me-1"></i>
            Vistos recientemente ({recentProducts.length})
          </button>
        </li>
      </ul>

      {activeTab === 'data' && <MyDataTab />}

      {activeTab === 'activity' && (
        <div>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="activityTypeFilter" className="form-label mb-0 small fw-semibold">
                Filtrar por tipo:
              </label>
              <select
                id="activityTypeFilter"
                className="form-select form-select-sm"
                style={{ width: '220px' }}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">Todos los eventos</option>
                <option value="product_view">Productos vistos</option>
                <option value="search">Búsquedas</option>
                <option value="favorite_added">Favoritos agregados</option>
                <option value="order_created">Pedidos creados</option>
                <option value="order_status_changed">Cambios de estado</option>
              </select>
            </div>

            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={loadActivityData}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Actualizar
            </button>
          </div>

          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando actividad...</span>
              </div>
              <p className="text-muted mt-2 mb-0">Cargando tu actividad...</p>
            </div>
          )}

          {!loading && error && (
            <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
              <div>
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={loadActivityData}
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && activities.length === 0 && (
            <div className="card border-0 shadow-sm text-center py-5">
              <div className="card-body">
                <i className="bi bi-journal-text display-4 text-muted mb-3 d-block"></i>
                <h5 className="fw-semibold">Sin actividad registrada todavía</h5>
                <p className="text-muted mb-3">
                  Tus visitas a productos, búsquedas, favoritos y pedidos aparecerán aquí.
                </p>
                <Link to="/" className="btn btn-primary">
                  Explorar productos
                </Link>
              </div>
            </div>
          )}

          {!loading && !error && activities.length > 0 && (
            <div className="list-group shadow-sm">
              {activities.map((item) => {
                const info = ACTIVITY_LABELS[item.type] || {
                  label: item.type,
                  icon: 'bi-circle-fill',
                  badgeClass: 'bg-secondary',
                };

                return (
                  <div
                    key={item.id}
                    className="list-group-item d-flex justify-content-between align-items-center p-3"
                  >
                    <div className="d-flex align-items-center gap-3">
                      <span className={`badge ${info.badgeClass} p-2`}>
                        <i className={`bi ${info.icon}`}></i>
                      </span>
                      <div>
                        <div className="fw-semibold">{info.label}</div>
                        <div className="small text-muted">
                          {item.productId && (
                            <Link
                              to={`/products/${item.productId}`}
                              className="me-2 text-decoration-none"
                            >
                              Ver producto #{item.productId}
                            </Link>
                          )}
                          {item.orderId && (
                            <Link
                              to={`/orders/${item.orderId}`}
                              className="me-2 text-decoration-none"
                            >
                              Ver pedido #{item.orderId}
                            </Link>
                          )}
                          {item.meta?.search && (
                            <span>Término: "{item.meta.search}"</span>
                          )}
                          {item.meta?.status && (
                            <span>Nuevo estado: {item.meta.status}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="small text-muted">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'recent' && (
        <div>
          {recentProducts.length === 0 ? (
            <div className="card border-0 shadow-sm text-center py-5">
              <div className="card-body">
                <i className="bi bi-clock-history display-4 text-muted mb-3 d-block"></i>
                <h5 className="fw-semibold">No has visto productos recientemente</h5>
                <Link to="/" className="btn btn-primary mt-2">
                  Ir al catálogo
                </Link>
              </div>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-3">
              {recentProducts.map((prod) => (
                <div className="col" key={prod.id}>
                  <div className="card h-100 border-0 shadow-sm">
                    <img
                      src={
                        prod.imageUrl ||
                        prod.imagen ||
                        'https://placehold.co/300x200?text=UNAB'
                      }
                      alt={prod.title || prod.nombre}
                      className="card-img-top"
                      style={{ height: '160px', objectFit: 'cover' }}
                    />
                    <div className="card-body d-flex flex-column justify-content-between">
                      <div>
                        <h6 className="fw-bold text-truncate">
                          {prod.title || prod.nombre}
                        </h6>
                        <p className="text-primary fw-bold mb-2">
                          ${Number(prod.price ?? prod.precio ?? 0).toLocaleString('es-CL')}
                        </p>
                      </div>
                      <Link
                        to={`/products/${prod.id}`}
                        className="btn btn-outline-primary btn-sm w-100"
                      >
                        Ver producto
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
    </div>
  );
}
