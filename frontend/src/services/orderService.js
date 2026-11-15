import api from './api';

/**
 * Servicio HTTP para la gestión de Pedidos y Transacciones (/orders)
 * Se comunica con la API NestJS a través de api.js
 * Respeta el contrato de datos del Hito 3.
 */
export const orderService = {
  /**
   * Crea un pedido a partir de los ítems actuales del carrito del usuario
   * POST /api/orders
   * @returns {Promise<object>} Pedido creado con items y estado 'pendiente'
   */
  async createOrder() {
    return api.post('/orders');
  },

  /**
   * Obtiene la lista de compras del usuario autenticado
   * GET /api/orders
   * @returns {Promise<Array<object>>} Arreglo de pedidos del comprador
   */
  async getMyOrders() {
    return api.get('/orders');
  },

  /**
   * Obtiene la lista de ventas donde el usuario es vendedor
   * GET /api/orders/sales
   * @returns {Promise<Array<object>>} Arreglo de pedidos que contienen productos del vendedor
   */
  async getMySales() {
    return api.get('/orders/sales');
  },

  /**
   * Obtiene el detalle completo de un pedido por su ID
   * GET /api/orders/:id
   * @param {number|string} orderId - ID del pedido
   * @returns {Promise<object>} Pedido con items, datos del comprador y transacciones
   */
  async getOrderById(orderId) {
    return api.get(`/orders/${orderId}`);
  },

  /**
   * Actualiza el estado de un pedido siguiendo la máquina de estados
   * PATCH /api/orders/:id/status
   * @param {number|string} orderId - ID del pedido
   * @param {string} status - Nuevo estado ('enviado' | 'listo_retiro' | 'entregado' | 'cancelado')
   * @returns {Promise<object>} Pedido actualizado
   */
  async updateOrderStatus(orderId, status) {
    return api.patch(`/orders/${orderId}/status`, { status });
  },

  /**
   * Ejecuta el pago simulado de un pedido pendiente
   * POST /api/orders/:id/pay
   * @param {number|string} orderId - ID del pedido
   * @param {string} cardNumber - Número de tarjeta (16 dígitos; termina en 0000 = rechazada)
   * @returns {Promise<{ transaction: object, order: object }>} Resultado del pago simulado
   */
  async payOrder(orderId, cardNumber) {
    return api.post(`/orders/${orderId}/pay`, { cardNumber });
  },
};

export default orderService;
