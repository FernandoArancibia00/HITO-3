import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';

export default function CartOffcanvas({
  isOpen = false,
  onClose,
  cart: propsCart,
  onEliminarDelCarrito,
  onVaciarCarrito,
  onActualizarCantidad,
  onIrACheckout
}) {
  let contextValues = null;
  try {
    contextValues = useCart();
  } catch {
    // Si se usa fuera del Provider temporalmente
  }

  const cartItems = propsCart || contextValues?.items || [];
  const errorMsg = contextValues?.error || null;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleRemove = (itemId) => {
    if (onEliminarDelCarrito) {
      onEliminarDelCarrito(itemId);
    } else if (contextValues?.removeFromCart) {
      contextValues.removeFromCart(itemId);
    }
  };

  const handleUpdateQty = (itemId, newQty) => {
    if (onActualizarCantidad) {
      onActualizarCantidad(itemId, newQty);
    } else if (contextValues?.updateQuantity) {
      contextValues.updateQuantity(itemId, newQty);
    }
  };

  const handleClear = () => {
    if (onVaciarCarrito) {
      onVaciarCarrito();
    } else if (contextValues?.clearCart) {
      contextValues.clearCart();
    }
  };

  const handleCheckoutClick = () => {
    if (cartItems.length === 0) return;
    if (onIrACheckout) {
      onIrACheckout();
    }
    onClose();
  };

  // Cálculo del total
  const totalPagar = cartItems.reduce((acc, item) => {
    const prod = item.product || item;
    const precio = Number(prod.price ?? prod.precio ?? 0);
    const qty = item.quantity || 1;
    return acc + precio * qty;
  }, 0);

  const totalUnidades = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

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
        style={{ zIndex: 1050, visibility: 'visible', width: '440px', maxWidth: '100vw' }}
      >
        <div className="offcanvas-header py-3 px-4">
          <h5 className="offcanvas-title m-0" id="offcanvasCarritoTitulo">
            <i className="bi bi-cart3"></i>
            <span>Carrito de Compras</span>
            <span className="badge bg-danger rounded-pill fs-6 ms-2">
              {totalUnidades}
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
          {errorMsg && (
            <div className="alert alert-danger py-2 px-3 small d-flex align-items-center mb-3">
              <i className="bi bi-exclamation-triangle-fill me-2 flex-shrink-0"></i>
              <span>{errorMsg}</span>
            </div>
          )}

          {cartItems.length === 0 ? (
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
            <div className="d-flex flex-column gap-3">
              {cartItems.map((item) => {
                const prod = item.product || item;
                const itemId = item.id;
                const nombre = prod.title || prod.nombre || 'Producto';
                const precio = Number(prod.price ?? prod.precio ?? 0);
                const imagen = prod.imageUrl || prod.imagen || 'https://placehold.co/100x100/ad0f0f/ffffff?text=UNAB';
                const vendedor = prod.seller?.name || prod.vendedor || 'Vendedor UNAB';
                const quantity = item.quantity || 1;
                const stockDisponible = prod.stock ?? 99;
                const subtotal = precio * quantity;

                return (
                  <div key={itemId} className="offcanvas-item-card flex-column align-items-stretch p-3">
                    <div className="d-flex align-items-start gap-3 w-100">
                      <img
                        src={imagen}
                        alt={nombre}
                        className="offcanvas-item-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/100x100/ad0f0f/ffffff?text=UNAB';
                        }}
                      />

                      <div className="flex-grow-1 min-w-0">
                        <h6 className="mb-1 text-truncate fw-bold text-dark" title={nombre}>
                          {nombre}
                        </h6>
                        <div className="small text-muted text-truncate mb-1" style={{ fontSize: '0.78rem' }}>
                          <i className="bi bi-person me-1"></i>
                          {vendedor}
                        </div>
                        <div className="small text-unab fw-bold">
                          ${precio.toLocaleString('es-CL')} CLP{' '}
                          <span className="text-muted fw-normal" style={{ fontSize: '0.75rem' }}>c/u</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center"
                        style={{ width: '30px', height: '30px', flexShrink: 0 }}
                        onClick={() => handleRemove(itemId)}
                        title="Eliminar del carrito"
                        aria-label={`Eliminar ${nombre} del carrito`}
                      >
                        <i className="bi bi-trash3"></i>
                      </button>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                      <div className="d-flex align-items-center gap-2">
                        <span className="small text-muted" style={{ fontSize: '0.8rem' }}>Cantidad:</span>
                        <div className="input-group input-group-sm" style={{ width: '105px' }}>
                          <button
                            type="button"
                            className="btn btn-outline-secondary px-2"
                            disabled={quantity <= 1}
                            onClick={() => handleUpdateQty(itemId, quantity - 1)}
                            title="Disminuir cantidad"
                          >
                            <i className="bi bi-dash"></i>
                          </button>
                          <span className="input-group-text bg-white fw-bold text-center justify-content-center flex-grow-1">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            className="btn btn-outline-secondary px-2"
                            disabled={quantity >= stockDisponible}
                            onClick={() => handleUpdateQty(itemId, quantity + 1)}
                            title={quantity >= stockDisponible ? 'Stock máximo alcanzado' : 'Aumentar cantidad'}
                          >
                            <i className="bi bi-plus"></i>
                          </button>
                        </div>
                      </div>

                      <div className="text-end">
                        <span className="small text-muted d-block" style={{ fontSize: '0.72rem' }}>Subtotal:</span>
                        <span className="fw-bold text-dark small">
                          ${subtotal.toLocaleString('es-CL')} CLP
                        </span>
                      </div>
                    </div>

                    {quantity >= stockDisponible && (
                      <div className="small text-warning-emphasis bg-warning bg-opacity-10 rounded px-2 py-1 mt-2 text-center" style={{ fontSize: '0.75rem' }}>
                        <i className="bi bi-info-circle me-1"></i>
                        Máximo stock disponible ({stockDisponible} un.)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="offcanvas-footer">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <span className="text-muted fw-bold d-block">Total a Pagar:</span>
                <span className="small text-muted">({totalUnidades} {totalUnidades === 1 ? 'unidad' : 'unidades'})</span>
              </div>
              <span className="fs-4 fw-bold text-unab">
                ${totalPagar.toLocaleString('es-CL')} CLP
              </span>
            </div>

            <div className="d-flex flex-column gap-2">
              <button
                type="button"
                className="btn btn-unab w-100 py-2 d-flex align-items-center justify-content-center gap-2 shadow-sm fw-bold"
                onClick={handleCheckoutClick}
              >
                <i className="bi bi-credit-card-fill"></i>
                <span>Proceder al Pago / Checkout</span>
              </button>

              <button
                type="button"
                className="btn btn-link text-danger text-decoration-none btn-sm"
                onClick={handleClear}
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
