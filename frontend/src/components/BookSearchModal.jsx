import React, { useState, useEffect } from 'react';
import { searchOpenLibraryBooks } from '../services/openLibraryApi';

export default function BookSearchModal({
  isOpen = false,
  onClose,
  onSelectBook
}) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();

    if (!query.trim()) {
      setError('Por favor escribe un título, autor o tema a buscar.');
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const books = await searchOpenLibraryBooks(query);
      setResults(books);
    } catch (err) {
      setError(err.message || 'Ocurrió un error al buscar en Open Library.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (sugerencia) => {
    setQuery(sugerencia);
    setLoading(true);
    setError(null);
    setHasSearched(true);

    searchOpenLibraryBooks(sugerencia)
      .then((books) => {
        setResults(books);
      })
      .catch((err) => {
        setError(err.message || 'Error en la búsqueda');
        setResults([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSelectBookItem = (book) => {
    const datosLibro = {
      nombre: `Libro: ${book.titulo}`,
      descripcion: `Libro universitario "${book.titulo}", escrito por ${book.autor} (${book.anio}). En excelente estado para ramos de pregrado.`,
      imagen: book.imagen,
      categoria: 'libros'
    };

    onSelectBook(datosLibro);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1060 }}
        onClick={onClose}
      ></div>

      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modalBookSearchTitulo"
        style={{ zIndex: 1065 }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content shadow-lg border-0">
            <div className="modal-header modal-header-unab d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-book-half fs-4 text-unab"></i>
                <h5 className="modal-title modal-title-unab m-0" id="modalBookSearchTitulo">
                  Búsqueda Bibliográfica (Open Library API)
                </h5>
              </div>
              <button
                type="button"
                className="btn-close"
                aria-label="Cerrar modal"
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body p-4">
              <p className="text-muted small mb-3">
                Busca cualquier texto de estudio en la base de datos de <strong>Open Library</strong> y haz clic en <em>"Usar Datos para Publicar"</em> para autocompletar automáticamente el formulario de publicación.
              </p>

              <form onSubmit={handleSearch} className="mb-3">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search text-unab"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Ej: Calculus Stewart, Biology Campbell, Física Tipler, Clean Code..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="btn btn-unab d-flex align-items-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span>Buscando...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-search"></i>
                        <span>Buscar</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="d-flex flex-wrap align-items-center gap-1 mb-4">
                <span className="small text-muted me-1">Sugerencias rápidas:</span>
                {['Calculus Stewart', 'Campbell Biology', 'Física Universitaria', 'Data Structures'].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    className="btn btn-light btn-sm text-secondary border px-2 py-0"
                    style={{ fontSize: '0.78rem' }}
                    onClick={() => handleQuickSearch(sug)}
                  >
                    {sug}
                  </button>
                ))}
              </div>

              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert">
                  <i className="bi bi-exclamation-octagon-fill fs-5"></i>
                  <div>{error}</div>
                </div>
              )}

              {loading && (
                <div className="text-center py-5">
                  <div className="spinner-border text-danger" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <div className="mt-3 text-muted fw-bold">Consultando Open Library API...</div>
                  <small className="text-muted">Extrayendo carátulas y metadatos de libros</small>
                </div>
              )}

              {!loading && hasSearched && results.length === 0 && !error && (
                <div className="text-center py-4">
                  <i className="bi bi-journal-x text-muted" style={{ fontSize: '3rem' }}></i>
                  <h6 className="mt-3 text-dark fw-bold">No se encontraron libros para "{query}"</h6>
                  <p className="text-muted small">Intenta buscar con otro término, en inglés o por nombre de autor.</p>
                </div>
              )}

              {!loading && results.length > 0 && (
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex justify-content-between align-items-center small text-muted border-bottom pb-2">
                    <span>Resultados obtenidos de Open Library ({results.length}):</span>
                    <span>Elige uno para autocompletar</span>
                  </div>

                  {results.map((libro) => (
                    <div key={libro.id} className="book-result-card d-flex flex-column flex-sm-row align-items-center gap-3">
                      <img
                        src={libro.imagen}
                        alt={libro.titulo}
                        className="book-cover-thumb"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/100x140/ad0f0f/ffffff?text=Libro';
                        }}
                      />

                      <div className="flex-grow-1 text-center text-sm-start">
                        <h6 className="fw-bold mb-1 text-dark">{libro.titulo}</h6>
                        <div className="text-muted small mb-1">
                          <i className="bi bi-person-fill me-1"></i>
                          <strong>Autor:</strong> {libro.autor}
                        </div>
                        <div className="text-muted small">
                          <i className="bi bi-calendar-event me-1"></i>
                          <strong>1ª Publicación:</strong> {libro.anio}
                        </div>
                      </div>

                      <div className="w-100 w-sm-auto text-center">
                        <button
                          type="button"
                          className="btn btn-unab btn-sm w-100 w-sm-auto d-flex align-items-center justify-content-center gap-2 text-nowrap px-3 py-2 shadow-sm"
                          onClick={() => handleSelectBookItem(libro)}
                        >
                          <i className="bi bi-arrow-right-circle-fill"></i>
                          <span>Usar Datos para Publicar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer bg-light border-top">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
