import React, { useState, useEffect } from 'react';

export default function ProductFormModal({
  isOpen = false,
  onClose,
  onAgregarProducto,
  onOpenBookSearch,
  initialData = null,
  categorias = []
}) {
  const initialFormState = {
    nombre: '',
    precio: '',
    categoria: 'libros',
    descripcion: '',
    imagen: '',
    vendedor: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errores, setErrores] = useState({});
  const [formularioEnviado, setFormularioEnviado] = useState(false);

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData((prev) => ({
        ...prev,
        nombre: initialData.nombre || prev.nombre,
        descripcion: initialData.descripcion || prev.descripcion,
        imagen: initialData.imagen || prev.imagen,
        categoria: initialData.categoria || 'libros'
      }));
    }
  }, [initialData, isOpen]);

  const handleCerrar = () => {
    setFormData(initialFormState);
    setErrores({});
    setFormularioEnviado(false);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errores[name]) {
      setErrores((prev) => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El título o nombre del producto es obligatorio.';
    }

    if (!formData.precio || Number(formData.precio) <= 0) {
      nuevosErrores.precio = 'Ingresa un precio válido mayor a 0.';
    }

    if (!formData.categoria) {
      nuevosErrores.categoria = 'Selecciona una categoría válida.';
    }

    if (!formData.descripcion.trim()) {
      nuevosErrores.descripcion = 'La descripción es obligatoria para informar a los compradores.';
    } else if (formData.descripcion.trim().length < 10) {
      nuevosErrores.descripcion = 'La descripción debe tener al menos 10 caracteres.';
    }

    if (!formData.vendedor.trim()) {
      nuevosErrores.vendedor = 'Indica tu nombre y carrera universitaria.';
    }

    return nuevosErrores;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormularioEnviado(true);

    const erroresDetectados = validarFormulario();

    if (Object.keys(erroresDetectados).length > 0) {
      setErrores(erroresDetectados);
      return;
    }

    const nuevoProducto = {
      id: Date.now(),
      nombre: formData.nombre.trim(),
      precio: parseInt(formData.precio, 10),
      categoria: formData.categoria,
      descripcion: formData.descripcion.trim(),
      imagen: formData.imagen.trim() || 'https://placehold.co/400x300/ad0f0f/ffffff?text=Marketplace+UNAB',
      vendedor: formData.vendedor.trim()
    };

    onAgregarProducto(nuevoProducto);
    handleCerrar();
  };

  if (!isOpen) return null;

  const categoriasValidas = categorias.filter((c) => c.id !== 'todas');

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
                <i className="bi bi-tag-fill"></i>
                <span>Crear Nueva Publicación</span>
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Cerrar"
                onClick={handleCerrar}
              ></button>
            </div>

            <div className="modal-body p-4">
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
                  >
                    <i className="bi bi-search"></i>
                    <span>Buscar en Open Library</span>
                  </button>
                </div>
              </div>

              {formularioEnviado && Object.keys(errores).length > 0 && (
                <div className="alert alert-danger py-2 px-3 small mb-3">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Por favor corrige los campos destacados antes de publicar.
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  <div className="col-12 col-md-8">
                    <label htmlFor="inputNombre" className="form-label fw-bold small">
                      Título de la Publicación <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="inputNombre"
                      name="nombre"
                      className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
                      placeholder="Ej: Libro Cálculo Stewart 8va Edición"
                      value={formData.nombre}
                      onChange={handleChange}
                    />
                    {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
                  </div>

                  <div className="col-12 col-md-4">
                    <label htmlFor="selectCategoria" className="form-label fw-bold small">
                      Categoría <span className="text-danger">*</span>
                    </label>
                    <select
                      id="selectCategoria"
                      name="categoria"
                      className={`form-select ${errores.categoria ? 'is-invalid' : ''}`}
                      value={formData.categoria}
                      onChange={handleChange}
                    >
                      {categoriasValidas.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                    {errores.categoria && <div className="invalid-feedback">{errores.categoria}</div>}
                  </div>

                  <div className="col-12 col-md-4">
                    <label htmlFor="inputPrecio" className="form-label fw-bold small">
                      Precio ($ CLP) <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        id="inputPrecio"
                        name="precio"
                        min="1"
                        step="100"
                        className={`form-control ${errores.precio ? 'is-invalid' : ''}`}
                        placeholder="Ej: 15000"
                        value={formData.precio}
                        onChange={handleChange}
                      />
                      {errores.precio && <div className="invalid-feedback">{errores.precio}</div>}
                    </div>
                  </div>

                  <div className="col-12 col-md-8">
                    <label htmlFor="inputVendedor" className="form-label fw-bold small">
                      Vendedor (Nombre y Carrera) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="inputVendedor"
                      name="vendedor"
                      className={`form-control ${errores.vendedor ? 'is-invalid' : ''}`}
                      placeholder="Ej: Matías Morales (Ingeniería Civil Informática)"
                      value={formData.vendedor}
                      onChange={handleChange}
                    />
                    {errores.vendedor && <div className="invalid-feedback">{errores.vendedor}</div>}
                  </div>

                  <div className="col-12">
                    <label htmlFor="inputImagen" className="form-label fw-bold small">
                      URL de la Imagen <span className="text-muted fw-normal">(Opcional, se usará imagen por defecto)</span>
                    </label>
                    <input
                      type="url"
                      id="inputImagen"
                      name="imagen"
                      className="form-control"
                      placeholder="https://ejemplo.com/foto-producto.jpg"
                      value={formData.imagen}
                      onChange={handleChange}
                    />
                    {formData.imagen && (
                      <div className="mt-2 d-flex align-items-center gap-2">
                        <span className="small text-muted">Vista previa:</span>
                        <img
                          src={formData.imagen}
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
                    <label htmlFor="inputDescripcion" className="form-label fw-bold small">
                      Descripción del Producto <span className="text-danger">*</span>
                    </label>
                    <textarea
                      id="inputDescripcion"
                      name="descripcion"
                      rows="3"
                      className={`form-control ${errores.descripcion ? 'is-invalid' : ''}`}
                      placeholder="Describe el estado del producto, campus de entrega, si incluye accesorios, etc."
                      value={formData.descripcion}
                      onChange={handleChange}
                    ></textarea>
                    {errores.descripcion && <div className="invalid-feedback">{errores.descripcion}</div>}
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleCerrar}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-unab d-flex align-items-center gap-2 shadow-sm"
                  >
                    <i className="bi bi-cloud-arrow-up-fill"></i>
                    <span>Publicar Ahora</span>
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
