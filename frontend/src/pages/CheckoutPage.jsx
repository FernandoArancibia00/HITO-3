import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import orderService from '../services/orderService';

export default function CheckoutPage({ onVolver, onPedidoCreado }) {
  const navigate = useNavigate();
  const {
    items,
    total,
    error: cartError,
    recargarCarrito,
  } = useCart();

  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [orderResult, setOrderResult] = useState(null);

  const volverAlCatalogo = () => {
    if (onVolver) {
      onVolver();
    } else {
      navigate('/');
    }
  };

  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    setCardNumber(raw);
    setErrorMsg(null);
  };

  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setExpiry(raw);
  };

  const handleCvvChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCvv(raw);
  };

  const handleProcesarPago = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setOrderResult(null);

    if (cardNumber.length !== 16) {
      setErrorMsg('El número de tarjeta debe tener exactamente 16 dígitos.');
      return;
    }

    if (!cardHolder.trim()) {
      setErrorMsg('Ingresa el nombre del titular de la tarjeta.');
      return;
    }

    setLoading(true);

    try {
      let order = pendingOrder;
      if (!order) {
        order = await orderService.createOrder();
        if (!order?.id) {
          throw new Error('El servidor no devolvió el pedido creado.');
        }
        setPendingOrder(order);
        await recargarCarrito();
      }

      const result = await orderService.payOrder(order.id, cardNumber);
      if (!result?.order || !result?.transaction) {
        throw new Error('El servidor devolvió una respuesta de pago incompleta.');
      }
      if (!['aprobada', 'rechazada'].includes(result.transaction.status)) {
        throw new Error('El servidor devolvió un estado de pago no válido.');
      }

      setPendingOrder(result.order);
      setOrderResult(result);
      if (result.transaction.status === 'rechazada') {
        setErrorMsg(
          'El pago fue rechazado. El pedido quedó pendiente; puedes intentar nuevamente con otra tarjeta.'
        );
      } else if (onPedidoCreado) {
        onPedidoCreado(result.order);
      }
    } catch (err) {
      setErrorMsg(err?.message || 'No se pudo procesar el pedido o el pago.');
    } finally {
      setLoading(false);
    }
  };

  // Vista cuando el pedido fue aprobado exitosamente
  if (orderResult && orderResult.transaction.status === 'aprobada') {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow-sm border-0 text-center p-4">
              <div className="mb-3">
                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4.5rem' }}></i>
              </div>
              <h3 className="fw-bold text-dark mb-2">¡Pago y Pedido Confirmados!</h3>
              <p className="text-muted">
                Tu transacción simulada ha sido aprobada con éxito bajo el contrato del Marketplace UNAB.
              </p>

              <div className="bg-light p-3 rounded-3 text-start my-3 border">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small">Número de Pedido:</span>
                  <span className="fw-bold">#{orderResult.order.id}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small">Estado del Pedido:</span>
                  <span className="badge bg-success">{orderResult.order.status}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small">ID Transacción:</span>
                  <span className="fw-bold font-monospace">TRX-{orderResult.transaction.id}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small">Método:</span>
                  <span className="text-capitalize">{orderResult.transaction.method}</span>
                </div>
                <hr className="my-2" />
                <div className="d-flex justify-content-between">
                  <span className="fw-bold">Monto Pagado:</span>
                  <span className="fw-bold text-unab fs-5">
                    ${Number(orderResult.order.total).toLocaleString('es-CL')} CLP
                  </span>
                </div>
              </div>

              <div className="d-flex flex-column gap-2 mt-2">
                <button type="button" className="btn btn-unab py-2 fw-bold" onClick={volverAlCatalogo}>
                  <i className="bi bi-arrow-left me-2"></i>Volver al Catálogo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista cuando el carrito está vacío
  if (items.length === 0 && !pendingOrder && !orderResult) {
    return (
      <div className="container py-5 text-center">
        <div className="py-5">
          <i className="bi bi-cart-x text-muted" style={{ fontSize: '4rem' }}></i>
          <h4 className="mt-3 fw-bold">No hay productos para pagar</h4>
          <p className="text-muted">Agrega productos al carrito antes de proceder al checkout.</p>
          {onVolver && (
            <button className="btn btn-outline-unab mt-2" onClick={onVolver}>
              Explorar Catálogo
            </button>
          )}
        </div>
      </div>
    );
  }

  const summaryItems = pendingOrder?.items || items;
  const summaryTotal = pendingOrder?.total ?? total;

  return (
    <div className="container py-4">
      {onVolver && (
        <button
          type="button"
          className="btn btn-link text-decoration-none text-muted p-0 mb-3 d-inline-flex align-items-center gap-1"
          onClick={onVolver}
        >
          <i className="bi bi-arrow-left"></i> Volver al Catálogo
        </button>
      )}

      <div className="d-flex align-items-center gap-2 mb-4">
        <i className="bi bi-credit-card-2-front text-unab fs-3"></i>
        <h2 className="fw-bold m-0 text-dark">Checkout y Pago Simulado</h2>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm p-4">
            <h5 className="fw-bold text-dark mb-3">
              <i className="bi bi-shield-lock-fill text-unab me-2"></i>
              Detalles de la Transacción Simula
            </h5>

            <div className="alert alert-info py-2 px-3 small mb-4">
              <i className="bi bi-info-circle-fill me-2"></i>
              <strong>Modo de prueba Hito 3:</strong> Cualquier tarjeta de 16 dígitos se <strong>aprobará</strong>. Si termina en <code>0000</code>, se simulará una transacción <strong>rechazada</strong> para probar la regla de negocio.
            </div>

            {errorMsg && (
              <div className="alert alert-danger py-2 px-3 small d-flex align-items-center mb-3">
                <i className="bi bi-exclamation-triangle-fill me-2 flex-shrink-0"></i>
                <div>{errorMsg}</div>
              </div>
            )}
            {cartError && !errorMsg && (
              <div className="alert alert-danger py-2 px-3 small d-flex align-items-center mb-3" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2 flex-shrink-0"></i>
                <div>{cartError}</div>
              </div>
            )}

            <form onSubmit={handleProcesarPago}>
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Nombre del Titular</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej. Juan Pérez"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Número de Tarjeta (16 dígitos)</label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-credit-card"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control font-monospace"
                    placeholder="4500 1234 5678 9012"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength="16"
                    required
                  />
                </div>
                <div className="form-text small" style={{ fontSize: '0.78rem' }}>
                  Termina en <code>0000</code> para probar caso de rechazo bancario.
                </div>
              </div>

              <div className="row g-2 mb-4">
                <div className="col-6">
                  <label className="form-label small fw-bold text-muted">Vencimiento (MM/AA)</label>
                  <input
                    type="text"
                    className="form-control text-center"
                    placeholder="12/28"
                    value={expiry}
                    onChange={handleExpiryChange}
                    maxLength="5"
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold text-muted">CVV</label>
                  <input
                    type="password"
                    className="form-control text-center"
                    placeholder="123"
                    value={cvv}
                    onChange={handleCvvChange}
                    maxLength="4"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-unab w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Procesando pago simulado...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-lock-fill"></i>
                    <span>
                      {pendingOrder ? 'Intentar pago' : 'Confirmar y Pagar'} $
                      {Number(summaryTotal).toLocaleString('es-CL')} CLP
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm p-4 bg-light">
            <h5 className="fw-bold text-dark mb-3">
              <i className="bi bi-bag-check me-2 text-unab"></i>
              Resumen del Pedido
            </h5>

            <div className="d-flex flex-column gap-2 mb-3" style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {summaryItems.map((item) => {
                const prod = item.product || item;
                const nombre = prod.title || prod.nombre || 'Producto';
                const precio = Number(item.unitPrice ?? prod.price ?? prod.precio ?? 0);
                const imagen = prod.imageUrl || prod.imagen || 'https://placehold.co/100x100/ad0f0f/ffffff?text=UNAB';
                const qty = item.quantity || 1;
                const subtotal = precio * qty;

                return (
                  <div key={item.id ?? item.productId} className="d-flex align-items-center gap-3 bg-white p-2 rounded border">
                    <img
                      src={imagen}
                      alt={nombre}
                      style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                      className="rounded bg-light p-1"
                    />
                    <div className="flex-grow-1 min-w-0">
                      <div className="fw-bold text-truncate small text-dark" title={nombre}>
                        {nombre}
                      </div>
                      <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                        {qty} x ${precio.toLocaleString('es-CL')} CLP
                      </div>
                    </div>
                    <div className="fw-bold text-dark small">
                      ${subtotal.toLocaleString('es-CL')}
                    </div>
                  </div>
                );
              })}
            </div>

            <hr />

            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted">Subtotal:</span>
              <span className="fw-bold">${Number(summaryTotal).toLocaleString('es-CL')} CLP</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-muted">Entrega en Campus:</span>
              <span className="badge bg-success-subtle text-success border border-success-subtle">Gratis (Coordinar)</span>
            </div>

            <div className="d-flex justify-content-between align-items-center pt-2 border-top">
              <span className="fw-bold fs-5 text-dark">Total:</span>
              <span className="fw-bold fs-4 text-unab">
                ${Number(summaryTotal).toLocaleString('es-CL')} CLP
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
