import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import conversationService from '../../services/conversationService';
import {
  CONDITION_LABELS,
  DEFAULT_PRODUCT_IMAGE,
  formatPrice,
  handleProductImageError,
} from './productUtils';

export default function ProductDetailModal({
  isOpen = false,
  producto: product,
  onClose,
  onAgregarAlCarrito,
  onToggleFavorito,
  esFavorito = false,
  estaEnCarrito = false,
}) {
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [contacting, setContacting] = useState(false);
  const [contactError, setContactError] = useState(null);

  if (!isOpen || !product) return null;

  const esPropio = Boolean(user && product.seller && product.seller.id === user.id);

  const handleContactSeller = async () => {
    setContactError(null);
    if (!isAuthenticated) {
      onClose();
      navigate('/login');
      return;
    }

    setContacting(true);
    try {
      const conv = await conversationService.createOrGetConversation(Number(product.id));
      const convId = conv?.id || conv?._id;
      onClose();
      navigate(convId ? `/messages/${convId}` : '/messages');
    } catch (err) {
      setContactError(err?.message || 'No se pudo iniciar la conversación con el vendedor.');
    } finally {
      setContacting(false);
    }
  };

  const handleAddCart = () => {
    onClose();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (onAgregarAlCarrito) {
      onAgregarAlCarrito(product);
    } else {
      addToCart(product);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1055 }}
      onClick={onClose}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content border-0 shadow-lg overflow-hidden">
          <div className="modal-header bg-dark text-white border-0">
            <h5 className="modal-title fw-bold">{product.title}</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Cerrar"
            ></button>
          </div>

          <div className="modal-body p-4">
            {contactError && (
              <div className="alert alert-danger py-2" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {contactError}
              </div>
            )}

            <div className="row g-4">
              <div className="col-md-6 text-center">
                <img
                  src={product.imageUrl || DEFAULT_PRODUCT_IMAGE}
                  alt={product.title}
                  className="img-fluid rounded shadow-sm"
                  style={{ maxHeight: '340px', objectFit: 'cover' }}
                  onError={handleProductImageError}
                />
              </div>

              <div className="col-md-6 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-primary text-uppercase">
                      {product.category?.name || 'General'}
                    </span>
                    <span className="badge bg-secondary">
                      {CONDITION_LABELS[product.condition] || product.condition}
                    </span>
                  </div>

                  <h3 className="text-primary fw-bold mb-1">{formatPrice(product.price)}</h3>
                  <div className="small text-muted mb-3">Stock disponible: {product.stock}</div>

                  <p className="text-muted">{product.description}</p>

                  <div className="bg-light p-3 rounded mt-3">
                    <div className="fw-semibold">
                      <i className="bi bi-person-circle me-2 text-primary"></i>
                      Vendedor:{' '}
                      {product.seller ? (
                        <Link to={`/users/${product.seller.id}`} onClick={onClose}>
                          {product.seller.name}
                        </Link>
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

                <div className="d-grid gap-2 mt-4">
                  {esPropio ? (
                    <div className="alert alert-light border text-center py-2 mb-0 small">
                      <i className="bi bi-person-check me-1"></i> Esta es tu publicación
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={`btn ${estaEnCarrito ? 'btn-success' : 'btn-primary'}`}
                        onClick={handleAddCart}
                      >
                        <i className={`bi ${estaEnCarrito ? 'bi-check2-circle' : 'bi-cart-plus'} me-2`}></i>
                        {estaEnCarrito ? 'En el carrito' : 'Agregar al carrito'}
                      </button>

                      <button
                        type="button"
                        className="btn btn-success"
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
                    </>
                  )}

                  {onToggleFavorito && (
                    <button
                      type="button"
                      className={`btn ${esFavorito ? 'btn-danger' : 'btn-outline-danger'}`}
                      onClick={() => onToggleFavorito(product)}
                    >
                      <i className={`bi ${esFavorito ? 'bi-heart-fill' : 'bi-heart'} me-2`}></i>
                      {esFavorito ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                    </button>
                  )}

                  <Link
                    to={`/products/${product.id}`}
                    className="btn btn-link btn-sm text-decoration-none"
                    onClick={onClose}
                  >
                    Ver página del producto <i className="bi bi-box-arrow-up-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
