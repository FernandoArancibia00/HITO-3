import React, { useState, useEffect, useMemo } from 'react';
import initialProducts from './data/products.json';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import ProductFormModal from './components/ProductFormModal';
import CartOffcanvas from './components/CartOffcanvas';
import FavoritesOffcanvas from './components/FavoritesOffcanvas';
import BookSearchModal from './components/BookSearchModal';
import './styles/styles.css';

// Lista dinámica de categorías para el Sidebar y Formulario
const CATEGORIAS = [
  { id: 'todas', nombre: 'Todas las Categorías', icono: 'grid-fill' },
  { id: 'libros', nombre: 'Apuntes y Libros Físicos', icono: 'book' },
  { id: 'tecnologia', nombre: 'Tecnología y Accesorios', icono: 'laptop' },
  { id: 'deportes', nombre: 'Deportes y Vida Sana', icono: 'trophy' },
  { id: 'utiles', nombre: 'Útiles y Papelería', icono: 'pencil-square' },
  { id: 'hogar', nombre: 'Artículos para el Hogar/Pieza', icono: 'house-door' },
  { id: 'snacks', nombre: 'Snacks y Colaciones', icono: 'cup-hot' }
];

export default function App() {
  // =========================================================
  // 1. ESTADOS PRINCIPALES Y SINCRONIZACIÓN CON LOCALSTORAGE
  // =========================================================

  // Catálogo de productos (iniciado con products.json y persistido opcionalmente en localStorage)
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('unab_marketplace_products');
      if (!saved) return initialProducts;
      const parsed = JSON.parse(saved);
      // Mantiene consistencia de imágenes base actualizadas desde products.json
      return parsed.map((item) => {
        const base = initialProducts.find((p) => p.id === item.id);
        return base ? { ...item, imagen: base.imagen } : item;
      });
    } catch (e) {
      console.error('Error al cargar productos desde localStorage:', e);
      return initialProducts;
    }
  });

  // Carrito de compras
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('unab_marketplace_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Lista de favoritos
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('unab_marketplace_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Guardar en localStorage cuando cambian los estados
  useEffect(() => {
    try {
      localStorage.setItem('unab_marketplace_products', JSON.stringify(products));
    } catch (e) {
      console.warn('No se pudo guardar productos en localStorage', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('unab_marketplace_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('No se pudo guardar carrito en localStorage', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('unab_marketplace_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.warn('No se pudo guardar favoritos en localStorage', e);
    }
  }, [favorites]);

  // =========================================================
  // 2. ESTADOS DE FILTROS Y BÚSQUEDA
  // =========================================================
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('todas');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');

  // =========================================================
  // 3. ESTADOS DE MODALES Y PANELES OFFCANVAS
  // =========================================================
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isBookSearchModalOpen, setIsBookSearchModalOpen] = useState(false);
  const [importedBookData, setImportedBookData] = useState(null);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  // Alerta temporal de notificación
  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (mensaje) => {
    setToastMessage(mensaje);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // =========================================================
  // 4. LÓGICA DE FILTRADO DERIVADO
  // =========================================================
  const productosFiltrados = useMemo(() => {
    return products.filter((prod) => {
      // 1. Filtro por término de búsqueda (nombre, descripción o vendedor)
      const busqueda = searchTerm.toLowerCase().trim();
      const matchBusqueda =
        !busqueda ||
        prod.nombre.toLowerCase().includes(busqueda) ||
        prod.descripcion.toLowerCase().includes(busqueda) ||
        prod.vendedor.toLowerCase().includes(busqueda);

      // 2. Filtro por categoría seleccionada
      const matchCategoria =
        selectedCategoria === 'todas' ||
        prod.categoria.toLowerCase() === selectedCategoria.toLowerCase();

      // 3. Filtro por precio mínimo
      const min = precioMin !== '' ? Number(precioMin) : 0;
      const matchMin = isNaN(min) || prod.precio >= min;

      // 4. Filtro por precio máximo
      const max = precioMax !== '' ? Number(precioMax) : Infinity;
      const matchMax = isNaN(max) || prod.precio <= max;

      return matchBusqueda && matchCategoria && matchMin && matchMax;
    });
  }, [products, searchTerm, selectedCategoria, precioMin, precioMax]);

  // Handler para reiniciar todos los filtros
  const handleLimpiarFiltros = () => {
    setSearchTerm('');
    setSelectedCategoria('todas');
    setPrecioMin('');
    setPrecioMax('');
  };

  // =========================================================
  // 5. HANDLERS DE PRODUCTOS
  // =========================================================

  // Ver detalles
  const handleVerDetalles = (producto) => {
    setSelectedProductForDetail(producto);
    setIsDetailModalOpen(true);
  };

  // Agregar nueva publicación
  const handleAgregarProducto = (nuevoProducto) => {
    setProducts((prev) => [nuevoProducto, ...prev]);
    setImportedBookData(null);
    triggerToast(`¡"${nuevoProducto.nombre}" fue publicado con éxito!`);
  };

  // Eliminar publicación del catálogo
  const handleEliminarProducto = (id) => {
    const productoAEliminar = products.find((p) => p.id === id);
    const confirmacion = window.confirm(
      `¿Deseas eliminar la publicación "${productoAEliminar ? productoAEliminar.nombre : 'este producto'}"?`
    );

    if (confirmacion) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      // También lo removemos de carrito y favoritos si existía
      setCart((prev) => prev.filter((p) => p.id !== id));
      setFavorites((prev) => prev.filter((p) => p.id !== id));

      if (selectedProductForDetail && selectedProductForDetail.id === id) {
        setIsDetailModalOpen(false);
        setSelectedProductForDetail(null);
      }
      triggerToast('Publicación eliminada correctamente.');
    }
  };

  // =========================================================
  // 6. HANDLERS DE CARRITO DE COMPRAS
  // =========================================================
  const handleAgregarAlCarrito = (producto) => {
    const yaEsta = cart.some((item) => item.id === producto.id);
    if (yaEsta) {
      triggerToast('El producto ya se encuentra en tu carrito de compras.');
      setIsCartOpen(true);
      return;
    }

    setCart((prev) => [...prev, producto]);
    triggerToast(`"${producto.nombre}" agregado al carrito.`);
  };

  const handleEliminarDelCarrito = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleVaciarCarrito = () => {
    if (window.confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
      setCart([]);
      triggerToast('Carrito vaciado.');
    }
  };

  // =========================================================
  // 7. HANDLERS DE FAVORITOS
  // =========================================================
  const handleToggleFavorito = (producto) => {
    const yaEsFavorito = favorites.some((f) => f.id === producto.id);

    if (yaEsFavorito) {
      setFavorites((prev) => prev.filter((f) => f.id !== producto.id));
      triggerToast(`"${producto.nombre}" eliminado de favoritos.`);
    } else {
      setFavorites((prev) => [...prev, producto]);
      triggerToast(`"${producto.nombre}" añadido a tus favoritos ❤️.`);
    }
  };

  const handleEliminarFavorito = (id) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  const handleMoverFavoritoAlCarrito = (producto) => {
    handleAgregarAlCarrito(producto);
  };

  // =========================================================
  // 8. HANDLERS DE OPEN LIBRARY API E IMPORTACIÓN
  // =========================================================
  const handleSelectBook = (bookData) => {
    // Al seleccionar el libro en el modal de búsqueda, alimentamos el formulario
    setImportedBookData(bookData);
    setIsBookSearchModalOpen(false);
    setIsFormModalOpen(true);
    triggerToast(`Datos de "${bookData.nombre}" importados al formulario.`);
  };

  // Array de IDs en carrito para verificar estados rápidos
  const cartIds = useMemo(() => cart.map((item) => item.id), [cart]);

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* 1. NAVBAR SUPERIOR */}
      <Navbar
        favCount={favorites.length}
        cartCount={cart.length}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCreateProduct={() => {
          setImportedBookData(null);
          setIsFormModalOpen(true);
        }}
        onOpenBookSearch={() => setIsBookSearchModalOpen(true)}
      />

      {/* Notificación Flotante (Toast) */}
      {toastMessage && (
        <div
          className="position-fixed bottom-0 end-0 p-3"
          style={{ zIndex: 1090 }}
        >
          <div className="toast show align-items-center text-white bg-dark border-0 shadow-lg" role="alert">
            <div className="d-flex">
              <div className="toast-body d-flex align-items-center gap-2">
                <i className="bi bi-info-circle-fill text-unab"></i>
                <span>{toastMessage}</span>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => setToastMessage(null)}
                aria-label="Cerrar notificación"
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* 2. HERO / BANNER PRINCIPAL */}
      <header className="bg-white border-bottom py-4 mb-4">
        <div className="container-fluid px-3 px-lg-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h1 className="h3 fw-bold text-dark mb-1">
                Catálogo de Compraventa Estudiantil
              </h1>
              <p className="text-muted small mb-0">
                Encuentra libros de asignaturas, tecnología, apuntes y artículos ofrecidos por compañeros de la UNAB.
              </p>
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-unab btn-sm d-flex align-items-center gap-2"
                onClick={() => setIsBookSearchModalOpen(true)}
              >
                <i className="bi bi-search"></i>
                <span>Explorar Libros (Open Library API)</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 3. CONTENIDO PRINCIPAL: SIDEBAR + GRID DE PRODUCTOS */}
      <main className="container-fluid px-3 px-lg-4 flex-grow-1">
        <div className="row g-4">
          {/* Columna Izquierda: Filtros Sidebar */}
          <div className="col-12 col-lg-3 col-xl-3">
            <Sidebar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategoria={selectedCategoria}
              setSelectedCategoria={setSelectedCategoria}
              precioMin={precioMin}
              setPrecioMin={setPrecioMin}
              precioMax={precioMax}
              setPrecioMax={setPrecioMax}
              onLimpiarFiltros={handleLimpiarFiltros}
              categorias={CATEGORIAS}
              totalResultados={productosFiltrados.length}
            />
          </div>

          {/* Columna Derecha: Catálogo de Publicaciones */}
          <div className="col-12 col-lg-9 col-xl-9">
            {/* Barra de estado de filtros activos */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="small text-muted">
                Mostrando <strong>{productosFiltrados.length}</strong> de <strong>{products.length}</strong> publicaciones
                {selectedCategoria !== 'todas' && (
                  <span className="badge bg-secondary ms-2 text-capitalize">
                    Categoría: {selectedCategoria}
                  </span>
                )}
                {searchTerm && (
                  <span className="badge bg-info text-dark ms-2">
                    Búsqueda: "{searchTerm}"
                  </span>
                )}
              </div>

              {(searchTerm || selectedCategoria !== 'todas' || precioMin || precioMax) && (
                <button
                  type="button"
                  className="btn btn-link text-decoration-none text-danger btn-sm p-0"
                  onClick={handleLimpiarFiltros}
                >
                  <i className="bi bi-x-circle me-1"></i> Quitar filtros
                </button>
              )}
            </div>

            {/* Listado de tarjetas de producto */}
            {productosFiltrados.length === 0 ? (
              <div className="card text-center p-5 border-dashed bg-white rounded-3 shadow-sm my-4">
                <div className="py-4">
                  <i className="bi bi-search text-muted" style={{ fontSize: '3.5rem' }}></i>
                  <h4 className="fw-bold mt-3 text-dark">No se encontraron productos</h4>
                  <p className="text-muted small mx-auto" style={{ maxWidth: '420px' }}>
                    No hay publicaciones que coincidan con los criterios de búsqueda aplicados. Intenta restablecer los filtros o publicar un nuevo artículo.
                  </p>
                  <div className="d-flex justify-content-center gap-2 mt-3">
                    <button
                      type="button"
                      className="btn btn-outline-unab btn-sm"
                      onClick={handleLimpiarFiltros}
                    >
                      Limpiar Filtros
                    </button>
                    <button
                      type="button"
                      className="btn btn-unab btn-sm"
                      onClick={() => setIsFormModalOpen(true)}
                    >
                      + Publicar un Producto
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="row g-3">
                {productosFiltrados.map((producto) => (
                  <ProductCard
                    key={producto.id}
                    producto={producto}
                    onVerDetalles={handleVerDetalles}
                    onAgregarAlCarrito={handleAgregarAlCarrito}
                    onToggleFavorito={handleToggleFavorito}
                    onEliminarProducto={handleEliminarProducto}
                    esFavorito={favorites.some((f) => f.id === producto.id)}
                    estaEnCarrito={cartIds.includes(producto.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 4. FOOTER INSTITUCIONAL */}
      <footer className="bg-white border-top py-4 mt-5">
        <div className="container-fluid px-3 px-lg-4 text-center">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 text-muted small">
            <div>
              <strong>Marketplace UNAB</strong> — Plataforma académica de intercambio estudiantil.
            </div>
            <div>
              <span>Integración con </span>
              <a
                href="https://openlibrary.org/"
                target="_blank"
                rel="noreferrer"
                className="text-unab text-decoration-none fw-bold"
              >
                Open Library API
              </a>
              <span> | Taller Evaluado 2 React</span>
            </div>
          </div>
        </div>
      </footer>

      {/* =========================================================
          5. MODALES Y OFFCANVAS
          ========================================================= */}

      {/* Modal de Detalle Completo de Producto */}
      <ProductDetailModal
        isOpen={isDetailModalOpen}
        producto={selectedProductForDetail}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedProductForDetail(null);
        }}
        onAgregarAlCarrito={handleAgregarAlCarrito}
        onToggleFavorito={handleToggleFavorito}
        esFavorito={
          selectedProductForDetail
            ? favorites.some((f) => f.id === selectedProductForDetail.id)
            : false
        }
        estaEnCarrito={
          selectedProductForDetail
            ? cartIds.includes(selectedProductForDetail.id)
            : false
        }
      />

      {/* Modal de Publicación de Producto */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setImportedBookData(null);
        }}
        onAgregarProducto={handleAgregarProducto}
        onOpenBookSearch={() => {
          setIsFormModalOpen(false);
          setIsBookSearchModalOpen(true);
        }}
        initialData={importedBookData}
        categorias={CATEGORIAS}
      />

      {/* Modal de Consulta a Open Library API */}
      <BookSearchModal
        isOpen={isBookSearchModalOpen}
        onClose={() => setIsBookSearchModalOpen(false)}
        onSelectBook={handleSelectBook}
      />

      {/* Offcanvas de Carrito */}
      <CartOffcanvas
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onEliminarDelCarrito={handleEliminarDelCarrito}
        onVaciarCarrito={handleVaciarCarrito}
      />

      {/* Offcanvas de Favoritos */}
      <FavoritesOffcanvas
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onEliminarFavorito={handleEliminarFavorito}
        onMoverAlCarrito={handleMoverFavoritoAlCarrito}
        cartIds={cartIds}
      />
    </div>
  );
}

