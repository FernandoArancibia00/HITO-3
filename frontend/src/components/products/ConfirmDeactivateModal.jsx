import React from 'react';

// Modal de confirmación (Bootstrap) para desactivar una publicación propia.
// Se muestra mientras `product` no sea null.
export default function ConfirmDeactivateModal({ product, loading = false, error = null, onConfirm, onCancel }) {
  if (!product) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1070 }} onClick={loading ? undefined : onCancel}></div>

      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modalDesactivarTitulo"
        style={{ zIndex: 1075 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header">
              <h5 className="modal-title fw-bold" id="modalDesactivarTitulo">
                <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
                Desactivar publicación
              </h5>
              <button type="button" className="btn-close" aria-label="Cerrar" onClick={onCancel} disabled={loading}></button>
            </div>

            <div className="modal-body">
              <p className="mb-2">
                ¿Deseas desactivar <strong>"{product.title}"</strong>?
              </p>
              <p className="small text-muted mb-0">
                Dejará de aparecer en el catálogo, pero se conserva en los pedidos anteriores.
              </p>
              {error && (
                <div className="alert alert-danger py-2 small mt-3 mb-0" role="alert">
                  {error}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={loading}>
                Cancelar
              </button>
              <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Desactivando...
                  </>
                ) : (
                  'Sí, desactivar'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
