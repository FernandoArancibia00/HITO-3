import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const navigate = useNavigate();
  const {
    items = [],
    total = 0,
    totalItems = 0,
    error,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const handleVaciar = () => {
    const confirmar = window.confirm('¿Estás seguro de que deseas vaciar todo el carrito?');
    if (confirmar) {
      clearCart();
    }
  };

  return (
    <div className="container py-4">
      {/* Navegación y Encabezado */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
            <i className="bi bi-cart3 text-unab"></i>
            Mi Carrito de Compras
          </h2>
          <p className="text-muted small m-0 mt-1">
            Revisa tus artículos universitarios antes de confirmar la compra y coordinar la entrega.
          </p>
        </div>

        <Link to="/" className="btn btn-outline-unab btn-sm d-flex align-items-center gap-1">
          <i className="bi bi-arrow-left"></i> Seguir Comprando
        </Link>
      </div>

      {/* Alerta de Error de Stock si existe */}
      {error && (
        <div className="alert alert-danger py-2 px-3 small d-flex align-items-center mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2 flex-shrink-0"></i>
          <div>{error}</div>
        </div>
      )}

      {/* Caso: Carrito Vacío */}
      {items.length === 0 ? (
        <div className="card border-0 shadow-sm text-center py-5">
          <div className="card-body py-5">
            <i className="bi bi-cart-x text-muted" style={{ fontSize: '4.5rem' }}></i>
            <h4 className="mt-3 fw-bold text-dark">Tu carrito está actualmente vacío</h4>
            <p className="text-muted small mx-auto" style={{ maxWidth: '420px' }}>
              Aún no has añadido productos. Explora los libros, calculadoras, útiles y artículos ofrecidos por otros estudiantes en el campus.
            </p>
            <Link to="/" className="btn btn-unab mt-2 px-4 py-2 fw-bold">
              <i className="bi bi-search me-2"></i>Explorar Catálogo
            </Link>
          </div>
        </div>
      ) : (
        /* Caso: Carrito con Productos */
        <div className="row g-4">
          {/* Columna Izquierda: Tabla / Lista de Artículos */}
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm p-3">
              <div className="table-responsive">
                <table className="table align-middle m-0">
                  <thead className="table-light small text-uppercase text-muted">
                    <tr>
                      <th>Producto</th>
                      <th className="text-end">Precio Unit.</th>
                      <th className="text-center" style={{ width: '130px' }}>Cantidad</th>
                      <th className="text-end">Subtotal</th>
                      <th className="text-center" style={{ width: '50px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
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
                        <tr key={itemId}>
                          {/* Datos del producto */}
                          <td>
                            <div className="d-flex align-items-center gap-3">
                              <img
                                src={imagen}
                                alt={nombre}
                                style={{ width: '55px', height: '55px', objectFit: 'contain' }}
                                className="rounded bg-light p-1 border flex-shrink-0"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://placehold.co/100x100/ad0f0f/ffffff?text=UNAB';
                                }}
                              />
                              <div className="min-w-0">
                                <span className="fw-bold d-block text-truncate text-dark" title={nombre} style={{ maxWidth: '280px' }}>
                                  {nombre}
                                </span>
                                <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
                                  <i className="bi bi-person me-1"></i>Vendedor: {vendedor}
                                </span>
                                {stockDisponible <= 5 && (
                                  <span className="badge bg-warning text-dark d-block mt-1" style={{ width: 'fit-content', fontSize: '0.68rem' }}>
                                    ¡Últimas {stockDisponible} unidades!
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Precio unitario */}
                          <td className="text-end fw-semibold small text-muted">
                            ${precio.toLocaleString('es-CL')}
                          </td>

                          {/* Selector de cantidad */}
                          <td className="text-center">
                            <div className="input-group input-group-sm justify-content-center">
                              <button
                                type="button"
                                className="btn btn-outline-secondary px-2"
                                disabled={quantity <= 1}
                                onClick={() => updateQuantity(itemId, quantity - 1)}
                                title="Disminuir cantidad"
                              >
                                <i className="bi bi-dash"></i>
                              </button>
                              <span className="input-group-text bg-white fw-bold text-center justify-content-center px-2" style={{ minWidth: '36px' }}>
                                {quantity}
                              </span>
                              <button
                                type="button"
                                className="btn btn-outline-secondary px-2"
                                disabled={quantity >= stockDisponible}
                                onClick={() => updateQuantity(itemId, quantity + 1)}
                                title={quantity >= stockDisponible ? 'Stock máximo alcanzado' : 'Aumentar cantidad'}
                              >
                                <i className="bi bi-plus"></i>
                              </button>
                            </div>
                          </td>

                          {/* Subtotal */}
                          <td className="text-end fw-bold text-dark">
                            ${subtotal.toLocaleString('es-CL')} CLP
                          </td>

                          {/* Botón eliminar */}
                          <td className="text-center">
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center mx-auto"
                              style={{ width: '28px', height: '28px' }}
                              onClick={() => removeFromCart(itemId)}
                              title="Quitar del carrito"
                            >
                              <i className="bi bi-trash3"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Botón para vaciar todo el carrito */}
              <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-2">
                <span className="text-muted small">
                  Total de artículos: <strong>{totalItems}</strong>
                </span>
                <button
                  type="button"
                  className="btn btn-link text-danger text-decoration-none btn-sm"
                  onClick={handleVaciar}
                >
                  <i className="bi bi-trash me-1"></i>Vaciar Carrito
                </button>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Resumen de Compra */}
          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm p-4 bg-light">
              <h5 className="fw-bold text-dark mb-3">
                <i className="bi bi-receipt me-2 text-unab"></i>
                Resumen de Compra
              </h5>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Subtotal ({totalItems} un.):</span>
                <span className="fw-semibold text-dark">${total.toLocaleString('es-CL')} CLP</span>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Entrega en Campus:</span>
                <span className="badge bg-success-subtle text-success border border-success-subtle">
                  Gratis (A coordinar)
                </span>
              </div>

              <hr />

              <div className="d-flex justify-content-between align-items-center mb-4">
                <span className="fw-bold text-dark fs-5">Total a Pagar:</span>
                <span className="fw-bold text-unab fs-4">
                  ${total.toLocaleString('es-CL')} CLP
                </span>
              </div>

              <button
                type="button"
                className="btn btn-unab w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                onClick={() => navigate('/checkout')}
              >
                <i className="bi bi-credit-card-fill"></i>
                <span>Continuar al Checkout</span>
              </button>

              <div className="text-center mt-3">
                <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
                  <i className="bi bi-shield-lock text-success me-1"></i>
                  Simulación de compra segura Marketplace UNAB
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
