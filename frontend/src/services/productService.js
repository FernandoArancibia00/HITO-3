import api from './api';

// Únicos query params que acepta GET /products. Cualquier otro (o uno vacío) responde 400.
const PRODUCT_QUERY_KEYS = ['search', 'category', 'minPrice', 'maxPrice', 'condition', 'sort', 'page', 'limit'];

// Arma "?search=...&page=1" omitiendo claves desconocidas y valores vacíos, nulos o indefinidos.
function buildProductQuery(filters = {}) {
  const params = new URLSearchParams();
  PRODUCT_QUERY_KEYS.forEach((key) => {
    const value = filters[key];
    if (value === undefined || value === null) return;
    const text = String(value).trim();
    if (text !== '') params.append(key, text);
  });
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const productService = {
  /**
   * Catálogo paginado con filtros (solo productos activos y con stock).
   * GET /api/products?search=&category=&minPrice=&maxPrice=&condition=&sort=&page=&limit=
   * @returns {Promise<{ data: Array, total: number, page: number, limit: number }>}
   */
  async getProducts(filters) {
    return api.get(`/products${buildProductQuery(filters)}`);
  },

  /**
   * Publicaciones del usuario conectado, incluidas las inactivas.
   * GET /api/products/mine
   */
  async getMine() {
    return api.get('/products/mine');
  },

  /**
   * Detalle de un producto con seller y category.
   * GET /api/products/:id
   */
  async getById(id) {
    return api.get(`/products/${id}`);
  },

  /**
   * Publica un producto. El vendedor lo toma el backend desde el token.
   * POST /api/products  { title, description, price, stock, condition, imageUrl?, categoryId }
   */
  async create(data) {
    return api.post('/products', data);
  },

  /**
   * Edita un producto propio (403 si no es del usuario).
   * PATCH /api/products/:id
   */
  async update(id, data) {
    return api.patch(`/products/${id}`, data);
  },

  /**
   * Desactiva un producto propio (borrado lógico, responde 204).
   * DELETE /api/products/:id
   */
  async remove(id) {
    return api.delete(`/products/${id}`);
  },
};

export default productService;
