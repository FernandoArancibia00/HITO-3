import api from './api';

export const favoriteService = {
  async getFavorites() {
    return api.get('/favorites');
  },

  async addFavorite(productId) {
    return api.post(`/favorites/${Number(productId)}`);
  },

  async removeFavorite(productId) {
    return api.delete(`/favorites/${Number(productId)}`);
  },
};

export default favoriteService;
