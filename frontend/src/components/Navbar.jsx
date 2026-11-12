import React from 'react';

export default function Navbar({
  favCount = 0,
  cartCount = 0,
  onOpenFavorites,
  onOpenCart,
  onOpenCreateProduct,
  onOpenBookSearch
}) {
  return (
    <nav className="navbar navbar-expand-lg navbar-unab sticky-top">
      <div className="container-fluid px-3 px-lg-4">
        <div className="navbar-brand d-flex align-items-center m-0 py-1" style={{ cursor: 'pointer' }}>
          <img
            src="/assets/img/logo_marketplace_unab.png"
            alt="Marketplace UNAB"
            className="logo-unab-img"
            onError={(e) => {
              e.currentTarget.src = 'assets/img/logo_marketplace_unab.png';
            }}
          />
        </div>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContenido"
          aria-controls="navbarContenido"
          aria-expanded="false"
          aria-label="Alternar navegación"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse mt-3 mt-lg-0" id="navbarContenido">
          <div className="ms-auto d-flex flex-wrap align-items-center gap-2 gap-md-3">
            <button
              type="button"
              className="btn btn-outline-unab d-flex align-items-center gap-2"
              onClick={onOpenBookSearch}
              title="Buscar libros en Open Library y autocompletar publicaciones"
            >
              <i className="bi bi-book-half"></i>
              <span className="d-none d-sm-inline">Buscar Libros (API)</span>
              <span className="d-inline d-sm-none">Libros API</span>
            </button>

            <button
              type="button"
              className="btn btn-unab d-flex align-items-center gap-2 shadow-sm"
              onClick={onOpenCreateProduct}
            >
              <i className="bi bi-plus-circle-fill"></i>
              <span>+ Publicar Producto</span>
            </button>

            <button
              type="button"
              className="nav-action-btn position-relative"
              onClick={onOpenFavorites}
              aria-label="Ver favoritos"
              title="Ver mis publicaciones favoritas"
            >
              <i className="bi bi-heart-fill text-danger fs-5"></i>
              <span className="d-none d-md-inline">Favoritos</span>
              {favCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white">
                  {favCount}
                  <span className="visually-hidden">productos en favoritos</span>
                </span>
              )}
            </button>

            <button
              type="button"
              className="nav-action-btn position-relative"
              onClick={onOpenCart}
              aria-label="Ver carrito de compras"
              title="Ver carrito de compras"
            >
              <i className="bi bi-cart3 text-primary fs-5"></i>
              <span className="d-none d-md-inline">Carrito</span>
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white">
                  {cartCount}
                  <span className="visually-hidden">productos en carrito</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
