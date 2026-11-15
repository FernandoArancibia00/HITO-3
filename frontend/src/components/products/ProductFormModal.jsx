import React, { useState, useEffect } from 'react';
import productService from '../../services/productService';

const EMPTY_FORM = {
  title: '',
  description: '',
  price: '',
  stock: '1',
  condition: 'usado',
  imageUrl: '',
  categoryId: '',
};

const isPositiveInt = (value) => /^\d+$/.test(String(value).trim()) && Number(value) > 0;
const isNonNegativeInt = (value) => /^\d+$/.test(String(value).trim());

const isHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

// Formulario para publicar (POST /products) o editar (PATCH /products/:id) un producto.
// - product: si viene, el modal está en modo edición.
// - initialData: datos precargados desde Open Library { title, description, imageUrl, categorySlug }.
// - onSaved(producto): se llama con el producto que devolvió el backend.
export default function ProductFormModal({
  isOpen = false,
  onClose,
  onSaved,
  onOpenBookSearch,
  initialData = null,
  product = null,
  categories = []
}) {
  const isEdit = Boolean(product);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errores, setErrores] = useState({});
  const [formularioEnviado, setFormularioEnviado] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Cada vez que se abre, se carga el producto a editar, los datos de Open Library o un formulario vacío.
  useEffect(() => {
    if (!isOpen) return;
    setErrores({});
    setFormularioEnviado(false);
    setServerError(null);

    if (product) {
      setFormData({
        title: product.title || '',
        description: product.description || '',
        price: String(product.price ?? ''),
        stock: String(product.stock ?? '0'),
        condition: product.condition || 'usado',
        imageUrl: product.imageUrl || '',
        categoryId: String(product.categoryId ?? product.category?.id ?? ''),
      });
    } else if (initialData) {
      setFormData({
        ...EMPTY_FORM,
        title: initialData.title || '',
        description: initialData.description || '',
        imageUrl: initialData.imageUrl || '',
      });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [isOpen, product, initialData]);

  // Si viene de Open Library, se selecciona la categoría por su slug cuando las categorías estén cargadas.
  useEffect(() => {
    if (!isOpen || product || !initialData?.categorySlug) return;
    const match = categories.find((c) => c.slug === initialData.categorySlug);
    if (match) {
      setFormData((prev) => (prev.categoryId ? prev : { ...prev, categoryId: String(match.id) }));
    }
  }, [isOpen, product, initialData, categories]);

  const handleCerrar = () => {
    if (submitting) return;
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    const title = formData.title.trim();
    const description = formData.description.trim();
    const imageUrl = formData.imageUrl.trim();

    if (!title) {
      nuevosErrores.title = 'El título del producto es obligatorio.';
    } else if (title.length > 150) {
      nuevosErrores.title = 'El título no puede superar los 150 caracteres.';
    }

    if (!isPositiveInt(formData.price)) {
      nuevosErrores.price = 'Ingresa un precio válido mayor a 0 (entero, sin decimales).';
    }

    if (!isNonNegativeInt(formData.stock)) {
      nuevosErrores.stock = 'El stock debe ser un número entero mayor o igual a 0.';
    }

    if (!['nuevo', 'usado'].includes(formData.condition)) {
      nuevosErrores.condition = 'Selecciona si el producto es nuevo o usado.';
    }

    if (!formData.categoryId) {
      nuevosErrores.categoryId = 'Selecciona una categoría válida.';
    }

    if (!description) {
      nuevosErrores.description = 'La descripción es obligatoria para informar a los compradores.';
    } else if (description.length < 10) {
      nuevosErrores.description = 'La descripción debe tener al menos 10 caracteres.';
    }

    if (imageUrl && (!isHttpUrl(imageUrl) || imageUrl.length > 500)) {
      nuevosErrores.imageUrl = 'Ingresa una URL válida (http o https) de hasta 500 caracteres.';
    }

    return nuevosErrores;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormularioEnviado(true);
    setServerError(null);

    const erroresDetectados = validarFormulario();
    if (Object.keys(erroresDetectados).length > 0) {
      setErrores(erroresDetectados);
      return;
    }

    const imageUrl = formData.imageUrl.trim();
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      stock: Number(formData.stock),
      condition: formData.condition,
      categoryId: Number(formData.categoryId),
    };
    // Al crear, sin imagen se omite el campo. Al editar, vaciarlo envía null para borrar la imagen.
    if (imageUrl) {
      payload.imageUrl = imageUrl;
    } else if (isEdit) {
      payload.imageUrl = null;
    }

    setSubmitting(true);
    try {
      const saved = isEdit
        ? await productService.update(product.id, payload)
        : await productService.create(payload);
      onSaved(saved);
      onClose();
    } catch (err) {
      // api.js ya entrega el primer mensaje del backend (message puede ser un arreglo).
      setServerError(err.message || 'No se pudo guardar la publicación.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1050 }}
        onClick={handleCerrar}
      ></div>

      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modalPublicarTitulo"
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content shadow-lg border-0">
            <div className="modal-header modal-header-unab d-flex align-items-center justify-content-between">
              <h5 className="modal-title modal-title-unab m-0 d-flex align-items-center gap-2" id="modalPublicarTitulo">
                <i className={`bi ${isEdit ? 'bi-pencil-square' : 'bi-tag-fill'}`}></i>
                <span>{isEdit ? 'Editar Publicación' : 'Crear Nueva Publicación'}</span>
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Cerrar"
                onClick={handleCerrar}
                disabled={submitting}
              ></button>
            </div>

            <div className="modal-body p-4">
              {!isEdit && onOpenBookSearch && (
                <div className="card border-danger border-opacity-25 bg-light mb-4 p-3 rounded-3">
                  <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-book-half fs-4 text-unab"></i>
                      <div>
                        <strong className="d-block text-dark">¿Vas a publicar un libro universitario?</strong>
                        <span className="small text-muted">
                          Ahorra tiempo buscando el libro en Open Library para autocompletar título, autor e imagen.
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline-unab btn-sm d-flex align-items-center gap-1 text-nowrap align-self-start align-self-sm-center"
                      onClick={onOpenBookSearch}
                      disabled={submitting}
                    >
                      <i className="bi bi-search"></i>
                      <span>Buscar en Open Library</span>
                    </button>
                  </div>
                </div>
              )}

              {formularioEnviado && Object.values(errores).some(Boolean) && (
                <div className="alert alert-danger py-2 px-3 small mb-3">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Por favor corrige los campos destacados antes de {isEdit ? 'guardar' : 'publicar'}.
                </div>
              )}

              {serverError && (
                <div className="alert alert-danger py-2 px-3 small mb-3" role="alert">
                  <i className="bi bi-x-octagon-fill me-2"></i>
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  <div className="col-12 col-md-8">
                    <label htmlFor="inputTitle" className="form-label fw-bold small">
                      Título de la Publicación <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="inputTitle"
                      name="title"
                      maxLength={150}
                      className={`form-control ${errores.title ? 'is-invalid' : ''}`}
                      placeholder="Ej: Libro Cálculo Stewart 8va Edición"
                      value={formData.title}
                      onChange={handleChange}
                    />
                    {errores.title && <div className="invalid-feedback">{errores.title}</div>}
                  </div>

                  <div className="col-12 col-md-4">
                    <label htmlFor="selectCategoryId" className="form-label fw-bold small">
                      Categoría <span className="text-danger">*</span>
                    </label>
                    <select
                      id="selectCategoryId"
                      name="categoryId"
                      className={`form-select ${errores.categoryId ? 'is-invalid' : ''}`}
                      value={formData.categoryId}
                      onChange={handleChange}
                    >
                      <option value="">
                        {categories.length === 0 ? 'Cargando categorías...' : 'Selecciona una categoría'}
                      </option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {errores.categoryId && <div className="invalid-feedback">{errores.categoryId}</div>}
                  </div>

                  <div className="col-12 col-md-4">
                    <label htmlFor="inputPrice" className="form-label fw-bold small">
                      Precio ($ CLP) <span className="text-danger">*</span>
                    </label>
                    <div className="input-group has-validation">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        id="inputPrice"
                        name="price"
                        min="1"
                        step="100"
                        className={`form-control ${errores.price ? 'is-invalid' : ''}`}
                        placeholder="Ej: 15000"
                        value={formData.price}
                        onChange={handleChange}
                      />
                      {errores.price && <div className="invalid-feedback">{errores.price}</div>}
                    </div>
                  </div>

                  <div className="col-6 col-md-4">
                    <label htmlFor="inputStock" className="form-label fw-bold small">
                      Stock <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      id="inputStock"
                      name="stock"
                      min="0"
                      step="1"
                      className={`form-control ${errores.stock ? 'is-invalid' : ''}`}
                      value={formData.stock}
                      onChange={handleChange}
                    />
                    {errores.stock && <div className="invalid-feedback">{errores.stock}</div>}
                  </div>

                  <div className="col-6 col-md-4">
                    <label htmlFor="selectCondition" className="form-label fw-bold small">
                      Condición <span className="text-danger">*</span>
                    </label>
                    <select
                      id="selectCondition"
                      name="condition"
                      className={`form-select ${errores.condition ? 'is-invalid' : ''}`}
                      value={formData.condition}
                      onChange={handleChange}
                    >
                      <option value="nuevo">Nuevo</option>
                      <option value="usado">Usado</option>
                    </select>
                    {errores.condition && <div className="invalid-feedback">{errores.condition}</div>}
                  </div>

                  <div className="col-12">
                    <label htmlFor="inputImageUrl" className="form-label fw-bold small">
                      URL de la Imagen <span className="text-muted fw-normal">(Opcional, se usará imagen por defecto)</span>
                    </label>
                    <input
                      type="url"
                      id="inputImageUrl"
                      name="imageUrl"
                      className={`form-control ${errores.imageUrl ? 'is-invalid' : ''}`}
                      placeholder="https://ejemplo.com/foto-producto.jpg"
                      value={formData.imageUrl}
                      onChange={handleChange}
                    />
                    {errores.imageUrl && <div className="invalid-feedback">{errores.imageUrl}</div>}
                    {formData.imageUrl && !errores.imageUrl && (
                      <div className="mt-2 d-flex align-items-center gap-2">
                        <span className="small text-muted">Vista previa:</span>
                        <img
                          src={formData.imageUrl}
                          alt="Previsualización"
                          style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                          className="border rounded p-1 bg-white"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="col-12">
                    <label htmlFor="inputDescription" className="form-label fw-bold small">
                      Descripción del Producto <span className="text-danger">*</span>
                    </label>
                    <textarea
                      id="inputDescription"
                      name="description"
                      rows="3"
                      className={`form-control ${errores.description ? 'is-invalid' : ''}`}
                      placeholder="Describe el estado del producto, campus de entrega, si incluye accesorios, etc."
                      value={formData.description}
                      onChange={handleChange}
                    ></textarea>
                    {errores.description && <div className="invalid-feedback">{errores.description}</div>}
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleCerrar}
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-unab d-flex align-items-center gap-2 shadow-sm"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <i className={`bi ${isEdit ? 'bi-check2-circle' : 'bi-cloud-arrow-up-fill'}`}></i>
                        <span>{isEdit ? 'Guardar Cambios' : 'Publicar Ahora'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
