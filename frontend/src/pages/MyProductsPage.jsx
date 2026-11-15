import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import Navbar from '../components/layout/Navbar';
import ProductFormModal from '../components/products/ProductFormModal';
import BookSearchModal from '../components/products/BookSearchModal';
import ConfirmDeactivateModal from '../components/products/ConfirmDeactivateModal';
import {
  CONDITION_LABELS,
  DEFAULT_PRODUCT_IMAGE,
  formatPrice,
  handleProductImageError,
} from '../components/products/productUtils';

// Página /my-products (ruta protegida): publicaciones del usuario conectado, activas e inactivas.
export default function MyProductsPage() {
  const navigate = useNavigate();
  const { totalItems } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [categories, setCategories] = useState([]);

  // Formulario: productToEdit = null → crear; con producto → editar.
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [isBookSearchOpen, setIsBookSearchOpen] = useState(false);
  const [importedBookData, setImportedBookData] = useState(null);

  const [productToDeactivate, setProductToDeactivate] = useState(null);
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState(null);

  // GET /products/mine
  const loadMine = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getMine();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar tus publicaciones.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMine();
  }, [loadMine]);

  // Categorías para el select del formulario. Si fallan, el formulario muestra el select vacío.
  useEffect(() => {
    categoryService
      .getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  const showSuccess = (mensaje) => {
    setSuccessMessage(mensaje);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleNuevo = () => {
    setProductToEdit(null);
    setImportedBookData(null);
    setIsFormOpen(true);
  };

  const handleEditar = (producto) => {
    setImportedBookData(null);
    setProductToEdit(producto);
    setIsFormOpen(true);
  };

  const handleCerrarFormulario = () => {
    setIsFormOpen(false);
    setProductToEdit(null);
    setImportedBookData(null);
  };

  // Reemplaza el producto editado en la lista o agrega el nuevo al inicio.
  const handleGuardado = (saved) => {
    const existe = products.some((p) => p.id === saved.id);
    setProducts((prev) =>
      prev.some((p) => p.id === saved.id)
        ? prev.map((p) => (p.id === saved.id ? saved : p))
        : [saved, ...prev]
    );
    showSuccess(existe ? `"${saved.title}" fue actualizado.` : `"${saved.title}" fue publicado.`);
  };

  const handleSelectBook = (bookData) => {
    setIsBookSearchOpen(false);
    setProductToEdit(null);
    setImportedBookData(bookData);
    setIsFormOpen(true);
  };

  const handleConfirmarDesactivar = async () => {
    if (!productToDeactivate) return;
    const { id, title } = productToDeactivate;
    setDeactivating(true);
    setDeactivateError(null);
    try {
      await productService.remove(id);
      // Borrado lógico: el producto sigue en la lista, ahora como inactivo.
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: false } : p)));
      setProductToDeactivate(null);
      showSuccess(`"${title}" fue desactivado.`);
    } catch (err) {
      setDeactivateError(err.message || 'No se pudo desactivar la publicación.');
    } finally {
      setDeactivating(false);
    }
  };

  const activos = products.filter((p) => p.isActive).length;

  const renderContenido = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <div className="mt-3 text-muted">Cargando tus publicaciones...</div>
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
          <button type="button" className="btn btn-outline-danger btn-sm" onClick={loadMine}>
            <i className="bi bi-arrow-clockwise me-1"></i> Reintentar
          </button>
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <div className="card text-center p-5 bg-white rounded-3 shadow-sm">
          <div className="py-3">
            <i className="bi bi-box-seam text-muted" style={{ fontSize: '3.5rem' }}></i>
            <h4 className="fw-bold mt-3 text-dark">Aún no tienes publicaciones</h4>
            <p className="text-muted small mx-auto" style={{ maxWidth: '420px' }}>
              Publica libros, apuntes o artículos que ya no uses y otros estudiantes de la UNAB podrán comprarlos.
            </p>
            <button type="button" className="btn btn-unab btn-sm mt-2" onClick={handleNuevo}>
              + Publicar un Producto
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th scope="col">Producto</th>
                <th scope="col">Categoría</th>
                <th scope="col" className="text-end">Precio</th>
                <th scope="col" className="text-center">Stock</th>
                <th scope="col" className="text-center">Estado</th>
                <th scope="col" className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className={p.isActive ? '' : 'text-muted'}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={p.imageUrl || DEFAULT_PRODUCT_IMAGE}
                        alt={p.title}
                        className="rounded border"
                        style={{ width: '48px', height: '48px', objectFit: 'cover', opacity: p.isActive ? 1 : 0.5 }}
                        onError={handleProductImageError}
                      />
                      <div className="min-w-0">
                        <Link to={`/products/${p.id}`} className="fw-semibold text-decoration-none">
                          {p.title}
                        </Link>
                        <div className="small text-muted">{CONDITION_LABELS[p.condition] || p.condition}</div>
                      </div>
                    </div>
                  </td>
                  <td className="small">{p.category?.name || '—'}</td>
                  <td className="text-end text-nowrap">{formatPrice(p.price)}</td>
                  <td className="text-center">
                    <span className={`badge ${p.stock > 0 ? 'bg-light text-dark border' : 'bg-warning text-dark'}`}>
                      {p.stock > 0 ? p.stock : 'Sin stock'}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className={`badge ${p.isActive ? 'bg-success' : 'bg-secondary'}`}>
                      {p.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="text-end text-nowrap">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm me-1"
                      onClick={() => handleEditar(p)}
                    >
                      <i className="bi bi-pencil me-1"></i> Editar
                    </button>
                    {p.isActive && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => {
                          setDeactivateError(null);
                          setProductToDeactivate(p);
                        }}
                      >
                        <i className="bi bi-eye-slash me-1"></i> Desactivar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar
        cartCount={totalItems}
        onOpenCart={() => navigate('/cart')}
        onOpenFavorites={() => navigate('/')}
        onOpenCreateProduct={handleNuevo}
        onOpenBookSearch={() => setIsBookSearchOpen(true)}
      />

      <main className="container py-4 flex-grow-1">
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4">
          <div>
            <h2 className="fw-bold m-0 d-flex align-items-center gap-2">
              <i className="bi bi-box-seam text-unab"></i>
              Mis Publicaciones
            </h2>
            {!loading && !error && products.length > 0 && (
              <p className="text-muted small m-0 mt-1">
                {products.length} {products.length === 1 ? 'publicación' : 'publicaciones'} · {activos} activas
              </p>
            )}
          </div>
          <button type="button" className="btn btn-unab d-flex align-items-center gap-2" onClick={handleNuevo}>
            <i className="bi bi-plus-circle-fill"></i>
            <span>Publicar Producto</span>
          </button>
        </div>

        {successMessage && (
          <div className="alert alert-success py-2 d-flex align-items-center gap-2" role="status">
            <i className="bi bi-check-circle-fill"></i>
            <span>{successMessage}</span>
          </div>
        )}

        {renderContenido()}
      </main>

      <ProductFormModal
        isOpen={isFormOpen}
        onClose={handleCerrarFormulario}
        onSaved={handleGuardado}
        onOpenBookSearch={() => {
          setIsFormOpen(false);
          setIsBookSearchOpen(true);
        }}
        initialData={importedBookData}
        product={productToEdit}
        categories={categories}
      />

      <BookSearchModal
        isOpen={isBookSearchOpen}
        onClose={() => setIsBookSearchOpen(false)}
        onSelectBook={handleSelectBook}
      />

      <ConfirmDeactivateModal
        product={productToDeactivate}
        loading={deactivating}
        error={deactivateError}
        onConfirm={handleConfirmarDesactivar}
        onCancel={() => setProductToDeactivate(null)}
      />
    </div>
  );
}
