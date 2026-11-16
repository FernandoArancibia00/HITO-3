import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import { getStatusBadge } from './MyOrdersPage';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const isBuyer = Boolean(user?.id && Number(order?.buyerId) === Number(user.id));
  const isSeller = Boolean(
    user?.id &&
    order?.items?.some((item) => Number(item.sellerId) === Number(user.id))
  );

  const timelineSteps = [
    { key: 'pendiente', label: 'Pedido Creado', icon: 'bi-file-earmark-text' },
    { key: 'pagado', label: 'Pago Confirmado', icon: 'bi-credit-card-check' },
    { key: 'enviado', label: 'En Camino / Retiro', icon: 'bi-truck' },
    { key: 'entregado', label: 'Entregado', icon: 'bi-check-circle' },
  ];

  const cargarPedido = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrderById(id);
      setOrder(data);
    } catch (err) {
      setError(err.message || `No fue posible cargar el detalle del pedido #${id}.`);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      cargarPedido();
    }
  }, [id, cargarPedido]);

  const getStepProgress = (stepKey) => {
    if (!order || order.status === 'cancelado') return 'inactivo';
    const currentOrderKey = order.status === 'listo_retiro' ? 'enviado' : order.status;
    const orderIndex = timelineSteps.findIndex((s) => s.key === currentOrderKey);
    const stepIndex = timelineSteps.findIndex((s) => s.key === stepKey);

    if (stepIndex < orderIndex) return 'completado';
    if (stepIndex === orderIndex) return 'actual';
    return 'pendiente';
  };

  const applyOrderUpdate = (updatedOrder, transaction) => {
    setOrder((prev) => {
      if (!prev) return updatedOrder;
      return {
        ...prev,
        ...updatedOrder,
        buyer: updatedOrder.buyer ?? prev.buyer,
        items: updatedOrder.items ?? prev.items,
        transactions:
          updatedOrder.transactions ??
          (transaction ? [...(prev.transactions || []), transaction] : prev.transactions),
      };
    });
  };

  const handleCancelar = async () => {
    if (!isBuyer || !['pendiente', 'pagado'].includes(order.status)) {
      setActionError('No puedes cancelar este pedido en su estado actual.');
      return;
    }

    const confirmar = window.confirm(`¿Confirmas la cancelación del Pedido #${order.id}? El stock reservado será restaurado.`);
    if (!confirmar) return;

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const updatedOrder = await orderService.updateOrderStatus(order.id, 'cancelado');
      if (updatedOrder?.status !== 'cancelado') {
        throw new Error('El servidor no confirmó la cancelación del pedido.');
      }
      applyOrderUpdate(updatedOrder);
      setActionSuccess('El pedido ha sido cancelado exitosamente y el stock fue liberado.');
    } catch (err) {
      setActionError(err?.message || 'Error al cancelar el pedido.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCambiarEstado = async (newStatus) => {
    const sellerTransitionAllowed =
      (order.status === 'pagado' && ['enviado', 'listo_retiro'].includes(newStatus)) ||
      (['enviado', 'listo_retiro'].includes(order.status) && newStatus === 'entregado');
    if (!isSeller || !sellerTransitionAllowed) {
      setActionError('No puedes cambiar este pedido al estado solicitado.');
      return;
    }

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const updatedOrder = await orderService.updateOrderStatus(order.id, newStatus);
      if (updatedOrder?.status !== newStatus) {
        throw new Error('El servidor no confirmó el cambio de estado.');
      }
      applyOrderUpdate(updatedOrder);
      setActionSuccess(`El pedido quedó en estado "${newStatus}".`);
    } catch (err) {
      setActionError(err?.message || 'Error al actualizar el estado del pedido.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePagar = async () => {
    if (!isBuyer || order.status !== 'pendiente') {
      setActionError('Solo puedes pagar tus pedidos pendientes.');
      return;
    }

    const cardInput = window.prompt(
      'Ingresa los 16 dígitos de la tarjeta para simular el pago:\n(Termina en 0000 para probar RECHAZO; cualquier otra para APROBAR)',
      '4500123456789012'
    );
    if (cardInput === null) return;

    const cardNumber = cardInput.replace(/\D/g, '');
    if (cardNumber.length !== 16) {
      setActionError('El número de tarjeta debe tener exactamente 16 dígitos.');
      return;
    }

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const result = await orderService.payOrder(order.id, cardNumber);
      if (!result?.order || !result?.transaction) {
        throw new Error('El servidor devolvió una respuesta de pago incompleta.');
      }
      if (!['aprobada', 'rechazada'].includes(result.transaction.status)) {
        throw new Error('El servidor devolvió un estado de pago no válido.');
      }
      applyOrderUpdate(result.order, result.transaction);
      if (result.transaction.status === 'aprobada') {
        setActionSuccess('¡Pago simulado aprobado correctamente!');
      } else {
        setActionError('El pago fue rechazado. El pedido sigue pendiente y puedes volver a intentarlo.');
      }
    } catch (err) {
      setActionError(err?.message || 'Error al procesar el pago simulado.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="container py-4">
      {/* Botón Volver */}
      <div className="mb-3">
        <Link to="/orders" className="btn btn-link text-decoration-none text-muted p-0 d-inline-flex align-items-center gap-1">
          <i className="bi bi-arrow-left"></i> Volver a Mis Compras
        </Link>
      </div>

      {/* Estado de Carga */}
      {loading && (
        <div className="text-center py-5 my-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Cargando pedido...</span>
          </div>
          <p className="text-muted mt-2 small">Cargando información del pedido #{id}...</p>
        </div>
      )}

      {/* Estado de Error */}
      {!loading && error && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between py-3" role="alert">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
            <div>{error}</div>
          </div>
          <button type="button" className="btn btn-outline-danger btn-sm" onClick={cargarPedido}>
            <i className="bi bi-arrow-clockwise me-1"></i> Reintentar
          </button>
        </div>
      )}

      {!loading && !error && order && (
        <>
          {actionSuccess && (
            <div className="alert alert-success alert-dismissible fade show d-flex align-items-center py-2 px-3 mb-4" role="alert">
              <i className="bi bi-check-circle-fill me-2 fs-5"></i>
              <div>{actionSuccess}</div>
              <button type="button" className="btn-close" onClick={() => setActionSuccess(null)}></button>
            </div>
          )}
          {actionError && (
            <div className="alert alert-danger py-2 px-3 mb-4" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {actionError}
            </div>
          )}

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h3 className="fw-bold m-0 text-dark">Pedido #{order.id}</h3>
                  {getStatusBadge(order.status)}
                </div>
                <span className="text-muted small">
                  <i className="bi bi-calendar3 me-1"></i>
                  Realizado el {new Date(order.createdAt).toLocaleDateString('es-CL', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="text-md-end">
                <span className="text-muted small d-block">Monto Total:</span>
                <span className="fs-3 fw-bold text-unab">
                  ${Number(order.total || 0).toLocaleString('es-CL')} CLP
                </span>
              </div>
            </div>
          </div>

          {/* Línea de Tiempo del Pedido (Timeline) */}
          <div className="card border-0 shadow-sm p-4 mb-4">
            <h5 className="fw-bold text-dark mb-4">
              <i className="bi bi-diagram-3 text-unab me-2"></i>
              Línea de Tiempo del Seguimiento
            </h5>

            {order.status === 'cancelado' ? (
              <div className="alert alert-danger d-flex align-items-center py-3 mb-0" role="alert">
                <i className="bi bi-x-octagon-fill fs-3 me-3"></i>
                <div>
                  <h6 className="fw-bold mb-1">Este pedido fue Cancelado</h6>
                  <span className="small">El stock reservado fue restaurado a los vendedores en la base de datos.</span>
                </div>
              </div>
            ) : (
              <div className="row g-2 text-center">
                {timelineSteps.map((st) => {
                  const statusStep = getStepProgress(st.key);
                  let badgeColor = 'bg-light text-muted border';
                  if (statusStep === 'completado') badgeColor = 'bg-success text-white';
                  if (statusStep === 'actual') badgeColor = 'bg-primary text-white shadow';

                  return (
                    <div key={st.key} className="col-12 col-md-3">
                      <div className="p-3 rounded-3 d-flex flex-column align-items-center">
                        <div
                          className={`rounded-circle d-flex align-items-center justify-content-center mb-2 ${badgeColor}`}
                          style={{ width: '48px', height: '48px', fontSize: '1.25rem' }}
                        >
                          <i className={`bi ${st.icon}`}></i>
                        </div>
                        <span className="small fw-bold text-dark">{st.label}</span>
                        <span className="small text-muted" style={{ fontSize: '0.72rem' }}>
                          {statusStep === 'completado' && 'Completado'}
                          {statusStep === 'actual' && 'Estado Actual'}
                          {statusStep === 'pendiente' && 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="row g-4">
            {/* Columna Izquierda: Detalle de Productos */}
            <div className="col-12 col-lg-8">
              <div className="card border-0 shadow-sm p-4">
                <h5 className="fw-bold text-dark mb-3">
                  <i className="bi bi-box-seam text-unab me-2"></i>
                  Artículos del Pedido
                </h5>

                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead className="table-light small text-uppercase text-muted">
                      <tr>
                        <th>Producto</th>
                        <th className="text-center">Cant.</th>
                        <th className="text-end">Precio Unit.</th>
                        <th className="text-end">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(order.items || []).map((it) => {
                        const prod = it.product || {};
                        const titulo = prod.title || prod.nombre || 'Producto';
                        const imagen = prod.imageUrl || prod.imagen || 'https://placehold.co/100x100/ad0f0f/ffffff?text=UNAB';
                        const precioUnit = Number(it.unitPrice || prod.price || 0);

                        return (
                          <tr key={it.id}>
                            <td>
                              <div className="d-flex align-items-center gap-3">
                                <img
                                  src={imagen}
                                  alt={titulo}
                                  style={{ width: '45px', height: '45px', objectFit: 'contain' }}
                                  className="rounded bg-light p-1 border flex-shrink-0"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://placehold.co/100x100/ad0f0f/ffffff?text=UNAB';
                                  }}
                                />
                                <div className="min-w-0">
                                  <span className="fw-bold d-block small text-dark" title={titulo}>{titulo}</span>
                                  {prod.condition && (
                                    <span className="badge bg-light text-muted border" style={{ fontSize: '0.7rem' }}>
                                      Condición: {prod.condition}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="text-center fw-bold">{it.quantity}</td>
                            <td className="text-end small">${precioUnit.toLocaleString('es-CL')}</td>
                            <td className="text-end fw-bold small text-dark">
                              ${(it.quantity * precioUnit).toLocaleString('es-CL')} CLP
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Acciones según el participante y el estado del pedido */}
                <div className="d-flex justify-content-end gap-2 mt-3 pt-3 border-top">
                  {isBuyer && order.status === 'pendiente' && (
                    <button type="button" className="btn btn-success btn-sm" onClick={handlePagar} disabled={actionLoading}>
                      <i className="bi bi-credit-card me-1"></i> Pagar Pedido Ahora
                    </button>
                  )}

                  {isBuyer && ['pendiente', 'pagado'].includes(order.status) && (
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleCancelar} disabled={actionLoading}>
                      <i className="bi bi-x-circle me-1"></i> Cancelar Pedido
                    </button>
                  )}

                  {isSeller && order.status === 'pagado' && (
                    <>
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => handleCambiarEstado('enviado')} disabled={actionLoading}>
                        <i className="bi bi-truck me-1"></i> Marcar enviado
                      </button>
                      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => handleCambiarEstado('listo_retiro')} disabled={actionLoading}>
                        <i className="bi bi-geo-alt me-1"></i> Listo para retiro
                      </button>
                    </>
                  )}

                  {isSeller && ['enviado', 'listo_retiro'].includes(order.status) && (
                    <button type="button" className="btn btn-success btn-sm" onClick={() => handleCambiarEstado('entregado')} disabled={actionLoading}>
                      <i className="bi bi-check-circle me-1"></i> Marcar entregado
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div className="d-flex flex-column gap-3">
                {/* Historial de Transacciones Registradas */}
                <div className="card border-0 shadow-sm p-3">
                  <h6 className="fw-bold text-dark mb-2">
                    <i className="bi bi-receipt-cutoff text-unab me-1"></i>
                    Transacciones Registradas
                  </h6>
                  {order.transactions && order.transactions.length > 0 ? (
                    order.transactions.map((trx) => (
                      <div key={trx.id} className="bg-light p-2 rounded small border mb-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-bold font-monospace">TRX-{trx.id}</span>
                          <span className={`badge ${trx.status === 'aprobada' ? 'bg-success' : 'bg-danger'}`}>
                            {trx.status}
                          </span>
                        </div>
                        <div className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                          Monto: ${Number(trx.amount || 0).toLocaleString('es-CL')} CLP | Método: {trx.method}
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="text-muted small">Sin transacciones registradas aún.</span>
                  )}
                </div>

                {/* Coordinación y Datos del Comprador */}
                {order.buyer && (
                  <div className="card border-0 shadow-sm p-3">
                    <h6 className="fw-bold text-dark mb-2">
                      <i className="bi bi-geo-alt-fill text-unab me-1"></i>
                      Coordinación de Entrega
                    </h6>
                    <div className="small text-muted">
                      <div className="mb-1"><strong>Comprador:</strong> {order.buyer.name}</div>
                      <div className="mb-1"><strong>Carrera:</strong> {order.buyer.career || 'No especificada'}</div>
                      <div className="mb-1"><strong>Campus:</strong> {order.buyer.campus || 'Campus UNAB'}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
