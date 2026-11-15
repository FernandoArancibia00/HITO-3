import api from './api';

export const categoryService = {
  /**
   * Lista todas las categorías.
   * GET /api/categories
   * @returns {Promise<Array<{ id: number, slug: string, name: string, icon: string }>>}
   */
  async getCategories() {
    return api.get('/categories');
  },
};

export default categoryService;
