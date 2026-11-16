import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  CONDITION_LABELS,
  DEFAULT_PRODUCT_IMAGE,
  formatPrice,
  handleProductImageError,
} from './productUtils';

export default function ProductCard({
  producto,
  onVerDetalles,
  onAgregarAlCarrito,
  onToggleFavorito,
  onEliminarProducto,
  esFavorito = false,
  estaEnCarrito = false
}) {
  const { user } = useAuth();
  const { title, price, description, imageUrl, condition, stock, seller, category } = producto;

  // Un producto es "propio" si lo publicó el usuario conectado.
  const esPropio = Boolean(user && seller && seller.id === user.id);

  return (
    <div className="col-12 col-sm-6 col-xl-4 mb-4">
      <div className="product-card">
        <button
          type="button"
          className="btn-card-fav"
          onClick={() => onToggleFavorito(producto)}
          title={esFavorito ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          aria-label={esFavorito ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          {esFavorito ? '❤️' : '🤍'}
        </button>

        {esPropio && onEliminarProducto && (
          <button
            type="button"
            className="btn-card-delete"
            onClick={() => onEliminarProducto(producto)}
            title="Desactivar publicación"
            aria-label="Desactivar publicación"
          >
            ✕
          </button>
        )}

        <div className="product-img-wrapper">
          <img
            src={imageUrl || DEFAULT_PRODUCT_IMAGE}
            alt={title}
            className="product-img-top"
            loading="lazy"
            onError={handleProductImageError}
          />
        </div>

        <div className="card-body">
          <span className="product-category-badge">
            {category?.name || 'General'}
          </span>

          <h5 className="card-title" title={title}>
            {title}
          </h5>

          <div className="product-price">
            {formatPrice(price)}
          </div>

          <div className="small text-muted mb-1">
            {CONDITION_LABELS[condition] || condition} · Stock: {stock}
          </div>

          <p className="card-text">
            {description}
          </p>

          <div className="product-seller-info">
            <i className="bi bi-person-fill text-unab me-1"></i>
            <strong>Vendedor:</strong> {seller?.name || 'Estudiante UNAB'}
          </div>

          <div className="mt-auto d-flex flex-column gap-2 pt-2">
            <button
              type="button"
              className="btn btn-outline-unab w-100 btn-sm py-2"
              onClick={() => onVerDetalles(producto)}
            >
              <i className="bi bi-eye me-1"></i> Ver Detalles
            </button>

            {esPropio ? (
              <span className="badge bg-light text-secondary border py-2">
                <i className="bi bi-person-check me-1"></i> Tu publicación
              </span>
            ) : (
              <button
                type="button"
                className={`btn w-100 btn-sm py-2 d-flex align-items-center justify-content-center gap-1 ${
                  estaEnCarrito ? 'btn-success' : 'btn-unab'
                }`}
                onClick={() => onAgregarAlCarrito(producto)}
              >
                {estaEnCarrito ? (
                  <>
                    <i className="bi bi-check2-circle"></i>
                    <span>En el Carrito</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-cart-plus"></i>
                    <span>Agregar al carrito</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
