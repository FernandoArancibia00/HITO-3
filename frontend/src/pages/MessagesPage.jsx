import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import conversationService from '../services/conversationService';

export default function MessagesPage() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await conversationService.getMyConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar tus conversaciones.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <i className="bi bi-chat-dots-fill text-primary me-2"></i>
            Mis Mensajes
          </h2>
          <p className="text-muted mb-0">
            Conversaciones con compradores y vendedores del Marketplace UNAB
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={loadConversations}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Actualizar
          </button>
          <Link to="/" className="btn btn-outline-primary btn-sm">
            <i className="bi bi-shop me-1"></i>
            Ir al catálogo
          </Link>
        </div>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando conversaciones...</span>
          </div>
          <p className="text-muted mt-2 mb-0">Cargando tus conversaciones...</p>
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
          <div>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
          <button
            type="button"
            className="btn btn-sm btn-danger"
            onClick={loadConversations}
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && conversations.length === 0 && (
        <div className="card border-0 shadow-sm text-center py-5">
          <div className="card-body">
            <i className="bi bi-chat-square-text display-4 text-muted mb-3 d-block"></i>
            <h5 className="fw-semibold">Aún no tienes conversaciones</h5>
            <p className="text-muted mb-3">
              Cuando contactes a un vendedor desde un producto o alguien te escriba, aparecerá aquí.
            </p>
            <Link to="/" className="btn btn-primary">
              Explorar productos
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && conversations.length > 0 && (
        <div className="list-group shadow-sm">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              type="button"
              onClick={() => navigate(`/messages/${conv.id}`)}
              className="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3"
            >
              <div className="d-flex align-items-center gap-3 overflow-hidden">
                <img
                  src={
                    conv.product?.imageUrl ||
                    'https://placehold.co/64x64?text=UNAB'
                  }
                  alt={conv.product?.title || 'Producto'}
                  className="rounded border flex-shrink-0"
                  style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                />
                <div className="text-start overflow-hidden">
                  <div className="d-flex align-items-center gap-2">
                    <h6 className="mb-0 fw-bold text-truncate">
                      {conv.product?.title || 'Producto'}
                    </h6>
                    {conv.unreadCount > 0 && (
                      <span className="badge rounded-pill bg-danger">
                        {conv.unreadCount} nuevo{conv.unreadCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="small text-secondary fw-medium">
                    <i className="bi bi-person-circle me-1"></i>
                    {conv.otherUser?.name || 'Usuario UNAB'}
                  </div>
                  <p className="mb-0 small text-muted text-truncate">
                    {conv.lastMessage || 'Conversación iniciada — escribe el primer mensaje'}
                  </p>
                </div>
              </div>

              <div className="text-end ms-3 flex-shrink-0">
                <div className="small text-muted mb-1">
                  {formatDate(conv.lastMessageAt)}
                </div>
                <span className="btn btn-sm btn-outline-primary">
                  Abrir chat <i className="bi bi-chevron-right"></i>
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
