import RecentProductsSection from '../components/products/RecentProductsSection';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import useFavorites from '../hooks/useFavorites';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/products/Sidebar';
import ProductCard from '../components/products/ProductCard';
import ProductDetailModal from '../components/products/ProductDetailModal';
import ProductFormModal from '../components/products/ProductFormModal';
import ConfirmDeactivateModal from '../components/products/ConfirmDeactivateModal';
import CartOffcanvas from '../components/cart/CartOffcanvas';
import FavoritesOffcanvas from '../components/cart/FavoritesOffcanvas';
import BookSearchModal from '../components/products/BookSearchModal';
import '../styles/styles.css';

const PAGE_LIMIT = 12;
const SEARCH_DEBOUNCE_MS = 400;

const SORT_OPTIONS = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
];

// El backend solo acepta precios enteros >= 0: cualquier otro valor no se envía.
const toPriceParam = (value) => (/^\d+$/.test(String(value).trim()) ? String(value).trim() : '');

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items: cartItems, totalItems, addToCart } = useCart();
  const {
    favorites,
    notice: favoritesNotice,
    dismissNotice: dismissFavoritesNotice,
    toggleFavorite,
    removeFavorite,
  } = useFavorites();

  // =========================================================
  // 1. CATÁLOGO (GET /products) Y CATEGORÍAS (GET /categories)
  // =========================================================
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0); // al incrementarlo se vuelve a pedir la página 1

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);

  // =========================================================
  // 2. FILTROS (lo que escribe el usuario) Y FILTROS APLICADOS
  // =========================================================
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState(''); // slug; '' = todas
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [condicion, setCondicion] = useState(''); // '' | 'nuevo' | 'usado'
  const [sort, setSort] = useState('recent');

  // Búsqueda y precios se aplican 400 ms después de la última tecla (debounce).
  const [debounced, setDebounced] = useState({ search: '', minPrice: '', maxPrice: '' });

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = {
        search: searchTerm.trim(),
        minPrice: toPriceParam(precioMin),
        maxPrice: toPriceParam(precioMax),
      };
      // Solo actualiza si algo cambió, para no repetir la petición.
      setDebounced((prev) =>
        prev.search === next.search && prev.minPrice === next.minPrice && prev.maxPrice === next.maxPrice
          ? prev
          : next
      );
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchTerm, precioMin, precioMax]);

  const appliedFilters = useMemo(
    () => ({
      search: debounced.search,
      category: selectedCategoria,
      minPrice: debounced.minPrice,
      maxPrice: debounced.maxPrice,
      condition: condicion,
      sort,
      limit: PAGE_LIMIT,
    }),
    [debounced, selectedCategoria, condicion, sort]
  );

  const priceRangeError =
    appliedFilters.minPrice !== '' &&
    appliedFilters.maxPrice !== '' &&
    Number(appliedFilters.minPrice) > Number(appliedFilters.maxPrice)
      ? 'El precio mínimo no puede ser mayor que el precio máximo.'
      : null;

  // =========================================================
  // 3. CARGA DE DATOS
  // =========================================================
  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const data = await categoryService.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setCategoriesError(err.message || 'No se pudieron cargar las categorías.');
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Cada vez que cambian los filtros aplicados se pide de nuevo la página 1.
  useEffect(() => {
    if (priceRangeError) {
      setLoading(false);
      return undefined;
    }

    let active = true; // evita que una respuesta antigua pise a una más nueva
    setLoading(true);
    setError(null);

    productService
      .getProducts({ ...appliedFilters, page: 1 })
      .then((res) => {
        if (!active) return;
        setProducts(res.data);
        setTotal(res.total);
        setPage(res.page);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'No se pudo cargar el catálogo.');
        setProducts([]);
        setTotal(0);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [appliedFilters, priceRangeError, reloadKey]);

  // "Cargar más": pide la página siguiente y la agrega al final (sin repetir ids).
  const handleCargarMas = async () => {
    setLoadingMore(true);
    try {
      const res = await productService.getProducts({ ...appliedFilters, page: page + 1 });
      setProducts((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        return [...prev, ...res.data.filter((p) => !ids.has(p.id))];
      });
      setTotal(res.total);
      setPage(res.page);
    } catch (err) {
      triggerToast(err.message || 'No se pudieron cargar más productos.');
    } finally {
      setLoadingMore(false);
    }
  };

  const reloadCatalog = () => setReloadKey((k) => k + 1);

  const handleLimpiarFiltros = () => {
    setSearchTerm('');
    setSelectedCategoria('');
    setPrecioMin('');
    setPrecioMax('');
    setCondicion('');
  };

  // =========================================================
  // 4. ESTADOS DE MODALES, OFFCANVAS Y NOTIFICACIONES
  // =========================================================
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isBookSearchModalOpen, setIsBookSearchModalOpen] = useState(false);
  const [importedBookData, setImportedBookData] = useState(null);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  const [productToDeactivate, setProductToDeactivate] = useState(null);
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState(null);

  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = useCallback((mensaje) => {
    setToastMessage(mensaje);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  useEffect(() => {
    if (!favoritesNotice) return undefined;
    triggerToast(favoritesNotice.message);
    const timeout = setTimeout(dismissFavoritesNotice, 3500);
    return () => clearTimeout(timeout);
  }, [favoritesNotice, dismissFavoritesNotice, triggerToast]);

  // =========================================================
  // 5. HANDLERS DE PRODUCTOS
  // =========================================================
  const handleVerDetalles = (producto) => {
    setSelectedProductForDetail(producto);
    setIsDetailModalOpen(true);
  };

  // Solo usuarios con sesión pueden publicar.
  const handleAbrirPublicar = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setImportedBookData(null);
    setIsFormModalOpen(true);
  };

  // Lo llama ProductFormModal después de un POST /products exitoso.
  const handleProductoGuardado = (producto) => {
    setImportedBookData(null);
    triggerToast(`¡"${producto.title}" fue publicado con éxito!`);
    reloadCatalog();
  };

  const handleEliminarProducto = (producto) => {
    setDeactivateError(null);
    setProductToDeactivate(producto);
  };

  const handleConfirmarDesactivar = async () => {
    if (!productToDeactivate) return;
    const { id, title } = productToDeactivate;
    setDeactivating(true);
    setDeactivateError(null);
    try {
      await productService.remove(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setTotal((prev) => Math.max(prev - 1, 0));
      await removeFavorite(id);
      if (selectedProductForDetail && selectedProductForDetail.id === id) {
        setIsDetailModalOpen(false);
        setSelectedProductForDetail(null);
      }
      setProductToDeactivate(null);
      triggerToast(`"${title}" fue desactivado.`);
    } catch (err) {
      setDeactivateError(err.message || 'No se pudo desactivar la publicación.');
    } finally {
      setDeactivating(false);
    }
  };

  // =========================================================
  // 6. CARRITO (CartContext)
  // =========================================================
  const cartIds = useMemo(
    () => cartItems.map((item) => item.product?.id ?? item.productId),
    [cartItems]
  );

  const handleAgregarAlCarrito = async (producto) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (cartIds.includes(producto.id)) {
      triggerToast('El producto ya se encuentra en tu carrito de compras.');
      setIsCartOpen(true);
      return;
    }
    await addToCart(producto);
    // El carrito muestra el resultado (o el error de stock que deja CartContext).
    setIsCartOpen(true);
  };

  // =========================================================
  // 8. OPEN LIBRARY → FORMULARIO DE PUBLICACIÓN
  // =========================================================
  const handleSelectBook = (bookData) => {
    setIsBookSearchModalOpen(false);
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setImportedBookData(bookData);
    setIsFormModalOpen(true);
    triggerToast(`Datos de "${bookData.title}" importados al formulario.`);
  };

  const hayFiltros = Boolean(searchTerm || selectedCategoria || precioMin || precioMax || condicion);
  const categoriaActiva = categories.find((c) => c.slug === selectedCategoria);
  const hayMas = products.length < total;

  // =========================================================
  // 9. CONTENIDO DEL LISTADO SEGÚN EL ESTADO
  // =========================================================
  const renderListado = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <div className="mt-3 text-muted">Cargando publicaciones...</div>
        </div>
      );
    }

    if (priceRangeError) {
      return (
        <div className="alert alert-warning d-flex align-items-center gap-2" role="alert">
          <i className="bi bi-exclamation-circle-fill"></i>
          <span>{priceRangeError}</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-danger d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2" role="alert">
          <span>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </span>
          <button type="button" className="btn btn-outline-danger btn-sm" onClick={reloadCatalog}>
            <i className="bi bi-arrow-clockwise me-1"></i> Reintentar
          </button>
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <div className="card text-center p-5 border-dashed bg-white rounded-3 shadow-sm my-4">
          <div className="py-4">
            <i className="bi bi-search text-muted" style={{ fontSize: '3.5rem' }}></i>
            <h4 className="fw-bold mt-3 text-dark">No se encontraron productos</h4>
            <p className="text-muted small mx-auto" style={{ maxWidth: '420px' }}>
              No hay publicaciones que coincidan con los criterios de búsqueda aplicados. Intenta restablecer los filtros o publicar un nuevo artículo.
            </p>
            <div className="d-flex justify-content-center gap-2 mt-3">
              <button type="button" className="btn btn-outline-unab btn-sm" onClick={handleLimpiarFiltros}>
                Limpiar Filtros
              </button>
              <button type="button" className="btn btn-unab btn-sm" onClick={handleAbrirPublicar}>
                + Publicar un Producto
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="row g-3">
          {products.map((producto) => (
            <ProductCard
              key={producto.id}
              producto={producto}
              onVerDetalles={handleVerDetalles}
              onAgregarAlCarrito={handleAgregarAlCarrito}
              onToggleFavorito={toggleFavorite}
              onEliminarProducto={handleEliminarProducto}
              esFavorito={favorites.some((f) => f.id === producto.id)}
              estaEnCarrito={cartIds.includes(producto.id)}
            />
          ))}
        </div>

        {hayMas && (
          <div className="text-center my-4">
            <button
              type="button"
              className="btn btn-outline-unab px-4"
              onClick={handleCargarMas}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Cargando...
                </>
              ) : (
                <>
                  <i className="bi bi-chevron-down me-1"></i> Cargar más
                </>
              )}
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* 1. NAVBAR SUPERIOR */}
      <Navbar
        favCount={favorites.length}
        cartCount={totalItems}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCreateProduct={handleAbrirPublicar}
        onOpenBookSearch={() => setIsBookSearchModalOpen(true)}
      />

      {/* Notificación Flotante (Toast) */}
      {toastMessage && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1090 }}>
          <div className="toast show align-items-center text-white bg-dark border-0 shadow-lg" role="alert">
            <div className="d-flex">
              <div className="toast-body d-flex align-items-center gap-2">
                <i className="bi bi-info-circle-fill text-unab"></i>
                <span>{toastMessage}</span>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => {
                  setToastMessage(null);
                  dismissFavoritesNotice();
                }}
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
              condicion={condicion}
              setCondicion={setCondicion}
              onLimpiarFiltros={handleLimpiarFiltros}
              categorias={categories}
              categoriasLoading={categoriesLoading}
              categoriasError={categoriesError}
              onReintentarCategorias={loadCategories}
              totalResultados={total}
            />
          </div>

          <div className="col-12 col-lg-9 col-xl-9">
            {/* Barra de estado de filtros y orden */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
              <div className="small text-muted">
                Mostrando <strong>{products.length}</strong> de <strong>{total}</strong> publicaciones
                {categoriaActiva && (
                  <span className="badge bg-secondary ms-2">Categoría: {categoriaActiva.name}</span>
                )}
                {condicion && (
                  <span className="badge bg-secondary ms-2 text-capitalize">Condición: {condicion}</span>
                )}
                {searchTerm && (
                  <span className="badge bg-info text-dark ms-2">Búsqueda: "{searchTerm}"</span>
                )}
                {hayFiltros && (
                  <button
                    type="button"
                    className="btn btn-link text-decoration-none text-danger btn-sm p-0 ms-2 align-baseline"
                    onClick={handleLimpiarFiltros}
                  >
                    <i className="bi bi-x-circle me-1"></i> Quitar filtros
                  </button>
                )}
              </div>

              <div className="d-flex align-items-center gap-2">
                <label htmlFor="selectOrden" className="small text-muted text-nowrap mb-0">Ordenar por</label>
                <select
                  id="selectOrden"
                  className="form-select form-select-sm"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {renderListado()}
          </div>
        </div>
      </main>

      <RecentProductsSection />

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
      <ProductDetailModal
        isOpen={isDetailModalOpen}
        producto={selectedProductForDetail}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedProductForDetail(null);
        }}
        onAgregarAlCarrito={handleAgregarAlCarrito}
        onToggleFavorito={toggleFavorite}
        esFavorito={
          selectedProductForDetail
            ? favorites.some((f) => f.id === selectedProductForDetail.id)
            : false
        }
        estaEnCarrito={
          selectedProductForDetail ? cartIds.includes(selectedProductForDetail.id) : false
        }
      />

      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setImportedBookData(null);
        }}
        onSaved={handleProductoGuardado}
        onOpenBookSearch={() => {
          setIsFormModalOpen(false);
          setIsBookSearchModalOpen(true);
        }}
        initialData={importedBookData}
        categories={categories}
      />

      <BookSearchModal
        isOpen={isBookSearchModalOpen}
        onClose={() => setIsBookSearchModalOpen(false)}
        onSelectBook={handleSelectBook}
      />

      <ConfirmDeactivateModal
        product={productToDeactivate}
        loading={deactivating}
        error={deactivateError}
        onConfirm={handleConfirmarDesactivar}
        onCancel={() => setProductToDeactivate(null)}
      />

      {/* El carrito lee y modifica sus datos directamente desde CartContext */}
      <CartOffcanvas
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onIrACheckout={() => navigate('/checkout')}
      />

      <FavoritesOffcanvas
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onEliminarFavorito={removeFavorite}
        onMoverAlCarrito={handleAgregarAlCarrito}
        cartIds={cartIds}
      />
    </div>
  );
}
