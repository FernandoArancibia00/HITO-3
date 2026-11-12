import React from 'react';

export default function ProductCard({
  producto,
  onVerDetalles,
  onAgregarAlCarrito,
  onToggleFavorito,
  onEliminarProducto,
  esFavorito = false,
  estaEnCarrito = false
}) {
  const { id, nombre, precio, descripcion, imagen, categoria, vendedor } = producto;

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://placehold.co/400x300/ad0f0f/ffffff?text=UNAB+Marketplace';
  };

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

        <button
          type="button"
          className="btn-card-delete"
          onClick={() => onEliminarProducto(id)}
          title="Eliminar publicación"
          aria-label="Eliminar publicación"
        >
          ✕
        </button>

        <div className="product-img-wrapper">
          <img
            src={imagen || 'https://placehold.co/400x300/ad0f0f/ffffff?text=UNAB'}
            alt={nombre}
            className="product-img-top"
            loading="lazy"
            onError={handleImageError}
          />
        </div>

        <div className="card-body">
          <span className="product-category-badge">
            {categoria}
          </span>

          <h5 className="card-title" title={nombre}>
            {nombre}
          </h5>

          <div className="product-price">
            ${precio.toLocaleString('es-CL')}
          </div>

          <p className="card-text">
            {descripcion}
          </p>

          <div className="product-seller-info">
            <i className="bi bi-person-fill text-unab me-1"></i>
            <strong>Vendedor:</strong> {vendedor}
          </div>

          <div className="mt-auto d-flex flex-column gap-2 pt-2">
            <button
              type="button"
              className="btn btn-outline-unab w-100 btn-sm py-2"
              onClick={() => onVerDetalles(producto)}
            >
              <i className="bi bi-eye me-1"></i> Ver Detalles
            </button>

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
                  <span>Añadir al Carrito</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
