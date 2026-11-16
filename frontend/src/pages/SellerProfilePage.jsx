import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import useFavorites from '../hooks/useFavorites';
import Navbar from '../components/layout/Navbar';
import ProductCard from '../components/products/ProductCard';
import userService from '../services/userService';

// Página /users/:id (pública): datos públicos del vendedor y sus productos activos con stock.
export default function SellerProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items: cartItems, totalItems, addToCart, error: cartError } = useCart();
  const {
    favorites,
    notice: favoritesNotice,
    dismissNotice: dismissFavoritesNotice,
    toggleFavorite,
  } = useFavorites();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [message, setMessage] = useState(null);

  // GET /users/:id. 404 (no existe) y 400 (id no numérico) se muestran como "no encontrado".
  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const data = await userService.getPublicProfile(id);
      setProfile(data);
    } catch (err) {
      setProfile(null);
      if (err?.status === 404 || err?.status === 400) {
        setNotFound(true);
      } else {
        setError(err?.message || 'No se pudo cargar el perfil del vendedor.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const cartIds = useMemo(
    () => cartItems.map((item) => item.product?.id ?? item.productId),
    [cartItems]
  );

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleVerDetalles = (producto) => navigate(`/products/${producto.id}`);

  const handleAgregarAlCarrito = async (producto) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (cartIds.includes(producto.id)) {
      showMessage('El producto ya se encuentra en tu carrito de compras.');
      return;
    }
    await addToCart(producto);
    showMessage(`"${producto.title}" se agregó al carrito.`);
  };

  const renderContenido = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <div className="mt-3 text-muted">Cargando perfil del vendedor...</div>
        </div>
      );
    }

    if (notFound) {
      return (
        <div className="card text-center p-5 bg-white rounded-3 shadow-sm">
          <div className="py-3">
            <i className="bi bi-person-x text-muted" style={{ fontSize: '3.5rem' }}></i>
            <h4 className="fw-bold mt-3 text-dark">Usuario no encontrado</h4>
            <p className="text-muted small">El perfil que buscas no existe.</p>
            <Link to="/" className="btn btn-unab btn-sm mt-2">
              Volver al catálogo
            </Link>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-danger d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2" role="alert">
          <span>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </span>
          <button type="button" className="btn btn-outline-danger btn-sm" onClick={loadProfile}>
            <i className="bi bi-arrow-clockwise me-1"></i> Reintentar
          </button>
        </div>
      );
    }

    const products = Array.isArray(profile?.products) ? profile.products : [];

    return (
      <>
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body d-flex align-items-center gap-3">
            <i className="bi bi-person-circle text-unab" style={{ fontSize: '3rem' }}></i>
            <div>
              <h2 className="fw-bold mb-1">{profile.name}</h2>
              <div className="d-flex flex-wrap gap-2">
                {profile.career && (
                  <span className="badge bg-primary">
                    <i className="bi bi-mortarboard me-1"></i>
                    {profile.career}
                  </span>
                )}
                {profile.campus && (
                  <span className="badge bg-secondary">
                    <i className="bi bi-geo-alt me-1"></i>
                    {profile.campus}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <h4 className="fw-bold mb-3">
          Publicaciones activas{' '}
          <span className="text-muted fs-6">({products.length})</span>
        </h4>

        {products.length === 0 ? (
          <div className="card text-center p-5 bg-white rounded-3 shadow-sm">
            <i className="bi bi-box-seam text-muted" style={{ fontSize: '3rem' }}></i>
            <p className="text-muted mt-3 mb-0">
              Este vendedor no tiene publicaciones activas por ahora.
            </p>
          </div>
        ) : (
          <div className="row">
            {products.map((producto) => (
              <ProductCard
                key={producto.id}
                producto={producto}
                onVerDetalles={handleVerDetalles}
                onAgregarAlCarrito={handleAgregarAlCarrito}
                onToggleFavorito={toggleFavorite}
                esFavorito={favorites.some((f) => f.id === producto.id)}
                estaEnCarrito={cartIds.includes(producto.id)}
              />
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar
        favCount={favorites.length}
        cartCount={totalItems}
        onOpenCart={() => navigate('/cart')}
        onOpenFavorites={() => navigate('/')}
        onOpenCreateProduct={() => navigate('/my-products')}
        onOpenBookSearch={() => navigate('/my-products')}
      />

      <main className="container py-4 flex-grow-1">
        {favoritesNotice && (
          <div
            className={`alert alert-${favoritesNotice.type} py-2 d-flex align-items-center justify-content-between gap-2`}
            role={favoritesNotice.type === 'danger' ? 'alert' : 'status'}
          >
            <span>{favoritesNotice.message}</span>
            <button
              type="button"
              className="btn-close"
              aria-label="Cerrar aviso de favoritos"
              onClick={dismissFavoritesNotice}
            ></button>
          </div>
        )}
        {message && (
          <div className="alert alert-success py-2 d-flex align-items-center gap-2" role="status">
            <i className="bi bi-check-circle-fill"></i>
            <span>{message}</span>
          </div>
        )}
        {cartError && (
          <div className="alert alert-warning py-2" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {cartError}
          </div>
        )}

        {renderContenido()}
      </main>
    </div>
  );
}
