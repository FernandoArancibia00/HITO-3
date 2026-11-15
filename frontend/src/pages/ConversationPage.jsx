import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import conversationService from '../services/conversationService';

export default function ConversationPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const currentUserId = Number(user?.id ?? user?.sub ?? 1);

  const fetchMessages = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
      }
      try {
        const data = await conversationService.getMessages(id);
        setConversation(data);
        setError(null);
      } catch (err) {
        if (!silent) {
          setError(err?.message || 'No se pudo cargar la conversación.');
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [id]
  );

  // Carga inicial y refresco cada 5 segundos (polling con setInterval)
  useEffect(() => {
    fetchMessages(false);
    const intervalId = setInterval(() => {
      fetchMessages(true);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [fetchMessages]);

  // Auto-scroll al último mensaje cuando llegan mensajes nuevos
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages?.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 1000 || sending) return;

    setSending(true);
    setError(null);
    try {
      const newMessage = await conversationService.sendMessage(id, trimmed);
      setText('');
      setConversation((prev) =>
        prev
          ? {
              ...prev,
              messages: [...(prev.messages || []), newMessage],
            }
          : prev
      );
    } catch (err) {
      setError(err?.message || 'No se pudo enviar el mensaje.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const messages = conversation?.messages || [];

  return (
    <div className="container py-4" style={{ maxWidth: '820px' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2">
          <Link to="/messages" className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-arrow-left me-1"></i>
            Volver a Mensajes
          </Link>
          <h4 className="fw-bold mb-0 ms-2">
            Conversación
            {conversation?.productId && (
              <span className="badge bg-light text-dark border ms-2 fw-normal fs-6">
                Producto #{conversation.productId}
              </span>
            )}
          </h4>
        </div>
        {conversation?.productId && (
          <Link
            to={`/products/${conversation.productId}`}
            className="btn btn-outline-primary btn-sm"
          >
            <i className="bi bi-box-arrow-up-right me-1"></i>
            Ver producto
          </Link>
        )}
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando mensajes...</span>
          </div>
          <p className="text-muted mt-2 mb-0">Cargando mensajes...</p>
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
            onClick={() => fetchMessages(false)}
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && conversation && (
        <div className="card shadow-sm border-0">
          <div
            className="card-body bg-light overflow-auto p-3"
            style={{ height: '440px' }}
          >
            {messages.length === 0 ? (
              <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                <i className="bi bi-chat-heart display-5 mb-2"></i>
                <p className="mb-0">
                  No hay mensajes todavía. ¡Envía el primero para coordinar!
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMine = Number(msg.senderId) === currentUserId;
                return (
                  <div
                    key={`${msg.sentAt || idx}-${idx}`}
                    className={`d-flex mb-3 ${
                      isMine ? 'justify-content-end' : 'justify-content-start'
                    }`}
                  >
                    <div
                      className={`p-3 rounded-3 shadow-sm ${
                        isMine
                          ? 'bg-primary text-white'
                          : 'bg-white text-dark border'
                      }`}
                      style={{ maxWidth: '75%' }}
                    >
                      <div className="mb-1" style={{ whiteSpace: 'pre-wrap' }}>
                        {msg.text}
                      </div>
                      <div
                        className={`small d-flex align-items-center justify-content-end gap-1 ${
                          isMine ? 'text-white-50' : 'text-muted'
                        }`}
                        style={{ fontSize: '0.75rem' }}
                      >
                        <span>{formatTime(msg.sentAt)}</span>
                        {isMine && (
                          <i
                            className={`bi ${
                              msg.read ? 'bi-check2-all' : 'bi-check2'
                            }`}
                            title={msg.read ? 'Leído' : 'Enviado'}
                          ></i>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="card-footer bg-white p-3">
            <form onSubmit={handleSend} className="d-flex gap-2">
              <input
                type="text"
                className="form-control"
                placeholder="Escribe un mensaje al vendedor/comprador (máx. 1000 caracteres)..."
                value={text}
                maxLength={1000}
                onChange={(e) => setText(e.target.value)}
                disabled={sending}
              />
              <button
                type="submit"
                className="btn btn-primary px-4 flex-shrink-0"
                disabled={sending || !text.trim()}
              >
                {sending ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-1"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Enviando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send-fill me-1"></i>
                    Enviar
                  </>
                )}
              </button>
            </form>
            <div className="d-flex justify-content-between mt-1 small text-muted">
              <span>
                <i className="bi bi-arrow-repeat me-1"></i>
                Actualización automática cada 5 segundos
              </span>
              <span>{text.length}/1000</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
