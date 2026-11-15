import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import activityService from '../services/activityService';

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
  const [activeTab, setActiveTab] = useState('activity');
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
    <div className="container py-4">
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
            <Link to="/my-orders" className="btn btn-outline-secondary btn-sm">
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
    </div>
  );
}
