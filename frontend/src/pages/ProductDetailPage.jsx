import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import productService from '../services/productService';
import conversationService from '../services/conversationService';
import {
  CONDITION_LABELS,
  DEFAULT_PRODUCT_IMAGE,
  formatPrice,
  handleProductImageError,
} from '../components/products/productUtils';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [contacting, setContacting] = useState(false);
  const [contactError, setContactError] = useState(null);

  // GET /products/:id — 400 (id no numérico) y 404 se muestran como "no encontrado".
  const loadProduct = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      setProduct(await productService.getById(id));
    } catch (err) {
      setProduct(null);
      if (err.status === 404 || err.status === 400) {
        setNotFound(true);
      } else {
        setError(err.message || 'No se pudo cargar el producto.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const esPropio = Boolean(user && product?.seller && product.seller.id === user.id);

  const handleAddCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await addToCart(product);
    navigate('/cart');
  };

  const handleContactSeller = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setContacting(true);
    setContactError(null);
    try {
      const conv = await conversationService.createOrGetConversation(product.id);
      const convId = conv?.id || conv?._id;
      navigate(convId ? `/messages/${convId}` : '/messages');
    } catch (err) {
      setContactError(err?.message || 'No se pudo iniciar la conversación con el vendedor.');
    } finally {
      setContacting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <div className="mt-3 text-muted">Cargando producto...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger d-inline-block" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
        <div className="d-flex justify-content-center gap-2">
          <button type="button" className="btn btn-outline-danger" onClick={loadProduct}>
            <i className="bi bi-arrow-clockwise me-1"></i> Reintentar
          </button>
          <Link to="/" className="btn btn-outline-secondary">Volver al catálogo</Link>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="container py-5 text-center">
        <h3 className="fw-bold mb-3">Producto no encontrado</h3>
        <Link to="/" className="btn btn-primary">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="mb-3">
        <Link to="/" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left me-1"></i>
          Volver al catálogo
        </Link>
      </div>

      {contactError && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {contactError}
        </div>
      )}

      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="row g-0">
          <div className="col-md-6 bg-light d-flex align-items-center justify-content-center p-4">
            <img
              src={product.imageUrl || DEFAULT_PRODUCT_IMAGE}
              alt={product.title}
              className="img-fluid rounded"
              style={{ maxHeight: '420px', objectFit: 'contain' }}
              onError={handleProductImageError}
            />
          </div>
          <div className="col-md-6 p-4 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex gap-2 mb-2">
                <span className="badge bg-primary text-uppercase">
                  {product.category?.name || 'General'}
                </span>
                <span className="badge bg-secondary">
                  {CONDITION_LABELS[product.condition] || product.condition}
                </span>
                {!product.isActive && <span className="badge bg-dark">Inactivo</span>}
              </div>

              <h2 className="fw-bold mb-2">{product.title}</h2>
              <h3 className="text-primary fw-bold mb-1">{formatPrice(product.price)}</h3>
              <div className="small text-muted mb-3">Stock disponible: {product.stock}</div>

              <p className="text-muted mb-4">{product.description}</p>

              <div className="p-3 bg-light rounded mb-4">
                <div className="fw-semibold mb-1">
                  <i className="bi bi-person-badge me-2 text-primary"></i>
                  Vendedor:{' '}
                  {product.seller ? (
                    <Link to={`/users/${product.seller.id}`}>{product.seller.name}</Link>
                  ) : (
                    'Estudiante UNAB'
                  )}
                </div>
                {product.seller?.career && (
                  <div className="small text-muted">Carrera: {product.seller.career}</div>
                )}
                {product.seller?.campus && (
                  <div className="small text-muted">Campus: {product.seller.campus}</div>
                )}
              </div>
            </div>

            {esPropio ? (
              <div className="alert alert-light border text-center mb-0">
                <i className="bi bi-person-check me-1"></i> Esta es tu publicación.{' '}
                <Link to="/my-products">Administrarla en Mis publicaciones</Link>
              </div>
            ) : (
              <div className="d-grid gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={handleAddCart}
                  disabled={!product.isActive || product.stock < 1}
                >
                  <i className="bi bi-cart-plus me-2"></i>
                  Agregar al carrito
                </button>

                <button
                  type="button"
                  className="btn btn-outline-success btn-lg"
                  onClick={handleContactSeller}
                  disabled={contacting}
                >
                  {contacting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Abriendo chat...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-chat-dots-fill me-2"></i>
                      Contactar al vendedor
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
