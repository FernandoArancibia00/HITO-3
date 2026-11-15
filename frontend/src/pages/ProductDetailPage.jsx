import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import initialProducts from '../data/products.json';
import conversationService from '../services/conversationService';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [contacting, setContacting] = useState(false);
  const [contactError, setContactError] = useState(null);

  const savedProducts = (() => {
    try {
      const raw = localStorage.getItem('unab_marketplace_products');
      return raw ? JSON.parse(raw) : initialProducts;
    } catch {
      return initialProducts;
    }
  })();

  const product = savedProducts.find((p) => String(p.id) === String(id));

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

  if (!product) {
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
              src={product.imagen || product.imageUrl || 'https://placehold.co/500x400?text=UNAB'}
              alt={product.nombre || product.title}
              className="img-fluid rounded"
              style={{ maxHeight: '420px', objectFit: 'contain' }}
            />
          </div>
          <div className="col-md-6 p-4 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex gap-2 mb-2">
                <span className="badge bg-primary text-uppercase">
                  {product.categoria || product.category?.name || 'General'}
                </span>
                <span className="badge bg-secondary">
                  {product.estado || product.condition || 'Usado'}
                </span>
              </div>

              <h2 className="fw-bold mb-2">{product.nombre || product.title}</h2>
              <h3 className="text-primary fw-bold mb-3">
                ${Number(product.precio ?? product.price ?? 0).toLocaleString('es-CL')}
              </h3>

              <p className="text-muted mb-4">
                {product.descripcion || product.description}
              </p>

              <div className="p-3 bg-light rounded mb-4">
                <div className="fw-semibold mb-1">
                  <i className="bi bi-person-badge me-2 text-primary"></i>
                  Vendedor: {product.vendedor || product.seller?.name || 'Estudiante UNAB'}
                </div>
                {(product.carrera || product.seller?.career) && (
                  <div className="small text-muted">
                    Carrera: {product.carrera || product.seller?.career}
                  </div>
                )}
                {(product.campus || product.seller?.campus) && (
                  <div className="small text-muted">
                    Campus: {product.campus || product.seller?.campus}
                  </div>
                )}
              </div>
            </div>

            <div className="d-grid gap-2">
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => addToCart(product)}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
