import React from 'react';

// Opción fija "Todas": slug vacío = no se envía el query param `category`.
const ALL_CATEGORIES = { slug: '', name: 'Todas las Categorías', icon: 'grid-fill' };

const CONDITION_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'usado', label: 'Usado' },
];

export default function Sidebar({
  searchTerm,
  setSearchTerm,
  selectedCategoria,
  setSelectedCategoria,
  precioMin,
  setPrecioMin,
  precioMax,
  setPrecioMax,
  condicion,
  setCondicion,
  onLimpiarFiltros,
  categorias = [],
  categoriasLoading = false,
  categoriasError = null,
  onReintentarCategorias,
  totalResultados = 0
}) {
  return (
    <aside className="sidebar-sticky mb-4">
      <div className="filter-card">
        <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
          <h5 className="m-0 fw-bold d-flex align-items-center gap-2">
            <i className="bi bi-funnel-fill text-unab"></i>
            <span>Filtros</span>
          </h5>
          <span className="badge bg-light text-dark border">
            {totalResultados} {totalResultados === 1 ? 'producto' : 'productos'}
          </span>
        </div>

        <div className="mb-3">
          <label htmlFor="inputSearch" className="form-label small fw-bold text-muted text-uppercase mb-1">
            Palabra clave
          </label>
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0 text-muted">
              <i className="bi bi-search"></i>
            </span>
            <input
              id="inputSearch"
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder="Buscar por título, descripción o vendedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="btn btn-outline-secondary border-start-0"
                type="button"
                onClick={() => setSearchTerm('')}
                title="Borrar texto"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label small fw-bold text-muted text-uppercase mb-1">
            Rango de Precio ($ CLP)
          </label>
          <div className="row g-2">
            <div className="col-6">
              <div className="input-group input-group-sm">
                <span className="input-group-text">$</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  className="form-control"
                  placeholder="Mínimo"
                  value={precioMin}
                  onChange={(e) => setPrecioMin(e.target.value)}
                  aria-label="Precio mínimo"
                />
              </div>
            </div>
            <div className="col-6">
              <div className="input-group input-group-sm">
                <span className="input-group-text">$</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  className="form-control"
                  placeholder="Máximo"
                  value={precioMax}
                  onChange={(e) => setPrecioMax(e.target.value)}
                  aria-label="Precio máximo"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label small fw-bold text-muted text-uppercase mb-1">
            Condición
          </label>
          <div className="btn-group btn-group-sm w-100" role="group" aria-label="Filtrar por condición">
            {CONDITION_OPTIONS.map((opt) => (
              <button
                key={opt.value || 'todas'}
                type="button"
                className={`btn ${condicion === opt.value ? 'btn-unab' : 'btn-outline-secondary'}`}
                onClick={() => setCondicion(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label small fw-bold text-muted text-uppercase mb-2">
            Categorías
          </label>

          {categoriasLoading && (
            <div className="small text-muted d-flex align-items-center gap-2 mb-2">
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Cargando categorías...
            </div>
          )}

          {categoriasError && (
            <div className="alert alert-warning py-2 px-2 small mb-2">
              {categoriasError}
              {onReintentarCategorias && (
                <button type="button" className="btn btn-link btn-sm p-0 ms-1 align-baseline" onClick={onReintentarCategorias}>
                  Reintentar
                </button>
              )}
            </div>
          )}

          <div className="category-list">
            {[ALL_CATEGORIES, ...categorias].map((cat) => {
              const isActive = selectedCategoria === cat.slug;
              return (
                <button
                  key={cat.slug || 'todas'}
                  type="button"
                  className={`category-filter-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedCategoria(cat.slug)}
                >
                  <span className="d-flex align-items-center gap-2">
                    {cat.icon && <i className={`bi bi-${cat.icon}`}></i>}
                    <span>{cat.name}</span>
                  </span>
                  {isActive && <i className="bi bi-check2"></i>}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
          onClick={onLimpiarFiltros}
        >
          <i className="bi bi-arrow-counterclockwise"></i>
          <span>Limpiar Filtros</span>
        </button>
      </div>
    </aside>
  );
}
