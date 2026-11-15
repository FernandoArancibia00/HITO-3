import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import conversationService from '../services/conversationService';

export default function ProductDetailModal({
  product,
  show,
  onClose,
  isFavorite,
  onToggleFavorite,
}) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [contacting, setContacting] = useState(false);
  const [contactError, setContactError] = useState(null);

  if (!show || !product) return null;

  const formatPrice = (price) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(price);

  const handleContactSeller = async () => {
    setContactError(null);
    if (!isAuthenticated) {
      onClose();
      navigate('/login');
      return;
    }

    setContacting(true);
    try {
      const conv = await conversationService.createOrGetConversation(product.id);
      const convId = conv?.id || conv?._id;
      onClose();
      if (convId) {
        navigate(`/messages/${convId}`);
      } else {
        navigate('/messages');
      }
    } catch (err) {
      setContactError(
        err?.message || 'No se pudo iniciar la conversación con el vendedor.'
      );
    } finally {
      setContacting(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-lg modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg overflow-hidden">
          <div className="modal-header bg-dark text-white border-0">
            <h5 className="modal-title fw-bold">
              {product.nombre || product.title}
            </h5>
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
                  src={product.imagen || product.imageUrl}
                  alt={product.nombre || product.title}
                  className="img-fluid rounded shadow-sm"
                  style={{ maxHeight: '340px', objectFit: 'cover' }}
                />
              </div>

              <div className="col-md-6 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-primary text-uppercase">
                      {product.categoria || 'General'}
                    </span>
                    <span className="badge bg-secondary">
                      {product.estado || product.condition || 'Usado'}
                    </span>
                  </div>

                  <h3 className="text-primary fw-bold mb-3">
                    {formatPrice(product.precio ?? product.price ?? 0)}
                  </h3>

                  <p className="text-muted">
                    {product.descripcion || product.description}
                  </p>

                  <div className="bg-light p-3 rounded mt-3">
                    <div className="fw-semibold">
                      <i className="bi bi-person-circle me-2 text-primary"></i>
                      Vendedor: {product.vendedor || product.seller?.name || 'Estudiante UNAB'}
                    </div>
                    {product.carrera && (
                      <div className="small text-muted">
                        Carrera: {product.carrera}
                      </div>
                    )}
                    {product.campus && (
                      <div className="small text-muted">
                        Campus: {product.campus}
                      </div>
                    )}
                  </div>
                </div>

                <div className="d-grid gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      addToCart(product);
                      onClose();
                    }}
                  >
                    <i className="bi bi-cart-plus me-2"></i>
                    Agregar al carrito
                  </button>

                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleContactSeller}
                    disabled={contacting}
                  >
                    {contacting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Abriendo chat...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-chat-dots-fill me-2"></i>
                        Contactar al vendedor
                      </>
                    )}
                  </button>

                  {onToggleFavorite && (
                    <button
                      type="button"
                      className={`btn ${
                        isFavorite ? 'btn-danger' : 'btn-outline-danger'
                      }`}
                      onClick={() => onToggleFavorite(product.id)}
                    >
                      <i
                        className={`bi ${
                          isFavorite ? 'bi-heart-fill' : 'bi-heart'
                        } me-2`}
                      ></i>
                      {isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
