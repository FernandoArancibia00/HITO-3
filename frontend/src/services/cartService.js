import api from './api';

export const cartService = {
  /**
   * Obtiene el carrito del usuario autenticado
   * GET /api/cart
   * @returns {Promise<{ items: Array<{ id: number, quantity: number, product: object }>, total: number }>}
   */
  async getCart() {
    return api.get('/cart');
  },

  /**
   * Agrega un producto al carrito (o suma cantidad si ya existe)
   * POST /api/cart
   * @param {number} productId - ID del producto a agregar
   * @param {number} quantity - Cantidad de unidades (por defecto 1)
   * @returns {Promise<{ items: Array, total: number }>} Carrito completo actualizado
   */
  async addToCart(productId, quantity = 1) {
    return api.post('/cart', {
      productId: Number(productId),
      quantity: Number(quantity),
    });
  },

  /**
   * Actualiza la cantidad de un ítem existente en el carrito
   * PATCH /api/cart/:itemId
   * @param {number} itemId - ID del ítem en la tabla cart_items
   * @param {number} quantity - Nueva cantidad (mínimo 1)
   * @returns {Promise<{ items: Array, total: number }>} Carrito completo actualizado
   */
  async updateQuantity(itemId, quantity) {
    return api.patch(`/cart/${itemId}`, {
      quantity: Number(quantity),
    });
  },

  /**
   * Elimina un producto específico del carrito
   * DELETE /api/cart/:itemId
   * @param {number} itemId - ID del ítem en la tabla cart_items
   * @returns {Promise<{ items: Array, total: number }>} Carrito completo actualizado
   */
  async removeFromCart(itemId) {
    return api.delete(`/cart/${itemId}`);
  },

  /**
   * Vacía por completo el carrito del usuario
   * DELETE /api/cart
   * @returns {Promise<null>}
   */
  async clearCart() {
    return api.delete('/cart');
  },
};

export default cartService;
