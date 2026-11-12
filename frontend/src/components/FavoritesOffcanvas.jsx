import React, { useEffect } from 'react';

export default function FavoritesOffcanvas({
  isOpen = false,
  onClose,
  favorites = [],
  onEliminarFavorito,
  onMoverAlCarrito,
  cartIds = []
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1045 }}
        onClick={onClose}
      ></div>

      <div
        className="offcanvas offcanvas-end show offcanvas-custom"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="offcanvasFavoritosTitulo"
        style={{ zIndex: 1050, visibility: 'visible', width: '420px', maxWidth: '100vw' }}
      >
        <div className="offcanvas-header py-3 px-4">
          <h5 className="offcanvas-title m-0" id="offcanvasFavoritosTitulo">
            <i className="bi bi-heart-fill text-danger"></i>
            <span>Mis Favoritos</span>
            <span className="badge bg-danger rounded-pill fs-6 ms-2">
              {favorites.length}
            </span>
          </h5>
          <button
            type="button"
            className="btn-close text-reset"
            aria-label="Cerrar favoritos"
            onClick={onClose}
          ></button>
        </div>

        <div className="offcanvas-body p-4 d-flex flex-column">
          {favorites.length === 0 ? (
            <div className="text-center my-auto py-5">
              <i className="bi bi-heartbreak text-muted" style={{ fontSize: '4rem' }}></i>
              <h5 className="mt-3 text-dark fw-bold">No tienes favoritos aún</h5>
              <p className="text-muted small px-3">
                Guarda los artículos que te interesen haciendo clic en el corazón de cualquier tarjeta de producto.
              </p>
              <button
                type="button"
                className="btn btn-outline-unab btn-sm mt-2"
                onClick={onClose}
              >
                Explorar publicaciones
              </button>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {favorites.map((producto) => {
                const yaEstaEnCarrito = cartIds.includes(producto.id);

                return (
                  <div key={producto.id} className="offcanvas-item-card flex-column align-items-stretch">
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={producto.imagen || 'https://placehold.co/100x100/ad0f0f/ffffff?text=UNAB'}
                        alt={producto.nombre}
                        className="offcanvas-item-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/100x100/ad0f0f/ffffff?text=UNAB';
                        }}
                      />

                      <div className="flex-grow-1 min-w-0">
                        <h6 className="mb-1 text-truncate fw-bold text-dark" title={producto.nombre}>
                          {producto.nombre}
                        </h6>
                        <div className="small text-unab fw-bold mb-1">
                          ${producto.precio.toLocaleString('es-CL')} CLP
                        </div>
                        <div className="small text-muted text-truncate" style={{ fontSize: '0.78rem' }}>
                          <i className="bi bi-person me-1"></i>
                          {producto.vendedor}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center"
                        style={{ width: '32px', height: '32px', flexShrink: 0 }}
                        onClick={() => onEliminarFavorito(producto.id)}
                        title="Quitar de favoritos"
                        aria-label={`Quitar ${producto.nombre} de favoritos`}
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>

                    <div className="mt-2 pt-2 border-top">
                      <button
                        type="button"
                        className={`btn w-100 btn-sm d-flex align-items-center justify-content-center gap-2 ${
                          yaEstaEnCarrito ? 'btn-outline-success' : 'btn-unab'
                        }`}
                        onClick={() => onMoverAlCarrito(producto)}
                      >
                        {yaEstaEnCarrito ? (
                          <>
                            <i className="bi bi-check-circle"></i>
                            <span>Ya está en el Carrito</span>
                          </>
                        ) : (
                          <>
                            <i className="bi bi-cart-plus"></i>
                            <span>Enviar al Carrito</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {favorites.length > 0 && (
          <div className="offcanvas-footer">
            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </>
  );
}
