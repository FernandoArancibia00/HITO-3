import { Link, useNavigate } from 'react-router-dom';
import React from 'react';
import { useAuth } from '../../context/AuthContext';

// Opciones del menú del usuario (docs/navegacion.md, sección 3).
const USER_MENU = [
  { to: '/profile', icon: 'bi-person-circle', label: 'Perfil' },
  { to: '/my-products', icon: 'bi-box-seam', label: 'Mis publicaciones' },
  { to: '/orders', icon: 'bi-bag-check', label: 'Mis compras' },
  { to: '/sales', icon: 'bi-cash-coin', label: 'Mis ventas' },
  { to: '/messages', icon: 'bi-chat-dots', label: 'Mensajes' },
];

export default function Navbar({
  favCount = 0,
  cartCount = 0,
  onOpenFavorites,
  onOpenCart,
  onOpenCreateProduct,
  onOpenBookSearch
}) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Cerrar sesión: borra token y user, y vuelve al catálogo.
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-unab sticky-top">
      <div className="container-fluid px-3 px-lg-4">
        <Link to="/" className="navbar-brand d-flex align-items-center m-0 py-1">
          <img
            src="/assets/img/logo_marketplace_unab.png"
            alt="Marketplace UNAB"
            className="logo-unab-img"
            onError={(e) => {
              e.currentTarget.src = 'assets/img/logo_marketplace_unab.png';
            }}
          />
        </Link>

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

            {!isAuthenticated ? (
              <>
                <Link to="/login" className="btn btn-unab d-flex align-items-center gap-2 shadow-sm">
                  <i className="bi bi-box-arrow-in-right"></i>
                  <span>Iniciar sesión</span>
                </Link>
                <Link to="/register" className="btn btn-outline-unab d-flex align-items-center gap-2">
                  <i className="bi bi-person-plus"></i>
                  <span>Crear cuenta</span>
                </Link>
              </>
            ) : (
              <>
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

                {/* Menú del usuario (dropdown de Bootstrap, JS cargado en index.html) */}
                <div className="dropdown">
                  <button
                    type="button"
                    className="btn btn-outline-dark d-flex align-items-center gap-2 dropdown-toggle"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-person-circle"></i>
                    <span className="text-truncate" style={{ maxWidth: '10rem' }}>
                      {user?.name || 'Mi cuenta'}
                    </span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                    {user?.email && (
                      <>
                        <li><span className="dropdown-item-text small text-muted">{user.email}</span></li>
                        <li><hr className="dropdown-divider" /></li>
                      </>
                    )}
                    {USER_MENU.map((item) => (
                      <li key={item.to}>
                        <Link to={item.to} className="dropdown-item">
                          <i className={`bi ${item.icon} me-2`}></i>
                          {item.label}
                        </Link>
                      </li>
                    ))}
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button type="button" className="dropdown-item text-danger" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Cerrar sesión
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
