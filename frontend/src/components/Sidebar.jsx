import React from 'react';

export default function Sidebar({
  searchTerm,
  setSearchTerm,
  selectedCategoria,
  setSelectedCategoria,
  precioMin,
  setPrecioMin,
  precioMax,
  setPrecioMax,
  onLimpiarFiltros,
  categorias = [],
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
              placeholder="Buscar por nombre, autor, descripción..."
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

        <div className="mb-4">
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
          <label className="form-label small fw-bold text-muted text-uppercase mb-2">
            Categorías
          </label>
          <div className="category-list">
            {categorias.map((cat) => {
              const isActive = selectedCategoria === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-filter-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedCategoria(cat.id)}
                >
                  <span className="d-flex align-items-center gap-2">
                    {cat.icono && <i className={`bi bi-${cat.icono}`}></i>}
                    <span>{cat.nombre}</span>
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
