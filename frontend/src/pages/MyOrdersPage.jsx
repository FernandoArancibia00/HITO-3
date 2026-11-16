import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../services/orderService';

export const getStatusBadge = (status) => {
  switch (status) {
    case 'pendiente':
      return <span className="badge bg-warning text-dark"><i className="bi bi-clock me-1"></i>Pendiente</span>;
    case 'pagado':
      return <span className="badge bg-primary"><i className="bi bi-credit-card me-1"></i>Pagado</span>;
    case 'enviado':
      return <span className="badge bg-info text-dark"><i className="bi bi-truck me-1"></i>En camino</span>;
    case 'listo_retiro':
      return <span className="badge bg-secondary"><i className="bi bi-geo-alt me-1"></i>Listo para retiro</span>;
    case 'entregado':
      return <span className="badge bg-success"><i className="bi bi-check-circle me-1"></i>Entregado</span>;
    case 'cancelado':
      return <span className="badge bg-danger"><i className="bi bi-x-circle me-1"></i>Cancelado</span>;
    default:
      return <span className="badge bg-light text-dark">{status}</span>;
  }
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Cargar pedidos desde la API
  const cargarPedidos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'No fue posible cargar tus pedidos. Asegúrate de tener la sesión iniciada.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  const handleCancelarPedido = async (orderId, statusActual) => {
    if (!['pendiente', 'pagado'].includes(statusActual)) {
      setActionError('No se puede cancelar un pedido que ya fue enviado o entregado.');
      return;
    }

    const confirmar = window.confirm(`¿Estás seguro de que deseas cancelar el Pedido #${orderId}?`);
    if (!confirmar) return;

    setActionLoadingId(orderId);
    setActionError(null);
    setActionSuccess(null);
    try {
      const updatedOrder = await orderService.updateOrderStatus(orderId, 'cancelado');
      if (updatedOrder?.status !== 'cancelado') {
        throw new Error('El servidor no confirmó la cancelación del pedido.');
      }
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, ...updatedOrder, status: updatedOrder.status } : order
        )
      );
      setActionSuccess(`El pedido #${orderId} fue cancelado.`);
    } catch (err) {
      setActionError(err?.message || 'Error al cancelar el pedido.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const ordersFiltradas = orders.filter((o) => {
    if (filtroEstado === 'todos') return true;
    if (filtroEstado === 'activos') return ['pendiente', 'pagado', 'enviado', 'listo_retiro'].includes(o.status);
    if (filtroEstado === 'entregados') return o.status === 'entregado';
    if (filtroEstado === 'cancelados') return o.status === 'cancelado';
    return true;
  });

  return (
    <div className="container py-4">
      {/* Encabezado */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
            <i className="bi bi-bag-check-fill text-unab"></i>
            Mis Compras
          </h2>
          <p className="text-muted small m-0 mt-1">
            Revisa el historial y estado de entrega de tus pedidos en el Marketplace UNAB.
          </p>
        </div>

        <Link to="/" className="btn btn-outline-unab btn-sm d-flex align-items-center gap-1">
          <i className="bi bi-shop"></i> Seguir Comprando
        </Link>
      </div>

      {loading && (
        <div className="text-center py-5 my-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Cargando pedidos...</span>
          </div>
          <p className="text-muted mt-2 small">Cargando tus compras...</p>
        </div>
      )}

      {actionSuccess && (
        <div className="alert alert-success py-2" role="status">{actionSuccess}</div>
      )}
      {actionError && (
        <div className="alert alert-danger py-2" role="alert">{actionError}</div>
      )}

      {!loading && error && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between py-3" role="alert">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
            <div>{error}</div>
          </div>
          <button type="button" className="btn btn-outline-danger btn-sm" onClick={cargarPedidos}>
            <i className="bi bi-arrow-clockwise me-1"></i> Reintentar
          </button>
        </div>
      )}

      {/* Contenido Principal */}
      {!loading && !error && (
        <>
          <div className="d-flex gap-2 mb-4 overflow-auto pb-2">
            <button
              type="button"
              className={`btn btn-sm ${filtroEstado === 'todos' ? 'btn-unab' : 'btn-outline-secondary'}`}
              onClick={() => setFiltroEstado('todos')}
            >
              Todos ({orders.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filtroEstado === 'activos' ? 'btn-unab' : 'btn-outline-secondary'}`}
              onClick={() => setFiltroEstado('activos')}
            >
              En Curso ({orders.filter((o) => ['pendiente', 'pagado', 'enviado', 'listo_retiro'].includes(o.status)).length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filtroEstado === 'entregados' ? 'btn-unab' : 'btn-outline-secondary'}`}
              onClick={() => setFiltroEstado('entregados')}
            >
              Entregados ({orders.filter((o) => o.status === 'entregado').length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filtroEstado === 'cancelados' ? 'btn-unab' : 'btn-outline-secondary'}`}
              onClick={() => setFiltroEstado('cancelados')}
            >
              Cancelados ({orders.filter((o) => o.status === 'cancelado').length})
            </button>
          </div>

          {/* Listado de Pedidos o Estado Vacío */}
          {ordersFiltradas.length === 0 ? (
            <div className="card border-0 shadow-sm text-center py-5">
              <div className="card-body py-5">
                <i className="bi bi-receipt text-muted" style={{ fontSize: '4rem' }}></i>
                <h5 className="mt-3 fw-bold text-dark">No tienes compras registradas</h5>
                <p className="text-muted small mx-auto" style={{ maxWidth: '400px' }}>
                  Cuando compres libros o artículos en el campus, podrás seguir el estado de tus envíos aquí.
                </p>
                <Link to="/" className="btn btn-outline-unab btn-sm mt-2">
                  Ver Catálogo de Productos
                </Link>
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {ordersFiltradas.map((order) => {
                const fecha = new Date(order.createdAt).toLocaleDateString('es-CL', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const puedeCancelar = ['pendiente', 'pagado'].includes(order.status);
                const itemsList = order.items || [];

                return (
                  <div key={order.id} className="card border-0 shadow-sm">
                    <div className="card-header bg-white py-3 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
                      <div className="d-flex align-items-center gap-3">
                        <span className="fw-bold text-dark fs-5">Pedido #{order.id}</span>
                        <span className="text-muted small">
                          <i className="bi bi-calendar3 me-1"></i>{fecha}
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        {getStatusBadge(order.status)}
                        <span className="fw-bold text-unab fs-5">
                          ${Number(order.total || 0).toLocaleString('es-CL')} CLP
                        </span>
                      </div>
                    </div>

                    {/* Artículos del pedido */}
                    <div className="card-body p-3">
                      <div className="d-flex flex-column gap-2">
                        {itemsList.map((it) => {
                          const prod = it.product || {};
                          const titulo = prod.title || prod.nombre || 'Producto';
                          const imagen = prod.imageUrl || prod.imagen || 'https://placehold.co/100x100/ad0f0f/ffffff?text=UNAB';
                          const precioUnit = Number(it.unitPrice || prod.price || 0);

                          return (
                            <div key={it.id} className="d-flex align-items-center gap-3 py-1">
                              <img
                                src={imagen}
                                alt={titulo}
                                style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                                className="rounded bg-light p-1 border flex-shrink-0"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://placehold.co/100x100/ad0f0f/ffffff?text=UNAB';
                                }}
                              />
                              <div className="flex-grow-1 min-w-0">
                                <h6 className="mb-0 text-truncate text-dark small fw-bold" title={titulo}>
                                  {titulo}
                                </h6>
                                <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
                                  Cantidad: {it.quantity} x ${precioUnit.toLocaleString('es-CL')} CLP
                                </span>
                              </div>
                              <div className="fw-bold small text-dark">
                                ${(it.quantity * precioUnit).toLocaleString('es-CL')} CLP
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="card-footer bg-light py-2 px-3 d-flex justify-content-end align-items-center gap-2">
                      {puedeCancelar && (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          disabled={actionLoadingId === order.id}
                          onClick={() => handleCancelarPedido(order.id, order.status)}
                        >
                          {actionLoadingId === order.id ? (
                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                          ) : (
                            <i className="bi bi-x-circle me-1"></i>
                          )}
                          Cancelar Pedido
                        </button>
                      )}

                      <Link to={`/orders/${order.id}`} className="btn btn-unab btn-sm">
                        <i className="bi bi-eye me-1"></i> Ver Detalle y Seguimiento
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
