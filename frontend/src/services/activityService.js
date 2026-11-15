import api from './api';

/**
 * Servicio HTTP para el módulo de Actividad y Vistos Recientemente (MongoDB) — Tarea T33
 * Endpoints bajo /api/activity
 */
export const activityService = {
  /**
   * GET /api/activity/me?type=&limit=
   * Obtiene el historial de actividad del usuario autenticado.
   * @param {Object} params - { type?: string, limit?: number }
   */
  async getMyActivity({ type, limit = 20 } = {}) {
    const params = { limit };
    if (type) {
      params.type = type;
    }
    const response = await api.get('/activity/me', { params });
    return response.data;
  },

  /**
   * GET /api/activity/me/recent-products
   * Obtiene los últimos 10 productos vistos por el usuario (sin repetir).
   */
  async getRecentProducts() {
    const response = await api.get('/activity/me/recent-products');
    return response.data;
  },
};

export default activityService;
