import React, { useEffect } from 'react';

export default function ProductDetailModal({
  producto,
  isOpen = false,
  onClose,
  onAgregarAlCarrito,
  onToggleFavorito,
  esFavorito = false,
  estaEnCarrito = false
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

  if (!isOpen || !producto) {
    return null;
  }

  const { nombre, precio, descripcion, imagen, categoria, vendedor } = producto;

  return (
    <>
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1050 }}
        onClick={onClose}
      ></div>

      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modalDetalleTitulo"
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content shadow-lg border-0">
            <div className="modal-header modal-header-unab d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-danger text-uppercase px-2 py-1">
                  {categoria}
                </span>
                <h5 className="modal-title m-0 fw-bold text-dark" id="modalDetalleTitulo">
                  Detalles del Producto
                </h5>
              </div>
              <button
                type="button"
                className="btn-close"
                aria-label="Cerrar"
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body p-4">
              <div className="row g-4 align-items-center">
                <div className="col-12 col-md-5 text-center">
                  <div
                    className="p-3 bg-white rounded border d-flex align-items-center justify-content-center"
                    style={{ minHeight: '260px' }}
                  >
                    <img
                      src={imagen || 'https://placehold.co/400x300/ad0f0f/ffffff?text=UNAB'}
                      alt={nombre}
                      className="img-fluid rounded"
                      style={{ maxHeight: '250px', objectFit: 'contain' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/400x300/ad0f0f/ffffff?text=UNAB+Marketplace';
                      }}
                    />
                  </div>
                </div>

                <div className="col-12 col-md-7">
                  <h3 className="fw-bold mb-2 text-dark">{nombre}</h3>

                  <div className="fs-3 fw-bold text-unab mb-3">
                    ${precio.toLocaleString('es-CL')} CLP
                  </div>

                  <div className="mb-3">
                    <h6 className="text-uppercase text-muted small fw-bold mb-1">Descripción:</h6>
                    <p className="text-secondary mb-0" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                      {descripcion}
                    </p>
                  </div>

                  <div className="card bg-light border-0 p-3 mb-3 rounded-3">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center"
                        style={{ width: '45px', height: '45px', fontSize: '1.25rem' }}
                      >
                        <i className="bi bi-person-fill"></i>
                      </div>
                      <div>
                        <div className="small text-muted fw-bold">PUBLICADO POR:</div>
                        <div className="fw-bold text-dark">{vendedor}</div>
                        <div className="small text-muted">Estudiante de la Comunidad UNAB</div>
                      </div>
                    </div>
                  </div>

                  <div className="alert alert-warning py-2 px-3 small d-flex align-items-center gap-2 mb-0">
                    <i className="bi bi-shield-check fs-5 text-warning"></i>
                    <span>Recomendamos coordinar entregas directas dentro de los campus universitarios.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer bg-light border-top d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-outline-secondary d-flex align-items-center gap-1"
                onClick={() => onToggleFavorito(producto)}
              >
                <span>{esFavorito ? '❤️ En Favoritos' : '🤍 Guardar en Favoritos'}</span>
              </button>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  className={`btn d-flex align-items-center gap-2 ${estaEnCarrito ? 'btn-success' : 'btn-unab'}`}
                  onClick={() => {
                    onAgregarAlCarrito(producto);
                  }}
                >
                  <i className={`bi ${estaEnCarrito ? 'bi-check-circle' : 'bi-cart-plus'}`}></i>
                  <span>{estaEnCarrito ? 'En el Carrito' : 'Añadir al Carrito'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
