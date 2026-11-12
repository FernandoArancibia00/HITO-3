import React, { useEffect } from 'react';

export default function CartOffcanvas({
  isOpen = false,
  onClose,
  cart = [],
  onEliminarDelCarrito,
  onVaciarCarrito
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

  const totalPagar = cart.reduce((acumulador, item) => {
    return acumulador + Number(item.precio || 0);
  }, 0);

  const handleSimularCompra = () => {
    if (cart.length === 0) return;
    alert(
      `¡Solicitud de compra simulada con éxito!\n\nTotal estimado: $${totalPagar.toLocaleString(
        'es-CL'
      )} CLP.\nSe ha enviado un aviso a los vendedores para coordinar la entrega física en el campus universitario.`
    );
    if (onVaciarCarrito) {
      onVaciarCarrito();
    }
    onClose();
  };

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
        aria-labelledby="offcanvasCarritoTitulo"
        style={{ zIndex: 1050, visibility: 'visible', width: '420px', maxWidth: '100vw' }}
      >
        <div className="offcanvas-header py-3 px-4">
          <h5 className="offcanvas-title m-0" id="offcanvasCarritoTitulo">
            <i className="bi bi-cart3"></i>
            <span>Carrito de Compras</span>
            <span className="badge bg-danger rounded-pill fs-6 ms-2">
              {cart.length}
            </span>
          </h5>
          <button
            type="button"
            className="btn-close text-reset"
            aria-label="Cerrar carrito"
            onClick={onClose}
          ></button>
        </div>

        <div className="offcanvas-body p-4 d-flex flex-column">
          {cart.length === 0 ? (
            <div className="text-center my-auto py-5">
              <i className="bi bi-cart-x text-muted" style={{ fontSize: '4rem' }}></i>
              <h5 className="mt-3 text-dark fw-bold">Tu carrito está vacío</h5>
              <p className="text-muted small px-3">
                Explora el catálogo del campus y añade libros, equipos tecnológicos o apuntes que necesites.
              </p>
              <button
                type="button"
                className="btn btn-outline-unab btn-sm mt-2"
                onClick={onClose}
              >
                Volver al catálogo
              </button>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {cart.map((producto) => (
                <div key={producto.id} className="offcanvas-item-card">
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
                    className="btn btn-outline-danger btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center"
                    style={{ width: '32px', height: '32px', flexShrink: 0 }}
                    onClick={() => onEliminarDelCarrito(producto.id)}
                    title="Eliminar del carrito"
                    aria-label={`Eliminar ${producto.nombre} del carrito`}
                  >
                    <i className="bi bi-trash3"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="offcanvas-footer">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-muted fw-bold">Total a Pagar:</span>
              <span className="fs-4 fw-bold text-unab">
                ${totalPagar.toLocaleString('es-CL')} CLP
              </span>
            </div>

            <div className="d-flex flex-column gap-2">
              <button
                type="button"
                className="btn btn-unab w-100 py-2 d-flex align-items-center justify-content-center gap-2 shadow-sm"
                onClick={handleSimularCompra}
              >
                <i className="bi bi-bag-check-fill"></i>
                <span>Simular Compra / Coordinar Entrega</span>
              </button>

              <button
                type="button"
                className="btn btn-link text-danger text-decoration-none btn-sm"
                onClick={onVaciarCarrito}
              >
                Vaciar Carrito
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
