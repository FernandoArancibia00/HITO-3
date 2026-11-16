import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../services/orderService';
import { getStatusBadge } from './MyOrdersPage';

export default function MySalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('todas');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Cargar ventas del vendedor desde la API
  const cargarVentas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getMySales();
      setSales(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'No fue posible cargar tus ventas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarVentas();
  }, [cargarVentas]);

  const handleCambiarEstado = async (orderId, nuevoEstado) => {
    const confirmar = window.confirm(`¿Confirmas cambiar el estado del Pedido #${orderId} a "${nuevoEstado}"?`);
    if (!confirmar) return;

    setActionLoadingId(orderId);
    setActionError(null);
    setActionSuccess(null);
    try {
      const updatedSale = await orderService.updateOrderStatus(orderId, nuevoEstado);
      if (updatedSale?.status !== nuevoEstado) {
        throw new Error('El servidor no confirmó el cambio de estado.');
      }
      setSales((prev) => prev.map((sale) => (
        sale.id === orderId
          ? {
              ...sale,
              ...updatedSale,
              buyer: updatedSale.buyer ?? sale.buyer,
              items: updatedSale.items ?? sale.items,
            }
          : sale
      )));
      setActionSuccess(`El pedido #${orderId} ahora está "${nuevoEstado}".`);
    } catch (err) {
      setActionError(err?.message || 'Error al actualizar el estado de la venta.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Métricas para el vendedor
  const totalIngresos = sales
    .filter((s) => s.status !== 'cancelado')
    .reduce((acc, s) => acc + Number(s.total || 0), 0);

  const pendientesDespacho = sales.filter((s) => s.status === 'pagado').length;
  const entregadas = sales.filter((s) => s.status === 'entregado').length;

  const ventasFiltradas = sales.filter((s) => {
    if (filtro === 'todas') return true;
    if (filtro === 'pendientes') return s.status === 'pagado';
    if (filtro === 'en_camino') return ['enviado', 'listo_retiro'].includes(s.status);
    if (filtro === 'entregadas') return s.status === 'entregado';
    return true;
  });

  return (
    <div className="container py-4">
      {/* Encabezado */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
            <i className="bi bi-shop-window text-unab"></i>
            Mis Ventas (Panel del Vendedor)
          </h2>
          <p className="text-muted small m-0 mt-1">
            Administra los pedidos de tus compradores universitarios y actualiza los estados de despacho.
          </p>
        </div>

        <Link to="/my-products" className="btn btn-outline-unab btn-sm d-flex align-items-center gap-1">
          <i className="bi bi-box-seam"></i> Mis Publicaciones
        </Link>
      </div>

      {actionSuccess && (
        <div className="alert alert-success py-2" role="status">{actionSuccess}</div>
      )}
      {actionError && (
        <div className="alert alert-danger py-2" role="alert">{actionError}</div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm p-3 border-start border-4 border-danger">
            <span className="text-muted small fw-bold text-uppercase">Ingresos Totales</span>
            <div className="fs-4 fw-bold text-unab mt-1">
              ${totalIngresos.toLocaleString('es-CL')} CLP
            </div>
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>Ventas confirmadas</span>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm p-3 border-start border-4 border-primary">
            <span className="text-muted small fw-bold text-uppercase">Por Despachar</span>
            <div className="fs-4 fw-bold text-primary mt-1">
              {pendientesDespacho} {pendientesDespacho === 1 ? 'pedido' : 'pedidos'}
            </div>
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>Requieren tu gestión</span>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm p-3 border-start border-4 border-success">
            <span className="text-muted small fw-bold text-uppercase">Entregas Finalizadas</span>
            <div className="fs-4 fw-bold text-success mt-1">
              {entregadas} {entregadas === 1 ? 'pedido' : 'pedidos'}
            </div>
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>Completadas exitosamente</span>
          </div>
        </div>
      </div>

      {/* Estado de Carga */}
      {loading && (
        <div className="text-center py-5 my-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Cargando ventas...</span>
          </div>
          <p className="text-muted mt-2 small">Cargando tus ventas...</p>
        </div>
      )}

      {/* Estado de Error */}
      {!loading && error && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between py-3" role="alert">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
            <div>{error}</div>
          </div>
          <button type="button" className="btn btn-outline-danger btn-sm" onClick={cargarVentas}>
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
              className={`btn btn-sm ${filtro === 'todas' ? 'btn-unab' : 'btn-outline-secondary'}`}
              onClick={() => setFiltro('todas')}
            >
              Todas ({sales.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filtro === 'pendientes' ? 'btn-unab' : 'btn-outline-secondary'}`}
              onClick={() => setFiltro('pendientes')}
            >
              Por Despachar ({pendientesDespacho})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filtro === 'en_camino' ? 'btn-unab' : 'btn-outline-secondary'}`}
              onClick={() => setFiltro('en_camino')}
            >
              En Camino / Retiro ({sales.filter((s) => ['enviado', 'listo_retiro'].includes(s.status)).length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filtro === 'entregadas' ? 'btn-unab' : 'btn-outline-secondary'}`}
              onClick={() => setFiltro('entregadas')}
            >
              Entregadas ({entregadas})
            </button>
          </div>

          {/* Listado de Ventas o Estado Vacío */}
          {ventasFiltradas.length === 0 ? (
            <div className="card border-0 shadow-sm text-center py-5">
              <div className="card-body py-5">
                <i className="bi bi-inbox text-muted" style={{ fontSize: '4rem' }}></i>
                <h5 className="mt-3 fw-bold text-dark">No hay ventas en esta sección</h5>
                <p className="text-muted small mx-auto" style={{ maxWidth: '400px' }}>
                  Cuando otros alumnos compren los artículos que publicaste, los verás listados aquí para coordinar el retiro o despacho.
                </p>
                <Link to="/my-products" className="btn btn-outline-unab btn-sm mt-2">
                  Gestionar Mis Publicaciones
                </Link>
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {ventasFiltradas.map((sale) => {
                const fecha = new Date(sale.createdAt).toLocaleDateString('es-CL', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const itemsList = sale.items || [];
                const buyer = sale.buyer || {};

                return (
                  <div key={sale.id} className="card border-0 shadow-sm">
                    {/* Cabecera */}
                    <div className="card-header bg-white py-3 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
                      <div className="d-flex align-items-center gap-3">
                        <span className="fw-bold text-dark fs-5">Venta #{sale.id}</span>
                        <span className="text-muted small">
                          <i className="bi bi-clock me-1"></i>{fecha}
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        {getStatusBadge(sale.status)}
                        <span className="fw-bold text-unab fs-5">
                          ${Number(sale.total || 0).toLocaleString('es-CL')} CLP
                        </span>
                      </div>
                    </div>

                    {/* Contenido: Productos y Datos del Comprador */}
                    <div className="card-body p-3">
                      <div className="row g-3">
                        <div className="col-12 col-md-7 border-end-md">
                          <h6 className="text-muted small fw-bold text-uppercase mb-2">Artículos Vendidos</h6>
                          <div className="d-flex flex-column gap-2">
                            {itemsList.map((it) => {
                              const prod = it.product || {};
                              const titulo = prod.title || prod.nombre || 'Producto';
                              const imagen = prod.imageUrl || prod.imagen || 'https://placehold.co/100x100/ad0f0f/ffffff?text=UNAB';
                              const precioUnit = Number(it.unitPrice || prod.price || 0);

                              return (
                                <div key={it.id} className="d-flex align-items-center gap-3 bg-light p-2 rounded">
                                  <img
                                    src={imagen}
                                    alt={titulo}
                                    style={{ width: '44px', height: '44px', objectFit: 'contain' }}
                                    className="rounded bg-white p-1 border flex-shrink-0"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://placehold.co/100x100/ad0f0f/ffffff?text=UNAB';
                                    }}
                                  />
                                  <div className="flex-grow-1 min-w-0">
                                    <span className="fw-bold text-truncate d-block text-dark small" title={titulo}>
                                      {titulo}
                                    </span>
                                    <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
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

                        {/* Datos del Comprador para Entrega */}
                        <div className="col-12 col-md-5">
                          <h6 className="text-muted small fw-bold text-uppercase mb-2">Coordinación de Entrega</h6>
                          <div className="bg-light p-3 rounded small">
                            <div className="mb-1">
                              <i className="bi bi-person-fill text-muted me-1"></i>
                              <strong>Comprador:</strong> {buyer.name || 'Estudiante UNAB'}
                            </div>
                            <div className="mb-1">
                              <i className="bi bi-mortarboard text-muted me-1"></i>
                              <strong>Carrera:</strong> {buyer.career || 'No especificada'}
                            </div>
                            <div className="mb-1">
                              <i className="bi bi-geo-alt-fill text-muted me-1"></i>
                              <strong>Campus:</strong> {buyer.campus || 'Campus UNAB'}
                            </div>
                            {buyer.phone && (
                              <div>
                                <i className="bi bi-telephone-fill text-muted me-1"></i>
                                <strong>Teléfono:</strong> {buyer.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pie de tarjeta con acciones del vendedor */}
                    <div className="card-footer bg-white py-2 px-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
                      <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
                        <i className="bi bi-shield-check text-success me-1"></i>
                        Entrega física universitaria segura
                      </span>

                      <div className="d-flex align-items-center gap-2">
                        {sale.status === 'pagado' && (
                          <>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              disabled={actionLoadingId === sale.id}
                              onClick={() => handleCambiarEstado(sale.id, 'enviado')}
                            >
                              {actionLoadingId === sale.id ? (
                                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                              ) : (
                                <i className="bi bi-truck me-1"></i>
                              )}
                              Marcar como Enviado
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              disabled={actionLoadingId === sale.id}
                              onClick={() => handleCambiarEstado(sale.id, 'listo_retiro')}
                            >
                              <i className="bi bi-geo-alt me-1"></i> Listo para Retiro
                            </button>
                          </>
                        )}

                        {/* Acción si está en camino o listo para retiro */}
                        {['enviado', 'listo_retiro'].includes(sale.status) && (
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            disabled={actionLoadingId === sale.id}
                            onClick={() => handleCambiarEstado(sale.id, 'entregado')}
                          >
                            <i className="bi bi-check-circle me-1"></i> Confirmar Entrega
                          </button>
                        )}

                        {sale.status === 'entregado' && (
                          <span className="badge bg-success-subtle text-success border border-success-subtle py-2 px-3">
                            <i className="bi bi-check-all me-1"></i> Entrega Finalizada
                          </span>
                        )}

                        <Link to={`/orders/${sale.id}`} className="btn btn-outline-dark btn-sm">
                          <i className="bi bi-eye me-1"></i> Ver Detalle
                        </Link>
                      </div>
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
