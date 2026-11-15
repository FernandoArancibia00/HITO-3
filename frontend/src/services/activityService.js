import api from './api';

const unwrap = (res) => (res && res.data !== undefined ? res.data : res);

export const activityService = {
  async getMyActivity(paramsObj = {}) {
    const type = typeof paramsObj === 'string' ? paramsObj : paramsObj?.type;
    const limit = typeof paramsObj === 'object' && paramsObj?.limit ? paramsObj.limit : 20;
    const params = new URLSearchParams();
    if (type && type !== 'all') params.append('type', type);
    if (limit) params.append('limit', String(limit));
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await api.get(`/activity/me${query}`);
    const data = unwrap(res);
    return Array.isArray(data) ? data : data?.items || data?.activities || data?.logs || [];
  },

  async getActivity(paramsObj = {}) {
    return this.getMyActivity(paramsObj);
  },

  async getRecentProducts() {
    const res = await api.get('/activity/me/recent-products');
    const data = unwrap(res);
    return Array.isArray(data) ? data : data?.items || data?.products || [];
  },

  async getMyRecentProducts() {
    return this.getRecentProducts();
  },
};

export default activityService;