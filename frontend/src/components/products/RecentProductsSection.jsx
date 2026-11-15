import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import activityService from '../../services/activityService';

export default function RecentProductsSection() {
  const { isAuthenticated } = useAuth();
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setRecentProducts([]);
      return;
    }

    let active = true;
    const loadRecent = async () => {
      setLoading(true);
      try {
        const data = await activityService.getRecentProducts();
        if (active && Array.isArray(data)) {
          setRecentProducts(data.slice(0, 10));
        }
      } catch {
        // Si no hay conexión o falla, se oculta silenciosamente sin afectar el catálogo
      } finally {
        if (active) setLoading(false);
      }
    };

    loadRecent();
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  if (!isAuthenticated || (!loading && recentProducts.length === 0)) {
    return null;
  }

  return (
    <section className="container my-4">
      <div className="card border-0 shadow-sm p-3 bg-white">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">
            <i className="bi bi-clock-history text-primary me-2"></i>
            Vistos recientemente
          </h5>
          <Link to="/profile" className="btn btn-sm btn-link text-decoration-none">
            Ver mi actividad <i className="bi bi-arrow-right"></i>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Cargando vistos recientemente...</span>
            </div>
          </div>
        ) : (
          <div className="row row-cols-2 row-cols-sm-3 row-cols-md-5 g-3">
            {recentProducts.map((item) => (
              <div className="col" key={item.id}>
                <Link
                  to={`/products/${item.id}`}
                  className="card h-100 border text-decoration-none text-dark shadow-sm"
                >
                  <img
                    src={
                      item.imageUrl ||
                      item.imagen ||
                      'https://placehold.co/240x160?text=UNAB'
                    }
                    alt={item.title || item.nombre}
                    className="card-img-top"
                    style={{ height: '120px', objectFit: 'cover' }}
                  />
                  <div className="card-body p-2">
                    <div className="small fw-semibold text-truncate">
                      {item.title || item.nombre}
                    </div>
                    <div className="text-primary fw-bold small">
                      ${Number(item.price ?? item.precio ?? 0).toLocaleString('es-CL')}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
